import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';

// Import configurations
import { appConfig } from '@/config/app.config';
import { corsOptions } from '@/api/middleware/cors';

// Import middleware
import { errorHandler } from '@/api/middleware/errorHandler';
import { generalLimiter } from '@/api/middleware/rateLimiter';

// Import routes
import apiRoutes from '@/api/routes';

// Import infrastructure
import DatabaseConnection from '@/infrastructure/database/connection';
import RedisCache from '@/infrastructure/cache/RedisCache';

// Import shared utilities
import { AppError } from '@/shared/errors/AppError';
import { HTTP_STATUS } from '@/shared/constants';

// Load environment variables
dotenv.config();

class App {
  public app: Application;
  private redisCache: RedisCache;

  constructor() {
    this.app = express();
    this.redisCache = RedisCache.getInstance();

    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddleware(): void {
    // Security middleware
    this.app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
          },
        },
      })
    );

    // CORS
    this.app.use(cors(corsOptions));

    // Compression
    this.app.use(compression());

    // Rate limiting
    this.app.use(generalLimiter);

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging middleware
    this.app.use((req: Request, _res: Response, next: NextFunction) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  private initializeRoutes(): void {
    // API routes
    this.app.use('/api', apiRoutes);

    // 404 handler
    this.app.all('*', (req: Request, _res: Response, next: NextFunction) => {
      next(
        new AppError(
          `Route ${req.originalUrl} not found`,
          HTTP_STATUS.NOT_FOUND
        )
      );
    });
  }

  private initializeErrorHandling(): void {
    // Global error handler
    this.app.use(errorHandler);
  }

  public async initializeDatabase(): Promise<void> {
    try {
      await DatabaseConnection.connect();

      // Sync database in development
      if (appConfig.isDevelopment) {
        await DatabaseConnection.sync({ alter: true });
      }
    } catch (error) {
      console.error('Failed to initialize database:', error);
      process.exit(1);
    }
  }

  public async initializeCache(): Promise<void> {
    try {
      await this.redisCache.connect();
      console.log('Redis cache connected successfully');
    } catch (error) {
      console.error('Failed to connect to Redis cache:', error);
      // Don't exit the process if Redis fails, just log the error
    }
  }

  public async start(): Promise<void> {
    try {
      // Initialize database
      await this.initializeDatabase();

      // Initialize cache
      await this.initializeCache();

      // Start server
      this.app.listen(appConfig.port, () => {
        console.log(`
🚀 Air Quality Backend API is running!
📍 Environment: ${appConfig.nodeEnv}
🔗 URL: http://localhost:${appConfig.port}
📚 API: http://localhost:${appConfig.port}/api
❤️  Health: http://localhost:${appConfig.port}/api/health
        `);
      });
    } catch (error) {
      console.error('Failed to start the application:', error);
      process.exit(1);
    }
  }

  public async stop(): Promise<void> {
    try {
      await DatabaseConnection.disconnect();
      await this.redisCache.disconnect();
      console.log('Application stopped gracefully');
    } catch (error) {
      console.error('Error stopping the application:', error);
    }
  }
}

// Handle graceful shutdown
const app = new App();

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await app.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await app.stop();
  process.exit(0);
});

// Start the application
if (require.main === module) {
  app.start().catch((error) => {
    console.error('Failed to start application:', error);
    process.exit(1);
  });
}

export default app;
