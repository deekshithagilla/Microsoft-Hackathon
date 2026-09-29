import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { IncidentDetail } from './components/IncidentDetail';
import { LearningLoopView } from './components/LearningLoopView';
import { MemoryExplorer } from './components/MemoryExplorer';
import { SimulationLauncher } from './components/SimulationLauncher';
import { CreateIncidentModal } from './components/CreateIncidentModal';
import { LandingPage } from './components/LandingPage';
import { AuthModal, UserProfile } from './components/AuthModal';
import { Incident, DashboardStats } from './types';
import { api } from './api/client';

export const App: React.FC = () => {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem('opsmemory_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // Navigation State
  const [currentView, setCurrentView] = useState<'dashboard' | 'incident' | 'learning' | 'memory' | 'simulator' | 'landing'>(
    () => {
      const stored = localStorage.getItem('opsmemory_user');
      return stored ? 'dashboard' : 'landing';
    }
  );

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [hindsightConnected, setHindsightConnected] = useState(true);
  const [hindsightBankId, setHindsightBankId] = useState('opsmemory-production');

  const loadData = async () => {
    try {
      const [incidentList, dashboardStats, health] = await Promise.all([
        api.getIncidents(),
        api.getStats(),
        api.getHealth(),
      ]);
      setIncidents(incidentList);
      setStats(dashboardStats);
      if (health?.hindsight) {
        setHindsightConnected(health.hindsight.isLiveDaemon || health.hindsight.status === 'active_mirror');
        if (health.hindsight.bankId) setHindsightBankId(health.hindsight.bankId);
      }
    } catch (err) {
      console.error('Failed to load initial application state', err);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleAuthSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('opsmemory_user', JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save user session', e);
    }
    setCurrentView('dashboard');
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('opsmemory_user');
    } catch (e) {
      console.error('Failed to clear user session', e);
    }
    setCurrentView('landing');
  };

  const handleOpenAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleSelectIncident = (id: string) => {
    setSelectedIncidentId(id);
    setCurrentView('incident');
  };

  const handleIncidentCreated = (incident: Incident) => {
    setIncidents(prev => [incident, ...prev]);
    setSelectedIncidentId(incident.id);
    setCurrentView('incident');
    loadData();
  };

  const handleIncidentUpdated = (updated: Incident) => {
    setIncidents(prev => prev.map(inc => inc.id === updated.id ? updated : inc));
    loadData();
  };

  const handleScenarioLaunched = async (incident: Incident) => {
    setIncidents(prev => [incident, ...prev]);
    setSelectedIncidentId(incident.id);
    setCurrentView('incident');
    // Automatically trigger investigation so judges see live timeline immediately!
    try {
      const investigated = await api.investigateIncident(incident.id);
      handleIncidentUpdated(investigated);
    } catch (err) {
      console.error('Auto-investigation after scenario launch error:', err);
    }
  };

  const handleResetData = async () => {
    if (window.confirm('Reset all demo data and historical memories to defaults?')) {
      await api.resetData();
      await loadData();
      setCurrentView('dashboard');
      setSelectedIncidentId(null);
    }
  };

  const selectedIncident = incidents.find(i => i.id === selectedIncidentId) || incidents[0];
  const activeCount = incidents.filter(i => i.status !== 'resolved').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* If viewing landing page, render dedicated Landing Page experience */}
      {currentView === 'landing' ? (
        <LandingPage
          onOpenAuth={handleOpenAuth}
          onExploreDirect={() => setCurrentView('dashboard')}
          onLaunchDemo={() => setCurrentView('simulator')}
          currentUser={currentUser}
        />
      ) : (
        <>
          {/* Global SRE Light Header */}
          <Header
            currentView={currentView}
            onNavigate={setCurrentView}
            activeIncidentsCount={activeCount}
            hindsightConnected={hindsightConnected}
            hindsightBankId={hindsightBankId}
            onOpenCreate={() => setIsCreateModalOpen(true)}
            onOpenSimulator={() => setCurrentView('simulator')}
            onReset={handleResetData}
            currentUser={currentUser}
            onSignOut={handleSignOut}
            onOpenAuth={handleOpenAuth}
          />

          {/* Main App Content Viewport */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            {currentView === 'dashboard' && (
              <Dashboard
                incidents={incidents}
                stats={stats}
                onSelectIncident={handleSelectIncident}
                onOpenCreate={() => setIsCreateModalOpen(true)}
                onOpenSimulator={() => setCurrentView('simulator')}
              />
            )}

            {currentView === 'incident' && selectedIncident && (
              <IncidentDetail
                incident={selectedIncident}
                onBack={() => setCurrentView('dashboard')}
                onIncidentUpdated={handleIncidentUpdated}
                onOpenExplorer={() => setCurrentView('memory')}
              />
            )}

            {currentView === 'learning' && (
              <LearningLoopView />
            )}

            {currentView === 'memory' && (
              <MemoryExplorer />
            )}

            {currentView === 'simulator' && (
              <SimulationLauncher
                onScenarioLaunched={handleScenarioLaunched}
              />
            )}
          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-slate-200 py-4 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-700">OpsMemory AI</span>
                <span>•</span>
                <span>Hindsight Agentic Memory Plane</span>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setCurrentView('landing')}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Product Overview
                </button>
                <span>•</span>
                <span>
                  Bank: <code className="font-mono text-indigo-700">opsmemory-production</code>
                </span>
              </div>
            </div>
          </footer>
        </>
      )}

      {/* Global Incident Creation Modal */}
      <CreateIncidentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={handleIncidentCreated}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        initialMode={authMode}
      />
    </div>
  );
};

