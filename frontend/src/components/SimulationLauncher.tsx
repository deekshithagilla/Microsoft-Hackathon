import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Brain, 
  Zap, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Server, 
  Flame, 
  ArrowRight,
  Database,
  Layers,
  Loader2
} from 'lucide-react';
import { SimulationScenario, Incident } from '../types';
import { api } from '../api/client';

interface SimulationLauncherProps {
  onScenarioLaunched: (incident: Incident) => void;
}

export const SimulationLauncher: React.FC<SimulationLauncherProps> = ({
  onScenarioLaunched,
}) => {
  const [scenarios, setScenarios] = useState<SimulationScenario[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [category, setCategory] = useState<'all' | 'core_demo' | 'system_failures'>('all');

  useEffect(() => {
    api.getScenarios().then(setScenarios).catch(console.error);
  }, []);

  const handleLaunch = async (scenarioId: string) => {
    setLoadingId(scenarioId);
    try {
      const incident = await api.launchScenario(scenarioId);
      // Auto-trigger investigation right after launch for seamless demo
      onScenarioLaunched(incident);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  const filtered = scenarios.filter(s => {
    if (category !== 'all' && s.category !== category) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white border border-emerald-200 rounded-xl p-6 shadow-sm bg-gradient-to-r from-emerald-50/50 via-blue-50/30 to-white">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm ring-2 ring-emerald-100">
            <Zap className="w-6 h-6 fill-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Interactive Simulation Studio</h1>
              <span className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                1-Click Live Judge Demo
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Select pre-seeded failure scenarios to demonstrate the before vs. after impact of Hindsight memory in real time.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setCategory('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            category === 'all'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Scenarios ({scenarios.length})
        </button>
        <button
          onClick={() => setCategory('core_demo')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
            category === 'core_demo'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Core Hackathon Scenarios (A vs B vs C)</span>
        </button>
        <button
          onClick={() => setCategory('system_failures')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
            category === 'system_failures'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>Additional System Failures</span>
        </button>
      </div>

      {/* Scenario Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(sc => {
          const isCoreDemo = sc.category === 'core_demo';
          const isScenarioB = sc.id === 'scenario-b-db-learned';
          const isScenarioC = sc.id === 'scenario-c-failed-fix';
          const isLaunching = loadingId === sc.id;

          return (
            <div
              key={sc.id}
              className={`p-5 rounded-xl border flex flex-col justify-between transition shadow-xs ${
                isScenarioB 
                  ? 'bg-blue-50/20 border-blue-300 ring-2 ring-blue-100 hover:border-blue-400' 
                  : isScenarioC
                  ? 'bg-amber-50/20 border-amber-300 ring-2 ring-amber-100 hover:border-amber-400'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                {/* Badge & Category */}
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    isScenarioB 
                      ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                      : isScenarioC
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {sc.badge}
                  </span>

                  {sc.hasPriorMemory ? (
                    <div className="flex items-center space-x-1 text-xs text-indigo-700 font-bold">
                      <Brain className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Has Hindsight Memory</span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-medium">
                      Zero Prior Memory
                    </span>
                  )}
                </div>

                {/* Scenario Name */}
                <h3 className="text-sm font-bold text-slate-900 mt-2.5">
                  {sc.name}
                </h3>

                {/* Description */}
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {sc.description}
                </p>

                {/* Key Learning Point Highlight */}
                <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                  <div className="flex items-center space-x-1.5 text-slate-700 font-semibold mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>What This Demonstrates:</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {sc.learningPoint}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleLaunch(sc.id)}
                  disabled={isLaunching}
                  className={`w-full py-2.5 px-4 rounded-lg text-xs font-bold shadow-sm transition flex items-center justify-center space-x-2 ${
                    isScenarioB 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : isScenarioC
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : 'bg-slate-800 hover:bg-slate-900 text-white'
                  }`}
                >
                  {isLaunching ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating Incident...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Launch Scenario Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
