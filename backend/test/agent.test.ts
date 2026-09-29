import { agentOrchestrator } from '../src/services/agent.js';
import { incidentStore } from '../src/db/store.js';
import { memoryBankService } from '../src/services/memoryBank.js';
import { postMortemService } from '../src/services/postmortem.js';
import { hindsightService } from '../src/services/hindsight.js';

async function runTests() {
  console.log('🧪 Starting OpsMemory AI Backend Test Suite...');

  // 1. Natural Language Parsing Test
  console.log('\n--- 1. Testing Natural Language Parser ---');
  const parsed = await agentOrchestrator.parseFreeFormIncident(
    "Payments API latency increased to 5 seconds after today's deployment. Database connections are at 98%."
  );
  console.log('Parsed Result:', {
    service: parsed.service,
    severity: parsed.severity,
    latencyMs: parsed.metrics?.latencyMs,
    dbConnectionsPercent: parsed.metrics?.dbConnectionsPercent,
  });
  if (parsed.service !== 'payments-api') throw new Error('Service extraction failed');
  if (parsed.metrics?.dbConnectionsPercent !== 98) throw new Error('DB connection extraction failed');
  console.log('✅ Natural Language Parser passed');

  // 2. Incident Creation & Investigation
  console.log('\n--- 2. Testing Autonomous Investigation Pipeline ---');
  const incident = incidentStore.save({
    id: 'INC-TEST-1',
    title: 'Test Surge on Payments API',
    service: 'payments-api',
    severity: 'P1',
    status: 'triggered',
    description: 'Sudden 504 timeouts and DB saturation',
    environment: 'production',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metrics: {
      errorRate: 19.5,
      latencyMs: 4900,
      cpuPercent: 78,
      memoryPercent: 65,
      dbConnectionsPercent: 97,
      timestamp: new Date().toISOString(),
    },
    logs: [
      '[ERROR] payments-api: TimeoutException: Timed out waiting for connection from pool "pg-pool-main"',
    ],
    timeline: [],
    memoryMatches: [],
    diagnosisCandidates: [],
    recommendedActions: [],
  });

  const investigated = await agentOrchestrator.investigate(incident.id, (step) => {
    console.log(`[Stream Event] ${step.source.toUpperCase()}: ${step.title}`);
  });

  console.log('Diagnosis candidates count:', investigated.diagnosisCandidates.length);
  console.log('Top Diagnosis:', investigated.diagnosisCandidates[0]?.rootCause, `(${investigated.diagnosisCandidates[0]?.confidence} confidence)`);
  console.log('Hindsight memory matches recalled:', investigated.memoryMatches.length);
  if (investigated.memoryMatches.length === 0) throw new Error('Expected Hindsight memory recall matches');
  console.log('Top Hindsight Memory:', investigated.memoryMatches[0].title, `(${investigated.memoryMatches[0].relevanceScore}% similarity)`);
  console.log('✅ Autonomous Investigation & Memory Recall passed');

  // 3. Human Approval Gate
  console.log('\n--- 3. Testing Human Approval Gate ---');
  const remediateAction = investigated.recommendedActions.find(a => a.category === 'remediation');
  if (!remediateAction) throw new Error('Expected remediation action');
  console.log('Testing approval for action:', remediateAction.title);
  
  const executed = await agentOrchestrator.executeAction(investigated.id, remediateAction.id);
  const updatedAction = executed.recommendedActions.find(a => a.id === remediateAction.id);
  if (updatedAction?.approvalStatus !== 'executed') throw new Error('Action execution status mismatch');
  console.log('✅ Human Action Approval & Execution passed');

  // 4. Human Feedback & Hindsight Retention
  console.log('\n--- 4. Testing Feedback & Hindsight Retention ---');
  const resolveRes = await agentOrchestrator.resolveIncident({
    incidentId: investigated.id,
    feedback: {
      diagnosisAccuracy: 'correct',
      fixOutcome: 'success',
      comments: 'Scaling connection pool immediately cleared 504 timeouts. Verified by SRE on-call.',
      submittedAt: new Date().toISOString(),
      engineerName: 'Lead SRE',
      retainedToHindsight: true,
    },
  });
  console.log('Resolved Incident Status:', resolveRes.incident.status);
  console.log('Retained Memory ID:', resolveRes.memoryId);
  if (resolveRes.incident.status !== 'resolved') throw new Error('Incident not marked resolved');
  console.log('✅ Feedback & Hindsight Retention passed');

  // 5. Post-Mortem Generation & Retention
  console.log('\n--- 5. Testing Automated Post-Mortem & Hindsight Retention ---');
  const draftPostMortem = postMortemService.generateDraft(resolveRes.incident);
  console.log('Generated Draft Post-Mortem:', draftPostMortem.title);
  const postMortemRetain = await postMortemService.retainPostMortem(draftPostMortem);
  console.log('Post-Mortem Retained in Hindsight:', postMortemRetain.success, 'Memory ID:', postMortemRetain.memoryId);
  if (!postMortemRetain.success) throw new Error('Post-Mortem retention failed');
  console.log('✅ Post-Mortem Generation & Retention passed');

  // 6. Memory Explorer Search
  console.log('\n--- 6. Testing Hindsight Memory Search ---');
  const searchResults = await memoryBankService.searchMemories('payments-api database connection pool');
  console.log(`Found ${searchResults.length} memories in Hindsight memory explorer.`);
  if (searchResults.length === 0) throw new Error('Memory search returned 0 items');
  console.log('✅ Hindsight Memory Search passed');

  console.log('\n🎉 ALL 6 BACKEND INTEGRATION TESTS PASSED SUCCESSFULLY!\n');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
