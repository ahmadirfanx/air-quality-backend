// src/api/routes/index.ts
import { Router } from 'express';
import healthRoutes from './health.routes';
import ingestionRoutes from './ingestion.routes';
import airQualityRoutes from './airQuality.routes';

const router = Router();

// Mount route modules
router.use('/health', healthRoutes);
router.use('/ingest', ingestionRoutes);
router.use('/air-quality', airQualityRoutes);

export default router;
