import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { incidentStore } from '../db/store.js';
import { agentOrchestrator } from '../services/agent.js';
import { postMortemService } from '../services/postmortem.js';
import { Incident } from '../types/index.js';

const router = Router();

// GET all incidents
router.get('/', (req: Request, res: Response) => {
  const incidents = incidentStore.getAll();
  res.json({ incidents });
});

// GET dashboard stats
router.get('/stats', (req: Request, res: Response) => {
  const stats = incidentStore.getDashboardStats();
  res.json({ stats });
});

// GET single incident
router.get('/:id', (req: Request, res: Response) => {
  const incident = incidentStore.getById(req.params.id);
  if (!incident) {
    return res.status(404).json({ error: 'Incident not found' });
  }
  res.json({ incident });
});

// POST parse free-form natural language
router.post('/parse-nl', async (req: Request, res: Response) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Text field is required' });
  }

  try {
    const parsed = await agentOrchestrator.parseFreeFormIncident(text);
    res.json({ parsed });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST create structured incident
router.post('/', (req: Request, res: Response) => {
  const body = req.body;
  const now = new Date().toISOString();
  const id = `INC-${Math.floor(1300 + Math.random() * 700)}`;

  const newIncident: Incident = {
    id,
    title: body.title || 'Untitled Incident',
    service: body.service || 'core-service',
    severity: body.severity || 'P2',
    status: 'triggered',
    description: body.description || '',
    environment: body.environment || 'production',
    createdAt: now,
    updatedAt: now,
    metrics: body.metrics || {
      errorRate: 0,
      latencyMs: 150,
      cpuPercent: 50,
      memoryPercent: 50,
      dbConnectionsPercent: 30,
      timestamp: now,
    },
    deployment: body.deployment,
    logs: body.logs || [],
    timeline: [
      {
        id: uuidv4(),
        timestamp: now,
        source: 'system',
        title: 'Incident Registered',
        description: `Incident ${id} created for service "${body.service || 'core-service'}". Ready for investigation.`,
        status: 'completed',
      },
    ],
    memoryMatches: [],
    diagnosisCandidates: [],
    recommendedActions: [],
  };

  const saved = incidentStore.save(newIncident);
  res.status(201).json({ incident: saved });
});

// POST run AI investigation
router.post('/:id/investigate', async (req: Request, res: Response) => {
  try {
    const updated = await agentOrchestrator.investigate(req.params.id);
    res.json({ incident: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET real-time SSE stream for investigation
router.get('/:id/investigate/stream', async (req: Request, res: Response) => {
  const incidentId = req.params.id;
  const incident = incidentStore.getById(incidentId);
  if (!incident) {
    return res.status(404).json({ error: 'Incident not found' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendEvent = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  sendEvent({ type: 'start', incidentId });

  try {
    await agentOrchestrator.investigate(incidentId, (step) => {
      sendEvent({ type: 'step', step });
    });

    const finalIncident = incidentStore.getById(incidentId);
    sendEvent({ type: 'complete', incident: finalIncident });
  } catch (err: any) {
    sendEvent({ type: 'error', error: err.message });
  } finally {
    res.end();
  }
});

// POST approve action
router.post('/:id/actions/:actionId/approve', async (req: Request, res: Response) => {
  try {
    const updated = await agentOrchestrator.executeAction(req.params.id, req.params.actionId);
    res.json({ incident: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST reject action
router.post('/:id/actions/:actionId/reject', async (req: Request, res: Response) => {
  const { reason } = req.body;
  try {
    const updated = await agentOrchestrator.rejectAction(req.params.id, req.params.actionId, reason || 'Rejected by on-call engineer');
    res.json({ incident: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST resolve incident with feedback (retains to Hindsight)
router.post('/:id/resolve', async (req: Request, res: Response) => {
  const { feedback } = req.body;
  if (!feedback) {
    return res.status(400).json({ error: 'Engineer feedback is required' });
  }

  try {
    const result = await agentOrchestrator.resolveIncident({
      incidentId: req.params.id,
      feedback: {
        diagnosisAccuracy: feedback.diagnosisAccuracy || 'correct',
        fixOutcome: feedback.fixOutcome || 'success',
        comments: feedback.comments || '',
        submittedAt: new Date().toISOString(),
        engineerName: feedback.engineerName || 'On-Call SRE',
        retainedToHindsight: true,
      },
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST generate draft postmortem
router.post('/:id/postmortem/draft', (req: Request, res: Response) => {
  const incident = incidentStore.getById(req.params.id);
  if (!incident) return res.status(404).json({ error: 'Incident not found' });

  const draft = postMortemService.generateDraft(incident);
  res.json({ postMortem: draft });
});

// POST retain postmortem to Hindsight
router.post('/:id/postmortem/retain', async (req: Request, res: Response) => {
  const { postMortem } = req.body;
  if (!postMortem) return res.status(400).json({ error: 'Post-mortem payload required' });

  try {
    const result = await postMortemService.retainPostMortem(postMortem);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST reset incidents
router.post('/reset', (req: Request, res: Response) => {
  incidentStore.resetToDefault();
  res.json({ message: 'Store reset to defaults', stats: incidentStore.getDashboardStats() });
});

export default router;
