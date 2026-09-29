import React, { useState } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Terminal, 
  AlertTriangle, 
  Play, 
  X, 
  Loader2,
  Lock,
  ArrowRight
} from 'lucide-react';
import { RecommendedAction } from '../types';

interface ActionApprovalModalProps {
  action: RecommendedAction | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (actionId: string) => Promise<void>;
  onReject: (actionId: string, reason: string) => Promise<void>;
}

export const ActionApprovalModal: React.FC<ActionApprovalModalProps> = ({
  action,
  isOpen,
  onClose,
  onApprove,
  onReject,
}) => {
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !action) return null;

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await onApprove(action.id);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    setIsProcessing(true);
    try {
      await onReject(action.id, rejectReason);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <Lock className="w-5 h-5 text-amber-600" />
            <h2 className="text-sm font-bold text-slate-900">Human Approval Gate</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-md">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {/* Action Title & Risk */}
          <div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900">{action.title}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                action.estimatedRisk === 'High'
                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}>
                {action.estimatedRisk} Risk
              </span>
            </div>
            <p className="text-slate-600 mt-1.5 leading-relaxed">{action.description}</p>
          </div>

          {/* Safety Notice */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start space-x-2 text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              This remediation action mutates production cluster infrastructure. In accordance with responsible AI safety policies, execution requires human engineer authorization.
            </p>
          </div>

          {/* Command / Payload Preview */}
          {action.commandOrPayload && (
            <div>
              <span className="font-semibold text-slate-700 block mb-1">Target Command / Payload:</span>
              <div className="p-3 bg-slate-900 text-emerald-400 rounded-lg font-mono text-[11px] overflow-x-auto whitespace-pre-wrap border border-slate-800">
                {action.commandOrPayload}
              </div>
            </div>
          )}

          {/* Rejection Input Mode */}
          {isRejecting ? (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block font-semibold text-slate-700">
                Rejection Rationale (Retained for AI Learning):
              </label>
              <textarea
                rows={2}
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="Explain why this action is inappropriate for current circumstances..."
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsRejecting(false)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-800 border border-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={isProcessing || !rejectReason.trim()}
                  className="px-3 py-1.5 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-700 disabled:opacity-50 transition"
                >
                  {isProcessing ? 'Recording...' : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsRejecting(true)}
                className="px-3.5 py-2 text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg font-semibold transition"
              >
                Reject Action
              </button>

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-sm transition flex items-center space-x-1.5"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Executing...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Approve & Execute</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
