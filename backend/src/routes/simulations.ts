import { Router, Request, Response } from 'express';
import { simulationService } from '../services/simulator.js';

const router = Router();

// GET all simulation scenarios
router.get('/', (req: Request, res: Response) => {
  const scenarios = simulationService.getScenarios();
  res.json({ scenarios });
});

// POST launch scenario
router.post('/launch', (req: Request, res: Response) => {
  const { scenarioId } = req.body;
  if (!scenarioId) {
    return res.status(400).json({ error: 'scenarioId is required' });
  }

  try {
    const incident = simulationService.launchScenario(scenarioId);
    res.status(201).json({ incident });
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

export default router;
