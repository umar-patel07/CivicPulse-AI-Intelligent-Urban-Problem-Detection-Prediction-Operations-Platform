import React from 'react';
import { ComplaintRecord, ComplaintStatus, PriorityLevel } from '../../types';
import {
  ListFilter,
  Search,
  ArrowUpDown,
  Download,
  AlertTriangle,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Filter
} from 'lucide-react';

interface ComplaintExplorerProps {
  complaints: ComplaintRecord[];
  onSelectComplaint: (c: ComplaintRecord) => void;
  onUpdateStatus: (id: string, status: ComplaintStatus) => void;
  onUpdatePriority: (id: string, priority: PriorityLevel) => void;
}

export const ComplaintExplorerView: React.FC<ComplaintExplorerProps> = ({
  complaints,
  onSelectComplaint,
  onUpdateStatus,
  onUpdatePriority,
}) => {
  const [search, setSearch] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('ALL');
  const [selectedStatus, setSelectedStatus] = React.useState('ALL');
  const [selectedPriority, setSelectedPriority] = React.useState('ALL');
  const [sortField, setSortField] = React.useState<'date' | 'urgency' | 'days'>('date');
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 15;

  const categories = Array.from(new Set(complaints.map(c => c.category)));

  // Filter
  const filtered = complaints.filter((c) => {
    if (selectedCategory !== 'ALL' && c.category !== selectedCategory) return false;
    if (selectedStatus !== 'ALL' && c.status !== selectedStatus) return false;
    if (selectedPriority !== 'ALL' && c.priority !== selectedPriority) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.trackingNumber.toLowerCase().includes(q) ||
        c.location.address.toLowerCase().includes(q) ||
        c.location.zone.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Sort
  filtered.sort((a, b) => {
    let diff = 0;
    if (sortField === 'date') {
      diff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortField === 'urgency') {
      diff = b.urgencyScore - a.urgencyScore;
    } else if (sortField === 'days') {
      diff = b.daysOpen - a.daysOpen;
    }
    return sortDir === 'asc' ? -diff : diff;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSort = (field: 'date' | 'urgency' | 'days') => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const exportCSV = () => {
    const headers = ['Tracking ID', 'Category', 'Title', 'Zone', 'Address', 'Status', 'Priority', 'Days Open', 'Urgency Score'];
    const rows = filtered.map(c => [
      c.trackingNumber,
      `"${c.category}"`,
      `"${c.title.replace(/"/g, '""')}"`,
      `"${c.location.zone}"`,
      `"${c.location.address.replace(/"/g, '""')}"`,
      c.status,
      c.priority,
      c.daysOpen,
      c.urgencyScore,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `civicpulse_complaints_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ListFilter className="h-5 w-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white lg:text-lg">
              Municipal Complaint Records Explorer
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Displaying {filtered.length} matching operational records across all municipal intake channels
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors self-start md:self-auto"
        >
          <Download className="h-3.5 w-3.5 text-cyan-400" />
          <span>Export Filtered CSV</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search keyword, tracking ID, address..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="h-9 w-full rounded-lg border border-slate-800 bg-slate-900 pl-9 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setCurrentPage(1);
          }}
          className="h-9 rounded-lg border border-slate-800 bg-slate-900 px-3 text-xs text-slate-300 focus:border-cyan-500 focus:outline-none"
        >
          <option value="ALL">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={selectedPriority}
          onChange={(e) => {
            setSelectedPriority(e.target.value);
            setCurrentPage(1);
          }}
          className="h-9 rounded-lg border border-slate-800 bg-slate-900 px-3 text-xs text-slate-300 focus:border-cyan-500 focus:outline-none"
        >
          <option value="ALL">All Priorities</option>
          <option value="CRITICAL">CRITICAL</option>
          <option value="HIGH">HIGH</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="LOW">LOW</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => {
            setSelectedStatus(e.target.value);
            setCurrentPage(1);
          }}
          className="h-9 rounded-lg border border-slate-800 bg-slate-900 px-3 text-xs text-slate-300 focus:border-cyan-500 focus:outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="NEW">NEW</option>
          <option value="TRIAGED">TRIAGED</option>
          <option value="ASSIGNED">ASSIGNED</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="RESOLVED">RESOLVED</option>
        </select>
      </div>

      {/* Table Container */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/70 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3 px-4">Tracking ID</th>
                <th className="py-3 px-4">Incident Summary</th>
                <th className="py-3 px-4">Category & Zone</th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-slate-200 transition-colors"
                  onClick={() => toggleSort('urgency')}
                >
                  <div className="flex items-center gap-1">
                    <span>AI Urgency</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-slate-200 transition-colors"
                  onClick={() => toggleSort('days')}
                >
                  <div className="flex items-center gap-1">
                    <span>Days Open</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {pageItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No matching complaints found for active filter criteria.
                  </td>
                </tr>
              ) : (
                pageItems.map((c) => {
                  const priColor =
                    c.priority === 'CRITICAL'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : c.priority === 'HIGH'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700';

                  const statColor =
                    c.status === 'RESOLVED'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : c.status === 'IN_PROGRESS'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : 'bg-slate-800 text-slate-300 border-slate-700';

                  return (
                    <tr
                      key={c.id}
                      onClick={() => onSelectComplaint(c)}
                      className="cursor-pointer hover:bg-slate-800/50 transition-colors group"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-cyan-400">
                        {c.trackingNumber}
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors truncate">
                          {c.title}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate mt-0.5">
                          {c.location.address}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-300 font-medium">{c.category}</div>
                        <div className="text-[11px] text-slate-500">{c.location.zone}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-bold text-slate-200">
                          <Sparkles className="h-3 w-3 text-amber-400" />
                          <span>{c.urgencyScore}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold ${priColor}`}>
                          {c.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statColor}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono">
                        {c.daysOpen}d
                        {c.slaBreached && (
                          <span className="ml-1 text-[10px] text-rose-400 font-bold">
                            !SLA
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950/70 p-3 text-xs text-slate-400">
          <div>
            Showing Page <span className="font-semibold text-slate-200">{currentPage}</span> of{' '}
            <span className="font-semibold text-slate-200">{totalPages}</span> ({filtered.length} total)
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="flex h-7 w-7 items-center justify-center rounded border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="flex h-7 w-7 items-center justify-center rounded border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
