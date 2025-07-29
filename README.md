# Air Quality Backend

A TypeScript Node.js Express backend API built with Clean Architecture principles for air quality monitoring and data management.

## Features

- Clean Architecture structure
- TypeScript with strict configuration
- Express.js with comprehensive middleware
- PostgreSQL with Sequelize ORM
- Redis for caching
- Docker containerization
- ESLint and Prettier for code quality

## Project Structure

```
src/
├── api/                 # API layer (controllers, routes, middleware)
├── core/                # Business logic (entities, use cases, repositories)
├── infrastructure/      # External concerns (database, cache, services)
├── shared/              # Shared utilities and types
├── config/              # Configuration files
└── app.ts              # Application entry point
```

## Prerequisites

- Node.js 18+
- Docker and Docker Compose
- PostgreSQL (if running locally)
- Redis (if running locally)

## Setup

1. Clone the repository
2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Development

### Using Docker (Recommended)

```bash
docker-compose up
```

### Local Development

1. Start PostgreSQL and Redis services
2. Update `.env` with your database credentials
3. Run the development server:
   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the TypeScript project
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## API Endpoints

The API will be available at `http://localhost:3000`

## Environment Variables

See `.env.example` for all required environment variables.

## License

MIT