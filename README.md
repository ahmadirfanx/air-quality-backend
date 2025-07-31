# Air Quality Backend API

A TypeScript Node.js Express backend API. This backend system provides a robust foundation for air quality data analysis with excellent performance, scalability, and maintainability characteristics.

## Tech Stack

- **Backend Framework**: Node.js with Express.js
- **Language**: TypeScript with strict configuration
- **Database**: PostgreSQL with Sequelize ORM
- **Cache**: Redis for caching and job queues
- **Architecture**: Clean Architecture pattern
- **Job Processing**: Bull Queue for background data ingestion
- **Validation**: Joi for request validation
- **Code Quality**: ESLint and Prettier
- **File Processing**: CSV parsing with csv-parse library

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 12+ running locally
- Redis 6+ running locally
- npm or yarn package manager

## Local Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup (PostgreSQL)

Install and start PostgreSQL, then create a database:

```sql
-- Connect to PostgreSQL as superuser
CREATE DATABASE air_quality_db;
CREATE USER postgres WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE air_quality_db TO postgres;
```

### 3. Redis Setup

Install and start Redis server:

```bash
# On macOS with Homebrew
brew install redis
brew services start redis
```

### 4. Environment Variables

Update the .env file with your credentials.

### 5. Running the Application

#### Development Mode (Main Server + Worker)

Start both the API server and background worker:

```bash
# Start both server and worker concurrently
npm run dev:all

# Or start them separately in different terminals:

# Terminal 1 - API Server
npm run dev

# Terminal 2 - Background Worker
npm run dev:worker
```

The API will be available at: `http://localhost:3000`

## How the System Works

### Data Ingestion Process

The system uses a queue-based architecture for processing large CSV files:

1. **File Upload**: POST `/api/ingest` with CSV file
2. **Job Creation**: File is stored temporarily and job added to Redis queue
3. **Background Processing**: Worker processes CSV in batches of 1000 records
4. **Progress Tracking**: Real-time progress updates via `/api/ingest/status/:jobId`
5. **Data Transformation**: Italian date/time format parsing and data validation
6. **Database Storage**: Bulk insert with duplicate handling

#### CSV Format Expected
- Delimiter: semicolon (`;`)
- Date format: DD/MM/YYYY
- Time format: HH.MM.SS
- Missing values: -200 (converted to null)
- Decimal separator: comma (`,`) (converted to dot)

### Core Use Cases

#### 1. IngestDataUseCase
- **Purpose**: Process and store CSV air quality data
- **Features**: Batch processing, progress tracking, error handling
- **Input**: CSV file path
- **Output**: Processing statistics (processed, failed, duration, errors)

#### 2. GetTimeSeriesUseCase
- **Purpose**: Retrieve time series data for specific parameters
- **Features**: Date range filtering, caching (5 min TTL)
- **Input**: Parameter name, optional date range
- **Output**: Time series data with metadata

#### 3. GetDateRangeDataUseCase
- **Purpose**: Get all measurements within date range
- **Features**: Full data retrieval, caching
- **Input**: Start and end dates
- **Output**: Complete measurement records

#### 4. GetStatisticsUseCase
- **Purpose**: Calculate statistical metrics for parameters
- **Features**: Advanced statistics (percentiles, std dev), caching (10 min TTL)
- **Input**: Parameter name, optional date range
- **Output**: Statistical analysis (avg, min, max, percentiles)

### Repository Pattern

The `AirQualityRepository` implements data access with:
- Bulk insert operations for efficient data ingestion
- Complex SQL queries for statistics calculation
- Date range filtering with proper indexing
- Parameter validation and type safety

### Caching Strategy

Redis is used for:
- **API Response Caching**: Time series and statistics (5-10 min TTL)
- **Job Queue Management**: Background processing with Bull
- **Progress Tracking**: Real-time job status updates


## Architecture Benefits

- **Separation of Concerns**: Clear boundaries between layers
- **Testability**: Business logic isolated from frameworks
- **Maintainability**: Easy to modify and extend
- **Dependency Inversion**: Core logic doesn't depend on external frameworks

### Scalability Features
- **Background Processing**: Non-blocking file processing
- **Caching Layer**: Reduced database load
- **Connection Pooling**: Efficient database connections
- **Rate Limiting**: API protection against abuse
- **Error Handling**: Comprehensive error management

## Data Processing Features

- **Batch Processing**: 1000 records per batch for optimal performance
- **Progress Tracking**: Real-time processing updates
- **Error Handling**: Detailed error reporting with row numbers
- **Data Validation**: Comprehensive validation of dates, numbers, and formats
- **Duplicate Handling**: Upsert operations based on timestamp uniqueness
- **Memory Management**: Streaming CSV processing for large files

## Performance Optimizations

- **Database Indexing**: Optimized indexes on timestamp and parameter columns
- **Bulk Operations**: Batch inserts for high throughput
- **Caching Strategy**: Multi-level caching with appropriate TTLs
- **Connection Pooling**: Configured for concurrent operations
- **Query Optimization**: Raw SQL for complex statistical calculations

- ## Project Structure

```
src/
├── api/                    # API Layer (Presentation)
│   ├── controllers/        # Route handlers and request/response logic
│   ├── middleware/         # Express middleware (CORS, error handling, rate limiting)
│   ├── routes/            # API route definitions
│   └── validators/        # Request validation schemas
├── core/                  # Business Logic (Domain)
│   ├── models/           # Domain entities and Sequelize models
│   ├── repositories/     # Data access interfaces and implementations
│   ├── types/           # TypeScript type definitions
│   └── usecases/        # Business logic and use cases
├── infrastructure/       # External Concerns (Infrastructure)
│   ├── cache/           # Redis cache implementation
│   ├── database/        # Database connection and configuration
│   ├── queues/         # Bull queue setup and job processors
│   └── services/       # External service integrations
├── shared/              # Shared Utilities
│   ├── constants/      # Application constants
│   ├── errors/        # Custom error classes
│   ├── types/        # Shared TypeScript types
│   └── utils/        # Utility functions
├── config/             # Configuration Files
│   ├── app.config.ts      # Application configuration
│   ├── cache.config.ts    # Redis configuration
│   └── database.config.ts # Database configuration
├── workers/            # Background Workers
│   └── ingestion.worker.ts # CSV data ingestion worker
└── app.ts             # Application entry point
```

## API Endpoints

### Health Check
- `GET /api/health` - System health status

### Data Ingestion
- `POST /api/ingest` - Upload CSV file for processing
- `GET /api/ingest/status/:jobId` - Get ingestion job status

### Air Quality Data
- `GET /api/air-quality/time-series/:parameter` - Get time series for parameter
  - Query params: `startDate`, `endDate` (ISO format)
- `GET /api/air-quality/date-range` - Get all data in date range
  - Query params: `startDate`, `endDate` (required)
- `GET /api/air-quality/statistics/:parameter` - Get statistical analysis
  - Query params: `startDate`, `endDate` (optional)

