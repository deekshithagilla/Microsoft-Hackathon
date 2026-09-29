import React from 'react';
import { 
  CheckCircle2, 
  HelpCircle, 
  Brain, 
  AlertCircle, 
  Search, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { DiagnosisCandidate } from '../types';

interface DiagnosisSectionProps {
  candidates: DiagnosisCandidate[];
  isInvestigating?: boolean;
}

export const DiagnosisSection: React.FC<DiagnosisSectionProps> = ({
  candidates,
  isInvestigating = false,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-blue-600" />
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            Ranked Root Cause Candidates
          </h2>
        </div>
        <span className="text-[11px] text-slate-500 font-medium">
          Calibrated via telemetry & Hindsight memories
        </span>
      </div>

      {isInvestigating ? (
        <div className="p-8 text-center text-slate-500 text-xs">
          <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2" />
          <span>Synthesizing root cause candidates...</span>
        </div>
      ) : candidates.length === 0 ? (
        <div className="p-6 text-center text-slate-400 text-xs">
          Click "Run AI Investigation" to diagnose root causes.
        </div>
      ) : (
        <div className="space-y-4">
          {candidates.map((cand) => {
            const isRank1 = cand.rank === 1;

            return (
              <div
                key={cand.id}
                className={`p-4 rounded-xl border transition ${
                  isRank1
                    ? 'bg-blue-50/20 border-blue-200 ring-1 ring-blue-50'
                    : 'bg-white border-slate-200'
                }`}
              >
                {/* Candidate Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      isRank1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {cand.rank}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">{cand.rootCause}</h3>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Calibrated Confidence Badge */}
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      cand.confidence === 'High'
                        ? 'bg-blue-100 text-blue-800 border-blue-200'
                        : cand.confidence === 'Medium'
                        ? 'bg-amber-100 text-amber-800 border-amber-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {cand.confidence} Confidence: {cand.confidenceLabel}
                    </span>
                  </div>
                </div>

                {/* Candidate Summary */}
                <p className="text-xs text-slate-700 mt-2.5 leading-relaxed">
                  {cand.summary}
                </p>

                {/* Supporting Evidence & Historical Memories */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-xs">
                  {/* Supporting Evidence */}
                  <div className="p-3 bg-slate-50/70 border border-slate-200/80 rounded-lg">
                    <span className="font-semibold text-slate-700 flex items-center space-x-1.5 mb-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>Supporting Evidence</span>
                    </span>
                    <ul className="space-y-1 text-slate-600">
                      {cand.supportingEvidence.map((ev, i) => (
                        <li key={i} className="flex items-start space-x-1.5">
                          <span className="text-slate-400 mt-0.5">•</span>
                          <span>{ev}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommended Verification */}
                  <div className="p-3 bg-slate-50/70 border border-slate-200/80 rounded-lg">
                    <span className="font-semibold text-slate-700 flex items-center space-x-1.5 mb-1.5">
                      <Search className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Recommended Verification</span>
                    </span>
                    <ul className="space-y-1 text-slate-600 font-mono text-[11px]">
                      {cand.recommendedVerification.map((v, i) => (
                        <li key={i} className="flex items-start space-x-1.5">
                          <ArrowRight className="w-3 h-3 text-indigo-500 mt-0.5 shrink-0" />
                          <span>{v}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Contradictory Evidence if present */}
                {cand.contradictoryEvidence && cand.contradictoryEvidence.length > 0 && (
                  <div className="mt-2.5 p-2.5 bg-amber-50/50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start space-x-2">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Contradictory Telemetry: </span>
                      <span>{cand.contradictoryEvidence.join('; ')}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
