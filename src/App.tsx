import React from 'react';
import {
  ComplaintRecord,
  ComplaintCategory,
  ComplaintStatus,
  PriorityLevel,
  UserRole,
  ZoneSummary,
  FilterState,
  AnomalyDetectionResult
} from './types';
import { Header } from './components/Header';
import { Navigation, NavView } from './components/Navigation';
import { GlobalFilters } from './components/GlobalFilters';
import { ComplaintDetailModal } from './components/ComplaintDetailModal';
import { CitizenReportModal } from './components/CitizenReportModal';

// Views
import { ExecutiveOverviewView } from './components/views/ExecutiveOverviewView';
import { OperationsDashboardView } from './components/views/OperationsDashboardView';
import { GeographicIntelligenceView } from './components/views/GeographicIntelligenceView';
import { TrendAnalyticsView } from './components/views/TrendAnalyticsView';
import { ComplaintExplorerView } from './components/views/ComplaintExplorerView';
import { MLIntelligenceView } from './components/views/MLIntelligenceView';
import { AIDataAnalystView } from './components/views/AIDataAnalystView';
import { VisionInspectorView } from './components/views/VisionInspectorView';
import { WhatIfScenarioView } from './components/views/WhatIfScenarioView';
import { ReportsView } from './components/views/ReportsView';
import { DatasetManagementView } from './components/views/DatasetManagementView';
import { RAGKnowledgeView } from './components/views/RAGKnowledgeView';
import { AdministrationView } from './components/views/AdministrationView';
import { PersonaWorkspaceBanner } from './components/PersonaWorkspaceBanner';

const ALL_CATEGORIES: ComplaintCategory[] = [
  'Potholes & Pavement Cracks',
  'Water Main & Drainage',
  'Streetlight & Electrical',
  'Illegal Dumping & Waste',
  'Traffic Signal Outage',
  'Noise & Public Nuisance',
  'Structural Hazard & Sidewalk',
];

