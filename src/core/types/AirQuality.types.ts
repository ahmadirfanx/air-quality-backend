export interface AirQualityMeasurement {
  id?: number;
  timestamp: Date;
  co: number | null;
  nmhc: number | null;
  benzene: number | null;
  nox: number | null;
  no2: number | null;
  pt08_s1_co: number | null;
  pt08_s2_nmhc: number | null;
  pt08_s3_nox: number | null;
  pt08_s4_no2: number | null;
  pt08_s5_o3: number | null;
  temperature: number | null;
  relative_humidity: number | null;
  absolute_humidity: number | null;
}

export interface TimeSeriesData {
  timestamp: Date;
  value: number | null;
}

export interface TimeSeriesQuery {
  parameter: string;
  startDate?: Date;
  endDate?: Date;
}

export interface DateRangeQuery {
  startDate: Date;
  endDate: Date;
}

export interface ParameterStatistics {
  parameter: string;
  avg: number;
  min: number;
  max: number;
  stddev: number;
  percentile_50: number;
  percentile_95: number;
  dataPoints: number;
  dateRange: {
    start: Date;
    end: Date;
  };
}

export interface IngestionResult {
  processed: number;
  failed: number;
  duration: number;
  errors?: Array<{
    row: number;
    error: string;
  }>;
}
