import React from 'react';
import { 
  ShieldAlert, 
  Brain, 
  PlusCircle, 
  Play, 
  RotateCcw, 
  Activity, 
  Database,
  Layers,
  Sparkles,
  LogOut,
  UserCheck
} from 'lucide-react';
import { UserProfile } from './LoginPage';

interface HeaderProps {
  currentView: 'dashboard' | 'incident' | 'learning' | 'memory' | 'simulator';
  onNavigate: (view: 'dashboard' | 'incident' | 'learning' | 'memory' | 'simulator') => void;
  activeIncidentsCount: number;
  hindsightConnected: boolean;
  hindsightBankId: string;
  onOpenCreate: () => void;
  onOpenSimulator: () => void;
  onReset: () => void;
  currentUser?: UserProfile | null;
  onSignOut?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  activeIncidentsCount,
  hindsightConnected,
  hindsightBankId,
  onOpenCreate,
  onOpenSimulator,
  onReset,
  currentUser,
  onSignOut,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      {/* Top Banner / SRE Status */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Product Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm ring-2 ring-blue-100">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold text-slate-900 tracking-tight">OpsMemory AI</span>
                <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 rounded">
                  Hindsight SRE
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Remembers every production failure, learns from every resolution
              </p>
            </div>
          </div>

          {/* Hindsight Status & Actions */}
          <div className="flex items-center space-x-2.5">
            {/* Hindsight Bank Indicator */}
            <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700">
              <span className={`w-2 h-2 rounded-full ${hindsightConnected ? 'bg-emerald-500' : 'bg-blue-500'} animate-pulse`} />
              <span className="font-medium text-slate-500">Bank:</span>
              <span className="font-mono font-semibold text-slate-800">{hindsightBankId}</span>
            </div>

            {/* Active Alert Pill */}
            {activeIncidentsCount > 0 && (
              <div 
                onClick={() => onNavigate('dashboard')}
                className="flex items-center space-x-1.5 px-2.5 py-1 bg-red-50 border border-red-200 text-red-700 rounded-md text-xs font-semibold cursor-pointer hover:bg-red-100 transition"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>{activeIncidentsCount} Active</span>
              </div>
            )}

            {/* Reset Demo Button */}
            <button
              onClick={onReset}
              title="Reset Demo Data"
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md border border-slate-200 transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Simulation Studio CTA */}
            <button
              onClick={onOpenSimulator}
              className="flex items-center space-x-1.5 px-3 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-md text-xs font-semibold hover:bg-indigo-100 transition shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-indigo-700" />
              <span>Demo Scenarios</span>
            </button>

            {/* Create Incident CTA */}
            <button
              onClick={onOpenCreate}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 text-white rounded-md text-xs font-semibold hover:bg-blue-700 transition shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Incident</span>
            </button>

            {/* User Profile / SRE Session */}
            {currentUser && (
              <div className="flex items-center space-x-2.5 pl-2.5 border-l border-slate-200">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-800 leading-tight">{currentUser.name}</span>
                  <span className="text-[10px] text-slate-500 truncate max-w-[130px]">{currentUser.role}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs ring-2 ring-blue-100">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                {onSignOut && (
                  <button
                    onClick={onSignOut}
                    title="Sign Out to Login Screen"
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition flex items-center space-x-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-xs text-slate-500 hidden md:inline">Sign Out</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-6 -mb-px border-t border-slate-100 text-sm font-medium">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`py-3 px-1 border-b-2 flex items-center space-x-2 transition ${
              currentView === 'dashboard'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Incident Dashboard</span>
          </button>

          <button
            onClick={() => onNavigate('learning')}
            className={`py-3 px-1 border-b-2 flex items-center space-x-2 transition ${
              currentView === 'learning'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>How OpsMemory Learns</span>
          </button>

          <button
            onClick={() => onNavigate('memory')}
            className={`py-3 px-1 border-b-2 flex items-center space-x-2 transition ${
              currentView === 'memory'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Database className="w-4 h-4 text-indigo-500" />
            <span>Hindsight Memory Explorer</span>
          </button>

          <button
            onClick={() => onNavigate('simulator')}
            className={`py-3 px-1 border-b-2 flex items-center space-x-2 transition ${
              currentView === 'simulator'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>Simulation Studio</span>
          </button>
        </div>
      </div>
    </header>
  );
};
