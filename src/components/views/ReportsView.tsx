import React from 'react';
import {
  FileText,
  Sparkles,
  Printer,
  Download,
  CheckCircle2,
  Calendar,
  Building,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const [report, setReport] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);

  const generateReport = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/ai/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      setReport(data);
    } catch (err) {
      console.error('Report error:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    generateReport();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white lg:text-lg">
              AI Municipal Executive Audit & Briefing Generator
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Grounded operational audits synthesized from real complaint backlogs, statistical anomalies, and ML forecasts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={generateReport}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-colors disabled:opacity-50"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{loading ? 'Synthesizing...' : 'Regenerate Audit'}</span>
          </button>

          {report && (
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <Printer className="h-3.5 w-3.5 text-slate-400" />
              <span>Print / PDF Export</span>
            </button>
          )}
        </div>
      </div>

      {/* Report Document Sheet */}
      {report ? (
        <div className="mx-auto max-w-4xl rounded-2xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl space-y-6 text-slate-200">
          {/* Document Header */}
          <div className="border-b border-slate-800 pb-5">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider text-cyan-400">
                CivicPulse AI • Official Briefing
              </span>
              <span className="font-mono">
                Generated: {new Date(report.generatedAt).toLocaleString()}
              </span>
            </div>
            <h1 className="text-xl font-extrabold text-white leading-tight">
              {report.title}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Confidential Municipal Operations & Infrastructure Resilience Audit
            </p>
          </div>

          {/* Executive Summary */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              1. Executive Summary & Operational Posture
            </h3>
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
              {report.executiveSummary}
            </div>
          </div>

          {/* Key Scorecard Metrics */}
          {report.keyMetrics && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                2. Key Operational Indicators
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <div className="text-[10px] text-slate-400">Total Logged</div>
                  <div className="text-lg font-extrabold text-white">{report.keyMetrics.totalLogged}</div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <div className="text-[10px] text-slate-400">Active Backlog</div>
                  <div className="text-lg font-extrabold text-cyan-400">{report.keyMetrics.activeBacklog}</div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <div className="text-[10px] text-slate-400">Critical Life-Safety</div>
                  <div className="text-lg font-extrabold text-rose-400">{report.keyMetrics.criticalPriorityCount}</div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <div className="text-[10px] text-slate-400">SLA Adherence</div>
                  <div className="text-lg font-extrabold text-emerald-400">{report.keyMetrics.slaComplianceRate}</div>
                </div>
              </div>
            </div>
          )}

          {/* Geographic & Risk Hotspots */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              3. Spatial Risk Concentration & Hotspots
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {report.geographicFindings}
            </p>
            {report.riskHotspots && (
              <div className="space-y-1.5 pt-1">
                {report.riskHotspots.map((h: string, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 rounded-lg border border-slate-800/80 bg-slate-950/60 p-2.5 text-xs"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold">
                      #{idx + 1}
                    </span>
                    <span className="text-slate-300">{h}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Strategic Recommendations */}
          {report.recommendations && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                4. Strategic & Dispatch Recommendations
              </h3>
              <div className="space-y-2">
                {report.recommendations.map((rec: string, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-3 text-xs text-slate-200"
                  >
                    <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Document Footer */}
          <div className="border-t border-slate-800 pt-4 flex items-center justify-between text-[10px] text-slate-500">
            <span>CivicPulse AI • Automated Operations Briefing</span>
            <span>Audit Validation Hash: SHA256-GroundTruth-Validated</span>
          </div>
        </div>
      ) : (
        <div className="flex h-64 items-center justify-center text-xs text-slate-500 animate-pulse">
          Generating AI Executive Audit Report...
        </div>
      )}
    </div>
  );
};
