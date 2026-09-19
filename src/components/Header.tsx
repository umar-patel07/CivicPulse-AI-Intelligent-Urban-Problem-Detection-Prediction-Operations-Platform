import React from 'react';
import { UserRole } from '../types';
import {
  Activity,
  ShieldCheck,
  Building2,
  RefreshCw,
  Bell,
  Sparkles,
  Search,
  SlidersHorizontal,
  ChevronDown,
  Camera,
} from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onRefresh: () => void;
  loading: boolean;
  totalComplaints: number;
  activeComplaints: number;
  criticalComplaints: number;
  onOpenQuickFilter: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenCitizenReport?: () => void;
}

const ROLES: { role: UserRole; label: string; desc: string }[] = [
  { role: 'OPERATIONS_DIRECTOR', label: 'Operations Director', desc: 'Full citywide operational control and resource dispatch' },
  { role: 'LEAD_ANALYST', label: 'Lead Urban Analyst', desc: 'Forecasting, deep anomaly modeling, and scenario runs' },
  { role: 'FIELD_DISPATCHER', label: 'Field Crew Dispatcher', desc: 'Ticket routing, triage and computer vision field verification' },
  { role: 'PLATFORM_ADMIN', label: 'Platform Administrator', desc: 'System configuration, data synthesis, and audit log inspection' },
  { role: 'PUBLIC_AUDITOR', label: 'Public Auditor & Observer', desc: 'Read-only transparency metrics and SLA compliance' },
];

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  onRefresh,
  loading,
  totalComplaints,
  activeComplaints,
  criticalComplaints,
  onOpenQuickFilter,
  searchQuery,
  onSearchChange,
  onOpenCitizenReport,
}) => {
  const [roleDropdownOpen, setRoleDropdownOpen] = React.useState(false);
  const selectedRoleObj = ROLES.find(r => r.role === currentRole) || ROLES[0];

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 backdrop-blur-md lg:px-6">
      {/* Left: Branding & Status */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-md shadow-cyan-500/20">
          <Activity className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold tracking-tight text-white lg:text-lg">
              CIVICPULSE<span className="text-cyan-400 font-extrabold ml-1">AI</span>
            </h1>
            <span className="hidden rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-300 sm:inline-block">
              Urban Intelligence v2.6
            </span>
          </div>
          <p className="hidden text-xs text-slate-400 sm:block">
            Autonomous Urban Problem Detection & Decision-Support
          </p>
        </div>
      </div>

      {/* Center: Live Quick Metrics & Search */}
      <div className="hidden items-center gap-3 md:flex">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search address, ID, tags, description..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-9 w-64 rounded-lg border border-slate-800 bg-slate-950/80 pl-9 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 lg:w-80"
          />
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-1.5 text-xs">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-400">Backlog:</span>
          <span className="font-semibold text-slate-200">{activeComplaints} active</span>
          <span className="text-slate-600">/</span>
          <span className="font-semibold text-rose-400">{criticalComplaints} critical</span>
        </div>
      </div>

      {/* Right: Actions & Role Switcher */}
      <div className="flex items-center gap-2">
        <button
          onClick={onRefresh}
          disabled={loading}
          title="Refresh Data"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-800/60 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
        </button>

        <button
          onClick={onOpenQuickFilter}
          title="Toggle Filters"
          className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-800/60 px-3 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
        >
          <SlidersHorizontal className="h-3.5 w-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Filters</span>
        </button>

        {/* Observer / Citizen Report Issue Button */}
        <button
          onClick={onOpenCitizenReport}
          title="Submit Incident Report with Photo"
          className="flex h-9 items-center gap-1.5 rounded-lg border border-cyan-500/50 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 px-3 text-xs font-bold text-cyan-300 transition-all hover:border-cyan-400 hover:from-cyan-500/30 hover:to-blue-600/30 hover:text-white shadow-sm shadow-cyan-500/10 active:scale-95"
        >
          <Camera className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
          <span>Report Issue</span>
        </button>

        {/* Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="flex h-9 items-center gap-2 rounded-lg border border-slate-700/80 bg-slate-800 px-3 text-xs font-medium text-slate-200 transition-colors hover:border-cyan-500/50 hover:bg-slate-700/80"
          >
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
            <span className="max-w-[120px] truncate sm:max-w-none">{selectedRoleObj.label}</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {roleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-800 bg-slate-900 p-2 shadow-2xl shadow-black/80 ring-1 ring-white/5 z-50">
              <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Switch Operational Persona
              </div>
              <div className="space-y-1">
                {ROLES.map((r) => (
                  <button
                    key={r.role}
                    onClick={() => {
                      onRoleChange(r.role);
                      setRoleDropdownOpen(false);
                    }}
                    className={`flex w-full flex-col rounded-lg px-2.5 py-2 text-left transition-colors ${
                      currentRole === r.role
                        ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-200'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-xs font-semibold">{r.label}</span>
                    <span className="text-[10px] text-slate-400 leading-tight mt-0.5">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
