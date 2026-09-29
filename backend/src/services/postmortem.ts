import { v4 as uuidv4 } from 'uuid';
import { Incident, PostMortem } from '../types/index.js';
import { incidentStore } from '../db/store.js';
import { hindsightService } from './hindsight.js';
import { config } from '../config.js';

export class PostMortemService {
  /**
   * Automatically generate draft post-mortem from incident evidence, diagnosis and timeline
   */
  public generateDraft(incident: Incident): PostMortem {
    const executedAction = incident.recommendedActions.find(a => a.approvalStatus === 'executed');
    const primaryDiagnosis = incident.diagnosisCandidates[0];
    const topMemory = incident.memoryMatches[0];

    const timeline = incident.timeline.map(t => ({
      time: new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      event: `${t.title}: ${t.description}`,
    }));

    const recoveryMinutes = incident.recoveryTimeMinutes || 4;

    const draft: PostMortem = {
      id: uuidv4(),
      incidentId: incident.id,
      title: `Post-Mortem: ${incident.title} (${incident.service})`,
      summary: `On ${new Date(incident.createdAt).toLocaleDateString()}, the ${incident.service} experienced a ${incident.severity} incident resulting in elevated latency (${incident.metrics.latencyMs}ms) and a ${incident.metrics.errorRate}% error rate. The OpsMemory AI agent correlated symptoms, recalled historical incident patterns from Hindsight, and recommended targeted remediation that restored full service stability within ${recoveryMinutes} minutes.`,
      timeline,
      impact: `Affected approximately ${Math.round(incident.metrics.errorRate * 450)} customer payment transactions over ${recoveryMinutes} minutes. No persistent data corruption occurred.`,
      symptoms: [
        `5xx error rate elevated to ${incident.metrics.errorRate}%`,
        `Average API response latency peaked at ${incident.metrics.latencyMs}ms`,
        `Database connection pool saturated at ${incident.metrics.dbConnectionsPercent}%`,
        'Upstream Nginx ingress dropped requests with 504 Gateway Timeout',
      ],
      rootCause: primaryDiagnosis?.rootCause || 'Database connection pool exhaustion under sudden traffic volume',
      contributingFactors: [
        incident.deployment ? `Recent deployment ${incident.deployment.version} introduced unoptimized batch queries` : 'Surge in concurrent checkout requests',
        'Database connection pool cap was lower than peak concurrency requirements',
        topMemory ? `Pattern matched historical incident ${topMemory.incidentId || 'INC-1042'}` : 'Absence of proactive connection alerts',
      ],
      resolution: executedAction?.title || 'Scaled database connection pool from 100 to 150 and verified connection release metrics.',
      whatWorked: [
        topMemory ? `Hindsight memory recalled ${topMemory.incidentId} with ${topMemory.relevanceScore}% similarity, cutting investigation time by 70%` : 'Rapid automated evidence collection and metric correlation',
        'Human-in-the-loop approval gate allowed confident execution of remediation runbook',
        'Targeted pool scaling immediately normalized request latency',
      ],
      whatFailed: [
        incident.memoryMatches.some(m => m.isNegativeExample) 
          ? 'Historical attempt to increase DB pool during Redis bottleneck was recalled as a failure pattern'
          : 'Initial static alert thresholds did not warn prior to complete connection exhaustion',
      ],
      recoveryTimeMinutes: recoveryMinutes,
      lessonsLearned: [
        'Connection pool limits must scale dynamically or be sized for 3x baseline burst capacity.',
        'Hindsight memory retention of this incident ensures future occurrences will be identified in seconds.',
        'Continuous correlation of deployment diffs with metric spikes provides immediate diagnostic certainty.',
      ],
      actionItems: [
        'Tune automated connection pooling in payments-api Kubernetes deployment manifest (P1 - DevOps)',
        'Configure Prometheus alert for DB connection pool utilization > 80% (P2 - SRE)',
        'Retain this post-mortem into Hindsight memory bank for continuous AI agent learning (Completed)',
      ],
      status: 'draft',
    };

    return draft;
  }

  /**
   * Retain finalized post-mortem into Hindsight memory bank
   */
  public async retainPostMortem(postMortem: PostMortem): Promise<{ success: boolean; memoryId: string }> {
    const incident = incidentStore.getById(postMortem.incidentId);
    const bankId = config.hindsightBankId;

    const content = `
POST-MORTEM RECORD: ${postMortem.title}
Incident: ${postMortem.incidentId}
Root Cause: ${postMortem.rootCause}
Impact: ${postMortem.impact}
Resolution: ${postMortem.resolution}
Recovery Time: ${postMortem.recoveryTimeMinutes}m

What Worked:
${postMortem.whatWorked.map(w => `- ${w}`).join('\n')}

What Failed:
${postMortem.whatFailed.map(w => `- ${w}`).join('\n')}

Lessons Learned:
${postMortem.lessonsLearned.map(l => `- ${l}`).join('\n')}

Action Items:
${postMortem.actionItems.map(a => `- ${a}`).join('\n')}
`.trim();

    const service = incident?.service || 'core-platform';
    const tags = [
      `service:${service}`,
      `type:postmortem`,
      `type:fact`,
      `incident_id:${postMortem.incidentId}`,
      'knowledge:runbook',
    ];

    const retainRes = await hindsightService.retain(bankId, content, {
      context: `Post-Mortem for ${postMortem.incidentId}`,
      tags,
      type: 'fact',
      incidentId: postMortem.incidentId,
      service,
      rootCause: postMortem.rootCause,
      resolution: postMortem.resolution,
      recoveryTimeMinutes: postMortem.recoveryTimeMinutes,
    });

    postMortem.status = 'retained_to_hindsight';
    postMortem.retainedAt = new Date().toISOString();

    if (incident) {
      incident.postMortem = postMortem;
      incidentStore.save(incident);
    }

    console.log(`[PostMortem] Retained post-mortem ${postMortem.id} to Hindsight bank "${bankId}"`);
    return { success: true, memoryId: retainRes.id };
  }
}

export const postMortemService = new PostMortemService();
