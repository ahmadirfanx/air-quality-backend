// src/api/validators/airQuality.validator.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '@/shared/errors/AppError';
import { HTTP_STATUS } from '@/shared/constants';
import { VALID_PARAMETERS } from '@/shared/constants';

export const validateTimeSeriesQuery = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { parameter } = req.params;
  const { startDate, endDate } = req.query;

  if (!VALID_PARAMETERS.includes(parameter as any)) {
    return next(
      new AppError(`Invalid parameter: ${parameter}`, HTTP_STATUS.BAD_REQUEST)
    );
  }

  if (startDate && isNaN(Date.parse(startDate as string))) {
    return next(new AppError('Invalid start date', HTTP_STATUS.BAD_REQUEST));
  }

  if (endDate && isNaN(Date.parse(endDate as string))) {
    return next(new AppError('Invalid end date', HTTP_STATUS.BAD_REQUEST));
  }

  if (startDate && endDate) {
    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    if (start > end) {
      return next(
        new AppError(
          'Start date cannot be after end date',
          HTTP_STATUS.BAD_REQUEST
        )
      );
    }
  }

  next();
};

export const validateDateRangeQuery = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return next(
      new AppError(
        'Both startDate and endDate are required',
        HTTP_STATUS.BAD_REQUEST
      )
    );
  }

  if (
    isNaN(Date.parse(startDate as string)) ||
    isNaN(Date.parse(endDate as string))
  ) {
    return next(new AppError('Invalid date format', HTTP_STATUS.BAD_REQUEST));
  }

  const start = new Date(startDate as string);
  const end = new Date(endDate as string);

  if (start > end) {
    return next(
      new AppError(
        'Start date cannot be after end date',
        HTTP_STATUS.BAD_REQUEST
      )
    );
  }

  // Maximum 1 year range
  const oneYear = 365 * 24 * 60 * 60 * 1000;
  if (end.getTime() - start.getTime() > oneYear) {
    return next(
      new AppError('Date range cannot exceed 1 year', HTTP_STATUS.BAD_REQUEST)
    );
  }

  next();
};
