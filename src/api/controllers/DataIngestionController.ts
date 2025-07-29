// src/api/controllers/DataIngestionController.ts
import { Request, Response, NextFunction } from 'express';
import { IngestDataUseCase } from '@/core/usecases/IngestDataUseCase';
import { IngestionQueue } from '@/infrastructure/queues/IngestionQueue';
import { AppError } from '@/shared/errors/AppError';
import { HTTP_STATUS } from '@/shared/constants';

export class DataIngestionController {
  private ingestionQueue: IngestionQueue;
  private ingestDataUseCase: IngestDataUseCase;

  constructor() {
    this.ingestionQueue = new IngestionQueue();
    this.ingestDataUseCase = new IngestDataUseCase();
  }

  async initiateIngestion(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new AppError('No file uploaded', HTTP_STATUS.BAD_REQUEST);
      }

      // Add job to queue
      const job = await this.ingestionQueue.addIngestionJob({
        filePath: req.file.path,
        originalFileName: req.file.originalname,
        uploadedAt: new Date(),
        userId: req.ip || 'anonymous',
      });

      res.status(HTTP_STATUS.ACCEPTED).json({
        success: true,
        message: 'Data ingestion started',
        data: {
          jobId: job.id,
          status: 'processing',
          trackingUrl: `/api/ingest/status/${job.id}`,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getIngestionStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { jobId } = req.params;

      const job = await this.ingestionQueue.getJob(jobId);
      if (!job) {
        throw new AppError('Job not found', HTTP_STATUS.NOT_FOUND);
      }

      const state = await job.getState();
      const progress = job.progress();

      res.json({
        success: true,
        data: {
          jobId: job.id,
          state,
          progress: {
            processed: progress.processed || 0,
            total: progress.total || 0,
            percentage: progress.percentage || 0,
          },
          result: job.returnvalue,
          error: job.failedReason,
          createdAt: new Date(job.timestamp),
          processedOn: job.processedOn ? new Date(job.processedOn) : null,
          finishedOn: job.finishedOn ? new Date(job.finishedOn) : null,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
