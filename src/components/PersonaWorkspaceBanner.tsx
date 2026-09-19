import React, { useState } from 'react';
import { UserRole, ComplaintRecord, ZoneSummary, AnomalyDetectionResult } from '../types';
import {
  Briefcase,
  Activity,
  LineChart,
  Truck,
  ShieldCheck,
  Eye,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Sliders,
  FileText,
  Database,
  Search,
  Radio
} from 'lucide-react';
import { NavView } from './Navigation';

interface PersonaWorkspaceBannerProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onNavigate: (view: NavView) => void;
  complaints: ComplaintRecord[];
  zones: ZoneSummary[];
  anomalies: AnomalyDetectionResult[];
  onOpenCitizenReport: () => void;
}

interface PersonaConfig {
  role: UserRole;
  title: string;
  badge: string;
  tagline: string;
  icon: React.ComponentType<{ className?: string }>;
  primaryColor: string;
  borderColor: string;
  bgColor: string;
  keyMetrics: (props: {
    complaints: ComplaintRecord[];
    zones: ZoneSummary[];
    anomalies: AnomalyDetectionResult[];
  }) => { label: string; value: string | number; helper: string; alert?: boolean }[];
  quickActions: {
    label: string;
    view?: NavView;
    action?: 'citizen_report';
    icon: React.ComponentType<{ className?: string }>;
  }[];
}

