import { Request, Response } from 'express';

export class HealthController {
  async checkHealth(req: Request, res: Response) {
    res.json({
      success: true,
      message: 'Air Quality API is healthy',
      data: {
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  }
}
