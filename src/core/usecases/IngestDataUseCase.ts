import { parse } from 'csv-parse';
import * as fs from 'fs';
import { IAirQualityRepository } from '../repositories/IAirQualityRepository';
import {
  AirQualityMeasurement,
  IngestionResult,
} from '@/core/types/AirQuality.types';
import { AppError } from '@/shared/errors/AppError';

export class IngestDataUseCase {
  private repository: IAirQualityRepository;

  constructor(repository?: IAirQualityRepository) {
    this.repository = repository!;
  }

  async execute(
    filePath: string,
    options?: {
      onProgress?: (processed: number) => Promise<void>;
    }
  ): Promise<IngestionResult> {
    const startTime = Date.now();
    let processed = 0;
    let failed = 0;
    const errors: Array<{ row: number; error: string }> = [];

    const measurements: AirQualityMeasurement[] = [];
    const batchSize = 1000;
    let rowNumber = 0;

    return new Promise((resolve, reject) => {
      const stream = fs.createReadStream(filePath);
      const parser = parse({
        columns: true,
        skip_empty_lines: true,
        delimiter: ';',
        relax_quotes: true,
        trim: true,
      });

      parser.on('data', async (row) => {
        rowNumber++;

        try {
          // Skip rows with invalid dates
          if (
            !row.Date ||
            row.Date.trim() === '' ||
            !row.Time ||
            row.Time.trim() === ''
          ) {
            failed++;
            errors.push({
              row: rowNumber,
              error: 'Missing date or time',
            });
            return;
          }

          const measurement = this.transformRow(row);

          // Validate the transformed data
          if (
            !measurement.timestamp ||
            isNaN(measurement.timestamp.getTime())
          ) {
            failed++;
            errors.push({
              row: rowNumber,
              error: `Invalid date: ${row.Date} ${row.Time}`,
            });
            return;
          }

          measurements.push(measurement);

          if (measurements.length >= batchSize) {
            parser.pause();

            try {
              await this.repository.bulkInsert(measurements);
              processed += measurements.length;
              measurements.length = 0;

              if (options?.onProgress) {
                await options.onProgress(processed);
              }
            } catch (error) {
              // Log specific rows that failed
              measurements.forEach((_, index) => {
                errors.push({
                  row: rowNumber - measurements.length + index + 1,
                  error:
                    error instanceof Error
                      ? error.message
                      : 'Database insertion failed',
                });
              });
              failed += measurements.length;
              measurements.length = 0;
            }

            parser.resume();
          }
        } catch (error) {
          failed++;
          errors.push({
            row: rowNumber,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      });

      parser.on('end', async () => {
        // Process remaining measurements
        if (measurements.length > 0) {
          try {
            await this.repository.bulkInsert(measurements);
            processed += measurements.length;
          } catch (error) {
            failed += measurements.length;
            errors.push({
              row: rowNumber,
              error:
                error instanceof Error
                  ? error.message
                  : 'Final batch insertion failed',
            });
          }
        }

        const duration = Date.now() - startTime;
        resolve({
          processed,
          failed,
          duration,
          errors: errors.slice(0, 100),
        });
      });

      parser.on('error', (error) => {
        reject(new AppError(`CSV parsing failed: ${error.message}`, 400));
      });

      stream.pipe(parser);
    });
  }

  private transformRow(row: any): AirQualityMeasurement {
    try {
      // Parse Italian date format (DD/MM/YYYY) and time with dots (HH.MM.SS)
      const dateParts = row.Date.trim().split('/');
      const timeParts = row.Time.trim().split('.');

      if (dateParts.length !== 3 || timeParts.length !== 3) {
        throw new Error('Invalid date/time format');
      }

      const day = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10) - 1; // JavaScript months are 0-based
      const year = parseInt(dateParts[2], 10);

      const hours = parseInt(timeParts[0], 10);
      const minutes = parseInt(timeParts[1], 10);
      const seconds = parseInt(timeParts[2], 10);

      // Create date object
      const timestamp = new Date(year, month, day, hours, minutes, seconds);

      // Validate the date
      if (isNaN(timestamp.getTime())) {
        throw new Error('Invalid date created');
      }

      // Helper function to parse numeric values
      const parseValue = (value: string | undefined): number | null => {
        if (!value || value.trim() === '') return null;

        // Replace comma with dot for decimal numbers
        const normalized = value.replace(',', '.');
        const parsed = parseFloat(normalized);

        // -200 represents missing data in this dataset
        return parsed === -200 || isNaN(parsed) ? null : parsed;
      };

      return {
        timestamp,
        co: parseValue(row['CO(GT)']),
        nmhc: parseValue(row['NMHC(GT)']),
        benzene: parseValue(row['C6H6(GT)']),
        nox: parseValue(row['NOx(GT)']),
        no2: parseValue(row['NO2(GT)']),
        pt08_s1_co: parseValue(row['PT08.S1(CO)']),
        pt08_s2_nmhc: parseValue(row['PT08.S2(NMHC)']),
        pt08_s3_nox: parseValue(row['PT08.S3(NOx)']),
        pt08_s4_no2: parseValue(row['PT08.S4(NO2)']),
        pt08_s5_o3: parseValue(row['PT08.S5(O3)']),
        temperature: parseValue(row['T']),
        relative_humidity: parseValue(row['RH']),
        absolute_humidity: parseValue(row['AH']),
      };
    } catch (error) {
      throw new Error(
        `Failed to transform row: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
