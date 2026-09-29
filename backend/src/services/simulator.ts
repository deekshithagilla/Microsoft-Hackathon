import { v4 as uuidv4 } from 'uuid';
import { Incident } from '../types/index.js';
import { incidentStore } from '../db/store.js';
import { hindsightService } from './hindsight.js';
import { config } from '../config.js';

export interface SimulationScenario {
  id: string;
  name: string;
  category: 'core_demo' | 'system_failures';
  badge: string;
  description: string;
  learningPoint: string;
  initialIncident: Partial<Incident>;
  hasPriorMemory: boolean;
  priorMemoryId?: string;
}

export const SCENARIOS: SimulationScenario[] = [
  {
    id: 'scenario-a-db-first',
    name: 'Scenario A: DB Pool Exhaustion (Day 1 - Zero Prior Memory)',
    category: 'core_demo',
    badge: 'Baseline: No Memory',
    description: 'First time encountering a connection pool exhaustion surge. The agent must investigate from first principles without historical memories.',
    learningPoint: 'Baseline investigation: Evaluates symptoms from scratch, requires longer triage, and stores the first resolution experience in Hindsight upon resolution.',
    hasPriorMemory: false,
    initialIncident: {
      title: 'Payments API: 504 Gateway Timeouts During Traffic Surge',
      service: 'payments-api',
      severity: 'P1',
      description: 'Sudden spike in checkout requests caused payments-api latency to jump from 120ms to 4800ms with a 19.8% 5xx error rate.',
      environment: 'production',
      metrics: {
        errorRate: 19.8,
        latencyMs: 4800,
        cpuPercent: 72,
        memoryPercent: 64,
        dbConnectionsPercent: 96,
        timestamp: new Date().toISOString(),
      },
      logs: [
        '[WARN] payments-api: Pool utilization warning: 96/100 connections acquired',
        '[ERROR] payments-api: TimeoutException: Timed out after 30000ms waiting for connection from pool "pg-pool-main"',
        '[FATAL] payments-api: HTTP 504 Gateway Timeout for POST /v1/charges',
      ],
      deployment: {
        version: 'v2.8.0',
        deployedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        commitHash: '3a8f1b2',
        author: 'sre-team@opsmemory.io',
        description: 'Standard maintenance release',
        changedFiles: ['config/production.json'],
      },
    },
  },
  {
    id: 'scenario-b-db-learned',
    name: 'Scenario B: DB Pool Exhaustion (Day 18 - Hindsight Recalled!)',
    category: 'core_demo',
    badge: 'Hindsight Accelerated',
    description: 'An identical DB connection surge occurs weeks later. The agent queries Hindsight, immediately recalls Scenario A (INC-1042), and achieves high-confidence diagnosis in seconds.',
    learningPoint: 'The agent is 70% faster because of Hindsight memory! Confirms 94% relevance match, shows past successful resolution, and cites engineer feedback.',
    hasPriorMemory: true,
    priorMemoryId: 'INC-1042',
    initialIncident: {
      title: 'Payments API: Database Connection Saturation Under Load',
      service: 'payments-api',
      severity: 'P1',
      description: 'Latency spiked to 5100ms and DB connections reached 98% following marketing flash sale. Identical symptoms to INC-1042.',
      environment: 'production',
      metrics: {
        errorRate: 22.1,
        latencyMs: 5120,
        cpuPercent: 76,
        memoryPercent: 67,
        dbConnectionsPercent: 98,
        timestamp: new Date().toISOString(),
      },
      logs: [
        '[WARN] payments-api: Connection pool utilization > 95% (98/100 connections acquired)',
        '[ERROR] payments-api: Connection acquisition timeout on pg-pool-main (30000ms)',
        '[FATAL] payments-api: HTTP 504 Gateway Timeout for POST /v1/charges/checkout',
      ],
    },
  },
  {
    id: 'scenario-c-failed-fix',
    name: 'Scenario C: Failed Solution Memory (Redis Starvation)',
    category: 'core_demo',
    badge: 'Negative Memory',
    description: 'Latency spikes on payments-api. DB connections are elevated (88%), tempting the engineer to increase pool size. BUT Hindsight recalls that increasing DB pool previously FAILED in INC-1098 because the actual bottleneck is Redis!',
    learningPoint: 'OpsMemory remembers FAILED fixes! Prevents engineers from repeating past mistakes and steers diagnosis directly to Redis cache cluster remediation.',
    hasPriorMemory: true,
    priorMemoryId: 'INC-1098',
    initialIncident: {
      title: 'Payments API: Checkout Latency Degradation & Intermittent Timeouts',
      service: 'payments-api',
      severity: 'P1',
      description: 'Latency reached 4300ms. DB connections at 88%. Redis client socket warnings observed. Engineer needs guidance on whether to scale DB pool.',
      environment: 'production',
      metrics: {
        errorRate: 15.6,
        latencyMs: 4320,
        cpuPercent: 84,
        memoryPercent: 71,
        dbConnectionsPercent: 88,
        timestamp: new Date().toISOString(),
      },
      logs: [
        '[WARN] payments-api: RedisClientTimeout: connection to redis-cluster-node-2 timed out after 5000ms',
        '[ERROR] payments-api: Cache miss spike triggering fallback to direct database queries',
        '[WARN] payments-api: DB connection utilization reached 88/100 due to cache bypass',
      ],
    },
  },
  {
    id: 'scenario-redis-timeout',
    name: 'Scenario: Redis Cluster Node Failover & Cache Saturation',
    category: 'system_failures',
    badge: 'Cache Failure',
    description: 'A primary Redis shard becomes unresponsive under high throughput, causing severe cache miss cascades.',
    learningPoint: 'Agent recognizes cross-service cache dependency patterns and suggests automated cluster failover.',
    hasPriorMemory: false,
    initialIncident: {
      title: 'Cache Cluster: Master Node Unreachable & Socket Pool Timeouts',
      service: 'cache-cluster',
      severity: 'P1',
      description: 'Redis master shard node-01 is dropping connection requests, causing cache hit rates to drop from 99.2% to 41.5%.',
      environment: 'production',
      metrics: {
        errorRate: 28.4,
        latencyMs: 3890,
        cpuPercent: 98,
        memoryPercent: 89,
        dbConnectionsPercent: 92,
        timestamp: new Date().toISOString(),
      },
      logs: [
        '[FATAL] redis-sentinel: Master node 10.0.4.12:6379 failed ping check for 15000ms',
        '[ERROR] payments-api: RedisConnectionException: Connection reset by peer',
      ],
    },
  },
  {
    id: 'scenario-memory-leak',
    name: 'Scenario: Heap Memory Leak in Order Streaming Buffer',
    category: 'system_failures',
    badge: 'Memory Leak',
    description: 'Order service pods are restarting in a crash loop (OOMKilled) following rollout of v2.7.4.',
    learningPoint: 'Correlates deployment commit diffs with container cgroup memory metrics and matches historical INC-1205.',
    hasPriorMemory: true,
    priorMemoryId: 'INC-1205',
    initialIncident: {
      title: 'Order Service: Recurring Pod OOMKilled Restarts',
      service: 'order-service',
      severity: 'P1',
      description: 'Order streaming pod memory continuously grows to 96% of container limit until Kubernetes sends SIGKILL.',
      environment: 'production',
      metrics: {
        errorRate: 14.2,
        latencyMs: 2400,
        cpuPercent: 65,
        memoryPercent: 96,
        dbConnectionsPercent: 35,
        timestamp: new Date().toISOString(),
      },
      deployment: {
        version: 'v2.7.4',
        deployedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        commitHash: '8b3c9f2',
        author: 'dev@opsmemory.io',
        description: 'Implement real-time order status webhooks buffer',
        changedFiles: ['src/buffers/orderStream.ts', 'src/listeners/webhook.ts'],
      },
      logs: [
        '[WARN] order-service: Process heap total: 1984MB / 2048MB (96.8%)',
        '[CRITICAL] kubelet: Container order-service in pod order-service-7d6f-k9x2 exceeded memory limit, sending SIGKILL (OOMKilled)',
      ],
    },
  },
  {
    id: 'scenario-auth-cpu',
    name: 'Scenario: Auth Service Cryptographic CPU Starvation',
    category: 'system_failures',
    badge: 'CPU Spike',
    description: 'Sudden spike in user authentication requests causes token verification CPU to reach 94%.',
    learningPoint: 'Recalls historical incident INC-1150 and validates in-memory JWKS caching remediation.',
    hasPriorMemory: true,
    priorMemoryId: 'INC-1150',
    initialIncident: {
      title: 'Auth Service: High Latency & Event Loop Starvation',
      service: 'auth-service',
      severity: 'P2',
      description: 'Token validation latency spiked to 3900ms. CPU usage at 94% due to repeated RSA verification.',
      environment: 'production',
      metrics: {
        errorRate: 6.8,
        latencyMs: 3900,
        cpuPercent: 94,
        memoryPercent: 62,
        dbConnectionsPercent: 38,
        timestamp: new Date().toISOString(),
      },
      logs: [
        '[WARN] auth-service: Event loop delay > 450ms during JWT signature verification',
        '[INFO] auth-service: Remote JWKS key fetched over network for every request',
      ],
    },
  },
];

