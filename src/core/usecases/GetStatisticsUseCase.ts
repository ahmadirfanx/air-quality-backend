import { IAirQualityRepository } from '../repositories/IAirQualityRepository';
import { ICacheService } from '@/infrastructure/cache/ICacheService';
import {
  TimeSeriesQuery,
  ParameterStatistics,
} from '@/core//types/AirQuality.types';
import { AppError } from '@/shared/errors/AppError';
import { VALID_PARAMETERS } from '@/shared/constants';

export class GetStatisticsUseCase {
  constructor(
    private repository: IAirQualityRepository,
    private cache: ICacheService
  ) {}

  async execute(query: TimeSeriesQuery): Promise<ParameterStatistics> {
    if (!VALID_PARAMETERS.includes(query.parameter as any)) {
      throw new AppError(`Invalid parameter: ${query.parameter}`, 400);
    }

    const cacheKey = `stats:${query.parameter}:${query.startDate?.getTime() || 'all'}:${query.endDate?.getTime() || 'all'}`;

    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const stats = await this.repository.getParameterStatistics(
      query.parameter,
      query.startDate,
      query.endDate
    );

    // Cache for 10 minutes
    await this.cache.set(cacheKey, JSON.stringify(stats), 600);

    return stats;
  }
}
