import React from 'react';
import { ComplaintRecord, ZoneSummary } from '../../types';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  TrendingUp,
  BrainCircuit,
  MapPin,
  ArrowUpRight,
  ShieldAlert,
  Sparkles,
  BarChart3,
  Activity,
  Flame,
  ChevronRight,
  Camera,
} from 'lucide-react';

interface ExecutiveOverviewProps {
  complaints: ComplaintRecord[];
  zones: ZoneSummary[];
  onSelectComplaint: (c: ComplaintRecord) => void;
  onNavigate: (view: any) => void;
  onOpenCitizenReport?: () => void;
}

export const ExecutiveOverviewView: React.FC<ExecutiveOverviewProps> = ({
  complaints,
  zones,
  onSelectComplaint,
  onNavigate,
  onOpenCitizenReport,
}) => {
  const total = complaints.length;
  const active = complaints.filter(c => c.status !== 'RESOLVED' && c.status !== 'CLOSED');
  const critical = complaints.filter(c => c.priority === 'CRITICAL');
  const slaBreached = complaints.filter(c => c.slaBreached);
  const resolved = complaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED');

  const slaRate = total > 0 ? Math.round(((total - slaBreached.length) / total) * 1000) / 10 : 85.0;

  // Category tally
  const catCounts: Record<string, { total: number; critical: number }> = {};
  for (const c of complaints) {
    if (!catCounts[c.category]) catCounts[c.category] = { total: 0, critical: 0 };
    catCounts[c.category].total++;
    if (c.priority === 'CRITICAL') catCounts[c.category].critical++;
  }

  const sortedCats = Object.entries(catCounts).sort((a, b) => b[1].total - a[1].total);
  const maxCatVal = sortedCats[0]?.[1]?.total || 1;

  // Highest risk zones
  const sortedZones = [...zones].sort((a, b) => b.riskIndex - a.riskIndex);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner alert if critical issues */}
      {critical.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-rose-500/30 bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 p-4 gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/40">
              <ShieldAlert className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-rose-200">
                Active Tactical Incident Alert: {critical.length} Critical Life-Safety Incidents Unresolved
              </h3>
              <p className="text-[11px] text-slate-400">
                Predominant concentrations identified in {sortedZones[0]?.name || 'Industrial District'} and {sortedZones[1]?.name || 'Downtown'}. Immediate crew dispatch required.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('operations')}
            className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-rose-900/30 hover:bg-rose-500 transition-colors shrink-0"
          >
            <span>Open Operations Dispatch</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 relative overflow-hidden">
          <div className="text-[11px] font-medium text-slate-400 mb-1">Total Recorded Cases</div>
          <div className="text-2xl font-extrabold text-white">{total}</div>
          <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
            <Activity className="h-3 w-3 text-cyan-400" />
            <span>Ingested stream</span>
          </div>
          <div className="absolute right-2 top-2 h-16 w-16 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 relative overflow-hidden">
          <div className="text-[11px] font-medium text-slate-400 mb-1">Active Backlog</div>
          <div className="text-2xl font-extrabold text-cyan-400">{active.length}</div>
          <div className="text-[10px] text-slate-400 mt-1">
            {Math.round((active.length / (total || 1)) * 100)}% of total volume
          </div>
        </div>

        <div className="rounded-xl border border-rose-950/60 bg-slate-900/80 p-4 relative overflow-hidden">
          <div className="text-[11px] font-medium text-rose-300 mb-1">Critical Priority</div>
          <div className="text-2xl font-extrabold text-rose-400">{critical.length}</div>
          <div className="text-[10px] text-rose-400/80 mt-1 flex items-center gap-1">
            <Flame className="h-3 w-3" />
            <span>SLA ≤ 12 Hours</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 relative overflow-hidden">
          <div className="text-[11px] font-medium text-slate-400 mb-1">SLA Compliance Rate</div>
          <div className="text-2xl font-extrabold text-emerald-400">{slaRate}%</div>
          <div className="text-[10px] text-slate-400 mt-1">
            {slaBreached.length} SLA breaches noted
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 relative overflow-hidden">
          <div className="text-[11px] font-medium text-slate-400 mb-1">Resolved in SLA</div>
          <div className="text-2xl font-extrabold text-slate-200">{resolved.length}</div>
          <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            <span>Closed work orders</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 relative overflow-hidden">
          <div className="text-[11px] font-medium text-slate-400 mb-1">Mean Time to Resolve</div>
          <div className="text-2xl font-extrabold text-blue-400">32.4h</div>
          <div className="text-[10px] text-slate-400 mt-1">
            Target benchmark: 36.0h
          </div>
        </div>
      </div>

      {/* Main Split: Category Breakdown vs Zone Risk Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Category Distribution */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-cyan-400" />
                Problem Category Volume & Criticality Breakdown
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Relative share and critical safety ratio across all reported municipal infrastructure
              </p>
            </div>
            <button
              onClick={() => onNavigate('trends')}
              className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-medium"
            >
              <span>Trends</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-3 pt-2">
            {sortedCats.map(([cat, info]) => {
              const pct = Math.round((info.total / maxCatVal) * 100);
              const critPct = Math.round((info.critical / (info.total || 1)) * 100);
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{cat}</span>
                    <div className="flex items-center gap-2">
                      {info.critical > 0 && (
                        <span className="text-[10px] font-bold text-rose-400">
                          {info.critical} Crit ({critPct}%)
                        </span>
                      )}
                      <span className="font-mono font-bold text-slate-300">
                        {info.total} cases
                      </span>
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden flex">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Zone Risk Matrix Leaderboard */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-400" />
                Municipal Zone Risk & Pressure Index
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Computed risk composite (workload, SLA violations & density)
              </p>
            </div>
            <button
              onClick={() => onNavigate('geospatial')}
              className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium"
            >
              <span>Map</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-3 pt-1">
            {sortedZones.map((z, idx) => {
              const riskColor =
                z.riskIndex >= 70
                  ? 'text-rose-400 bg-rose-500/15 border-rose-500/30'
                  : z.riskIndex >= 50
                  ? 'text-amber-400 bg-amber-500/15 border-amber-500/30'
                  : 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30';

              return (
                <div
                  key={z.zoneId}
                  className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 hover:border-slate-700 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-200">
                        {idx + 1}. {z.name}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500">
                        {z.zoneId}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span>{z.activeComplaints} active</span>
                      <span>•</span>
                      <span>Avg MTTR: {z.avgResolutionHours}h</span>
                      <span>•</span>
                      <span className="text-slate-300 font-medium">{z.topCategory}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`rounded-lg border px-2.5 py-1 text-xs font-extrabold ${riskColor}`}>
                      {z.riskIndex} / 100
                    </div>
                    <div className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold mt-0.5">
                      Risk Index
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Access Intelligence Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Observer Photo Report Card */}
        <div
          onClick={onOpenCitizenReport}
          className="group cursor-pointer rounded-xl border border-cyan-500/40 bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-950 p-5 hover:border-cyan-400 transition-all shadow-lg shadow-cyan-950/30"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 group-hover:scale-105 transition-transform">
              <Camera className="h-5 w-5" />
            </div>
            <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[9px] font-bold text-cyan-300">
              Observer Portal
            </span>
          </div>
          <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-1.5">
            <span>Report Incident with Photo</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-cyan-400" />
          </h4>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Upload or snap infrastructure hazard photo. AI vision segments damage, sets priority & dispatches to district crew.
          </p>
        </div>

        <div
          onClick={() => onNavigate('ml')}
          className="group cursor-pointer rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-5 hover:border-cyan-500/50 transition-all shadow-md"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:scale-105 transition-transform">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
          </div>
          <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
            ML Forecasting & Anomaly Engine
          </h4>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Time-series forecasting, statistical Z-score surge alerts, and transparent multi-factor prioritization scoring.
          </p>
        </div>

        <div
          onClick={() => onNavigate('vision')}
          className="group cursor-pointer rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-5 hover:border-blue-500/50 transition-all shadow-md"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5" />
            </div>
            <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
          </div>
          <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
            Computer Vision Infrastructure Inspector
          </h4>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Automated road surface crack detection, deep pothole contour segmentation, and surface distress grading.
          </p>
        </div>

        <div
          onClick={() => onNavigate('scenario')}
          className="group cursor-pointer rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-5 hover:border-emerald-500/50 transition-all shadow-md"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform">
              <TrendingUp className="h-5 w-5" />
            </div>
            <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
          </div>
          <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
            What-If Operations Simulator
          </h4>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Simulate operational capacity shifts, bad weather surges, auto-triage adoption, and preventative capital investments.
          </p>
        </div>
      </div>
    </div>
  );
};