export class SimulationService {
  public getScenarios(): SimulationScenario[] {
    return SCENARIOS;
  }

  public launchScenario(scenarioId: string): Incident {
    const scenario = SCENARIOS.find(s => s.id === scenarioId);
    if (!scenario) throw new Error(`Scenario ${scenarioId} not found`);

    const incidentId = `INC-${Math.floor(1300 + Math.random() * 600)}`;
    const now = new Date().toISOString();

    const incident: Incident = {
      id: incidentId,
      title: scenario.initialIncident.title || 'Simulated Production Incident',
      service: scenario.initialIncident.service || 'payments-api',
      severity: scenario.initialIncident.severity || 'P1',
      status: 'triggered',
      description: scenario.initialIncident.description || '',
      environment: scenario.initialIncident.environment || 'production',
      createdAt: now,
      updatedAt: now,
      metrics: scenario.initialIncident.metrics || {
        errorRate: 15,
        latencyMs: 3500,
        cpuPercent: 75,
        memoryPercent: 70,
        dbConnectionsPercent: 85,
        timestamp: now,
      },
      deployment: scenario.initialIncident.deployment,
      logs: scenario.initialIncident.logs || [],
      timeline: [
        {
          id: uuidv4(),
          timestamp: now,
          source: 'system',
          title: `Alert Triggered: ${scenario.name}`,
          description: `PagerDuty fired incident alert for service "${scenario.initialIncident.service}". Telemetry and logs ingested.`,
          status: 'completed',
        },
      ],
      memoryMatches: [],
      diagnosisCandidates: [],
      recommendedActions: [],
      isSimulated: true,
      simulationScenarioId: scenario.id,
    };

    incidentStore.save(incident);
    console.log(`[Simulator] Launched scenario "${scenario.name}" -> Incident ID: ${incidentId}`);
    return incident;
  }
}

export const simulationService = new SimulationService();
