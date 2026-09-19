import React from 'react';
import {
  LayoutDashboard,
  Radio,
  MapPin,
  TrendingUp,
  ListFilter,
  BrainCircuit,
  MessageSquareCode,
  FileText,
  ScanEye,
  Sliders,
  BookOpen,
  Database,
  Settings,
  Sparkles,
  Camera,
} from 'lucide-react';

export type NavView =
  | 'overview'
  | 'operations'
  | 'geospatial'
  | 'trends'
  | 'explorer'
  | 'ml'
  | 'analyst'
  | 'reports'
  | 'vision'
  | 'scenario'
  | 'knowledge'
  | 'datasets'
  | 'admin';

interface NavigationProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  anomalyCount?: number;
  criticalCount?: number;
  onOpenCitizenReport?: () => void;
}

interface NavSection {
  title: string;
  items: {
    id: NavView;
    label: string;
    icon: React.ElementType;
    badge?: string | number;
    badgeColor?: string;
    isAi?: boolean;
  }[];
}

export const Navigation: React.FC<NavigationProps> = ({
  currentView,
  onSelectView,
  anomalyCount = 0,
  criticalCount = 0,
  onOpenCitizenReport,
}) => {
  const sections: NavSection[] = [
    {
      title: 'Command & Operations',
      items: [
        { id: 'overview', label: 'Executive Overview', icon: LayoutDashboard },
        {
          id: 'operations',
          label: 'Operations Board',
          icon: Radio,
          badge: criticalCount > 0 ? `${criticalCount} Crit` : undefined,
          badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
        },
        { id: 'geospatial', label: 'Geographic Intelligence', icon: MapPin },
        { id: 'trends', label: 'Trend & Diagnostic Analytics', icon: TrendingUp },
        { id: 'explorer', label: 'Complaint Explorer', icon: ListFilter },
      ],
    },
    {
      title: 'Machine Intelligence & AI',
      items: [
        {
          id: 'ml',
          label: 'ML Intelligence Center',
          icon: BrainCircuit,
          badge: anomalyCount > 0 ? `${anomalyCount} Anom` : undefined,
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        },
        {
          id: 'analyst',
          label: 'AI Data Analyst',
          icon: MessageSquareCode,
          isAi: true,
        },
        {
          id: 'vision',
          label: 'Computer Vision Inspector',
          icon: ScanEye,
        },
        {
          id: 'scenario',
          label: 'What-If Scenario Engine',
          icon: Sliders,
        },
      ],
    },
    {
      title: 'Strategy & Governance',
      items: [
        { id: 'reports', label: 'AI Executive Reports', icon: FileText, isAi: true },
        { id: 'knowledge', label: 'Urban RAG Knowledge', icon: BookOpen },
        { id: 'datasets', label: 'Dataset & Ingestion', icon: Database },
        { id: 'admin', label: 'Administration & Audit', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-slate-800 bg-slate-900/60 p-4 flex flex-col justify-between overflow-y-auto hidden md:flex">
      <div className="space-y-6">
        {sections.map((section, idx) => (
          <div key={idx}>
            <h3 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              {section.title}
            </h3>
            <nav className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectView(item.id)}
                    className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon
                        className={`h-4 w-4 shrink-0 transition-colors ${
                          isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {item.isAi && (
                        <span className="flex items-center gap-0.5 rounded px-1 py-0.2 bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-[9px] font-bold text-cyan-300 border border-cyan-500/30">
                          <Sparkles className="h-2.5 w-2.5" />
                          AI
                        </span>
                      )}
                      {item.badge && (
                        <span
                          className={`rounded-full border px-1.5 py-0.2 text-[9px] font-semibold ${
                            item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer system status & quick report */}
      <div className="pt-4 mt-6 border-t border-slate-800/80 space-y-3">
        <button
          onClick={onOpenCitizenReport}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-cyan-500/40 bg-gradient-to-r from-cyan-500/15 via-blue-600/15 to-cyan-500/15 p-2.5 text-xs font-bold text-cyan-300 hover:border-cyan-400 hover:text-white transition-all shadow-md shadow-cyan-950/20 group"
        >
          <Camera className="h-4 w-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          <span>Report Hazard (Photo)</span>
        </button>

        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-slate-400 font-medium">Urban Engine Status</span>
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              Online
            </span>
          </div>
          <div className="text-[10px] text-slate-500">
            Model: Gemini 3.8 Flash
          </div>
          <div className="text-[10px] text-slate-500">
            Inference: Real-Time Stream
          </div>
        </div>
      </div>
    </aside>
  );
};
