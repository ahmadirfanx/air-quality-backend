import { Router } from 'express';
import multer from 'multer';
import { DataIngestionController } from '@/api/controllers/DataIngestionController';
import { validateIngestion } from '@/api/validators/ingestion.validator';

const router = Router();
const upload = multer({ dest: 'uploads/' });
const controller = new DataIngestionController();

router.post(
  '/',
  upload.single('file'),
  validateIngestion,
  controller.initiateIngestion.bind(controller)
);

router.get('/status/:jobId', controller.getIngestionStatus.bind(controller));

export default router;
