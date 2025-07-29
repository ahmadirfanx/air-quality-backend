// src/infrastructure/database/connection.ts (UPDATE existing file)
import { Sequelize } from 'sequelize';
import { databaseConfig } from '@/config/database.config';
import { initAirQualityModel } from '@/core/models/AirQualityModel';

class DatabaseConnection {
  private static instance: DatabaseConnection;
  private sequelize: Sequelize | null = null;

  private constructor() {}

  static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  async connect(): Promise<void> {
    if (this.sequelize) {
      console.log('Database already connected');
      return;
    }

    this.sequelize = new Sequelize(
      databaseConfig.database,
      databaseConfig.username,
      databaseConfig.password,
      {
        host: databaseConfig.host,
        port: databaseConfig.port,
        dialect: 'postgres',
        logging: databaseConfig.logging,
        pool: databaseConfig.pool,
      }
    );

    try {
      await this.sequelize.authenticate();
      console.log('Database connection established successfully');

      // Initialize models
      initAirQualityModel(this.sequelize);
    } catch (error) {
      console.error('Unable to connect to the database:', error);
      throw error;
    }
  }

  async sync(options?: any): Promise<void> {
    if (!this.sequelize) {
      throw new Error('Database not connected');
    }
    await this.sequelize.sync(options);
  }

  async disconnect(): Promise<void> {
    if (this.sequelize) {
      await this.sequelize.close();
      this.sequelize = null;
      console.log('Database connection closed');
    }
  }

  getSequelize(): Sequelize {
    if (!this.sequelize) {
      throw new Error('Database not connected');
    }
    return this.sequelize;
  }

  async authenticate(): Promise<void> {
    if (!this.sequelize) {
      throw new Error('Database not connected');
    }
    await this.sequelize.authenticate();
  }
}

export default DatabaseConnection.getInstance();
