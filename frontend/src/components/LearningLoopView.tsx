import React, { useState } from 'react';
import { 
  Brain, 
  ArrowDown, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  TrendingUp, 
  ShieldAlert, 
  Clock, 
  Zap,
  RotateCw,
  Layers,
  Database
} from 'lucide-react';

export const LearningLoopView: React.FC = () => {
  const [selectedIncident, setSelectedIncident] = useState<number>(1);

  const incidentsFlow = [
    {
      step: 1,
      id: 'INC-1042',
      title: 'First Encounter: Zero Prior Memory',
      day: 'Day 1',
      symptoms: '504 Timeouts, Latency 5.2s, DB Connections at 98%',
      memoryState: 'No prior match in Hindsight bank "opsmemory-production"',
      investigation: 'First-principles diagnostic triage from logs and metrics',
      diagnosis: 'Database connection pool exhaustion identified',
      resolution: 'Scaled pool from 100 → 150',
      outcome: 'SUCCESS',
      outcomeBadge: 'success',
      mttr: '14.8 minutes',
      learningImpact: 'Experience, symptoms, telemetry vectors, and engineer feedback retained into Hindsight memory.',
      memoryRetained: 'Stored as Experience + Runbook Fact in opsmemory-production',
    },
    {
      step: 2,
      id: 'INC-1240',
      title: 'Second Encounter: Memory Recalled!',
      day: 'Day 18',
      symptoms: 'Identical 504 Timeouts & DB Connection saturation at 98%',
      memoryState: 'Hindsight immediately recalled INC-1042 with 94% relevance!',
      investigation: 'Skipped trial-and-error; directly correlated past successful resolution',
      diagnosis: 'Confirmed database pool exhaustion via memory match',
      resolution: 'Pre-approved pool scaling runbook executed instantly',
      outcome: 'SUCCESS (71% FASTER)',
      outcomeBadge: 'success',
      mttr: '4.2 minutes',
      learningImpact: 'Agent confirmed confidence score (+18%), saving 10.6 minutes of downtime.',
      memoryRetained: 'Memory weight strengthened; MTTR benchmark updated',
    },
    {
      step: 3,
      id: 'INC-1298',
      title: 'Complex Edge Case: Failed Fix Remembered',
      day: 'Day 35',
      symptoms: 'Latency spike to 4.2s, DB connections elevated to 88%, Redis socket errors',
      memoryState: 'Recalled negative experience: INC-1098 where DB pool increase FAILED!',
      investigation: 'Negative memory alert: "Increasing DB pool failed for similar symptoms (Redis starvation)"',
      diagnosis: 'Avoided DB pool mistake; diagnosed Redis cache cluster node starvation',
      resolution: 'Restarted Redis cache pods and triggered clean cluster failover',
      outcome: 'SUCCESS (AVOIDED FALSE FIX)',
      outcomeBadge: 'success',
      mttr: '5.1 minutes',
      learningImpact: 'Agent prevented repeating a 28-minute outage by remembering past failed remediation.',
      memoryRetained: 'Cross-service causal link retained: Redis starvation → DB query pileup',
    },
  ];

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="bg-white border border-indigo-100 rounded-xl p-6 shadow-sm bg-gradient-to-r from-indigo-50/50 via-blue-50/30 to-white">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm ring-2 ring-indigo-100">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">How OpsMemory Learns</h1>
              <span className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 rounded-full border border-indigo-200">
                Closed-Loop Memory System
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Visualizing how Hindsight memory evolves across consecutive production incidents: remembering successes, recalling runbooks, and learning from past failed attempts.
            </p>
          </div>
        </div>
      </div>

      {/* The Central Learning Loop Flow */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Incident Memory Evolution Timeline</h2>
            <p className="text-xs text-slate-500">Click any step to inspect the agent's cognitive leap</p>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <span className="flex items-center space-x-1 text-slate-500">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>Overall MTTR Gain: <strong>-65%</strong></span>
            </span>
          </div>
        </div>

        {/* Step Selector Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {incidentsFlow.map((inc) => {
            const isSelected = selectedIncident === inc.step;
            return (
              <div
                key={inc.step}
                onClick={() => setSelectedIncident(inc.step)}
                className={`p-4 rounded-xl border cursor-pointer transition relative ${
                  isSelected 
                    ? 'bg-indigo-50/30 border-indigo-500 ring-2 ring-indigo-200 shadow-sm' 
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                    {inc.day}
                  </span>
                  <span className="font-mono text-xs font-bold text-indigo-700">
                    {inc.id}
                  </span>
                </div>

                <h3 className="text-xs font-bold text-slate-900 mt-2">
                  {inc.title}
                </h3>

                <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                  <span className="text-slate-500">MTTR:</span>
                  <span className="font-bold text-slate-800">{inc.mttr}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Deep Dive Card for Selected Step */}
        {(() => {
          const inc = incidentsFlow.find(i => i.step === selectedIncident)!;

          return (
            <div className="p-6 bg-slate-50 rounded-xl border border-indigo-100 space-y-5 animate-in fade-in duration-150">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                    {inc.step}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">
                    {inc.title} ({inc.id})
                  </h3>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {inc.outcome}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                    MTTR: {inc.mttr}
                  </span>
                </div>
              </div>

              {/* The Step Pipeline */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                {/* 1. Ingestion */}
                <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    1. Telemetry Ingested
                  </span>
                  <p className="text-slate-800 font-medium">{inc.symptoms}</p>
                </div>

                {/* 2. Hindsight Search */}
                <div className="p-3 bg-white border border-indigo-200 rounded-lg space-y-1">
                  <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block flex items-center space-x-1">
                    <Brain className="w-3 h-3 text-indigo-600" />
                    <span>2. Hindsight Memory Query</span>
                  </span>
                  <p className="text-slate-800 font-medium">{inc.memoryState}</p>
                </div>

                {/* 3. Diagnosis */}
                <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    3. AI Reasoning
                  </span>
                  <p className="text-slate-800 font-medium">{inc.diagnosis}</p>
                </div>

                {/* 4. Retention */}
                <div className="p-3 bg-white border border-emerald-200 rounded-lg space-y-1">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block flex items-center space-x-1">
                    <Database className="w-3 h-3 text-emerald-600" />
                    <span>4. Hindsight Retain</span>
                  </span>
                  <p className="text-slate-800 font-medium">{inc.memoryRetained}</p>
                </div>
              </div>

              {/* Explanatory Callout */}
              <div className="p-4 bg-white border border-indigo-100 rounded-lg shadow-2xs">
                <div className="flex items-center space-x-2 text-indigo-800 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>The Memory Impact:</span>
                </div>
                <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                  {inc.learningImpact}
                </p>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Before vs After Memory Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Without Memory (Traditional AI / Static Runbook) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-slate-700">
            <XCircle className="w-5 h-5 text-rose-500" />
            <h3 className="text-sm font-bold text-slate-900">Without Hindsight Memory</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Stateless chatbots and static wikis start every incident from scratch.
          </p>
          <ul className="space-y-2 text-xs text-slate-600">
            <li className="flex items-start space-x-2">
              <span className="text-rose-500 font-bold mt-0.5">✕</span>
              <span>Repeats identical diagnostic queries on every recurrence</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-rose-500 font-bold mt-0.5">✕</span>
              <span>Forgets which fixes worked and which fixes failed</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-rose-500 font-bold mt-0.5">✕</span>
              <span>Risks re-applying dangerous, ineffective remediation attempts</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-rose-500 font-bold mt-0.5">✕</span>
              <span>Average MTTR remains stagnant at 14+ minutes</span>
            </li>
          </ul>
        </div>

        {/* With OpsMemory Hindsight AI */}
        <div className="bg-white rounded-xl border border-blue-200 p-5 shadow-sm space-y-3 bg-gradient-to-br from-blue-50/20 to-white">
          <div className="flex items-center space-x-2 text-blue-700">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">With OpsMemory AI + Hindsight</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every failure becomes a permanent cognitive asset for your engineering team.
          </p>
          <ul className="space-y-2 text-xs text-slate-700 font-medium">
            <li className="flex items-start space-x-2">
              <span className="text-emerald-600 font-bold mt-0.5">✓</span>
              <span>Instantly recalls historical incidents via multi-strategy TEMPR search</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-emerald-600 font-bold mt-0.5">✓</span>
              <span>Explicitly alerts when a proposed fix previously failed (Negative Memory)</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-emerald-600 font-bold mt-0.5">✓</span>
              <span>Human approval gate verifies runbook commands before execution</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-emerald-600 font-bold mt-0.5">✓</span>
              <span>MTTR accelerates by 71%, resolving repeated surges in under 4 minutes</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
