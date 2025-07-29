import Bull from 'bull';
import { cacheConfig } from '@/config/cache.config';

export interface IngestionJobData {
  filePath: string;
  originalFileName: string;
  uploadedAt: Date;
  userId: string;
}

export class IngestionQueue {
  private queue: Bull.Queue<IngestionJobData>;
  private static instance: IngestionQueue;

  constructor() {
    this.queue = new Bull('air-quality-ingestion', {
      redis: {
        host: cacheConfig.host,
        port: cacheConfig.port,
        password: cacheConfig.password,
      },
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      },
    });

    this.setupEventHandlers();
  }

  static getInstance(): IngestionQueue {
    if (!IngestionQueue.instance) {
      IngestionQueue.instance = new IngestionQueue();
    }
    return IngestionQueue.instance;
  }

  async addIngestionJob(
    data: IngestionJobData
  ): Promise<Bull.Job<IngestionJobData>> {
    return this.queue.add('process-csv', data, {
      attempts: 3,
      timeout: 300000, // 5 minutes
    });
  }

  async getJob(jobId: string): Promise<Bull.Job<IngestionJobData> | null> {
    return this.queue.getJob(jobId);
  }

  process(
    concurrency: number,
    processor: Bull.ProcessCallbackFunction<IngestionJobData>
  ): void {
    this.queue.process('process-csv', concurrency, processor);
  }

  private setupEventHandlers(): void {
    this.queue.on('failed', (job, err) => {
      console.error(`Job ${job.id} failed:`, err);
    });

    this.queue.on('completed', (job, result) => {
      console.log(`Job ${job.id} completed:`, result);
    });

    this.queue.on('progress', (job, progress) => {
      console.log(`Job ${job.id} progress: ${progress.percentage}%`);
    });

    this.queue.on('error', (error) => {
      console.error('Queue error:', error);
    });

    this.queue.on('stalled', (job) => {
      console.warn(`Job ${job.id} stalled`);
    });
  }

  async close(): Promise<void> {
    await this.queue.close();
  }

  async obliterate(): Promise<void> {
    await this.queue.obliterate({ force: true });
  }
}
