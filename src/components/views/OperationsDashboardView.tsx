import React from 'react';
import { ComplaintRecord, ComplaintStatus, PriorityLevel } from '../../types';
import {
  Radio,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Users,
  Send,
  ChevronRight,
  Flame,
  ArrowRight,
  Filter,
  Check
} from 'lucide-react';

interface OperationsDashboardProps {
  complaints: ComplaintRecord[];
  onSelectComplaint: (c: ComplaintRecord) => void;
  onUpdateStatus: (id: string, status: ComplaintStatus) => void;
  onUpdatePriority: (id: string, priority: PriorityLevel) => void;
}

const LIFECYCLE_STAGES: { status: ComplaintStatus; label: string; desc: string }[] = [
  { status: 'NEW', label: 'New Ingest', desc: 'Awaiting initial triage' },
  { status: 'TRIAGED', label: 'Triaged', desc: 'Categorized & verified' },
  { status: 'ASSIGNED', label: 'Assigned', desc: 'Routed to district crew' },
  { status: 'IN_PROGRESS', label: 'In Progress', desc: 'Field active remediation' },
  { status: 'RESOLVED', label: 'Resolved', desc: 'Work completed & signed' },
];

export const OperationsDashboardView: React.FC<OperationsDashboardProps> = ({
  complaints,
  onSelectComplaint,
  onUpdateStatus,
  onUpdatePriority,
}) => {
  const [activeZoneFilter, setActiveZoneFilter] = React.useState<string>('ALL');

  const zones = Array.from(new Set(complaints.map(c => c.location.zone)));

  const filtered = activeZoneFilter === 'ALL'
    ? complaints
    : complaints.filter(c => c.location.zone === activeZoneFilter);

  const criticalIssues = filtered.filter(c => c.priority === 'CRITICAL' && c.status !== 'RESOLVED' && c.status !== 'CLOSED');
  const breachedIssues = filtered.filter(c => c.slaBreached && c.status !== 'RESOLVED' && c.status !== 'CLOSED');

  return (
    <div className="space-y-6 pb-12">
      {/* Top Operations Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-cyan-400 animate-pulse" />
            <h2 className="text-base font-bold text-white lg:text-lg">
              Tactical Operations & Dispatch Board
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-stage incident triage, field crew routing, and SLA escalation tracking
          </p>
        </div>

        {/* Zone Selector Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold text-slate-400 mr-1">Zone Filter:</span>
          <button
            onClick={() => setActiveZoneFilter('ALL')}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              activeZoneFilter === 'ALL'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All Zones
          </button>
          {zones.map((z) => (
            <button
              key={z}
              onClick={() => setActiveZoneFilter(z)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                activeZoneFilter === z
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {z}
            </button>
          ))}
        </div>
      </div>

      {/* Escalation Alerts Bar */}
      {(criticalIssues.length > 0 || breachedIssues.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-rose-500/40 bg-rose-950/20 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 font-bold text-rose-300 text-xs">
                <Flame className="h-4 w-4 text-rose-400 animate-bounce" />
                <span>Critical Life-Safety Emergency Queue ({criticalIssues.length})</span>
              </div>
              <span className="text-[10px] text-rose-400 font-semibold uppercase">12h Maximum SLA</span>
            </div>
            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {criticalIssues.slice(0, 3).map((c) => (
                <div
                  key={c.id}
                  onClick={() => onSelectComplaint(c)}
                  className="flex items-center justify-between rounded-lg border border-rose-900/40 bg-slate-900/90 p-2.5 hover:border-rose-500/60 cursor-pointer transition-colors"
                >
                  <div className="truncate pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-cyan-400 font-bold text-[11px]">{c.trackingNumber}</span>
                      <span className="font-semibold text-slate-200 text-xs truncate">{c.title}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 truncate">{c.location.address}</div>
                  </div>
                  <span className="shrink-0 rounded bg-rose-500/20 text-rose-300 px-2 py-0.5 text-[10px] font-bold">
                    {c.urgencyScore}/100 Urgency
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 font-bold text-amber-300 text-xs">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <span>SLA Breached Work Orders ({breachedIssues.length})</span>
              </div>
              <span className="text-[10px] text-amber-400 font-semibold uppercase">Turnaround Delay</span>
            </div>
            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {breachedIssues.slice(0, 3).map((c) => (
                <div
                  key={c.id}
                  onClick={() => onSelectComplaint(c)}
                  className="flex items-center justify-between rounded-lg border border-amber-900/40 bg-slate-900/90 p-2.5 hover:border-amber-500/60 cursor-pointer transition-colors"
                >
                  <div className="truncate pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-cyan-400 font-bold text-[11px]">{c.trackingNumber}</span>
                      <span className="font-semibold text-slate-200 text-xs truncate">{c.title}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 truncate">{c.location.address}</div>
                  </div>
                  <span className="shrink-0 font-mono text-[10px] text-amber-300 font-bold">
                    +{c.daysOpen} days open
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Lifecycle Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {LIFECYCLE_STAGES.map((stage) => {
          const itemsInStage = filtered.filter(c => c.status === stage.status);
          return (
            <div
              key={stage.status}
              className="flex flex-col rounded-xl border border-slate-800 bg-slate-900/60 p-3 min-h-[480px]"
            >
              {/* Stage Header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80 mb-3">
                <div>
                  <h4 className="text-xs font-bold text-white">{stage.label}</h4>
                  <p className="text-[10px] text-slate-400">{stage.desc}</p>
                </div>
                <span className="rounded-full bg-slate-800 text-slate-300 font-mono font-bold text-[11px] px-2 py-0.5">
                  {itemsInStage.length}
                </span>
              </div>

              {/* Cards list */}
              <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
                {itemsInStage.length === 0 ? (
                  <div className="flex h-32 items-center justify-center text-[11px] text-slate-500 italic">
                    No tickets in this stage
                  </div>
                ) : (
                  itemsInStage.slice(0, 8).map((c) => (
                    <div
                      key={c.id}
                      onClick={() => onSelectComplaint(c)}
                      className="group rounded-lg border border-slate-800 bg-slate-950/80 p-3 hover:border-cyan-500/50 cursor-pointer transition-all shadow-sm"
                    >
                      <div className="flex items-center justify-between text-[10px] mb-1">
                        <span className="font-mono text-cyan-400 font-bold">{c.trackingNumber}</span>
                        <span
                          className={`rounded px-1.5 py-0.2 font-bold ${
                            c.priority === 'CRITICAL'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : c.priority === 'HIGH'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {c.priority}
                        </span>
                      </div>

                      <h5 className="text-xs font-bold text-slate-200 line-clamp-2 leading-snug group-hover:text-cyan-300 transition-colors">
                        {c.title}
                      </h5>

                      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-900 pt-1.5">
                        <span className="truncate max-w-[100px]">{c.location.zone}</span>
                        <span>{c.daysOpen}d open</span>
                      </div>

                      {/* Quick advance control */}
                      <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 truncate max-w-[90px]">
                          {c.assignedTeam || 'Unassigned'}
                        </span>
                        {stage.status !== 'RESOLVED' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const nextStatus: ComplaintStatus =
                                stage.status === 'NEW'
                                  ? 'TRIAGED'
                                  : stage.status === 'TRIAGED'
                                  ? 'ASSIGNED'
                                  : stage.status === 'ASSIGNED'
                                  ? 'IN_PROGRESS'
                                  : 'RESOLVED';
                              onUpdateStatus(c.id, nextStatus);
                            }}
                            className="flex items-center gap-1 rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-semibold text-slate-300 hover:bg-cyan-500 hover:text-slate-950 transition-colors"
                          >
                            <span>Advance</span>
                            <ArrowRight className="h-2.5 w-2.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