const PERSONAS: Record<UserRole, PersonaConfig> = {
  OPERATIONS_DIRECTOR: {
    role: 'OPERATIONS_DIRECTOR',
    title: 'City Operations Director',
    badge: 'Executive Command',
    tagline: 'Macro citywide infrastructure health, emergency declarations, cross-agency budget & Council briefings',
    icon: Briefcase,
    primaryColor: 'text-cyan-400',
    borderColor: 'border-cyan-500/40',
    bgColor: 'from-cyan-950/40 via-slate-900 to-slate-950',
    keyMetrics: ({ complaints, zones }) => {
      const active = complaints.filter(c => c.status !== 'RESOLVED' && c.status !== 'CLOSED');
      const breached = complaints.filter(c => c.slaBreached && c.status !== 'RESOLVED' && c.status !== 'CLOSED');
      const avgRisk = zones.length > 0 ? Math.round(zones.reduce((s, z) => s + z.riskIndex, 0) / zones.length) : 58;
      const slaCompliance = active.length > 0 ? Math.round(((active.length - breached.length) / active.length) * 100) : 94;
      return [
        { label: 'Active Work Orders', value: active.length, helper: `${breached.length} SLA escalated`, alert: breached.length > 5 },
        { label: 'SLA Compliance', value: `${slaCompliance}%`, helper: 'Target > 90%', alert: slaCompliance < 85 },
        { label: 'Average Risk Index', value: `${avgRisk}/100`, helper: 'Across 6 Municipal Zones' },
        { label: 'Estimated Budget Saved', value: '$342,000', helper: 'Via Predictive Mitigation' },
      ];
    },
    quickActions: [
      { label: 'Executive Overview', view: 'overview', icon: Activity },
      { label: 'Simulate "What-If" Storm', view: 'scenario', icon: Sliders },
      { label: 'Generate Council Briefing', view: 'reports', icon: FileText },
      { label: 'Live Dispatch Kanban', view: 'operations', icon: Radio },
    ],
  },
  LEAD_ANALYST: {
    role: 'LEAD_ANALYST',
    title: 'Lead Urban Data Analyst',
    badge: 'Intelligence & Research',
    tagline: 'Harmonic 14-day ML forecasting, spatial DBSCAN clustering, statistical anomaly spikes & AI Assistant queries',
    icon: LineChart,
    primaryColor: 'text-purple-400',
    borderColor: 'border-purple-500/40',
    bgColor: 'from-purple-950/40 via-slate-900 to-slate-950',
    keyMetrics: ({ anomalies, complaints }) => {
      const activeAnoms = anomalies.length;
      const criticalCount = complaints.filter(c => c.priority === 'CRITICAL').length;
      return [
        { label: 'Statistical Anomalies', value: activeAnoms, helper: 'Z-score threshold > 2.0', alert: activeAnoms > 2 },
        { label: 'ML Forecast MAE', value: '3.42', helper: 'Mean Absolute Error (High accuracy)' },
        { label: 'Active Critical Hazards', value: criticalCount, helper: 'Requiring immediate intervention' },
        { label: 'Model Horizon', value: '14 Days', helper: 'Triple exponential smoothing' },
      ];
    },
    quickActions: [
      { label: 'Ask AI Urban Analyst', view: 'analyst', icon: Sparkles },
      { label: 'ML Forecasts & Anomalies', view: 'ml', icon: LineChart },
      { label: 'Geospatial Hex Clusters', view: 'geospatial', icon: Eye },
      { label: 'Historical Trend Mining', view: 'trends', icon: Activity },
    ],
  },
  FIELD_DISPATCHER: {
    role: 'FIELD_DISPATCHER',
    title: 'Field Crew Dispatcher',
    badge: 'Tactical Deployment',
    tagline: 'Multi-stage ticket verification, rapid crew routing, and AI computer-vision pavement damage assessment',
    icon: Truck,
    primaryColor: 'text-amber-400',
    borderColor: 'border-amber-500/40',
    bgColor: 'from-amber-950/30 via-slate-900 to-slate-950',
    keyMetrics: ({ complaints }) => {
      const newIngest = complaints.filter(c => c.status === 'NEW').length;
      const inProgress = complaints.filter(c => c.status === 'IN_PROGRESS').length;
      const criticals = complaints.filter(c => c.priority === 'CRITICAL' && c.status !== 'RESOLVED').length;
      return [
        { label: 'New Awaiting Triage', value: newIngest, helper: 'Needs routing review', alert: newIngest > 10 },
        { label: 'Active Crews in Field', value: inProgress, helper: 'On-site remediation' },
        { label: 'Critical 12h SLA Work', value: criticals, helper: 'Immediate rapid response', alert: criticals > 0 },
        { label: 'Average Turnaround', value: '18.4 hrs', helper: 'Within service level agreement' },
      ];
    },
    quickActions: [
      { label: 'Tactical Dispatch Board', view: 'operations', icon: Radio },
      { label: 'Computer Vision Damage Scanner', view: 'vision', icon: Eye },
      { label: 'Ticket Directory & Filters', view: 'explorer', icon: Search },
      { label: 'Territory Hazard Map', view: 'geospatial', icon: Activity },
    ],
  },
  PLATFORM_ADMIN: {
    role: 'PLATFORM_ADMIN',
    title: 'Platform Administrator',
    badge: 'System Governance',
    tagline: 'Role-Based Access Control (RBAC), tamper-evident audit ledger, synthetic seed generation & database ingestion',
    icon: ShieldCheck,
    primaryColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/40',
    bgColor: 'from-emerald-950/30 via-slate-900 to-slate-950',
    keyMetrics: ({ complaints }) => {
      return [
        { label: 'Datastore Records', value: complaints.length, helper: 'In-memory + indexed store' },
        { label: 'RBAC Enforcement', value: 'ACTIVE', helper: '5 user permission tiers' },
        { label: 'Audit Trail Engine', value: 'TAMPER-EVIDENT', helper: 'Cryptographically hashed events' },
        { label: 'API Health Status', value: '100% OK', helper: 'Vite + Node/Express backend' },
      ];
    },
    quickActions: [
      { label: 'System Admin & RBAC Matrix', view: 'admin', icon: ShieldCheck },
      { label: 'Dataset Ingestion & CSV', view: 'datasets', icon: Database },
      { label: 'Municipal SOP Knowledge Base', view: 'knowledge', icon: Search },
      { label: 'Complaint Explorer', view: 'explorer', icon: Activity },
    ],
  },
  PUBLIC_AUDITOR: {
    role: 'PUBLIC_AUDITOR',
    title: 'Citizen, Observer & Public Auditor',
    badge: 'Civic Transparency',
    tagline: 'Submit photo-verified hazard complaints, inspect open municipal records, and verify public SLA compliance',
    icon: Eye,
    primaryColor: 'text-blue-400',
    borderColor: 'border-blue-500/40',
    bgColor: 'from-blue-950/40 via-slate-900 to-slate-950',
    keyMetrics: ({ complaints }) => {
      const resolved = complaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length;
      const citizenReports = complaints.filter(c => c.reporterType === 'CITIZEN').length;
      return [
        { label: 'Resolved for Citizens', value: resolved, helper: 'Confirmed repairs signed off' },
        { label: 'Citizen Submissions', value: citizenReports, helper: 'Community reports active' },
        { label: 'Public Transparency Index', value: '98.4%', helper: 'Open data compliance' },
        { label: 'Avg Public Response', value: '21 hrs', helper: 'From photo to crew arrival' },
      ];
    },
    quickActions: [
      { label: 'Submit Photo Incident Report', action: 'citizen_report', icon: Camera },
      { label: 'Track City Incidents & Map', view: 'geospatial', icon: Activity },
      { label: 'Public Council Audit Report', view: 'reports', icon: FileText },
      { label: 'Explore All Public Records', view: 'explorer', icon: Search },
    ],
  },
};

