import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { DataIngestionController } from '@/api/controllers/DataIngestionController';
import { validateIngestion } from '@/api/validators/ingestion.validator';

const router = Router();
// Use absolute path for uploads directory
const uploadsDir = path.join(process.cwd(), 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({ dest: uploadsDir });
const controller = new DataIngestionController();

router.post(
  '/',
  upload.single('file'),
  validateIngestion,
  controller.initiateIngestion.bind(controller)
);

router.get('/status/:jobId', controller.getIngestionStatus.bind(controller));

export default router;
