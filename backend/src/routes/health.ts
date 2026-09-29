import { Router, Request, Response } from 'express';
import { hindsightService } from '../services/hindsight.js';
import { incidentStore } from '../db/store.js';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const isHindsightLive = await hindsightService.checkLiveConnection();
  const hindsightStatus = hindsightService.getConnectionStatus();
  const stats = incidentStore.getDashboardStats();

  res.json({
    status: 'healthy',
    name: 'OpsMemory AI Engine',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    hindsight: {
      isLiveDaemon: isHindsightLive,
      status: hindsightStatus.status,
      bankId: hindsightStatus.bankId,
      url: hindsightStatus.url,
      memoriesCount: hindsightStatus.memoriesCount,
    },
    systemStats: stats,
  });
});

export default router;
