import React from 'react';
import { ComplaintRecord } from '../../types';
import {
  TrendingUp,
  Calendar,
  BarChart2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Sparkles
} from 'lucide-react';

interface TrendAnalyticsProps {
  complaints: ComplaintRecord[];
}

export const TrendAnalyticsView: React.FC<TrendAnalyticsProps> = ({ complaints }) => {
  // Compute day of week distribution
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayCounts = [0, 0, 0, 0, 0, 0, 0];

  for (const c of complaints) {
    const d = new Date(c.createdAt).getDay();
    dayCounts[d]++;
  }
  const maxDayVal = Math.max(...dayCounts, 1);

  // Compute SLA turnaround histogram
  const slaBins = [
    { label: '< 12 Hours (Emergency)', count: 0, color: 'bg-emerald-500' },
    { label: '12 - 24 Hours (Fast)', count: 0, color: 'bg-cyan-500' },
    { label: '24 - 48 Hours (Standard)', count: 0, color: 'bg-blue-500' },
    { label: '48 - 72 Hours (Moderate)', count: 0, color: 'bg-amber-500' },
    { label: '> 72 Hours (SLA Breached)', count: 0, color: 'bg-rose-500' },
  ];

  for (const c of complaints) {
    const hours = c.actualResolutionHours || (c.daysOpen * 24);
    if (hours < 12) slaBins[0].count++;
    else if (hours < 24) slaBins[1].count++;
    else if (hours < 48) slaBins[2].count++;
    else if (hours < 72) slaBins[3].count++;
    else slaBins[4].count++;
  }
  const maxSlaVal = Math.max(...slaBins.map(b => b.count), 1);

  // Growth surge highlights
  const surgeMetrics = [
    { category: 'Potholes & Pavement Cracks', change: '+32.4%', isSurge: true, reason: 'Winter freeze-thaw asphalt degradation' },
    { category: 'Water Main & Drainage', change: '+18.1%', isSurge: true, reason: 'Heavy rainfall catchment overflow' },
    { category: 'Traffic Signal Outage', change: '-8.5%', isSurge: false, reason: 'Proactive LED controller upgrades' },
    { category: 'Illegal Dumping & Waste', change: '+14.2%', isSurge: true, reason: 'Weekend commercial renovation debris' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-cyan-400" />
          <h2 className="text-base font-bold text-white lg:text-lg">
            Diagnostic & Cyclical Trend Analytics
          </h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Longitudinal intake rhythms, seasonal surge detection, and resolution turnaround histograms
        </p>
      </div>

      {/* Surge Rate Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {surgeMetrics.map((sm) => (
          <div
            key={sm.category}
            className="rounded-xl border border-slate-800 bg-slate-900/70 p-4"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-medium text-slate-400 truncate max-w-[170px]">
                {sm.category}
              </span>
              <span
                className={`flex items-center text-xs font-bold ${
                  sm.isSurge ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {sm.isSurge ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                {sm.change}
              </span>
            </div>
            <div className="text-[11px] text-slate-300 font-semibold mt-1">
              {sm.reason}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Trailing 14-day comparison
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Day of Week Intake Rhythms (6 cols) */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-cyan-400" />
                <span>Day-of-Week Intake Cyclical Distribution</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Weekly citizen filing pattern peaking on Monday morning intake
              </p>
            </div>
          </div>

          <div className="pt-4 space-y-3">
            {days.map((day, idx) => {
              const count = dayCounts[idx];
              const pct = Math.round((count / maxDayVal) * 100);
              return (
                <div key={day} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300 w-10">{day}</span>
                    <span className="font-mono text-slate-400">{count} complaints</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-800 overflow-hidden flex">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SLA Turnaround Histogram (6 cols) */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-400" />
                <span>Resolution Turnaround SLA Histogram</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Distribution of work orders by elapsed resolution turnaround hours
              </p>
            </div>
          </div>

          <div className="pt-4 space-y-3">
            {slaBins.map((bin) => {
              const pct = Math.round((bin.count / maxSlaVal) * 100);
              return (
                <div key={bin.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">{bin.label}</span>
                    <span className="font-mono text-slate-400">{bin.count} cases</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-800 overflow-hidden flex">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${bin.color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
