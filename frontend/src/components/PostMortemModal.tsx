import React, { useState } from 'react';
import { 
  FileText, 
  Brain, 
  X, 
  Loader2, 
  CheckCircle2, 
  Edit3, 
  Save, 
  Clock, 
  Share2 
} from 'lucide-react';
import { PostMortem } from '../types';

interface PostMortemModalProps {
  postMortem: PostMortem | null;
  isOpen: boolean;
  onClose: () => void;
  onRetain: (postMortem: PostMortem) => Promise<void>;
}

export const PostMortemModal: React.FC<PostMortemModalProps> = ({
  postMortem,
  isOpen,
  onClose,
  onRetain,
}) => {
  if (!isOpen || !postMortem) return null;

  const [title, setTitle] = useState(postMortem.title);
  const [summary, setSummary] = useState(postMortem.summary);
  const [rootCause, setRootCause] = useState(postMortem.rootCause);
  const [impact, setImpact] = useState(postMortem.impact);
  const [resolution, setResolution] = useState(postMortem.resolution);
  const [lessonsLearned, setLessonsLearned] = useState(postMortem.lessonsLearned.join('\n'));
  const [actionItems, setActionItems] = useState(postMortem.actionItems.join('\n'));
  const [isRetaining, setIsRetaining] = useState(false);
  const [isSuccess, setIsSuccess] = useState(postMortem.status === 'retained_to_hindsight');

  const handleSaveToHindsight = async () => {
    setIsRetaining(true);
    try {
      const updated: PostMortem = {
        ...postMortem,
        title,
        summary,
        rootCause,
        impact,
        resolution,
        lessonsLearned: lessonsLearned.split('\n').filter(l => l.trim().length > 0),
        actionItems: actionItems.split('\n').filter(a => a.trim().length > 0),
      };
      await onRetain(updated);
      setIsSuccess(true);
    } finally {
      setIsRetaining(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">Incident Post-Mortem Draft</h2>
              <p className="text-[11px] text-slate-500">Auto-generated from telemetry, timeline, and agent resolution</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-md">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-4 overflow-y-auto text-xs flex-1">
          {isSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center space-x-2 text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">
                Post-mortem successfully retained into Hindsight bank "opsmemory-production"! Future similar incidents will recall this runbook.
              </span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Document Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900"
            />
          </div>

          {/* Summary */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Executive Summary</label>
            <textarea
              rows={3}
              value={summary}
              onChange={e => setSummary(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Root Cause & Resolution */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Identified Root Cause</label>
              <textarea
                rows={2}
                value={rootCause}
                onChange={e => setRootCause(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Applied Resolution</label>
              <textarea
                rows={2}
                value={resolution}
                onChange={e => setResolution(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-emerald-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Impact & Recovery Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">User & System Impact</label>
              <textarea
                rows={2}
                value={impact}
                onChange={e => setImpact(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col justify-center">
              <span className="text-[11px] font-semibold text-slate-500">Recovery Time (MTTR)</span>
              <div className="flex items-center space-x-2 mt-1">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="text-xl font-bold text-slate-900">{postMortem.recoveryTimeMinutes} Minutes</span>
              </div>
            </div>
          </div>

          {/* What Worked & What Failed */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-lg">
              <span className="font-semibold text-emerald-900 block mb-1">What Worked</span>
              <ul className="space-y-1 text-slate-700">
                {postMortem.whatWorked.map((w, i) => (
                  <li key={i} className="flex items-start space-x-1.5">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-lg">
              <span className="font-semibold text-amber-900 block mb-1">What Failed</span>
              <ul className="space-y-1 text-slate-700">
                {postMortem.whatFailed.map((f, i) => (
                  <li key={i} className="flex items-start space-x-1.5">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Lessons Learned */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Lessons Learned (One per line)
            </label>
            <textarea
              rows={3}
              value={lessonsLearned}
              onChange={e => setLessonsLearned(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Action Items */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Preventative Action Items (One per line)
            </label>
            <textarea
              rows={2}
              value={actionItems}
              onChange={e => setActionItems(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Retaining stores structured runbook knowledge into Hindsight
          </span>

          <div className="flex space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-800 border border-slate-200 rounded-lg"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleSaveToHindsight}
              disabled={isRetaining}
              className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 shadow-sm transition flex items-center space-x-1.5 disabled:opacity-50"
            >
              {isRetaining ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving to Hindsight...</span>
                </>
              ) : (
                <>
                  <Brain className="w-3.5 h-3.5" />
                  <span>Save to Hindsight</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
