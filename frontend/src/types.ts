export type Severity = 'P1' | 'P2' | 'P3' | 'P4';

export type IncidentStatus = 
  | 'triggered'
  | 'investigating'
  | 'identified'
  | 'mitigating'
  | 'resolved';

export type MemoryType = 'experience' | 'fact' | 'observation' | 'opinion';

export type ResolutionOutcome = 'success' | 'failed' | 'partial';

export interface TimelineEvent {
  id: string;
  timestamp: string;
  source: 'system' | 'agent' | 'engineer' | 'hindsight';
  title: string;
  description: string;
  detail?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'warning' | 'error';
}

export interface MetricSnapshot {
  errorRate: number;
  latencyMs: number;
  cpuPercent: number;
  memoryPercent: number;
  dbConnectionsPercent: number;
  timestamp: string;
}

export interface DeploymentInfo {
  version: string;
  deployedAt: string;
  commitHash: string;
  author: string;
  description: string;
  changedFiles: string[];
}

export interface RecalledMemoryMatch {
  id: string;
  incidentId?: string;
  relevanceScore: number;
  title: string;
  service: string;
  rootCause: string;
  resolution: string;
  outcome: ResolutionOutcome;
  recoveryTimeMinutes?: number;
  occurredAt: string;
  whyMatters: string;
  memoryType: MemoryType;
  engineerFeedback?: string;
  sourceBank: string;
  isNegativeExample?: boolean;
}

export interface DiagnosisCandidate {
  id: string;
  rank: number;
  rootCause: string;
  confidence: 'High' | 'Medium' | 'Low';
  confidenceScore: number;
  confidenceLabel: 'Likely cause' | 'Evidence suggests' | 'Historical match' | 'Needs verification';
  summary: string;
  supportingEvidence: string[];
  supportingMemories: string[];
  contradictoryEvidence?: string[];
  recommendedVerification: string[];
}

export interface RecommendedAction {
  id: string;
  title: string;
  description: string;
  category: 'investigation' | 'remediation' | 'verification';
  isDangerous: boolean;
  requiresApproval: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'executed';
  rejectionReason?: string;
  commandOrPayload?: string;
  estimatedRisk: 'Low' | 'Medium' | 'High';
  executionResult?: {
    success: boolean;
    output: string;
    executedAt: string;
  };
}

export interface EngineerFeedback {
  diagnosisAccuracy: 'correct' | 'incorrect' | 'partially_correct';
  fixOutcome: ResolutionOutcome;
  comments: string;
  submittedAt: string;
  engineerName: string;
  retainedToHindsight: boolean;
}

export interface PostMortem {
  id: string;
  incidentId: string;
  title: string;
  summary: string;
  timeline: { time: string; event: string }[];
  impact: string;
  symptoms: string[];
  rootCause: string;
  contributingFactors: string[];
  resolution: string;
  whatWorked: string[];
  whatFailed: string[];
  recoveryTimeMinutes: number;
  lessonsLearned: string[];
  actionItems: string[];
  status: 'draft' | 'finalized' | 'retained_to_hindsight';
  retainedAt?: string;
}

export interface Incident {
  id: string;
  title: string;
  service: string;
  severity: Severity;
  status: IncidentStatus;
  description: string;
  environment: 'production' | 'staging';
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  recoveryTimeMinutes?: number;
  metrics: MetricSnapshot;
  deployment?: DeploymentInfo;
  logs: string[];
  timeline: TimelineEvent[];
  memoryMatches: RecalledMemoryMatch[];
  diagnosisCandidates: DiagnosisCandidate[];
  recommendedActions: RecommendedAction[];
  feedback?: EngineerFeedback;
  postMortem?: PostMortem;
  isSimulated?: boolean;
  simulationScenarioId?: string;
}

export interface DashboardStats {
  activeIncidents: number;
  resolvedToday: number;
  avgResolutionTimeFormatted: string;
  avgResolutionTimeMinutes: number;
  historicalMemoriesCount: number;
  successfulResolutionsCount: number;
  failedResolutionsCount: number;
  learningAccelerationPercent: number;
}

export interface StoredMemoryRecord {
  id: string;
  bankId: string;
  content: string;
  type: MemoryType;
  context?: string;
  timestamp: string;
  tags: string[];
  metadata: Record<string, string>;
  incidentId?: string;
  outcome?: ResolutionOutcome;
  service?: string;
  rootCause?: string;
  resolution?: string;
  engineerFeedback?: string;
  recoveryTimeMinutes?: number;
}

export interface SimulationScenario {
  id: string;
  name: string;
  category: 'core_demo' | 'system_failures';
  badge: string;
  description: string;
  learningPoint: string;
  hasPriorMemory: boolean;
  priorMemoryId?: string;
}