export default function App() {
  const [currentView, setCurrentView] = React.useState<NavView>('overview');
  const [currentRole, setCurrentRole] = React.useState<UserRole>('OPERATIONS_DIRECTOR');
  const [complaints, setComplaints] = React.useState<ComplaintRecord[]>([]);
  const [zones, setZones] = React.useState<ZoneSummary[]>([]);
  const [anomalies, setAnomalies] = React.useState<AnomalyDetectionResult[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [selectedComplaint, setSelectedComplaint] = React.useState<ComplaintRecord | null>(null);
  const [citizenReportOpen, setCitizenReportOpen] = React.useState(false);

  // Global filters
  const [filters, setFilters] = React.useState<FilterState>({
    searchQuery: '',
    selectedCategories: [],
    selectedZones: [],
    selectedStatuses: [],
    selectedPriorities: [],
    dateRange: { start: '', end: '' },
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch complaints list
      const compRes = await fetch('/api/v1/complaints?limit=250');
      const compData = await compRes.json();
      setComplaints(compData.items || []);

      // Fetch stats & zones
      const statsRes = await fetch('/api/v1/complaints/stats');
      const statsData = await statsRes.json();
      if (statsData.zones) {
        setZones(statsData.zones);
      }

      // Fetch anomalies
      const anomRes = await fetch('/api/v1/ml/anomalies');
      const anomData = await anomRes.json();
      setAnomalies(anomData || []);
    } catch (err) {
      console.error('Data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (id: string, status: ComplaintStatus) => {
    try {
      const res = await fetch(`/api/v1/complaints/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const updated = await res.json();
      setComplaints(prev => prev.map(c => (c.id === id ? updated : c)));
      if (selectedComplaint && selectedComplaint.id === id) {
        setSelectedComplaint(updated);
      }
    } catch (err) {
      console.error('Update status err:', err);
    }
  };

  const handleUpdatePriority = async (id: string, priority: PriorityLevel) => {
    try {
      const res = await fetch(`/api/v1/complaints/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority }),
      });
      const updated = await res.json();
      setComplaints(prev => prev.map(c => (c.id === id ? updated : c)));
      if (selectedComplaint && selectedComplaint.id === id) {
        setSelectedComplaint(updated);
      }
    } catch (err) {
      console.error('Update priority err:', err);
    }
  };

  // Filtered complaints applied citywide
  const displayedComplaints = complaints.filter(c => {
    if (filters.selectedCategories.length > 0 && !filters.selectedCategories.includes(c.category)) {
      return false;
    }
    if (filters.selectedZones.length > 0 && !filters.selectedZones.includes(c.location.zone)) {
      return false;
    }
    if (filters.selectedStatuses.length > 0 && !filters.selectedStatuses.includes(c.status)) {
      return false;
    }
    if (filters.selectedPriorities.length > 0 && !filters.selectedPriorities.includes(c.priority)) {
      return false;
    }
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      return (
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.trackingNumber.toLowerCase().includes(q) ||
        c.location.address.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeCount = complaints.filter(c => c.status !== 'RESOLVED' && c.status !== 'CLOSED').length;
  const criticalCount = complaints.filter(c => c.priority === 'CRITICAL' && c.status !== 'RESOLVED' && c.status !== 'CLOSED').length;
  const availableZoneNames = zones.map(z => z.name);

  const handleComplaintCreated = (newComplaint: ComplaintRecord) => {
    setComplaints(prev => [newComplaint, ...prev]);
  };

  const handleNavigateToOperations = (complaint: ComplaintRecord) => {
    setCurrentView('operations');
    setFilters(prev => ({
      ...prev,
      selectedStatuses: [],
      selectedZones: [],
      selectedCategories: [],
    }));
  };

  const handleNavigateToMap = (complaint: ComplaintRecord) => {
    setCurrentView('geospatial');
    setSelectedComplaint(complaint);
  };

  return (
    <div className="flex h-screen w-screen flex-col bg-slate-950 text-slate-100 overflow-hidden select-none">
      {/* Top Application Bar */}
      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        onRefresh={fetchData}
        loading={loading}
        totalComplaints={complaints.length}
        activeComplaints={activeCount}
        criticalComplaints={criticalCount}
        onOpenQuickFilter={() => setFilterOpen(!filterOpen)}
        searchQuery={filters.searchQuery}
        onSearchChange={(q) => setFilters(prev => ({ ...prev, searchQuery: q }))}
        onOpenCitizenReport={() => setCitizenReportOpen(true)}
      />

      {/* Global Expandable Filters Drawer */}
      <GlobalFilters
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onFilterChange={setFilters}
        availableZones={availableZoneNames}
        categories={ALL_CATEGORIES}
      />

      {/* Main Workspace Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <Navigation
          currentView={currentView}
          onSelectView={setCurrentView}
          anomalyCount={anomalies.length}
          criticalCount={criticalCount}
          onOpenCitizenReport={() => setCitizenReportOpen(true)}
        />

        {/* Scrollable View Canvas */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-gradient-to-b from-slate-950 via-slate-900/30 to-slate-950">
          {/* Active Persona Workspace Lens HUD */}
          <PersonaWorkspaceBanner
            currentRole={currentRole}
            onRoleChange={setCurrentRole}
            onNavigate={setCurrentView}
            complaints={complaints}
            zones={zones}
            anomalies={anomalies}
            onOpenCitizenReport={() => setCitizenReportOpen(true)}
          />

          {currentView === 'overview' && (
            <ExecutiveOverviewView
              complaints={displayedComplaints}
              zones={zones}
              onSelectComplaint={setSelectedComplaint}
              onNavigate={setCurrentView}
              onOpenCitizenReport={() => setCitizenReportOpen(true)}
            />
          )}

          {currentView === 'operations' && (
            <OperationsDashboardView
              complaints={displayedComplaints}
              onSelectComplaint={setSelectedComplaint}
              onUpdateStatus={handleUpdateStatus}
              onUpdatePriority={handleUpdatePriority}
            />
          )}

          {currentView === 'geospatial' && (
            <GeographicIntelligenceView
              complaints={displayedComplaints}
              zones={zones}
              onSelectComplaint={setSelectedComplaint}
            />
          )}

          {currentView === 'trends' && (
            <TrendAnalyticsView complaints={displayedComplaints} />
          )}

          {currentView === 'explorer' && (
            <ComplaintExplorerView
              complaints={displayedComplaints}
              onSelectComplaint={setSelectedComplaint}
              onUpdateStatus={handleUpdateStatus}
              onUpdatePriority={handleUpdatePriority}
            />
          )}

          {currentView === 'ml' && (
            <MLIntelligenceView
              complaints={displayedComplaints}
              onSelectComplaint={setSelectedComplaint}
            />
          )}

          {currentView === 'analyst' && <AIDataAnalystView />}

          {currentView === 'vision' && <VisionInspectorView />}

          {currentView === 'scenario' && <WhatIfScenarioView />}

          {currentView === 'reports' && <ReportsView />}

          {currentView === 'datasets' && (
            <DatasetManagementView
              onRefresh={fetchData}
              datasetCount={complaints.length}
            />
          )}

          {currentView === 'knowledge' && <RAGKnowledgeView />}

          {currentView === 'admin' && <AdministrationView currentRole={currentRole} />}
        </main>
      </div>

      {/* Individual Complaint Inspector Modal */}
      <ComplaintDetailModal
        complaint={selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        onUpdateStatus={handleUpdateStatus}
        onUpdatePriority={handleUpdatePriority}
        allComplaints={complaints}
      />

      {/* Observer / Citizen Incident Report Modal */}
      <CitizenReportModal
        isOpen={citizenReportOpen}
        onClose={() => setCitizenReportOpen(false)}
        onComplaintCreated={handleComplaintCreated}
        onNavigateToOperations={handleNavigateToOperations}
        onNavigateToMap={handleNavigateToMap}
        onInspectComplaint={(comp) => setSelectedComplaint(comp)}
        availableZones={availableZoneNames}
        allComplaints={complaints}
      />
    </div>
  );
}
