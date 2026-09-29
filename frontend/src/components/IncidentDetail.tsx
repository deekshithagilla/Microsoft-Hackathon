import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ArrowLeft, 
  Play, 
  Brain, 
  CheckCircle2, 
  Clock, 
  Activity, 
  FileText, 
  GitCommit, 
  Terminal, 
  AlertTriangle,
  Lock,
  MessageSquare,
  Sparkles,
  Loader2,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { 
  Incident, 
  RecommendedAction, 
  EngineerFeedback, 
  PostMortem 
} from '../types';
import { HindsightPanel } from './HindsightPanel';
import { DiagnosisSection } from './DiagnosisSection';
import { TimelineStream } from './TimelineStream';
import { ActionApprovalModal } from './ActionApprovalModal';
import { FeedbackModal } from './FeedbackModal';
import { PostMortemModal } from './PostMortemModal';
import { api } from '../api/client';

interface IncidentDetailProps {
  incident: Incident;
  onBack: () => void;
  onIncidentUpdated: (updated: Incident) => void;
  onOpenExplorer: () => void;
}

export const IncidentDetail: React.FC<IncidentDetailProps> = ({
  incident,
  onBack,
  onIncidentUpdated,
  onOpenExplorer,
}) => {
  const [activeTab, setActiveTab] = useState<'investigation' | 'evidence' | 'timeline' | 'postmortem'>('investigation');
  const [isInvestigating, setIsInvestigating] = useState(false);
  const [selectedActionForApproval, setSelectedActionForApproval] = useState<RecommendedAction | null>(null);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isPostMortemModalOpen, setIsPostMortemModalOpen] = useState(false);
  const [currentPostMortem, setCurrentPostMortem] = useState<PostMortem | null>(incident.postMortem || null);

  const handleInvestigate = async () => {
    setIsInvestigating(true);
    try {
      const updated = await api.investigateIncident(incident.id);
      onIncidentUpdated(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setIsInvestigating(false);
    }
  };

  const handleApproveAction = async (actionId: string) => {
    const updated = await api.approveAction(incident.id, actionId);
    onIncidentUpdated(updated);
  };

  const handleRejectAction = async (actionId: string, reason: string) => {
    const updated = await api.rejectAction(incident.id, actionId, reason);
    onIncidentUpdated(updated);
  };

  const handleResolve = async (feedback: EngineerFeedback) => {
    const { incident: updated } = await api.resolveIncident(incident.id, feedback);
    onIncidentUpdated(updated);
  };

  const handleOpenPostMortem = async () => {
    try {
      const draft = await api.generatePostMortemDraft(incident.id);
      setCurrentPostMortem(draft);
      setIsPostMortemModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRetainPostMortem = async (postMortem: PostMortem) => {
    await api.retainPostMortem(postMortem);
    const updated = await api.getIncident(incident.id);
    onIncidentUpdated(updated);
    setCurrentPostMortem(postMortem);
  };

  const isResolved = incident.status === 'resolved';

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        {/* Navigation & Status Breadcrumbs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md border border-slate-200 transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                incident.severity === 'P1'
                  ? 'bg-red-100 text-red-800 border border-red-200'
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}>
                {incident.severity}
              </span>
              <span className="font-mono text-xs font-bold text-slate-500">{incident.id}</span>
              <span className="text-slate-300">•</span>
              <span className="font-mono text-xs text-slate-700 font-semibold">{incident.service}</span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 capitalize">{incident.environment}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              isResolved 
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : 'bg-blue-100 text-blue-800 border border-blue-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isResolved ? 'bg-emerald-500' : 'bg-blue-500'}`} />
              <span className="capitalize">{incident.status}</span>
            </span>

            {isResolved && incident.recoveryTimeMinutes && (
              <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs font-semibold text-slate-700 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5" />
                <span>MTTR: {incident.recoveryTimeMinutes}m</span>
              </span>
            )}
          </div>
        </div>

        {/* Title & Action Toolbar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{incident.title}</h1>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
              {incident.description}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Run Investigation Button */}
            {!isResolved && (
              <button
                onClick={handleInvestigate}
                disabled={isInvestigating}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition flex items-center space-x-1.5 disabled:opacity-50"
              >
                {isInvestigating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Investigating with Hindsight...</span>
                  </>
                ) : (
                  <>
                    <Brain className="w-3.5 h-3.5" />
                    <span>{incident.diagnosisCandidates.length > 0 ? 'Re-Investigate' : 'Run AI Investigation'}</span>
                  </>
                )}
              </button>
            )}

            {/* Resolve Incident CTA */}
            {!isResolved && (
              <button
                onClick={() => setIsFeedbackModalOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition flex items-center space-x-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Resolve & Retain</span>
              </button>
            )}

            {/* Post-Mortem CTA */}
            <button
              onClick={handleOpenPostMortem}
              className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs transition flex items-center space-x-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>{incident.postMortem ? 'View Post-Mortem' : 'Draft Post-Mortem'}</span>
            </button>
          </div>
        </div>

        {/* Tab Strip */}
        <div className="flex space-x-6 border-t border-slate-100 pt-3 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('investigation')}
            className={`pb-2 border-b-2 flex items-center space-x-1.5 transition ${
              activeTab === 'investigation'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Brain className="w-4 h-4 text-indigo-600" />
            <span>AI Investigation & Hindsight Memory</span>
          </button>

          <button
            onClick={() => setActiveTab('evidence')}
            className={`pb-2 border-b-2 flex items-center space-x-1.5 transition ${
              activeTab === 'evidence'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Telemetry, Logs & Deployment</span>
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`pb-2 border-b-2 flex items-center space-x-1.5 transition ${
              activeTab === 'timeline'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Audit Trail ({incident.timeline.length})</span>
          </button>
        </div>
      </div>

      {/* Tab 1: AI Investigation & Hindsight Memory */}
      {activeTab === 'investigation' && (
        <div className="space-y-6">
          {/* HINDSIGHT MEMORY PANEL (PRIMARY FEATURE 4) */}
          <HindsightPanel
            memories={incident.memoryMatches}
            isInvestigating={isInvestigating}
            onOpenExplorer={onOpenExplorer}
          />

          {/* DIAGNOSIS CANDIDATES (FEATURE 5) */}
          <DiagnosisSection
            candidates={incident.diagnosisCandidates}
            isInvestigating={isInvestigating}
          />

          {/* RECOMMENDED ACTIONS & HUMAN APPROVAL (FEATURE 7) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-amber-600" />
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  Recommended Remediation & Human Approval Gate
                </h2>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                Dangerous actions require human engineer review before execution
              </span>
            </div>

            {incident.recommendedActions.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                No active actions. Click "Run AI Investigation" to generate remediation plan.
              </div>
            ) : (
              <div className="space-y-3">
                {incident.recommendedActions.map(action => {
                  const isExecuted = action.approvalStatus === 'executed';
                  const isRejected = action.approvalStatus === 'rejected';

                  return (
                    <div
                      key={action.id}
                      className={`p-4 rounded-xl border transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                        isExecuted
                          ? 'bg-emerald-50/30 border-emerald-200'
                          : isRejected
                          ? 'bg-slate-50 border-slate-200 opacity-60'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider ${
                            action.category === 'remediation'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {action.category}
                          </span>
                          <span className="font-bold text-xs text-slate-900">{action.title}</span>
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${
                            action.estimatedRisk === 'High'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {action.estimatedRisk} Risk
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                          {action.description}
                        </p>

                        {/* If executed, show terminal output snippet */}
                        {isExecuted && action.executionResult && (
                          <div className="mt-2 p-2 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded border border-slate-800 whitespace-pre-wrap">
                            {action.executionResult.output}
                          </div>
                        )}
                      </div>

                      {/* Approval CTA */}
                      <div className="shrink-0 flex items-center space-x-2">
                        {isExecuted ? (
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg text-xs flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Executed</span>
                          </span>
                        ) : isRejected ? (
                          <span className="px-3 py-1 bg-slate-200 text-slate-700 font-bold rounded-lg text-xs">
                            Rejected
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedActionForApproval(action);
                              setIsApprovalModalOpen(true);
                            }}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition flex items-center space-x-1.5"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            <span>Review & Authorize</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* REAL-TIME INVESTIGATION STREAM (FEATURE 6) */}
          <TimelineStream
            timeline={incident.timeline}
            isInvestigating={isInvestigating}
          />
        </div>
      )}

      {/* Tab 2: Evidence, Logs & Metrics */}
      {activeTab === 'evidence' && (
        <div className="space-y-6">
          {/* Telemetry Snapshot Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 block">Response Latency</span>
              <p className="text-xl font-bold text-slate-900 mt-1">{incident.metrics.latencyMs} ms</p>
              <span className="text-[10px] text-red-600 font-medium">+4200ms vs normal</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 block">5xx Error Rate</span>
              <p className="text-xl font-bold text-red-600 mt-1">{incident.metrics.errorRate} %</p>
              <span className="text-[10px] text-red-600 font-medium">Critical SLA breach</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 block">DB Connection Pool</span>
              <p className="text-xl font-bold text-slate-900 mt-1">{incident.metrics.dbConnectionsPercent} %</p>
              <span className="text-[10px] text-amber-600 font-medium">Saturation threshold 80%</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 block">Container CPU</span>
              <p className="text-xl font-bold text-slate-900 mt-1">{incident.metrics.cpuPercent} %</p>
              <span className="text-[10px] text-slate-500">Normal operating load</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 block">Container Memory</span>
              <p className="text-xl font-bold text-slate-900 mt-1">{incident.metrics.memoryPercent} %</p>
              <span className="text-[10px] text-slate-500">Stable allocation</span>
            </div>
          </div>

          {/* Deployment Correlation */}
          {incident.deployment && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
                <GitCommit className="w-4 h-4 text-blue-600" />
                <span>Correlated Deployment: {incident.deployment.version}</span>
              </div>
              <p className="text-xs text-slate-600">{incident.deployment.description}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-500 pt-2 border-t border-slate-100">
                <span>Commit: <strong className="text-slate-800">{incident.deployment.commitHash}</strong></span>
                <span>•</span>
                <span>Author: <strong className="text-slate-800">{incident.deployment.author}</strong></span>
                <span>•</span>
                <span>Files: {incident.deployment.changedFiles.join(', ')}</span>
              </div>
            </div>
          )}

          {/* Application Logs */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
                <Terminal className="w-4 h-4 text-slate-700" />
                <span>Ingested Application Logs</span>
              </div>
              <span className="text-xs font-mono text-slate-500">{incident.logs.length} lines</span>
            </div>

            <div className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs overflow-x-auto space-y-1.5 border border-slate-800 max-h-96">
              {incident.logs.map((log, idx) => {
                const isError = log.includes('ERROR') || log.includes('FATAL');
                const isWarn = log.includes('WARN');

                return (
                  <div key={idx} className={isError ? 'text-red-400 font-semibold' : isWarn ? 'text-amber-300' : 'text-slate-300'}>
                    {log}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Complete Audit Trail */}
      {activeTab === 'timeline' && (
        <TimelineStream
          timeline={incident.timeline}
          isInvestigating={isInvestigating}
        />
      )}

      {/* Modals */}
      <ActionApprovalModal
        action={selectedActionForApproval}
        isOpen={isApprovalModalOpen}
        onClose={() => {
          setIsApprovalModalOpen(false);
          setSelectedActionForApproval(null);
        }}
        onApprove={handleApproveAction}
        onReject={handleRejectAction}
      />

      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        onSubmit={handleResolve}
        incidentTitle={incident.title}
      />

      <PostMortemModal
        postMortem={currentPostMortem}
        isOpen={isPostMortemModalOpen}
        onClose={() => setIsPostMortemModalOpen(false)}
        onRetain={handleRetainPostMortem}
      />
    </div>
  );
};
