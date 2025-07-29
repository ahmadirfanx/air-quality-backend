import { Op, QueryTypes } from 'sequelize';
import { IAirQualityRepository } from './IAirQualityRepository';
import {
  AirQualityMeasurement,
  TimeSeriesData,
  ParameterStatistics,
} from '@/core/types/AirQuality.types';
import { AirQualityModel } from '../models/AirQualityModel';
import DatabaseConnection from '@/infrastructure/database/connection';

export class AirQualityRepository implements IAirQualityRepository {
  async bulkInsert(measurements: AirQualityMeasurement[]): Promise<void> {
    await AirQualityModel.bulkCreate(measurements as any[], {
      updateOnDuplicate: ['timestamp'], // Update if timestamp already exists
    });
  }

  async getByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<AirQualityMeasurement[]> {
    const results = await AirQualityModel.findAll({
      where: {
        timestamp: {
          [Op.between]: [startDate, endDate],
        },
      },
      order: [['timestamp', 'ASC']],
      raw: true,
    });

    return results;
  }

  async getParameterTimeSeries(
    parameter: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<TimeSeriesData[]> {
    const whereClause: any = {
      [parameter]: {
        [Op.not]: null,
      },
    };

    if (startDate && endDate) {
      whereClause.timestamp = {
        [Op.between]: [startDate, endDate],
      };
    }

    const results = await AirQualityModel.findAll({
      where: whereClause,
      attributes: ['timestamp', parameter],
      order: [['timestamp', 'ASC']],
      raw: true,
    });

    return results.map((r) => ({
      timestamp: r.timestamp,
      value: r[parameter as keyof typeof r] as number,
    }));
  }

  async getParameterStatistics(
    parameter: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<ParameterStatistics> {
    let whereCondition = `${parameter} IS NOT NULL`;
    const replacements: any = {};

    if (startDate && endDate) {
      whereCondition += ` AND timestamp BETWEEN :startDate AND :endDate`;
      replacements.startDate = startDate;
      replacements.endDate = endDate;
    }

    const query = `
      SELECT 
        '${parameter}' as parameter,
        AVG(${parameter}) as avg,
        MIN(${parameter}) as min,
        MAX(${parameter}) as max,
        STDDEV(${parameter}) as stddev,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY ${parameter}) as percentile_50,
        PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY ${parameter}) as percentile_95,
        COUNT(*) as data_points,
        MIN(timestamp) as start_date,
        MAX(timestamp) as end_date
      FROM air_quality_measurements
      WHERE ${whereCondition}
    `;

    const sequelize = DatabaseConnection.getSequelize();
    const [result] = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });

    return {
      parameter,
      avg: parseFloat(result.avg) || 0,
      min: parseFloat(result.min) || 0,
      max: parseFloat(result.max) || 0,
      stddev: parseFloat(result.stddev) || 0,
      percentile_50: parseFloat(result.percentile_50) || 0,
      percentile_95: parseFloat(result.percentile_95) || 0,
      dataPoints: parseInt(result.data_points) || 0,
      dateRange: {
        start: new Date(result.start_date),
        end: new Date(result.end_date),
      },
    };
  }

  async count(): Promise<number> {
    return AirQualityModel.count();
  }

  async getDateRange(): Promise<{ min: Date; max: Date }> {
    const result = await AirQualityModel.findOne({
      attributes: [
        [
          DatabaseConnection.getSequelize().fn(
            'MIN',
            DatabaseConnection.getSequelize().col('timestamp')
          ),
          'min',
        ],
        [
          DatabaseConnection.getSequelize().fn(
            'MAX',
            DatabaseConnection.getSequelize().col('timestamp')
          ),
          'max',
        ],
      ],
      raw: true,
    });

    return {
      min: new Date(result?.min || Date.now()),
      max: new Date(result?.max || Date.now()),
    };
  }
}