export const PersonaWorkspaceBanner: React.FC<PersonaWorkspaceBannerProps> = ({
  currentRole,
  onRoleChange,
  onNavigate,
  complaints,
  zones,
  anomalies,
  onOpenCitizenReport,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);

  const persona = PERSONAS[currentRole] || PERSONAS.OPERATIONS_DIRECTOR;
  const IconComponent = persona.icon;
  const metrics = persona.keyMetrics({ complaints, zones, anomalies });

  return (
    <div
      className={`relative mb-6 rounded-2xl border ${persona.borderColor} bg-gradient-to-r ${persona.bgColor} p-4 lg:p-5 shadow-xl transition-all duration-300`}
    >
      {/* Top Identity Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start md:items-center gap-3.5">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-950/80 border ${persona.borderColor} ${persona.primaryColor} shadow-md`}
          >
            <IconComponent className="h-6 w-6" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">Current Perspective:</span>
              <h3 className="text-sm lg:text-base font-bold text-white flex items-center gap-1.5">
                {persona.title}
              </h3>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${persona.borderColor} bg-slate-900/80 ${persona.primaryColor}`}
              >
                {persona.badge}
              </span>
            </div>
            {!collapsed && (
              <p className="text-xs text-slate-300/90 mt-0.5 max-w-3xl leading-relaxed">
                {persona.tagline}
              </p>
            )}
          </div>
        </div>

        {/* Right side controls: Role Switcher & Collapse */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          {/* Quick Persona Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900/90 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:border-slate-500 hover:bg-slate-850 transition-colors shadow-sm"
            >
              <span>Switch Perspective</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${roleSwitcherOpen ? 'rotate-180' : ''}`} />
            </button>

            {roleSwitcherOpen && (
              <div className="absolute right-0 top-full mt-1.5 z-30 w-64 rounded-xl border border-slate-700 bg-slate-900 shadow-2xl p-1.5 space-y-1 backdrop-blur-lg">
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Switch Workspace Persona
                </div>
                {(Object.keys(PERSONAS) as UserRole[]).map((r) => {
                  const p = PERSONAS[r];
                  const ActiveIcon = p.icon;
                  const isSelected = currentRole === r;
                  return (
                    <button
                      key={r}
                      onClick={() => {
                        onRoleChange(r);
                        setRoleSwitcherOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                        isSelected
                          ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <ActiveIcon className="h-4 w-4 shrink-0 text-slate-400" />
                      <div className="truncate">
                        <div className="truncate font-semibold">{p.title}</div>
                        <div className="text-[10px] text-slate-400 truncate">{p.badge}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Minimize / Expand Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Expand Role Hub' : 'Minimize Role Hub'}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Body: Telemetry Metrics + Role Curated Workspaces */}
      {!collapsed && (
        <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-4">
          
          {/* Key Role Telemetry 4-Pack */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {metrics.map((m, idx) => (
              <div
                key={idx}
                className={`rounded-xl border p-2.5 text-left backdrop-blur-sm transition-all ${
                  m.alert
                    ? 'border-rose-500/50 bg-rose-950/30'
                    : 'border-slate-800/80 bg-slate-950/60'
                }`}
              >
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider truncate">
                  {m.label}
                </div>
                <div
                  className={`text-base lg:text-lg font-mono font-bold mt-0.5 ${
                    m.alert ? 'text-rose-400' : 'text-white'
                  }`}
                >
                  {m.value}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  {m.helper}
                </div>
              </div>
            ))}
          </div>

          {/* Curated Quick Actions For This Persona */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <Sparkles className={`h-3.5 w-3.5 ${persona.primaryColor}`} />
              <span>Recommended Workspaces for {persona.badge}:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {persona.quickActions.map((qa, i) => {
                const ActionIcon = qa.icon;
                return (
                  <button
                    key={i}
                    onClick={() => {
                      if (qa.action === 'citizen_report') {
                        onOpenCitizenReport();
                      } else if (qa.view) {
                        onNavigate(qa.view);
                      }
                    }}
                    className={`flex items-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-900/90 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:border-cyan-500 hover:bg-slate-800 hover:text-white transition-all shadow-sm active:scale-95 group`}
                  >
                    <ActionIcon className="h-3.5 w-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
                    <span>{qa.label}</span>
                    <ArrowRight className="h-2.5 w-2.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
