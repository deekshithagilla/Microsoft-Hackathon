import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { config } from './config.js';
import incidentsRouter from './routes/incidents.js';
import memoryRouter from './routes/memory.js';
import simulationsRouter from './routes/simulations.js';
import healthRouter from './routes/health.js';

const app = express();

app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  if (!req.path.includes('/stream')) {
    console.log(`[API] ${req.method} ${req.path}`);
  }
  next();
});

// API Routes
app.use('/api/incidents', incidentsRouter);
app.use('/api/memory', memoryRouter);
app.use('/api/simulations', simulationsRouter);
app.use('/api/health', healthRouter);

// Serve production frontend assets if available
const candidateDistPaths = [
  path.resolve(process.cwd(), 'frontend/dist'),
  path.resolve(process.cwd(), '../frontend/dist'),
  path.resolve(process.cwd(), 'dist/frontend'),
];
const frontendDistPath = candidateDistPaths.find(p => fs.existsSync(p));

if (frontendDistPath) {
  console.log(`[Static] Serving production frontend from ${frontendDistPath}`);
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

app.listen(config.port, () => {
  console.log(`=======================================================`);
  console.log(`⚡ OpsMemory AI Unified Production Engine`);
  console.log(`🚀 Server listening on http://localhost:${config.port}`);
  console.log(`🧠 Hindsight Memory Bank: "${config.hindsightBankId}"`);
  console.log(`🔗 Hindsight Daemon Target: ${config.hindsightUrl}`);
  console.log(`=======================================================`);
});

