import { Router } from 'express';
import { HealthController } from '../controllers/HealthController';

const router = Router();
const healthController = new HealthController();

router.get('/', healthController.checkHealth.bind(healthController));

export default router;
