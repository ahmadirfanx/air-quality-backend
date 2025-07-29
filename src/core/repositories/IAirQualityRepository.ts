import {
  AirQualityMeasurement,
  TimeSeriesData,
  ParameterStatistics,
} from '../types/AirQuality.types';

export interface IAirQualityRepository {
  // Create operations
  bulkInsert(measurements: AirQualityMeasurement[]): Promise<void>;

  // Read operations
  getByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<AirQualityMeasurement[]>;

  getParameterTimeSeries(
    parameter: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<TimeSeriesData[]>;

  getParameterStatistics(
    parameter: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<ParameterStatistics>;

  // Utility operations
  count(): Promise<number>;
  getDateRange(): Promise<{ min: Date; max: Date }>;
}
