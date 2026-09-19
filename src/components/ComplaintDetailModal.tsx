import React from 'react';
import { ComplaintRecord, ComplaintStatus, PriorityLevel } from '../types';
import {
  X,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Users,
  Tag,
  Share2,
  Copy,
  ExternalLink,
  ShieldAlert,
  Flame,
  FileSearch,
  Sparkles
} from 'lucide-react';

interface ComplaintDetailModalProps {
  complaint: ComplaintRecord | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: ComplaintStatus) => void;
  onUpdatePriority: (id: string, priority: PriorityLevel) => void;
  allComplaints: ComplaintRecord[];
}

export const ComplaintDetailModal: React.FC<ComplaintDetailModalProps> = ({
  complaint,
  onClose,
  onUpdateStatus,
  onUpdatePriority,
  allComplaints,
}) => {
  const [duplicateMatches, setDuplicateMatches] = React.useState<any[]>([]);
  const [loadingDuplicates, setLoadingDuplicates] = React.useState(false);

  React.useEffect(() => {
    if (complaint) {
      // Fetch or compute duplicate matches
      setLoadingDuplicates(true);
      fetch('/api/v1/nlp/duplicates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ complaintId: complaint.id }),
      })
        .then((res) => res.json())
        .then((data) => {
          setDuplicateMatches(data.matches || []);
          setLoadingDuplicates(false);
        })
        .catch(() => setLoadingDuplicates(false));
    }
  }, [complaint]);

  if (!complaint) return null;

  const priorityColor =
    complaint.priority === 'CRITICAL'
      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
      : complaint.priority === 'HIGH'
      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
      : complaint.priority === 'MEDIUM'
      ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
      : 'bg-slate-700/50 text-slate-300 border-slate-600';

  const statusColor =
    complaint.status === 'RESOLVED' || complaint.status === 'CLOSED'
      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
      : complaint.status === 'IN_PROGRESS'
      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
      : complaint.status === 'ASSIGNED'
      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
      : 'bg-slate-800 text-slate-300 border-slate-700';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 p-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-xs font-bold text-cyan-400">
                {complaint.trackingNumber}
              </span>
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${priorityColor}`}>
                {complaint.priority}
              </span>
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusColor}`}>
                {complaint.status}
              </span>
              {complaint.slaBreached && (
                <span className="flex items-center gap-1 rounded-full border border-rose-500/40 bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300 animate-pulse">
                  <AlertTriangle className="h-3 w-3" /> SLA BREACH
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-white leading-snug">
              {complaint.title}
            </h2>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <span>{complaint.category}</span>
              <span>•</span>
              <span>{complaint.subcategory}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-slate-300">
          {/* Description */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Citizen / Field Intake Description
            </h3>
            <p className="text-sm text-slate-200 leading-relaxed">
              {complaint.description}
            </p>
          </div>

          {/* Grid Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Location */}
            <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-3">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1 font-medium text-[11px]">
                <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                <span>Geographic Location</span>
              </div>
              <div className="font-semibold text-slate-200">{complaint.location.address}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Zone: <span className="text-cyan-300 font-medium">{complaint.location.zone}</span> ({complaint.location.lat.toFixed(4)}, {complaint.location.lng.toFixed(4)})
              </div>
            </div>

            {/* SLA & Time */}
            <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-3">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1 font-medium text-[11px]">
                <Clock className="h-3.5 w-3.5 text-blue-400" />
                <span>Lifecycle Timing</span>
              </div>
              <div className="font-semibold text-slate-200">
                Open for {complaint.daysOpen} days ({Math.round(complaint.daysOpen * 24)}h)
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Target SLA: {complaint.slaTargetHours}h | Channel: {complaint.sourceChannel}
              </div>
            </div>

            {/* AI Urgency & Team */}
            <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-3">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1 font-medium text-[11px]">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>AI Assessment</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-16 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-amber-500 to-rose-500"
                    style={{ width: `${complaint.urgencyScore}%` }}
                  />
                </div>
                <span className="font-bold text-slate-200">{complaint.urgencyScore}/100</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Assigned: <span className="text-slate-200">{complaint.assignedTeam || 'Unassigned Queue'}</span>
              </div>
            </div>
          </div>

          {/* Tags */}
          {complaint.tags && complaint.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-medium text-slate-500">NLP Entities & Tags:</span>
              {complaint.tags.map((tag) => (
                <span key={tag} className="rounded-md border border-slate-800 bg-slate-800/60 px-2 py-0.5 text-[11px] text-slate-300">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* NLP Semantic Duplicate Detection Section */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 font-semibold text-slate-200 text-xs">
                <Copy className="h-4 w-4 text-cyan-400" />
                <span>Semantic & Spatial Duplicate Cluster Matcher</span>
              </div>
              <span className="text-[11px] text-slate-400">
                Levenshtein + TF-IDF Jaccard + Distance Radius
              </span>
            </div>

            {loadingDuplicates ? (
              <div className="py-4 text-center text-slate-500 animate-pulse text-xs">
                Scanning dataset for co-located duplicate reports...
              </div>
            ) : duplicateMatches.length === 0 ? (
              <div className="rounded-lg border border-slate-800/60 bg-slate-900/40 p-3 text-slate-400 text-xs">
                No duplicate or clustered reports detected for this incident within 600m.
              </div>
            ) : (
              <div className="space-y-2">
                {duplicateMatches.map((dm: any) => (
                  <div
                    key={dm.match.id}
                    className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 p-3 hover:border-slate-700 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-cyan-400 font-bold text-[11px]">
                          {dm.match.trackingNumber}
                        </span>
                        <span className="font-medium text-slate-200 text-xs">
                          {dm.match.title}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                        <span>{dm.match.location.address}</span>
                        <span>•</span>
                        <span className="text-amber-300">
                          {dm.reasons.join(', ')}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 text-[11px] font-bold">
                        {Math.round(dm.similarity * 100)}% Match
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Controls Footer */}
        <div className="flex flex-wrap items-center justify-between border-t border-slate-800 bg-slate-950 p-4 gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400">Change Status:</span>
            {(['TRIAGED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'] as ComplaintStatus[]).map((st) => (
              <button
                key={st}
                onClick={() => onUpdateStatus(complaint.id, st)}
                disabled={complaint.status === st}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                  complaint.status === st
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400">Priority:</span>
            {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as PriorityLevel[]).map((pr) => (
              <button
                key={pr}
                onClick={() => onUpdatePriority(complaint.id, pr)}
                className={`rounded-lg px-2 py-1 text-[11px] font-medium transition-all ${
                  complaint.priority === pr
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                {pr}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
