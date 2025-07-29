// src/config/cache.config.ts
import dotenv from 'dotenv';

dotenv.config();

export const cacheConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  ttl: 3600, // 1 hour default TTL
  maxRetriesPerRequest: null,
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  get url() {
    const auth = this.password ? `:${this.password}@` : '';
    return `redis://${auth}${this.host}:${this.port}`;
  },
};
