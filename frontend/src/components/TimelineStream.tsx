import React, { useState } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Brain, 
  Terminal, 
  ChevronDown, 
  ChevronRight,
  ShieldCheck,
  User,
  Activity
} from 'lucide-react';
import { TimelineEvent } from '../types';

interface TimelineStreamProps {
  timeline: TimelineEvent[];
  isInvestigating?: boolean;
}

export const TimelineStream: React.FC<TimelineStreamProps> = ({
  timeline,
  isInvestigating = false,
}) => {
  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedEvents(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-blue-600" />
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            Live Autonomous Investigation Timeline
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          {isInvestigating && (
            <span className="flex items-center space-x-1.5 px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-semibold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
              <span>Streaming Agent Steps...</span>
            </span>
          )}
          <span className="text-[11px] text-slate-400 font-mono">
            {timeline.length} events logged
          </span>
        </div>
      </div>

      {/* Events List */}
      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {timeline.map((event, idx) => {
          const isExpanded = Boolean(expandedEvents[event.id]);
          const isHindsight = event.source === 'hindsight';
          const isEngineer = event.source === 'engineer';
          const isWarning = event.status === 'warning';

          return (
            <div key={event.id || idx} className="relative group">
              {/* Dot Icon */}
              <div className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center border-2 bg-white transition ${
                isWarning 
                  ? 'border-amber-500 text-amber-600' 
                  : isHindsight
                  ? 'border-indigo-600 text-indigo-600'
                  : isEngineer
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-blue-600 text-blue-600'
              }`}>
                {isHindsight ? (
                  <Brain className="w-2.5 h-2.5" />
                ) : isEngineer ? (
                  <User className="w-2.5 h-2.5" />
                ) : isWarning ? (
                  <AlertCircle className="w-2.5 h-2.5" />
                ) : (
                  <CheckCircle2 className="w-2.5 h-2.5" />
                )}
              </div>

              {/* Event Content Box */}
              <div 
                onClick={() => event.detail && toggleExpand(event.id)}
                className={`p-3 rounded-lg border text-xs transition ${
                  event.detail ? 'cursor-pointer hover:border-slate-300' : ''
                } ${
                  isWarning
                    ? 'bg-amber-50/50 border-amber-200'
                    : isHindsight
                    ? 'bg-indigo-50/30 border-indigo-100'
                    : 'bg-slate-50/60 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[11px] font-semibold text-slate-500">
                      {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    <span className="font-bold text-slate-900">{event.title}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-bold tracking-wider ${
                      isHindsight 
                        ? 'bg-indigo-100 text-indigo-800' 
                        : isEngineer
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {event.source}
                    </span>
                  </div>

                  {event.detail && (
                    <div className="text-slate-400">
                      {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </div>
                  )}
                </div>

                <p className="text-slate-700 mt-1 leading-relaxed">
                  {event.description}
                </p>

                {/* Collapsible Detail Log */}
                {isExpanded && event.detail && (
                  <div className="mt-2 p-2 bg-slate-900 text-slate-100 rounded font-mono text-[11px] overflow-x-auto whitespace-pre-wrap border border-slate-700">
                    {event.detail}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
