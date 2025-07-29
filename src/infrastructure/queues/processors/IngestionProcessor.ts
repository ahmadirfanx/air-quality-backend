import { Job } from 'bull';
import { IngestDataUseCase } from '@/core/usecases/IngestDataUseCase';
import { AirQualityRepository } from '@/core/repositories/AirQualityRepository';
import { IngestionJobData } from '../IngestionQueue';
import * as fs from 'fs/promises';
import { parse } from 'csv-parse';
import { createReadStream } from 'fs';

export class IngestionProcessor {
  private ingestDataUseCase: IngestDataUseCase;

  constructor() {
    const repository = new AirQualityRepository();
    this.ingestDataUseCase = new IngestDataUseCase(repository);
  }

  async process(job: Job<IngestionJobData>) {
    const { filePath, originalFileName, userId } = job.data;

    try {
      console.log(`Processing job ${job.id} for file ${originalFileName}`);

      // Count total rows for progress tracking
      const totalRows = await this.countCSVRows(filePath);
      await job.progress({
        processed: 0,
        total: totalRows,
        percentage: 0,
      });

      // Process with progress updates
      const result = await this.ingestDataUseCase.execute(filePath, {
        onProgress: async (processed: number) => {
          const percentage = Math.round((processed / totalRows) * 100);

          await job.progress({
            processed,
            total: totalRows,
            percentage,
          });

          // Log every 10%
          if (percentage % 10 === 0) {
            console.log(`Job ${job.id}: ${percentage}% complete`);
          }
        },
      });

      // Cleanup temporary file
      await this.cleanupFile(filePath);

      console.log(`Job ${job.id} completed successfully:`, result);
      return result;
    } catch (error) {
      console.error(`Job ${job.id} failed:`, error);

      // Cleanup file even on error
      await this.cleanupFile(filePath);

      throw error;
    }
  }

  private async countCSVRows(filePath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      let count = 0;
      const stream = createReadStream(filePath);
      const parser = parse({
        columns: true,
        skip_empty_lines: true,
        delimiter: ';',
      });

      parser.on('data', () => count++);
      parser.on('end', () => resolve(count));
      parser.on('error', reject);

      stream.pipe(parser);
    });
  }

  private async cleanupFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
      console.log(`Cleaned up temporary file: ${filePath}`);
    } catch (error) {
      console.error('Failed to cleanup file:', error);
    }
  }
}
