import { Incident, MetricSnapshot, TimelineEvent } from '../types/index.js';
import { StoredMemoryRecord } from '../services/hindsight.js';

export const SEED_HISTORICAL_MEMORIES: StoredMemoryRecord[] = [
  {
    id: 'mem-1042-success',
    bankId: 'opsmemory-production',
    incidentId: 'INC-1042',
    type: 'experience',
    service: 'payments-api',
    rootCause: 'Database connection pool exhaustion',
    resolution: 'Increased connection pool allocation from 100 to 150 in payments-api config',
    outcome: 'success',
    recoveryTimeMinutes: 4,
    engineerFeedback: 'Increasing pool to 150 immediately cleared the 504 gateway timeouts. Similar incidents should check connection saturation first.',
    timestamp: '2026-09-11T10:30:00.000Z',
    tags: ['service:payments-api', 'severity:P1', 'outcome:success', 'type:experience', 'symptom:db_saturation:98%', 'symptom:latency:5200ms'],
    metadata: { service: 'payments-api', severity: 'P1', outcome: 'success', incidentId: 'INC-1042' },
    content: `
Incident: INC-1042
Timestamp: 2026-09-11T10:30:00Z
Service: payments-api
Severity: P1
Symptoms: Latency spiked to 5200ms, Error rate 19.4%, DB Connections reached 98% saturation.
Evidence: [FATAL] pool exhausted, acquire timeout 30000ms.
Diagnosis: Database connection pool exhaustion caused by sudden query surge following marketing campaign.
Resolution: Increased connection pool allocation from 100 to 150 in payments-api config and restarted web pool.
Outcome: SUCCESSFUL
Recovery Time: 4 minutes
Engineer Feedback: "Increasing pool to 150 immediately cleared the 504 gateway timeouts. Similar incidents should check connection saturation first."
`.trim(),
  },
  {
    id: 'mem-1098-failed',
    bankId: 'opsmemory-production',
    incidentId: 'INC-1098',
    type: 'experience',
    service: 'payments-api',
    rootCause: 'Redis connection timeout causing downstream query pileups',
    resolution: 'Increased database connection pool from 150 to 200 (FAILED REMEDIATION)',
    outcome: 'failed',
    recoveryTimeMinutes: 28,
    engineerFeedback: 'Increasing DB connection pool did NOT fix the issue and exacerbated database load. Actual root cause was Redis cache timeouts. Avoid increasing DB pool when Redis timeout errors are present!',
    timestamp: '2026-09-18T14:15:00.000Z',
    tags: ['service:payments-api', 'severity:P1', 'outcome:failed', 'warning:failed_fix', 'type:experience', 'symptom:latency:4200ms', 'symptom:redis_timeout'],
    metadata: { service: 'payments-api', severity: 'P1', outcome: 'failed', incidentId: 'INC-1098', failedAction: 'increase_db_pool' },
    content: `
Incident: INC-1098
Timestamp: 2026-09-18T14:15:00Z
Service: payments-api
Severity: P1
Symptoms: Latency 4200ms, Error rate 14%, Redis client timeouts in logs, DB connections elevated to 88%.
Attempted Action: Engineer increased database connection pool from 150 to 200.
Outcome: FAILED. Database CPU spiked to 100% and latency deteriorated further.
Actual Resolution: Fixed Redis cluster node failover and cleared stale cache connections.
Recovery Time: 28 minutes
Engineer Feedback: "Increasing DB connection pool did NOT fix the issue and exacerbated database load. Actual root cause was Redis cache timeouts. Avoid increasing DB pool when Redis timeout errors are present!"
`.trim(),
  },
  {
    id: 'mem-1150-auth',
    bankId: 'opsmemory-production',
    incidentId: 'INC-1150',
    type: 'experience',
    service: 'auth-service',
    rootCause: 'Uncached JWKS public key lookups under token refresh burst',
    resolution: 'Enabled in-memory JWKS caching with 15-minute TTL',
    outcome: 'success',
    recoveryTimeMinutes: 6,
    engineerFeedback: 'Auth latency dropped from 3400ms to 42ms after JWKS cache was enabled.',
    timestamp: '2026-09-21T09:00:00.000Z',
    tags: ['service:auth-service', 'severity:P2', 'outcome:success', 'type:experience', 'symptom:cpu_saturation:92%'],
    metadata: { service: 'auth-service', severity: 'P2', outcome: 'success', incidentId: 'INC-1150' },
    content: `
Incident: INC-1150
Timestamp: 2026-09-21T09:00:00Z
Service: auth-service
Severity: P2
Symptoms: CPU reached 92%, token verification latency spiked to 3400ms.
Diagnosis: Uncached JWKS public key lookups under token refresh burst.
Resolution: Enabled in-memory JWKS caching with 15-minute TTL.
Outcome: SUCCESSFUL
Recovery Time: 6 minutes
Engineer Feedback: "Auth latency dropped from 3400ms to 42ms after JWKS cache was enabled."
`.trim(),
  },
  {
    id: 'mem-1205-memoryleak',
    bankId: 'opsmemory-production',
    incidentId: 'INC-1205',
    type: 'experience',
    service: 'order-service',
    rootCause: 'Memory leak in order streaming buffer introduced in v2.7.4',
    resolution: 'Rolled back deployment v2.7.4 to stable release v2.7.3',
    outcome: 'success',
    recoveryTimeMinutes: 12,
    engineerFeedback: 'Rollback immediately restored pod stability. The buffer leak bug was fixed in PR #409.',
    timestamp: '2026-09-24T16:20:00.000Z',
    tags: ['service:order-service', 'severity:P1', 'outcome:success', 'type:experience', 'symptom:memory_saturation:96%'],
    metadata: { service: 'order-service', severity: 'P1', outcome: 'success', incidentId: 'INC-1205' },
    content: `
Incident: INC-1205
Timestamp: 2026-09-24T16:20:00Z
Service: order-service
Severity: P1
Symptoms: Container memory continuously climbed to 96% with recurring OOMKilled crashes.
Diagnosis: Unbounded event buffer in v2.7.4 release.
Resolution: Rolled back deployment v2.7.4 to stable release v2.7.3.
Outcome: SUCCESSFUL
Recovery Time: 12 minutes
Engineer Feedback: "Rollback immediately restored pod stability. The buffer leak bug was fixed in PR #409."
`.trim(),
  },
];

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'INC-1301',
    title: 'Payments API 504 Gateway Timeouts & High Latency',
    service: 'payments-api',
    severity: 'P1',
    status: 'triggered',
    description: 'Payments API latency increased to 5.2 seconds with a 21.4% error rate following deployment of v2.8.2. Multiple clients report 504 Gateway Timeout during checkout processing.',
    environment: 'production',
    createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    metrics: {
      errorRate: 21.4,
      latencyMs: 5240,
      cpuPercent: 78,
      memoryPercent: 68,
      dbConnectionsPercent: 97,
      timestamp: new Date().toISOString(),
    },
    deployment: {
      version: 'v2.8.2',
      deployedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      commitHash: '7f9c2a1',
      author: 'alex.dev@opsmemory.io',
      description: 'Add support for merchant batch processing and invoice webhook hooks',
      changedFiles: ['src/services/batchProcessor.ts', 'src/db/connection.ts', 'config/production.json'],
    },
    logs: [
      '2026-09-29T18:02:11Z [WARN] payments-api: Connection pool utilization > 90% (90/100 connections acquired)',
      '2026-09-29T18:02:19Z [ERROR] payments-api: TimeoutException: Timed out after 30000ms waiting for connection from pool "pg-pool-main"',
      '2026-09-29T18:02:24Z [FATAL] payments-api: HTTP 504 Gateway Timeout for POST /v1/charges (duration: 30004ms)',
      '2026-09-29T18:02:30Z [WARN] nginx-ingress: Upstream timed out (110: Connection timed out) while reading response header from upstream',
    ],
    timeline: [
      {
        id: 't-1',
        timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
        source: 'system',
        title: 'Alert Fired: P1 High 5xx Error Rate',
        description: 'PagerDuty triggered: payments-api error rate breached threshold (21.4% > 2.0%)',
        status: 'completed',
      },
      {
        id: 't-2',
        timestamp: new Date(Date.now() - 1000 * 60 * 16).toISOString(),
        source: 'agent',
        title: 'OpsMemory AI Ingested Incident',
        description: 'Auto-correlated metrics: DB connection saturation at 97%, latency at 5240ms',
        status: 'completed',
      },
    ],
    memoryMatches: [],
    diagnosisCandidates: [],
    recommendedActions: [],
  },
  {
    id: 'INC-1298',
    title: 'Auth Service Latency Spike during Token Refresh',
    service: 'auth-service',
    severity: 'P2',
    status: 'resolved',
    description: 'Auth service CPU peaked at 94% with auth verification latency reaching 3.8s.',
    environment: 'production',
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    resolvedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    recoveryTimeMinutes: 7,
    metrics: {
      errorRate: 4.2,
      latencyMs: 3800,
      cpuPercent: 94,
      memoryPercent: 62,
      dbConnectionsPercent: 44,
      timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    },
    logs: [
      '[WARN] auth-service: Heavy cryptographic key computation on event loop',
      '[INFO] auth-service: Applied in-memory JWKS cache configuration',
    ],
    timeline: [
      {
        id: 't-auth-1',
        timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
        source: 'system',
        title: 'Alert Fired: Auth Service High Latency',
        description: 'P2 Latency threshold breached on /auth/verify',
        status: 'completed',
      },
      {
        id: 't-auth-2',
        timestamp: new Date(Date.now() - 1000 * 60 * 175).toISOString(),
        source: 'agent',
        title: 'Recalled Hindsight Memory INC-1150',
        description: 'Agent identified uncached JWKS public key lookups based on memory match.',
        status: 'completed',
      },
      {
        id: 't-auth-3',
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        source: 'engineer',
        title: 'Resolved by SRE Team',
        description: 'Cached JWKS keys with 15m TTL. Latency normalized to 38ms.',
        status: 'completed',
      },
    ],
    memoryMatches: [],
    diagnosisCandidates: [],
    recommendedActions: [],
  },
];
