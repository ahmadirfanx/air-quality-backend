import { Request, Response, NextFunction } from 'express';
import { AppError } from '@/shared/errors/AppError';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let err = { ...error };
  err.message = error.message;

  // Log error
  console.error(error);

  // Mongoose bad ObjectId
  if (error.name === 'CastError') {
    const message = 'Resource not found';
    err = new AppError(message, 404);
  }

  // Mongoose duplicate key
  if (error.name === 'MongoError' && (error as any).code === 11000) {
    const message = 'Duplicate field value entered';
    err = new AppError(message, 400);
  }

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const message = Object.values((error as any).errors).map((val: any) => val.message);
    err = new AppError(message.join(', '), 400);
  }

  // Sequelize errors
  if (error.name === 'SequelizeValidationError') {
    const message = (error as any).errors.map((err: any) => err.message).join(', ');
    err = new AppError(message, 400);
  }

  if (error.name === 'SequelizeUniqueConstraintError') {
    const message = 'Duplicate field value entered';
    err = new AppError(message, 400);
  }

  if (error.name === 'SequelizeForeignKeyConstraintError') {
    const message = 'Invalid reference to related resource';
    err = new AppError(message, 400);
  }

  res.status((err as AppError).statusCode || 500).json({
    success: false,
    error: (err as AppError).message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};