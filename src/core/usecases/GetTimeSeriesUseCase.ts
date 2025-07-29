// src/core/usecases/GetTimeSeriesUseCase.ts
import { IAirQualityRepository } from '@/core/repositories/IAirQualityRepository';
import { ICacheService } from '@/infrastructure/cache/ICacheService';
import { TimeSeriesQuery, TimeSeriesData } from '../types/AirQuality.types';
import { AppError } from '@/shared/errors/AppError';
import { VALID_PARAMETERS } from '@/shared/constants';

export class GetTimeSeriesUseCase {
  constructor(
    private repository: IAirQualityRepository,
    private cache: ICacheService
  ) {}

  async execute(query: TimeSeriesQuery): Promise<{
    parameter: string;
    data: TimeSeriesData[];
    metadata: {
      dataPoints: number;
      dateRange: {
        start: Date | null;
        end: Date | null;
      };
    };
  }> {
    // Validate parameter
    if (!VALID_PARAMETERS.includes(query.parameter as any)) {
      throw new AppError(`Invalid parameter: ${query.parameter}`, 400);
    }

    // Generate cache key
    const cacheKey = this.getCacheKey(query);

    // Check cache
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Get data from repository
    const data = await this.repository.getParameterTimeSeries(
      query.parameter,
      query.startDate,
      query.endDate
    );

    const result = {
      parameter: query.parameter,
      data,
      metadata: {
        dataPoints: data.length,
        dateRange: {
          start: data.length > 0 ? data[0].timestamp : null,
          end: data.length > 0 ? data[data.length - 1].timestamp : null,
        },
      },
    };

    // Cache for 5 minutes
    await this.cache.set(cacheKey, JSON.stringify(result), 300);

    return result;
  }

  private getCacheKey(query: TimeSeriesQuery): string {
    const start = query.startDate?.getTime() || 'all';
    const end = query.endDate?.getTime() || 'all';
    return `timeseries:${query.parameter}:${start}:${end}`;
  }
}
