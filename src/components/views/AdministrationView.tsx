import React from 'react';
import { AuditLogEntry, UserRole } from '../../types';
import {
  Settings,
  ShieldCheck,
  History,
  Terminal,
  Layers,
  Lock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface AdministrationProps {
  currentRole: UserRole;
}

const ROLES_INFO: { role: UserRole; title: string; permissions: string[] }[] = [
  {
    role: 'OPERATIONS_DIRECTOR',
    title: 'Operations Director',
    permissions: ['Dispatch Field Crews', 'Reassign Zones', 'Triage Lifecycle Advance', 'Generate Executive Audits', 'View All Analytics'],
  },
  {
    role: 'LEAD_ANALYST',
    title: 'Lead Urban Analyst',
    permissions: ['Tune ML Prioritization Weights', 'Run What-If Simulations', 'Query AI Natural Language Analyst', 'Export Filtered Data'],
  },
  {
    role: 'FIELD_DISPATCHER',
    title: 'Field Crew Dispatcher',
    permissions: ['Triage Status Updates', 'Run Computer Vision Inspections', 'Sign Off Remediation Work Orders', 'View Territory Hotspots'],
  },
  {
    role: 'PLATFORM_ADMIN',
    title: 'Platform Administrator',
    permissions: ['Regenerate Synthetic Datasets', 'Import CSV Batches', 'View System Audit Trail', 'Configure AI Models & APIs'],
  },
  {
    role: 'PUBLIC_AUDITOR',
    title: 'Public Auditor & Observer',
    permissions: ['Read-Only Access to KPI Metrics', 'Inspect SLA Compliance Rates', 'Search Municipal SOP Knowledge Base'],
  },
];

export const AdministrationView: React.FC<AdministrationProps> = ({ currentRole }) => {
  const [logs, setLogs] = React.useState<AuditLogEntry[]>([]);
  const [loadingLogs, setLoadingLogs] = React.useState(false);

  React.useEffect(() => {
    setLoadingLogs(true);
    fetch('/api/v1/audit-logs')
      .then(r => r.json())
      .then(data => {
        setLogs(data || []);
        setLoadingLogs(false);
      })
      .catch(err => {
        console.error('Audit logs fetch err:', err);
        setLoadingLogs(false);
      });
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-cyan-400" />
          <h2 className="text-base font-bold text-white lg:text-lg">
            System Administration & RBAC Security Governance
          </h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Role-based permission enforcement, tamper-evident operational audit trails, and platform telemetry
        </p>
      </div>

      {/* Main Split: RBAC Permissions vs Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: RBAC Permissions Matrix (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-cyan-400" />
              <span>Role-Based Access Control (RBAC) Matrix</span>
            </h3>
          </div>

          <div className="space-y-3 pt-1">
            {ROLES_INFO.map((r) => {
              const isCurrent = currentRole === r.role;
              return (
                <div
                  key={r.role}
                  className={`rounded-xl border p-3.5 transition-all ${
                    isCurrent
                      ? 'border-cyan-500/50 bg-cyan-500/10 text-white'
                      : 'border-slate-800 bg-slate-950/60 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold">{r.title}</span>
                    {isCurrent && (
                      <span className="rounded bg-cyan-500 text-slate-950 px-2 py-0.5 text-[10px] font-bold uppercase">
                        Current Session
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {r.permissions.map((p) => (
                      <span
                        key={p}
                        className="rounded bg-slate-800/80 px-2 py-0.5 text-[10px] text-slate-300"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Operational Audit Trail (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <History className="h-4 w-4 text-blue-400" />
              <span>Tamper-Evident Operational Audit Trail ({logs.length})</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              Immutable Log Stream
            </span>
          </div>

          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {logs.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 italic">
                No recent administrative actions recorded.
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-xs space-y-1 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-cyan-400">{log.action}</span>
                      <span className="text-slate-600">•</span>
                      <span className="font-medium text-slate-300">{log.entityType}</span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-500">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-slate-300 text-xs leading-snug">
                    {log.details}
                  </p>

                  <div className="text-[10px] text-slate-500 pt-0.5">
                    Authorized User: <span className="text-slate-400 font-semibold">{log.userName}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
