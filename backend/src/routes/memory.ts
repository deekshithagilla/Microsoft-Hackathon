import { Router, Request, Response } from 'express';
import { memoryBankService } from '../services/memoryBank.js';
import { hindsightService } from '../services/hindsight.js';
import { config } from '../config.js';

const router = Router();

// GET all memories in the bank
router.get('/', (req: Request, res: Response) => {
  const memories = memoryBankService.getAllMemories();
  const status = hindsightService.getConnectionStatus();
  res.json({ memories, status });
});

// POST recall search
router.post('/recall', async (req: Request, res: Response) => {
  const { query, service, outcome, type } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
    const results = await memoryBankService.searchMemories(query, {
      service,
      outcome,
      type,
    });
    res.json({ results, query, count: results.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST reflect agentic synthesis
router.post('/reflect', async (req: Request, res: Response) => {
  const { query, context } = req.body;
  if (!query) return res.status(400).json({ error: 'Reflection query is required' });

  try {
    const result = await hindsightService.reflect(config.hindsightBankId, query, { context });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST manually retain custom memory/fact/runbook
router.post('/retain', async (req: Request, res: Response) => {
  const { content, type, service, tags, metadata } = req.body;
  if (!content) return res.status(400).json({ error: 'Content is required' });

  try {
    const allTags = [...(tags || [])];
    if (service) allTags.push(`service:${service}`);
    if (type) allTags.push(`type:${type}`);

    const result = await hindsightService.retain(config.hindsightBankId, content, {
      type: type || 'fact',
      service,
      tags: allTags,
      metadata: metadata || {},
    });

    res.status(201).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET status
router.get('/status', (req: Request, res: Response) => {
  const status = hindsightService.getConnectionStatus();
  res.json(status);
});

export default router;
