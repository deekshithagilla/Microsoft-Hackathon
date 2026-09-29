import React, { useState } from 'react';
import { X, Sparkles, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { Incident, Severity } from '../types';
import { api } from '../api/client';

interface CreateIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (incident: Incident) => void;
}

export const CreateIncidentModal: React.FC<CreateIncidentModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [mode, setMode] = useState<'freeform' | 'structured'>('freeform');
  const [isParsing, setIsParsing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Free-form state
  const [freeformText, setFreeformText] = useState(
    "Payments API latency increased to 5.2 seconds after today's deployment. Database connections reached 98% with 504 Gateway Timeouts."
  );

  // Structured form state
  const [title, setTitle] = useState('');
  const [service, setService] = useState('payments-api');
  const [severity, setSeverity] = useState<Severity>('P1');
  const [environment, setEnvironment] = useState<'production' | 'staging'>('production');
  const [description, setDescription] = useState('');
  const [errorRate, setErrorRate] = useState<number>(18.5);
  const [latencyMs, setLatencyMs] = useState<number>(4800);
  const [cpuPercent, setCpuPercent] = useState<number>(75);
  const [memoryPercent, setMemoryPercent] = useState<number>(68);
  const [dbConnectionsPercent, setDbConnectionsPercent] = useState<number>(98);
  const [deploymentVersion, setDeploymentVersion] = useState('v2.8.2');
  const [logsText, setLogsText] = useState(
    `[ERROR] TimeoutException: Timed out waiting for connection from pool "pg-pool-main"\n[FATAL] HTTP 504 Gateway Timeout for POST /v1/charges`
  );

  if (!isOpen) return null;

  const handleParseNL = async () => {
    if (!freeformText.trim()) return;
    setIsParsing(true);
    setError(null);
    try {
      const parsed = await api.parseNaturalLanguage(freeformText);
      if (parsed.title) setTitle(parsed.title);
      if (parsed.service) setService(parsed.service);
      if (parsed.severity) setSeverity(parsed.severity);
      if (parsed.description) setDescription(parsed.description);
      if (parsed.metrics) {
        if (parsed.metrics.errorRate !== undefined) setErrorRate(parsed.metrics.errorRate);
        if (parsed.metrics.latencyMs !== undefined) setLatencyMs(parsed.metrics.latencyMs);
        if (parsed.metrics.dbConnectionsPercent !== undefined) setDbConnectionsPercent(parsed.metrics.dbConnectionsPercent);
        if (parsed.metrics.cpuPercent !== undefined) setCpuPercent(parsed.metrics.cpuPercent);
        if (parsed.metrics.memoryPercent !== undefined) setMemoryPercent(parsed.metrics.memoryPercent);
      }
      if (parsed.deployment?.version) setDeploymentVersion(parsed.deployment.version);
      setMode('structured');
    } catch (err: any) {
      setError(err.message || 'Failed to parse incident description');
    } finally {
      setIsParsing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const logs = logsText.split('\n').filter(l => l.trim().length > 0);
      const incident = await api.createIncident({
        title: title || (mode === 'freeform' ? freeformText.slice(0, 60) : 'Production Incident'),
        service,
        severity,
        environment,
        description: description || freeformText,
        metrics: {
          errorRate: Number(errorRate),
          latencyMs: Number(latencyMs),
          cpuPercent: Number(cpuPercent),
          memoryPercent: Number(memoryPercent),
          dbConnectionsPercent: Number(dbConnectionsPercent),
          timestamp: new Date().toISOString(),
        },
        deployment: deploymentVersion ? {
          version: deploymentVersion,
          deployedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          commitHash: '8f7a1b2',
          author: 'deploy-bot@opsmemory.io',
          description: 'Production release deployment',
          changedFiles: ['config/production.json', 'src/db/connection.ts'],
        } : undefined,
        logs: logs.length > 0 ? logs : ['[WARN] Telemetry anomaly detected by monitoring daemon'],
      });

      onCreated(incident);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create incident');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div>
            <h2 className="text-base font-bold text-slate-900">Create Production Incident</h2>
            <p className="text-xs text-slate-500">Ingest alert telemetry for AI investigation and Hindsight recall</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="px-6 pt-4 flex space-x-2 border-b border-slate-100 pb-2">
          <button
            type="button"
            onClick={() => setMode('freeform')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
              mode === 'freeform'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Natural Language AI Parser</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('structured')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              mode === 'structured'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>Structured SRE Form</span>
          </button>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'freeform' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Incident Alert / Slack Message
                </label>
                <textarea
                  rows={4}
                  value={freeformText}
                  onChange={e => setFreeformText(e.target.value)}
                  placeholder="Paste unstructured incident text, Slack alert, or PagerDuty details..."
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-slate-800"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  The AI parser will extract the affected service, severity, symptoms, and telemetry automatically.
                </p>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={handleParseNL}
                  disabled={isParsing || !freeformText.trim()}
                  className="px-4 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-semibold flex items-center space-x-2 transition disabled:opacity-50"
                >
                  {isParsing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Parsing with AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Parse with AI & Review Fields</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || !freeformText.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating Incident...' : 'Direct Create & Investigate'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {/* Title & Service */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Incident Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Payments API 504 Timeouts"
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Service</label>
                  <select
                    value={service}
                    onChange={e => setService(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="payments-api">payments-api</option>
                    <option value="auth-service">auth-service</option>
                    <option value="order-service">order-service</option>
                    <option value="cache-cluster">cache-cluster</option>
                    <option value="checkout-gateway">checkout-gateway</option>
                    <option value="postgres-primary">postgres-primary</option>
                  </select>
                </div>
              </div>

              {/* Severity & Environment */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Severity</label>
                  <select
                    value={severity}
                    onChange={e => setSeverity(e.target.value as Severity)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="P1">P1 - Critical Customer Impact</option>
                    <option value="P2">P2 - High Degradation</option>
                    <option value="P3">P3 - Medium Anomaly</option>
                    <option value="P4">P4 - Low Informational</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Environment</label>
                  <select
                    value={environment}
                    onChange={e => setEnvironment(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="production">production</option>
                    <option value="staging">staging</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe observed failure symptoms..."
                  className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Metrics Grid */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Telemetry Snapshot
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-500">Error Rate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={errorRate}
                      onChange={e => setErrorRate(parseFloat(e.target.value))}
                      className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500">Latency (ms)</label>
                    <input
                      type="number"
                      value={latencyMs}
                      onChange={e => setLatencyMs(parseInt(e.target.value, 10))}
                      className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500">DB Conn (%)</label>
                    <input
                      type="number"
                      value={dbConnectionsPercent}
                      onChange={e => setDbConnectionsPercent(parseInt(e.target.value, 10))}
                      className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500">CPU (%)</label>
                    <input
                      type="number"
                      value={cpuPercent}
                      onChange={e => setCpuPercent(parseInt(e.target.value, 10))}
                      className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500">Memory (%)</label>
                    <input
                      type="number"
                      value={memoryPercent}
                      onChange={e => setMemoryPercent(parseInt(e.target.value, 10))}
                      className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500">Recent Deploy</label>
                    <input
                      type="text"
                      value={deploymentVersion}
                      onChange={e => setDeploymentVersion(e.target.value)}
                      placeholder="e.g. v2.8.2"
                      className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Log Lines */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Application Logs
                </label>
                <textarea
                  rows={3}
                  value={logsText}
                  onChange={e => setLogsText(e.target.value)}
                  placeholder="Paste log snippets for agent correlation..."
                  className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-slate-800"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
                >
                  {isSubmitting ? 'Registering...' : 'Register Incident'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
