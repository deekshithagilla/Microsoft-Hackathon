import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Tag, 
  Database, 
  Loader2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { StoredMemoryRecord } from '../types';
import { api } from '../api/client';

export const MemoryExplorer: React.FC = () => {
  const [memories, setMemories] = useState<StoredMemoryRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('Find incidents where increasing the DB pool failed');
  const [filterService, setFilterService] = useState('all');
  const [filterOutcome, setFilterOutcome] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [hindsightStatus, setHindsightStatus] = useState<any>(null);

  const loadAllMemories = async () => {
    setIsLoading(true);
    try {
      const data = await api.getMemories();
      setMemories(data.memories || []);
      setHindsightStatus(data.status);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllMemories();
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      loadAllMemories();
      return;
    }

    setIsLoading(true);
    try {
      const results = await api.recallMemories(searchQuery, {
        service: filterService !== 'all' ? filterService : undefined,
        outcome: filterOutcome !== 'all' ? filterOutcome : undefined,
      });
      setMemories(results);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = memories.filter(m => {
    if (filterService !== 'all' && m.service !== filterService) return false;
    if (filterOutcome !== 'all' && m.outcome !== filterOutcome) return false;
    if (filterType !== 'all' && m.type !== filterType) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm ring-2 ring-indigo-100">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Hindsight Memory Explorer</h1>
              <span className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 rounded-full border border-indigo-200">
                Bank: {hindsightStatus?.bankId || 'opsmemory-production'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Explore, filter, and execute semantic queries over all retained incident experiences, failure memories, and runbooks.
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-500 block">Total Stored Records</span>
          <span className="text-xl font-bold text-slate-900 font-mono">
            {memories.length} Memories
          </span>
        </div>
      </div>

      {/* Natural Language Recall Query Box */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <form onSubmit={handleSearch} className="space-y-3">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
            Query Hindsight Memory (Semantic & Multi-Strategy Recall)
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="e.g. Find incidents where increasing DB pool failed..."
                className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 shadow-sm transition flex items-center space-x-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Execute Recall</span>
                </>
              )}
            </button>
          </div>

          {/* Quick preset suggestions */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500">
            <span className="font-semibold">Suggested queries:</span>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('Find incidents where increasing the DB pool failed');
              }}
              className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition"
            >
              "Find incidents where increasing the DB pool failed"
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('Database connection pool exhaustion');
              }}
              className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition"
            >
              "Database connection pool exhaustion"
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('Redis cluster cache timeouts');
              }}
              className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition"
            >
              "Redis cluster cache timeouts"
            </button>
          </div>
        </form>

        {/* Filters Bar */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center space-x-1.5 text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Service Filter */}
          <select
            value={filterService}
            onChange={e => setFilterService(e.target.value)}
            className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
          >
            <option value="all">All Services</option>
            <option value="payments-api">payments-api</option>
            <option value="auth-service">auth-service</option>
            <option value="order-service">order-service</option>
            <option value="cache-cluster">cache-cluster</option>
          </select>

          {/* Outcome Filter */}
          <select
            value={filterOutcome}
            onChange={e => setFilterOutcome(e.target.value)}
            className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
          >
            <option value="all">All Outcomes</option>
            <option value="success">Successful Resolutions</option>
            <option value="failed">Failed Resolutions</option>
          </select>

          {/* Memory Type */}
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
          >
            <option value="all">All Memory Types</option>
            <option value="experience">Experience Memories</option>
            <option value="fact">Fact / Runbook Memories</option>
            <option value="opinion">Opinion / Feedback</option>
          </select>

          <button
            onClick={() => {
              setSearchQuery('');
              setFilterService('all');
              setFilterOutcome('all');
              setFilterType('all');
              loadAllMemories();
            }}
            className="text-[11px] text-blue-600 hover:text-blue-800 underline ml-auto"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Memories Cards Grid */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
            <p className="text-xs">Executing multi-strategy recall on Hindsight memory bank...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-400">
            <Brain className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">No matching memories returned from Hindsight</p>
            <p className="text-[11px] text-slate-500 mt-1">Try broadening your search query or resetting filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(mem => {
              const isFailed = mem.outcome === 'failed';
              const isSuccess = mem.outcome === 'success';

              return (
                <div 
                  key={mem.id}
                  className={`p-5 rounded-xl border transition shadow-xs ${
                    isFailed 
                      ? 'bg-amber-50/30 border-amber-200 hover:border-amber-300' 
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Top Bar */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs text-slate-900 font-mono">
                        {mem.incidentId ? `Memory #${mem.incidentId}` : 'Hindsight Record'}
                      </span>
                      {mem.service && (
                        <span className="text-[11px] px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded font-mono">
                          {mem.service}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        isSuccess
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : isFailed
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {mem.outcome || mem.type}
                      </span>
                    </div>
                  </div>

                  {/* Memory Raw Content */}
                  <div className="mt-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Memory Ingestion Block
                    </span>
                    <pre className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-mono text-slate-800 whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
                      {mem.content}
                    </pre>
                  </div>

                  {/* Tags & Metadata */}
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    {mem.tags.map((t, idx) => (
                      <span 
                        key={idx}
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                          t.includes('failed')
                            ? 'bg-amber-100 text-amber-800 border-amber-200 font-bold'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Card Footer */}
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(mem.timestamp).toLocaleString()}</span>
                    </div>
                    <span className="font-mono text-[10px]">Bank: {mem.bankId}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
