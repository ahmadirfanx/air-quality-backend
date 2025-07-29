import { AirQualityRepository } from '@/core/repositories/AirQualityRepository';
import { ICacheService } from '@/infrastructure/cache/ICacheService';
import {
  DateRangeQuery,
  AirQualityMeasurement,
} from '@/core//types/AirQuality.types';

export class GetDateRangeDataUseCase {
  constructor(
    private repository: AirQualityRepository,
    private cache: ICacheService
  ) {}

  async execute(query: DateRangeQuery): Promise<{
    data: AirQualityMeasurement[];
    metadata: {
      count: number;
      dateRange: {
        start: Date;
        end: Date;
      };
    };
  }> {
    const cacheKey = `daterange:${query.startDate.getTime()}:${query.endDate.getTime()}`;

    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const data = await this.repository.getByDateRange(
      query.startDate,
      query.endDate
    );

    const result = {
      data,
      metadata: {
        count: data.length,
        dateRange: {
          start: query.startDate,
          end: query.endDate,
        },
      },
    };

    // Cache for 5 minutes
    await this.cache.set(cacheKey, JSON.stringify(result), 300);

    return result;
  }
}
