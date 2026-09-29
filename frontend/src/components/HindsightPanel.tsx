import React from 'react';
import { 
  Brain, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ExternalLink,
  Tag,
  ShieldAlert
} from 'lucide-react';
import { RecalledMemoryMatch } from '../types';

interface HindsightPanelProps {
  memories: RecalledMemoryMatch[];
  isInvestigating?: boolean;
  onOpenExplorer?: () => void;
}

export const HindsightPanel: React.FC<HindsightPanelProps> = ({
  memories,
  isInvestigating = false,
  onOpenExplorer,
}) => {
  const hasNegativeMemories = memories.some(m => m.isNegativeExample);

  return (
    <div className="bg-white rounded-xl border border-indigo-200 shadow-sm overflow-hidden ring-1 ring-indigo-50">
      {/* Panel Header */}
      <div className="p-4 bg-gradient-to-r from-indigo-50/80 via-blue-50/50 to-white border-b border-indigo-100 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm ring-2 ring-indigo-100">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">Hindsight Memory</h2>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 rounded-full border border-indigo-200">
                TEMPR Multi-Strategy Recall
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Queried memory bank <code className="text-indigo-700 font-semibold font-mono">opsmemory-production</code>
            </p>
          </div>
        </div>

        {onOpenExplorer && (
          <button
            onClick={onOpenExplorer}
            className="text-xs text-indigo-700 hover:text-indigo-900 font-semibold flex items-center space-x-1 px-2.5 py-1 bg-white border border-indigo-200 rounded-md shadow-2xs hover:bg-indigo-50 transition"
          >
            <span>Search All Memories</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="p-5 space-y-4">
        {/* Memory status summary message */}
        {isInvestigating ? (
          <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-lg flex items-center space-x-3">
            <Brain className="w-5 h-5 text-blue-600 animate-pulse" />
            <div>
              <p className="text-xs font-semibold text-blue-900">Querying Hindsight Memory Bank...</p>
              <p className="text-[11px] text-blue-700">Searching historical incidents, failure outcomes, and runbooks.</p>
            </div>
          </div>
        ) : memories.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-lg border border-slate-200">
            <Brain className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">No Prior Historical Matches Found</p>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-1">
              This failure represents a first-time symptom signature. Resolving this incident will retain the first experience in Hindsight for future encounters.
            </p>
          </div>
        ) : (
          <>
            {/* Critical Failed Fix Alert if negative memory exists */}
            {hasNegativeMemories && (
              <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-xl shadow-xs flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                      Critical Negative Memory Recalled
                    </span>
                    <span className="px-1.5 py-0.2 text-[10px] font-bold bg-amber-200 text-amber-900 rounded">
                      Prevents Repeated Mistake
                    </span>
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    OpsMemory remembers that increasing the DB connection pool was previously attempted for identical symptoms and <strong>FAILED</strong> (Incident INC-1098). The root bottleneck was Redis socket timeouts.
                  </p>
                </div>
              </div>
            )}

            {/* Recalled Memory Cards List */}
            <div className="space-y-3">
              {memories.map((mem, idx) => {
                const isSuccess = mem.outcome === 'success';
                const isNegative = mem.isNegativeExample;

                return (
                  <div 
                    key={mem.id || idx}
                    className={`p-4 rounded-xl border transition shadow-xs ${
                      isNegative 
                        ? 'bg-amber-50/40 border-amber-200 hover:border-amber-300' 
                        : idx === 0 
                        ? 'bg-indigo-50/20 border-indigo-200 hover:border-indigo-300 ring-1 ring-indigo-50' 
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Card Top: Match Score & Incident Reference */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-slate-900 font-mono">
                          {mem.incidentId ? `Historical Incident #${mem.incidentId}` : mem.title}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {mem.service}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {/* Relevance Score Pill */}
                        <div className="flex items-center space-x-1 px-2.5 py-0.5 bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-full text-xs font-bold">
                          <Sparkles className="w-3 h-3 text-indigo-600" />
                          <span>{mem.relevanceScore}% Relevance</span>
                        </div>

                        {/* Outcome Pill */}
                        <div className={`flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          isSuccess 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}>
                          {isSuccess ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Resolved in {mem.recoveryTimeMinutes || 4}m</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-rose-600" />
                              <span>Remediation Failed</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card Details: Root Cause & Resolution */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-xs">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          Past Root Cause
                        </span>
                        <p className="font-medium text-slate-800 mt-0.5">
                          {mem.rootCause}
                        </p>
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isNegative ? 'Attempted Remediation' : 'Successful Resolution'}
                        </span>
                        <p className={`font-medium mt-0.5 ${isNegative ? 'text-rose-700 line-through' : 'text-emerald-700'}`}>
                          {mem.resolution}
                        </p>
                      </div>
                    </div>

                    {/* "Why this matters" Section - Highlighted Hackathon Value */}
                    <div className="mt-3 p-3 bg-white border border-indigo-100 rounded-lg shadow-2xs">
                      <div className="flex items-center space-x-1.5 text-indigo-800 font-bold text-[11px] uppercase tracking-wide">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Why this memory matters:</span>
                      </div>
                      <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                        {mem.whyMatters}
                      </p>
                      {mem.engineerFeedback && (
                        <p className="text-[11px] text-slate-500 italic mt-1.5 border-t border-slate-100 pt-1.5">
                          Engineer on-call note: "{mem.engineerFeedback}"
                        </p>
                      )}
                    </div>

                    {/* Card Footer: Metadata */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-100">
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Stored: {new Date(mem.occurredAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Tag className="w-3 h-3 text-slate-400" />
                        <span className="capitalize">{mem.memoryType} Memory</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
