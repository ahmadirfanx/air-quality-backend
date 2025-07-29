import { Router } from 'express';
import { AirQualityController } from '@/api/controllers/AirQualityController';
import {
  validateTimeSeriesQuery,
  validateDateRangeQuery,
} from '@/api/validators/airQuality.validator';

const router = Router();
const controller = new AirQualityController();

// Get time series data for specific parameter
router.get(
  '/time-series/:parameter',
  validateTimeSeriesQuery,
  controller.getTimeSeries.bind(controller)
);

// Get all data within date range
router.get(
  '/date-range',
  validateDateRangeQuery,
  controller.getDateRangeData.bind(controller)
);

// Get statistics for a parameter
router.get(
  '/statistics/:parameter',
  validateTimeSeriesQuery,
  controller.getStatistics.bind(controller)
);

export default router;
