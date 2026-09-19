import React from 'react';
import { ComplaintCategory, ComplaintStatus, PriorityLevel, FilterState } from '../types';
import { X, Filter, RotateCcw } from 'lucide-react';

interface GlobalFiltersProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  availableZones: string[];
  isOpen: boolean;
  onClose: () => void;
  categories: ComplaintCategory[];
}

export const GlobalFilters: React.FC<GlobalFiltersProps> = ({
  filters,
  onFilterChange,
  availableZones,
  isOpen,
  onClose,
  categories,
}) => {
  if (!isOpen) return null;

  const toggleCategory = (cat: ComplaintCategory) => {
    const exists = filters.selectedCategories.includes(cat);
    const next = exists
      ? filters.selectedCategories.filter(c => c !== cat)
      : [...filters.selectedCategories, cat];
    onFilterChange({ ...filters, selectedCategories: next });
  };

  const toggleZone = (z: string) => {
    const exists = filters.selectedZones.includes(z);
    const next = exists
      ? filters.selectedZones.filter(zone => zone !== z)
      : [...filters.selectedZones, z];
    onFilterChange({ ...filters, selectedZones: next });
  };

  const togglePriority = (p: PriorityLevel) => {
    const exists = filters.selectedPriorities.includes(p);
    const next = exists
      ? filters.selectedPriorities.filter(pri => pri !== p)
      : [...filters.selectedPriorities, p];
    onFilterChange({ ...filters, selectedPriorities: next });
  };

  const toggleStatus = (s: ComplaintStatus) => {
    const exists = filters.selectedStatuses.includes(s);
    const next = exists
      ? filters.selectedStatuses.filter(st => st !== s)
      : [...filters.selectedStatuses, s];
    onFilterChange({ ...filters, selectedStatuses: next });
  };

  const resetAll = () => {
    onFilterChange({
      searchQuery: '',
      selectedCategories: [],
      selectedZones: [],
      selectedStatuses: [],
      selectedPriorities: [],
      dateRange: { start: '', end: '' },
    });
  };

  const hasActiveFilters =
    filters.selectedCategories.length > 0 ||
    filters.selectedZones.length > 0 ||
    filters.selectedPriorities.length > 0 ||
    filters.selectedStatuses.length > 0;

  return (
    <div className="border-b border-slate-800 bg-slate-900/95 px-4 py-3 text-xs backdrop-blur lg:px-6">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/60 mb-3">
        <div className="flex items-center gap-2 font-semibold text-slate-200">
          <Filter className="h-3.5 w-3.5 text-cyan-400" />
          <span>Global Territory & Multi-Source Operational Filters</span>
          {hasActiveFilters && (
            <span className="rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 text-[10px]">
              Active Filters Applied
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={resetAll}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              Reset All
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Categories */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Complaint Categories ({filters.selectedCategories.length || 'All'})
          </div>
          <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto pr-1">
            {categories.map((cat) => {
              const selected = filters.selectedCategories.includes(cat);
              return (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`rounded-md px-2 py-1 text-[11px] transition-all ${
                    selected
                      ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Zones */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Municipal Zones ({filters.selectedZones.length || 'All'})
          </div>
          <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto pr-1">
            {availableZones.map((z) => {
              const selected = filters.selectedZones.includes(z);
              return (
                <button
                  key={z}
                  onClick={() => toggleZone(z)}
                  className={`rounded-md px-2 py-1 text-[11px] transition-all ${
                    selected
                      ? 'bg-blue-500 text-white font-semibold'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {z}
                </button>
              );
            })}
          </div>
        </div>

        {/* Priority */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Priority Tier
          </div>
          <div className="flex flex-wrap gap-1">
            {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as PriorityLevel[]).map((p) => {
              const selected = filters.selectedPriorities.includes(p);
              const colorClass =
                p === 'CRITICAL'
                  ? selected ? 'bg-rose-600 text-white' : 'text-rose-400 border border-rose-900/50 bg-rose-950/30'
                  : p === 'HIGH'
                  ? selected ? 'bg-amber-600 text-white' : 'text-amber-400 border border-amber-900/50 bg-amber-950/30'
                  : selected ? 'bg-slate-700 text-white' : 'text-slate-300 bg-slate-800/80';
              return (
                <button
                  key={p}
                  onClick={() => togglePriority(p)}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-all ${colorClass}`}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>

        {/* Status */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Triage & Lifecycle State
          </div>
          <div className="flex flex-wrap gap-1">
            {(['NEW', 'TRIAGED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'] as ComplaintStatus[]).map((s) => {
              const selected = filters.selectedStatuses.includes(s);
              return (
                <button
                  key={s}
                  onClick={() => toggleStatus(s)}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-all ${
                    selected
                      ? 'bg-emerald-600 text-white font-semibold'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
