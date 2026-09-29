import React from 'react';
import { 
  Brain, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Lock, 
  Zap, 
  Database, 
  Activity, 
  GitCommit, 
  Terminal, 
  Layers,
  ChevronRight,
  TrendingDown,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

interface LandingPageProps {
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onExploreDirect: () => void;
  onLaunchDemo: () => void;
  currentUser?: { name: string; email: string; role: string; team: string } | null;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  onExploreDirect,
  onLaunchDemo,
  currentUser,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-blue-100 selection:text-blue-900">
      {/* Top Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={onExploreDirect}>
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm ring-2 ring-blue-100">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold tracking-tight text-slate-900">OpsMemory AI</span>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 rounded">
                  Hindsight SRE
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            {currentUser ? (
              <>
                <span className="hidden sm:inline-block text-slate-600 font-medium">
                  Logged in as <strong className="text-slate-900">{currentUser.name}</strong>
                </span>
                <button
                  onClick={onExploreDirect}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs transition flex items-center space-x-1.5"
                >
                  <span>Open SRE Console</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-4 py-2 text-slate-700 hover:text-slate-900 font-semibold transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth('signup')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs transition flex items-center space-x-1.5"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-6">
        {/* Hackathon Badge */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-xs font-semibold text-blue-800 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          <span>Built for Hindsight AI Hackathon • Bank: <code className="font-mono font-bold">opsmemory-production</code></span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
          An AI Incident-Response Engineer that <span className="text-blue-600">Remembers Every Production Failure</span>
        </h1>

        {/* Tagline & Subheading */}
        <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
          Engineers repeatedly investigate similar outages from scratch. <strong>OpsMemory AI</strong> searches persistent Hindsight memory, recalls matching historical root causes, warns against past failed fixes, and resolves production failures <strong>up to 71% faster</strong>.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            onClick={onLaunchDemo}
            className="w-full sm:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition flex items-center justify-center space-x-2"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>Launch Live Demo Studio</span>
          </button>

          <button
            onClick={() => onOpenAuth('login')}
            className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-sm font-bold shadow-xs hover:border-slate-300 transition flex items-center justify-center space-x-2"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Log In as SRE Commander</span>
          </button>
        </div>

        {/* Live Interactive Hero Preview Card */}
        <div className="pt-10 max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden text-left p-6 space-y-4 ring-1 ring-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 bg-red-100 text-red-800 text-[10px] font-bold rounded">P1 CRITICAL</span>
                <span className="font-mono text-xs font-bold text-slate-900">INC-1240: Payments API 504 Timeout Surge</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-full text-xs font-bold flex items-center space-x-1">
                  <Brain className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Hindsight Memory Recalled: INC-1042 (94% Match)</span>
                </span>
              </div>
            </div>

            {/* Cognitive Leap Visualizer */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Observed Telemetry</span>
                <p className="font-medium text-slate-800">Latency: 5120ms • DB Pool: 98% • Error Rate: 22.1%</p>
              </div>

              <div className="p-3 bg-indigo-50/60 border border-indigo-200 rounded-lg">
                <span className="text-[10px] font-bold text-indigo-800 uppercase block mb-1">Recalled Historical Resolution</span>
                <p className="font-medium text-indigo-950">Scale DB Pool 100 → 150 (Resolved in 4m in INC-1042)</p>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block mb-1">SRE Outcome</span>
                <p className="font-medium text-emerald-950">MTTR: 4.2m (-71.6% faster vs. first occurrence)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Counter Bar */}
      <section className="bg-white border-y border-slate-200 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-3xl font-extrabold text-blue-600 tracking-tight">-71.6%</p>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1 block">MTTR Reduction</span>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">1,284+</p>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1 block">Hindsight Memories Stored</span>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-emerald-600 tracking-tight">812</p>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1 block">Proven Successful Fixes</span>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-amber-600 tracking-tight">100%</p>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1 block">Failed Fixes Remembered</span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Engineered for Modern DevOps & SRE Teams
          </h2>
          <p className="text-sm text-slate-600 max-w-2xl mx-auto">
            OpsMemory AI isn't a chatbot with memory bolted on—it's a closed-loop memory plane that transforms every outage into permanent organizational intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 hover:border-slate-300 transition">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Persistent Hindsight Memory</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Integrates official <code className="text-indigo-600 font-mono font-bold">@vectorize-io/hindsight-client</code> to retain technical facts, operational experiences, and engineer beliefs in an isolated memory bank.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-2xl border border-amber-200 shadow-sm space-y-3 bg-amber-50/20 hover:border-amber-300 transition">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Negative Memory Guard</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Remembers when a remediation attempt <strong>FAILED</strong> (e.g. increasing DB pool failed during Redis socket timeouts). Alerts on-call engineers to prevent repeating past mistakes.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 hover:border-slate-300 transition">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Human Approval Gate</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Investigation and evidence analysis are fully autonomous. Dangerous mutating actions (restarts, scaling, rollbacks) strictly require human authorization with full runbook execution audits.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 hover:border-slate-300 transition">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Calibrated Multi-Root Cause</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Provides ranked diagnosis candidates with calibrated confidence scores (<em>Likely cause</em>, <em>Evidence suggests</em>, <em>Historical match</em>) to prevent hallucinated certainty.
            </p>
          </div>

          {/* Card 5 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 hover:border-slate-300 transition">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Terminal className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Live Streaming Timeline</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Watch the agent ingest telemetry, parse logs, query Hindsight, evaluate matching memories, and prepare actionable remediation in real time via Server-Sent Events.
            </p>
          </div>

          {/* Card 6 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 hover:border-slate-300 transition">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Automated Post-Mortem Retention</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Generates editable draft post-mortems upon incident resolution. Clicking "Save to Hindsight" retains the learnings into the bank for subsequent on-call engineers.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 py-12 px-4 sm:px-6 lg:px-8 text-center text-white">
        <div className="max-w-4xl mx-auto space-y-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Ready to Experience Autonomous Incident Response with Memory?
          </h2>
          <p className="text-blue-100 text-xs sm:text-sm max-w-2xl mx-auto">
            Test the live hackathon scenarios, review real-time Hindsight memory recalls, and explore the closed-loop learning cycle.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={onLaunchDemo}
              className="px-6 py-3 bg-white text-blue-700 hover:bg-blue-50 rounded-xl font-bold text-xs shadow-md transition"
            >
              Launch Demo Studio
            </button>
            <button
              onClick={() => onOpenAuth('signup')}
              className="px-6 py-3 bg-blue-800 hover:bg-blue-900 text-white rounded-xl font-bold text-xs border border-blue-400 transition"
            >
              Sign In to OpsMemory
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p>OpsMemory AI • Built for the Hindsight AI Hackathon • Strict Enterprise Light Theme</p>
      </footer>
    </div>
  );
};
