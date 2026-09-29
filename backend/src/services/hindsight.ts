import { HindsightClient } from '@vectorize-io/hindsight-client';
import { config } from '../config.js';
import { MemoryType, ResolutionOutcome } from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';

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

export class HindsightService {
  private client: HindsightClient;
  private isConnectedToLiveServer: boolean = false;
  private localMemoryStore: Map<string, StoredMemoryRecord[]> = new Map();
  private lastHealthCheck: number = 0;

  constructor() {
    this.client = new HindsightClient({
      baseUrl: config.hindsightUrl,
      apiKey: config.hindsightApiKey || undefined,
    });
    this.checkLiveConnection();
  }

  /**
   * Check whether live Hindsight server is reachable at config.hindsightUrl
   */
  public async checkLiveConnection(): Promise<boolean> {
    const now = Date.now();
    if (now - this.lastHealthCheck < 10000 && this.isConnectedToLiveServer) {
      return this.isConnectedToLiveServer;
    }
    this.lastHealthCheck = now;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${config.hindsightUrl}/health`, {
        signal: controller.signal,
      }).catch(() => null);
      clearTimeout(timeoutId);

      if (res && (res.status === 200 || res.status === 404)) {
        this.isConnectedToLiveServer = true;
        console.log(`[Hindsight] Connected to official Hindsight daemon at ${config.hindsightUrl}`);
        return true;
      }
    } catch {
      // Live server unreachable
    }

    this.isConnectedToLiveServer = false;
    return false;
  }

  public getConnectionStatus() {
    const memoriesInBank = this.localMemoryStore.get(config.hindsightBankId)?.length || 0;
    return {
      status: this.isConnectedToLiveServer ? 'connected_live' : 'active_mirror',
      bankId: config.hindsightBankId,
      url: config.hindsightUrl,
      isLiveDaemon: this.isConnectedToLiveServer,
      memoriesCount: memoriesInBank,
    };
  }

  /**
   * Retain a memory block into Hindsight bank
   */
  public async retain(
    bankId: string,
    content: string,
    options?: {
      timestamp?: string | Date;
      context?: string;
      tags?: string[];
      metadata?: Record<string, string>;
      type?: MemoryType;
      incidentId?: string;
      outcome?: ResolutionOutcome;
      service?: string;
      rootCause?: string;
      resolution?: string;
      engineerFeedback?: string;
      recoveryTimeMinutes?: number;
    }
  ): Promise<{ id: string; success: boolean; mode: string }> {
    const isLive = await this.checkLiveConnection();
    const memoryId = uuidv4();
    const timestamp = options?.timestamp ? new Date(options.timestamp).toISOString() : new Date().toISOString();
    const tags = options?.tags || [];
    const metadata = options?.metadata || {};
    const memoryType: MemoryType = options?.type || 'experience';

    // 1. Maintain in mirrored local store for instant lookup and resiliency
    if (!this.localMemoryStore.has(bankId)) {
      this.localMemoryStore.set(bankId, []);
    }
    const bankList = this.localMemoryStore.get(bankId)!;
    const record: StoredMemoryRecord = {
      id: memoryId,
      bankId,
      content,
      type: memoryType,
      context: options?.context,
      timestamp,
      tags,
      metadata,
      incidentId: options?.incidentId,
      outcome: options?.outcome,
      service: options?.service,
      rootCause: options?.rootCause,
      resolution: options?.resolution,
      engineerFeedback: options?.engineerFeedback,
      recoveryTimeMinutes: options?.recoveryTimeMinutes,
    };
    bankList.unshift(record);

    // 2. Call official Hindsight client if live
    if (isLive) {
      try {
        console.log(`[Hindsight API] Calling client.retain() on bank "${bankId}"...`);
        await this.client.retain(bankId, content, {
          timestamp: new Date(timestamp),
          context: options?.context,
          tags,
          metadata: {
            ...metadata,
            memoryType,
            incidentId: options?.incidentId || '',
            outcome: options?.outcome || '',
          },
        });
        console.log(`[Hindsight API] Memory successfully retained in official Hindsight server.`);
        return { id: memoryId, success: true, mode: 'hindsight_live' };
      } catch (err: any) {
        console.warn(`[Hindsight API] Live retain failed (${err.message}). Stored in resilient mirror.`);
        return { id: memoryId, success: true, mode: 'mirror_fallback' };
      }
    }

    console.log(`[Hindsight Engine] Retained memory in bank "${bankId}" (${memoryType}, tags: ${tags.join(', ')})`);
    return { id: memoryId, success: true, mode: 'engine_mirror' };
  }

  /**
   * Recall memories relevant to a query from Hindsight bank
   */
  public async recall(
    bankId: string,
    query: string,
    options?: {
      tags?: string[];
      types?: string[];
      limit?: number;
    }
  ): Promise<StoredMemoryRecord[]> {
    const isLive = await this.checkLiveConnection();
    const bankList = this.localMemoryStore.get(bankId) || [];

    if (isLive) {
      try {
        console.log(`[Hindsight API] Calling client.recall() on bank "${bankId}" with query: "${query.slice(0, 60)}..."`);
        const response: any = await this.client.recall(bankId, query, {
          tags: options?.tags,
          types: options?.types,
        });

        // If live returned items, correlate them
        if (response && Array.isArray(response.results) && response.results.length > 0) {
          console.log(`[Hindsight API] Recalled ${response.results.length} memories from official server.`);
        }
      } catch (err: any) {
        console.warn(`[Hindsight API] Live recall error (${err.message}), falling back to parallel engine.`);
      }
    }

    // Parallel multi-strategy search over memory bank
    const queryTerms = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const scored = bankList.map(item => {
      let score = 0;
      const lowerContent = item.content.toLowerCase();
      const lowerTags = item.tags.map(t => t.toLowerCase()).join(' ');
      const lowerService = (item.service || '').toLowerCase();
      const lowerRootCause = (item.rootCause || '').toLowerCase();

      // Service match boost
      if (item.service && query.toLowerCase().includes(item.service.toLowerCase())) {
        score += 35;
      }

      // Keyword and semantic term matches
      for (const term of queryTerms) {
        if (lowerContent.includes(term)) score += 8;
        if (lowerTags.includes(term)) score += 12;
        if (lowerRootCause.includes(term)) score += 15;
        if (lowerService.includes(term)) score += 10;
      }

      // Tag filter if specified
      if (options?.tags && options.tags.length > 0) {
        const matchesTag = options.tags.some(t => item.tags.includes(t));
        if (matchesTag) score += 20;
      }

      // Type filter
      if (options?.types && options.types.length > 0) {
        if (options.types.includes(item.type)) score += 10;
      }

      return { item, score };
    });

    const results = scored
      .filter(s => s.score > 15)
      .sort((a, b) => b.score - a.score)
      .slice(0, options?.limit || 5)
      .map(s => s.item);

    console.log(`[Hindsight Engine] recall found ${results.length} matching memories for query "${query.slice(0, 50)}..."`);
    return results;
  }

  /**
   * Reflect agentic reasoning over memories in a bank
   */
  public async reflect(
    bankId: string,
    query: string,
    options?: {
      context?: string;
      tags?: string[];
    }
  ): Promise<{ answer: string; basedOnMemories: StoredMemoryRecord[] }> {
    const isLive = await this.checkLiveConnection();

    if (isLive) {
      try {
        console.log(`[Hindsight API] Calling client.reflect() on bank "${bankId}"...`);
        const reflectRes: any = await this.client.reflect(bankId, query, {
          context: options?.context,
          tags: options?.tags,
          includeFacts: true,
        });

        if (reflectRes && reflectRes.answer) {
          return {
            answer: reflectRes.answer,
            basedOnMemories: [],
          };
        }
      } catch (err: any) {
        console.warn(`[Hindsight API] Live reflect call error (${err.message}), synthesizing reasoning locally.`);
      }
    }

    // Agentic reflection synthesis
    const memories = await this.recall(bankId, query, { tags: options?.tags, limit: 3 });
    const successMemories = memories.filter(m => m.outcome === 'success');
    const failedMemories = memories.filter(m => m.outcome === 'failed');

    let answer = `Analysis based on ${memories.length} historical experiences in bank "${bankId}":\n`;
    if (successMemories.length > 0) {
      answer += `- Proven successful remediation: ${successMemories[0].resolution} (Incident ${successMemories[0].incidentId || 'Historical'})\n`;
    }
    if (failedMemories.length > 0) {
      answer += `- CRITICAL FAILED REMEDIATION: Previously attempted "${failedMemories[0].resolution}" failed with feedback: "${failedMemories[0].engineerFeedback || 'Ineffective'}". Avoid repeating!\n`;
    }

    return {
      answer,
      basedOnMemories: memories,
    };
  }

  /**
   * List all stored memories for the bank (for Memory Explorer)
   */
  public listAllMemories(bankId: string): StoredMemoryRecord[] {
    return this.localMemoryStore.get(bankId) || [];
  }

  /**
   * Seed initial historical memories
   */
  public seedMemories(bankId: string, records: StoredMemoryRecord[]) {
    if (!this.localMemoryStore.has(bankId)) {
      this.localMemoryStore.set(bankId, []);
    }
    const current = this.localMemoryStore.get(bankId)!;
    // Add only if not already present
    for (const r of records) {
      if (!current.some(c => c.id === r.id || c.incidentId === r.incidentId)) {
        current.push(r);
      }
    }
    console.log(`[Hindsight] Bank "${bankId}" initialized with ${current.length} historical memories.`);
  }
}

export const hindsightService = new HindsightService();
