import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Brain, 
  X, 
  Loader2, 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown, 
  AlertCircle 
} from 'lucide-react';
import { EngineerFeedback, ResolutionOutcome } from '../types';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: EngineerFeedback) => Promise<void>;
  incidentTitle: string;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  incidentTitle,
}) => {
  const [diagnosisAccuracy, setDiagnosisAccuracy] = useState<'correct' | 'incorrect' | 'partially_correct'>('correct');
  const [fixOutcome, setFixOutcome] = useState<ResolutionOutcome>('success');
  const [comments, setComments] = useState('Scaling the connection pool from 100 to 150 immediately cleared 504 gateway timeouts.');
  const [engineerName, setEngineerName] = useState('Alex Rivera (Lead SRE)');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        diagnosisAccuracy,
        fixOutcome,
        comments,
        submittedAt: new Date().toISOString(),
        engineerName,
        retainedToHindsight: true,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">Resolve & Record Experience</h2>
              <p className="text-[11px] text-slate-500">Retain engineer feedback directly into Hindsight</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-md">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Target Incident */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Incident Resolving
            </span>
            <span className="font-bold text-slate-900 mt-0.5 block">{incidentTitle}</span>
          </div>

          {/* Diagnosis Accuracy */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Was the AI Diagnosis Accurate?
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDiagnosisAccuracy('correct')}
                className={`p-2.5 rounded-lg border font-medium flex flex-col items-center space-y-1 transition ${
                  diagnosisAccuracy === 'correct'
                    ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold ring-1 ring-blue-500'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
                <span>Correct</span>
              </button>

              <button
                type="button"
                onClick={() => setDiagnosisAccuracy('partially_correct')}
                className={`p-2.5 rounded-lg border font-medium flex flex-col items-center space-y-1 transition ${
                  diagnosisAccuracy === 'partially_correct'
                    ? 'bg-amber-50 border-amber-500 text-amber-700 font-bold ring-1 ring-amber-500'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <AlertCircle className="w-4 h-4" />
                <span>Partial</span>
              </button>

              <button
                type="button"
                onClick={() => setDiagnosisAccuracy('incorrect')}
                className={`p-2.5 rounded-lg border font-medium flex flex-col items-center space-y-1 transition ${
                  diagnosisAccuracy === 'incorrect'
                    ? 'bg-rose-50 border-rose-500 text-rose-700 font-bold ring-1 ring-rose-500'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ThumbsDown className="w-4 h-4" />
                <span>Incorrect</span>
              </button>
            </div>
          </div>

          {/* Remediation Outcome */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Remediation Action Result
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFixOutcome('success')}
                className={`p-2.5 rounded-lg border font-medium text-center transition ${
                  fixOutcome === 'success'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold ring-1 ring-emerald-500'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Fix Worked
              </button>

              <button
                type="button"
                onClick={() => setFixOutcome('partial')}
                className={`p-2.5 rounded-lg border font-medium text-center transition ${
                  fixOutcome === 'partial'
                    ? 'bg-amber-50 border-amber-500 text-amber-800 font-bold ring-1 ring-amber-500'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Partially Worked
              </button>

              <button
                type="button"
                onClick={() => setFixOutcome('failed')}
                className={`p-2.5 rounded-lg border font-medium text-center transition ${
                  fixOutcome === 'failed'
                    ? 'bg-rose-50 border-rose-500 text-rose-800 font-bold ring-1 ring-rose-500'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Fix Failed
              </button>
            </div>
          </div>

          {/* Free text commentary */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Engineer Commentary & Lessons Learned
            </label>
            <textarea
              rows={3}
              required
              value={comments}
              onChange={e => setComments(e.target.value)}
              placeholder="e.g. Pool increase solved it. Next time check Redis first..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              This note will be ingested as an Opinion/Belief memory block in Hindsight to guide future on-call engineers.
            </p>
          </div>

          {/* Engineer Name */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">On-Call Engineer</label>
            <input
              type="text"
              value={engineerName}
              onChange={e => setEngineerName(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <span className="text-[11px] text-indigo-700 font-medium flex items-center space-x-1">
              <Brain className="w-3.5 h-3.5" />
              <span>Saves into opsmemory-production</span>
            </span>

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-slate-600 hover:text-slate-800 border border-slate-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-sm transition flex items-center space-x-1.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Retaining to Hindsight...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Resolve & Retain Experience</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
