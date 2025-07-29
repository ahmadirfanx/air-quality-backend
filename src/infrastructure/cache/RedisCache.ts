import Redis from 'ioredis';
import { cacheConfig } from '@/config/cache.config';
import { ICacheService } from './ICacheService';

class RedisCache implements ICacheService {
  private static instance: RedisCache;
  private client: Redis | null = null;

  private constructor() {}

  static getInstance(): RedisCache {
    if (!RedisCache.instance) {
      RedisCache.instance = new RedisCache();
    }
    return RedisCache.instance;
  }

  async connect(): Promise<void> {
    if (this.client) {
      console.log('Redis already connected');
      return;
    }

    this.client = new Redis({
      host: cacheConfig.host,
      port: cacheConfig.port,
      password: cacheConfig.password,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.client.on('connect', () => {
      console.log('Redis client connected');
    });

    this.client.on('error', (err) => {
      console.error('Redis client error:', err);
    });
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.client) {
      console.warn('Redis not connected');
      return null;
    }
    return this.client.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (!this.client) {
      console.warn('Redis not connected');
      return;
    }

    if (ttl) {
      await this.client.setex(key, ttl, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.client) {
      console.warn('Redis not connected');
      return;
    }
    await this.client.del(key);
  }

  async deletePattern(pattern: string): Promise<void> {
    if (!this.client) {
      console.warn('Redis not connected');
      return;
    }

    const keys = await this.client.keys(pattern);
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.client) {
      console.warn('Redis not connected');
      return false;
    }
    const result = await this.client.exists(key);
    return result === 1;
  }

  async ping(): Promise<void> {
    if (!this.client) {
      throw new Error('Redis not connected');
    }
    await this.client.ping();
  }
}

export default RedisCache;
