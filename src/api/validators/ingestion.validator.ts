// src/api/validators/ingestion.validator.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '@/shared/errors/AppError';
import { HTTP_STATUS } from '@/shared/constants';

export const validateIngestion = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.file) {
    return next(new AppError('No file provided', HTTP_STATUS.BAD_REQUEST));
  }

  const allowedMimeTypes = ['text/csv', 'application/csv'];
  if (!allowedMimeTypes.includes(req.file.mimetype)) {
    return next(
      new AppError(
        'Invalid file type. Only CSV files are allowed',
        HTTP_STATUS.BAD_REQUEST
      )
    );
  }

  // Check file size (max 50MB)
  const maxSize = 50 * 1024 * 1024;
  if (req.file.size > maxSize) {
    return next(
      new AppError('File size exceeds 50MB limit', HTTP_STATUS.BAD_REQUEST)
    );
  }

  next();
};
