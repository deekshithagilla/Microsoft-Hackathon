import { 
  Incident, 
  DashboardStats, 
  EngineerFeedback, 
  PostMortem, 
  StoredMemoryRecord, 
  SimulationScenario 
} from '../types';

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined)
  ? `${(import.meta.env.VITE_API_URL as string).replace(/\/$/, '')}/api`
  : '/api';

export const api = {
  // Incidents
  async getIncidents(): Promise<Incident[]> {
    const res = await fetch(`${BASE_URL}/incidents`);
    const data = await res.json();
    return data.incidents || [];
  },

  async getStats(): Promise<DashboardStats> {
    const res = await fetch(`${BASE_URL}/incidents/stats`);
    const data = await res.json();
    return data.stats;
  },

  async getIncident(id: string): Promise<Incident> {
    const res = await fetch(`${BASE_URL}/incidents/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch incident');
    return data.incident;
  },

  async createIncident(incidentData: Partial<Incident>): Promise<Incident> {
    const res = await fetch(`${BASE_URL}/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(incidentData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create incident');
    return data.incident;
  },

  async parseNaturalLanguage(text: string): Promise<Partial<Incident>> {
    const res = await fetch(`${BASE_URL}/incidents/parse-nl`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to parse text');
    return data.parsed;
  },

  async investigateIncident(id: string): Promise<Incident> {
    const res = await fetch(`${BASE_URL}/incidents/${id}/investigate`, {
      method: 'POST',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to investigate incident');
    return data.incident;
  },

  async approveAction(incidentId: string, actionId: string): Promise<Incident> {
    const res = await fetch(`${BASE_URL}/incidents/${incidentId}/actions/${actionId}/approve`, {
      method: 'POST',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to approve action');
    return data.incident;
  },

  async rejectAction(incidentId: string, actionId: string, reason: string): Promise<Incident> {
    const res = await fetch(`${BASE_URL}/incidents/${incidentId}/actions/${actionId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reject action');
    return data.incident;
  },

  async resolveIncident(incidentId: string, feedback: EngineerFeedback): Promise<{ incident: Incident; memoryId: string }> {
    const res = await fetch(`${BASE_URL}/incidents/${incidentId}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feedback }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to resolve incident');
    return data;
  },

  async generatePostMortemDraft(incidentId: string): Promise<PostMortem> {
    const res = await fetch(`${BASE_URL}/incidents/${incidentId}/postmortem/draft`, {
      method: 'POST',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to generate post-mortem');
    return data.postMortem;
  },

  async retainPostMortem(postMortem: PostMortem): Promise<{ success: boolean; memoryId: string }> {
    const res = await fetch(`${BASE_URL}/incidents/${postMortem.incidentId}/postmortem/retain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postMortem }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to retain post-mortem');
    return data;
  },

  async resetData(): Promise<void> {
    await fetch(`${BASE_URL}/incidents/reset`, { method: 'POST' });
  },

  // Memory
  async getMemories(): Promise<{ memories: StoredMemoryRecord[]; status: any }> {
    const res = await fetch(`${BASE_URL}/memory`);
    const data = await res.json();
    return data;
  },

  async recallMemories(query: string, filters?: { service?: string; outcome?: string }): Promise<StoredMemoryRecord[]> {
    const res = await fetch(`${BASE_URL}/memory/recall`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, ...filters }),
    });
    const data = await res.json();
    return data.results || [];
  },

  // Simulations
  async getScenarios(): Promise<SimulationScenario[]> {
    const res = await fetch(`${BASE_URL}/simulations`);
    const data = await res.json();
    return data.scenarios || [];
  },

  async launchScenario(scenarioId: string): Promise<Incident> {
    const res = await fetch(`${BASE_URL}/simulations/launch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenarioId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to launch scenario');
    return data.incident;
  },

  // Health
  async getHealth(): Promise<any> {
    const res = await fetch(`${BASE_URL}/health`);
    return await res.json();
  },
};
