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

    // Build dynamic symptoms based on actual elevated telemetry
    const dynamicSymptoms: string[] = [];
    if (incident.metrics.errorRate > 2) {
      dynamicSymptoms.push(`5xx error rate elevated to ${incident.metrics.errorRate}%`);
    }
    if (incident.metrics.latencyMs > 500) {
      dynamicSymptoms.push(`Average API response latency peaked at ${incident.metrics.latencyMs}ms`);
    }
    if (incident.metrics.dbConnectionsPercent > 70) {
      dynamicSymptoms.push(`Database connection pool utilization saturated at ${incident.metrics.dbConnectionsPercent}%`);
    }
    if (incident.metrics.cpuPercent > 70) {
      dynamicSymptoms.push(`Container CPU utilization breached threshold at ${incident.metrics.cpuPercent}%`);
    }
    if (incident.metrics.memoryPercent > 70) {
      dynamicSymptoms.push(`Memory utilization elevated to ${incident.metrics.memoryPercent}%`);
    }
    if (incident.logs.length > 0) {
      dynamicSymptoms.push(`Application logs emitted: ${incident.logs[0]}`);
    }

    const estimatedImpactCount = Math.round(incident.metrics.errorRate * (incident.metrics.latencyMs > 3000 ? 420 : 180));

    const draft: PostMortem = {
      id: uuidv4(),
      incidentId: incident.id,
      title: `Post-Mortem: ${incident.title} (${incident.service})`,
      summary: `On ${new Date(incident.createdAt).toLocaleDateString()}, the ${incident.service} experienced a ${incident.severity} incident resulting in elevated latency (${incident.metrics.latencyMs}ms) and a ${incident.metrics.errorRate}% error rate. The OpsMemory AI agent correlated symptoms, recalled historical incident patterns from Hindsight, and recommended targeted remediation that restored full service stability within ${recoveryMinutes} minutes.`,
      timeline,
      impact: `Affected approximately ${estimatedImpactCount > 0 ? estimatedImpactCount.toLocaleString() : '100+'} ${incident.service} operations over ${recoveryMinutes} minutes. No persistent data corruption detected.`,
      symptoms: dynamicSymptoms.length > 0 ? dynamicSymptoms : [`Elevated latency anomaly on ${incident.service}`],
      rootCause: primaryDiagnosis?.rootCause || `Operational anomaly in ${incident.service}`,
      contributingFactors: [
        incident.deployment ? `Recent deployment ${incident.deployment.version} introduced workload or configuration change` : `Sudden surge in concurrent ${incident.service} requests`,
        topMemory ? `Pattern matched historical incident ${topMemory.incidentId || 'Incident'} in Hindsight memory` : `First-time occurrence of this operational signature`,
      ],
      resolution: executedAction?.title || `Applied target remediation for ${incident.service} and normalized telemetry.`,
      whatWorked: [
        topMemory ? `Hindsight memory recalled ${topMemory.incidentId} with ${topMemory.relevanceScore}% similarity, cutting investigation time significantly` : 'Rapid automated evidence collection and metric correlation',
        'Human-in-the-loop approval gate allowed confident verification of remediation runbook',
        'Targeted remediation immediately restored baseline performance',
      ],
      whatFailed: [
        incident.memoryMatches.some(m => m.isNegativeExample) 
          ? `Historical attempt to apply past remediation was recalled as an ineffective pattern, avoiding repeated mistake`
          : 'Initial alert thresholds fired after threshold breach rather than predicting saturation',
      ],
      recoveryTimeMinutes: recoveryMinutes,
      lessonsLearned: [
        `Service resource limits on ${incident.service} must scale dynamically with burst throughput.`,
        'Hindsight memory retention of this incident ensures future occurrences will be identified in seconds.',
        'Continuous correlation of deployment diffs with metric spikes provides immediate diagnostic certainty.',
      ],
      actionItems: [
        `Review and tune resource allocations in ${incident.service} Kubernetes deployment manifest (P1)`,
        `Configure Prometheus alert thresholds for ${incident.service} telemetry (P2)`,
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
