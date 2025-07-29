import { Request, Response, NextFunction } from 'express';
import { GetTimeSeriesUseCase } from '@/core/usecases/GetTimeSeriesUseCase';
import { GetDateRangeDataUseCase } from '@/core/usecases/GetDateRangeDataUseCase';
import { GetStatisticsUseCase } from '@/core/usecases/GetStatisticsUseCase';
import { AirQualityRepository } from '@/core/repositories/AirQualityRepository';
import RedisCache from '@/infrastructure/cache/RedisCache';

export class AirQualityController {
  private getTimeSeriesUseCase: GetTimeSeriesUseCase;
  private getDateRangeDataUseCase: GetDateRangeDataUseCase;
  private getStatisticsUseCase: GetStatisticsUseCase;

  constructor() {
    const repository = new AirQualityRepository();
    const cache = RedisCache.getInstance();

    this.getTimeSeriesUseCase = new GetTimeSeriesUseCase(repository, cache);
    this.getDateRangeDataUseCase = new GetDateRangeDataUseCase(
      repository,
      cache
    );
    this.getStatisticsUseCase = new GetStatisticsUseCase(repository, cache);
  }

  async getTimeSeries(req: Request, res: Response, next: NextFunction) {
    try {
      const { parameter } = req.params;
      const { startDate, endDate } = req.query;

      const data = await this.getTimeSeriesUseCase.execute({
        parameter,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      });

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getDateRangeData(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;

      const data = await this.getDateRangeDataUseCase.execute({
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string),
      });

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getStatistics(req: Request, res: Response, next: NextFunction) {
    try {
      const { parameter } = req.params;
      const { startDate, endDate } = req.query;

      const data = await this.getStatisticsUseCase.execute({
        parameter,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      });

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}
