import { IngestionQueue } from '../infrastructure/queues/IngestionQueue';
import { IngestionProcessor } from '../infrastructure/queues/processors/IngestionProcessor';
import DatabaseConnection from '../infrastructure/database/connection';
import RedisCache from '../infrastructure/cache/RedisCache';

async function startWorker() {
  console.log('Starting ingestion worker...');

  try {
    // Initialize database
    await DatabaseConnection.connect();
    console.log('Worker: Database connected');

    // Initialize cache
    const cache = RedisCache.getInstance();
    await cache.connect();
    console.log('Worker: Cache connected');

    // Create processor
    const processor = new IngestionProcessor();

    // Get queue instance
    const queue = IngestionQueue.getInstance();

    // Process jobs with concurrency of 2
    queue.process(2, async (job) => {
      console.log(`Worker: Processing job ${job.id}`);
      return processor.process(job);
    });

    console.log('Worker started and waiting for jobs...');
  } catch (error) {
    console.error('Failed to start worker:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Worker: SIGTERM received, shutting down...');
  const queue = IngestionQueue.getInstance();
  await queue.close();
  await DatabaseConnection.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Worker: SIGINT received, shutting down...');
  const queue = IngestionQueue.getInstance();
  await queue.close();
  await DatabaseConnection.disconnect();
  process.exit(0);
});

// Start the worker
startWorker().catch(console.error);
