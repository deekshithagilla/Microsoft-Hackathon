import express from 'express';
import cors from 'cors';
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

// Routes
app.use('/api/incidents', incidentsRouter);
app.use('/api/memory', memoryRouter);
app.use('/api/simulations', simulationsRouter);
app.use('/api/health', healthRouter);

app.listen(config.port, () => {
  console.log(`=======================================================`);
  console.log(`⚡ OpsMemory AI Backend Engine`);
  console.log(`🚀 Server listening on http://localhost:${config.port}`);
  console.log(`🧠 Hindsight Memory Bank: "${config.hindsightBankId}"`);
  console.log(`🔗 Hindsight Daemon Target: ${config.hindsightUrl}`);
  console.log(`=======================================================`);
});
