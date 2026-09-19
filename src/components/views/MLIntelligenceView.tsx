import React from 'react';
import { ComplaintRecord, MLForecastResult, AnomalyDetectionResult, PrioritizationWeights, ScoredComplaint } from '../../types';
import {
  BrainCircuit,
  TrendingUp,
  AlertTriangle,
  Sliders,
  CheckCircle2,
  Sparkles,
  Info,
  ShieldAlert,
  Save,
  RotateCcw
} from 'lucide-react';

interface MLIntelligenceProps {
  complaints: ComplaintRecord[];
  onSelectComplaint: (c: ComplaintRecord) => void;
}

export const MLIntelligenceView: React.FC<MLIntelligenceProps> = ({
  complaints,
  onSelectComplaint,
}) => {
  const [forecast, setForecast] = React.useState<MLForecastResult | null>(null);
  const [anomalies, setAnomalies] = React.useState<AnomalyDetectionResult[]>([]);
  const [scoredComplaints, setScoredComplaints] = React.useState<ScoredComplaint[]>([]);
  const [weights, setWeights] = React.useState<PrioritizationWeights>({
    severity: 0.35,
    recurrence: 0.20,
    timeUnresolved: 0.20,
    infrastructureCriticality: 0.15,
    socialVulnerability: 0.10,
  });
  const [activeTab, setActiveTab] = React.useState<'forecast' | 'anomalies' | 'prioritization'>('forecast');
  const [savingWeights, setSavingWeights] = React.useState(false);

  React.useEffect(() => {
    // Fetch forecast
    fetch('/api/v1/ml/forecast?horizon=14')
      .then(r => r.json())
      .then(d => setForecast(d))
      .catch(err => console.error('Forecast fetch err:', err));

    // Fetch anomalies
    fetch('/api/v1/ml/anomalies')
      .then(r => r.json())
      .then(d => setAnomalies(d))
      .catch(err => console.error('Anomalies fetch err:', err));

    // Fetch prioritization
    fetch('/api/v1/ml/prioritization')
      .then(r => r.json())
      .then(d => {
        if (d.weights) setWeights(d.weights);
        if (d.scoredComplaints) setScoredComplaints(d.scoredComplaints);
      })
      .catch(err => console.error('Prioritization fetch err:', err));
  }, [complaints.length]);

  const saveWeights = async () => {
    setSavingWeights(true);
    try {
      const res = await fetch('/api/v1/ml/prioritization/weights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(weights),
      });
      const data = await res.json();
      if (data.weights) setWeights(data.weights);

      // Re-fetch prioritization scores
      const priRes = await fetch('/api/v1/ml/prioritization');
      const priData = await priRes.json();
      if (priData.scoredComplaints) setScoredComplaints(priData.scoredComplaints);
    } catch (err) {
      console.error('Weights save err:', err);
    } finally {
      setSavingWeights(false);
    }
  };

  const resetWeights = () => {
    setWeights({
      severity: 0.35,
      recurrence: 0.20,
      timeUnresolved: 0.20,
      infrastructureCriticality: 0.15,
      socialVulnerability: 0.10,
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white lg:text-lg">
              Machine Learning Intelligence & Decision Support Center
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Harmonic time-series forecasting, Poisson anomaly detection, and transparent multi-factor work order scoring
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900 p-1 text-xs">
          <button
            onClick={() => setActiveTab('forecast')}
            className={`rounded-lg px-3 py-1.5 font-semibold transition-all ${
              activeTab === 'forecast'
                ? 'bg-cyan-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            14-Day ML Forecast
          </button>
          <button
            onClick={() => setActiveTab('anomalies')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold transition-all ${
              activeTab === 'anomalies'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Surge Anomalies</span>
            {anomalies.length > 0 && (
              <span className="rounded-full bg-slate-950/40 px-1.5 py-0.2 text-[10px]">
                {anomalies.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('prioritization')}
            className={`rounded-lg px-3 py-1.5 font-semibold transition-all ${
              activeTab === 'prioritization'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Explainable Prioritization
          </button>
        </div>
      </div>

      {/* ================= TAB 1: FORECASTING ================= */}
      {activeTab === 'forecast' && (
        <div className="space-y-6">
          {/* Metrics Scorecard */}
          {forecast && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                <div className="text-[11px] text-slate-400 font-medium">Model Validation MAE</div>
                <div className="text-2xl font-extrabold text-cyan-400">{forecast.metrics.mae}</div>
                <div className="text-[10px] text-slate-500 mt-1">Mean Absolute Error (test set)</div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                <div className="text-[11px] text-slate-400 font-medium">Root Mean Squared Error (RMSE)</div>
                <div className="text-2xl font-extrabold text-blue-400">{forecast.metrics.rmse}</div>
                <div className="text-[10px] text-slate-500 mt-1">Penalizes large error variances</div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                <div className="text-[11px] text-slate-400 font-medium">Mean Absolute Percentage Error</div>
                <div className="text-2xl font-extrabold text-emerald-400">{forecast.metrics.mape}%</div>
                <div className="text-[10px] text-slate-500 mt-1">High fidelity model precision</div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                <div className="text-[11px] text-slate-400 font-medium">Baseline Benchmark</div>
                <div className="text-sm font-bold text-slate-200 mt-1">{forecast.metrics.baselineComparison}</div>
                <div className="text-[10px] text-slate-500 mt-1">vs 7-day historical moving average</div>
              </div>
            </div>
          )}

          {/* Forecast Visual Curve */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-cyan-400" />
                  <span>14-Day Trajectory Forecast with 95% Confidence Intervals</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Chronological additive harmonic regression combining day-of-week seasonality and trend slope
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-slate-400" />
                  <span className="text-slate-400">Historical Actual</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-cyan-400" />
                  <span className="text-cyan-300 font-semibold">ML Projected</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-6 rounded bg-cyan-500/20 border border-cyan-500/40" />
                  <span className="text-slate-400">95% Conf. Interval</span>
                </div>
              </div>
            </div>

            {/* SVG Chart */}
            <div className="relative w-full h-64 select-none pt-4">
              {forecast ? (
                <svg viewBox="0 0 800 240" className="w-full h-full">
                  <defs>
                    <linearGradient id="forecastArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(6, 182, 212, 0.3)" />
                      <stop offset="100%" stopColor="rgba(6, 182, 212, 0.0)" />
                    </linearGradient>
                  </defs>

                  {/* Grid horizontal lines */}
                  <line x1="40" y1="40" x2="780" y2="40" stroke="rgba(51, 65, 85, 0.3)" strokeDasharray="3 3" />
                  <line x1="40" y1="100" x2="780" y2="100" stroke="rgba(51, 65, 85, 0.3)" strokeDasharray="3 3" />
                  <line x1="40" y1="160" x2="780" y2="160" stroke="rgba(51, 65, 85, 0.3)" strokeDasharray="3 3" />
                  <line x1="40" y1="210" x2="780" y2="210" stroke="rgba(51, 65, 85, 0.6)" />

                  {/* Confidence interval ribbon for projected points */}
                  {(() => {
                    const points = forecast.points;
                    const maxVal = Math.max(...points.map((p: any) => Math.max(p.historical || p.actual || 0, p.upperBound || 0)), 40);
                    const step = 740 / (points.length - 1);

                    // Polyline points
                    const upperPoints: string[] = [];
                    const lowerPoints: string[] = [];
                    const projLine: string[] = [];
                    const histLine: string[] = [];

                    points.forEach((p: any, idx: number) => {
                      const x = 40 + idx * step;
                      const yVal = p.isProjected ? (p.forecast || 0) : (p.historical || p.actual || 0);
                      const y = 210 - (yVal / maxVal) * 160;

                      if (p.isProjected) {
                        projLine.push(`${x},${y}`);
                        const yUpper = 210 - ((p.upperBound || yVal) / maxVal) * 160;
                        const yLower = 210 - ((p.lowerBound || yVal) / maxVal) * 160;
                        upperPoints.push(`${x},${yUpper}`);
                        lowerPoints.unshift(`${x},${yLower}`);
                      } else {
                        histLine.push(`${x},${y}`);
                        if (idx === points.findIndex((pt: any) => pt.isProjected) - 1) {
                          // connect to projected
                          projLine.push(`${x},${y}`);
                        }
                      }
                    });

                    return (
                      <g>
                        {/* Confidence Interval Ribbon */}
                        {upperPoints.length > 0 && (
                          <polygon
                            points={`${upperPoints.join(' ')} ${lowerPoints.join(' ')}`}
                            fill="rgba(6, 182, 212, 0.15)"
                            stroke="rgba(6, 182, 212, 0.4)"
                            strokeDasharray="2 2"
                          />
                        )}

                        {/* Historical Polyline */}
                        <polyline
                          points={histLine.join(' ')}
                          fill="none"
                          stroke="#94a3b8"
                          strokeWidth="2.5"
                        />

                        {/* Projected Polyline */}
                        <polyline
                          points={projLine.join(' ')}
                          fill="none"
                          stroke="#06b6d4"
                          strokeWidth="3"
                          strokeDasharray="5 3"
                        />

                        {/* Point dots */}
                        {points.map((p: any, idx: number) => {
                          const x = 40 + idx * step;
                          const yVal = p.isProjected ? (p.forecast || 0) : (p.historical || p.actual || 0);
                          const y = 210 - (yVal / maxVal) * 160;

                          return (
                            <g key={p.date}>
                              <circle
                                cx={x}
                                cy={y}
                                r={p.isProjected ? 4 : 3}
                                fill={p.isProjected ? '#06b6d4' : '#64748b'}
                                stroke="#0f172a"
                                strokeWidth="1.5"
                              />
                              {/* Date labels on bottom for sample */}
                              {idx % 3 === 0 && (
                                <text
                                  x={x}
                                  y="228"
                                  textAnchor="middle"
                                  fill="#64748b"
                                  fontSize="9"
                                  fontFamily="monospace"
                                >
                                  {p.date.slice(5)}
                                </text>
                              )}
                            </g>
                          );
                        })}
                      </g>
                    );
                  })()}
                </svg>
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-slate-500">
                  Computing chronological time-series projection...
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: ANOMALIES ================= */}
      {activeTab === 'anomalies' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-400" />
              <span>Statistically Significant Surges (Poisson & Z-Score Analysis)</span>
            </h3>
            <span className="text-xs text-slate-400">
              Surge threshold: Z-Score ≥ 2.5 (p &lt; 0.01)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {anomalies.map((anom) => (
              <div
                key={anom.id}
                className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{anom.zone}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-xs font-semibold text-cyan-300">{anom.category}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Type: <span className="font-semibold text-slate-300">{anom.type.replace(/_/g, ' ')}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 text-xs font-mono font-bold">
                      Z: +{anom.zScore}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-lg bg-slate-950 p-2 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Observed Volume</div>
                    <div className="text-sm font-bold text-rose-400">{anom.observedValue}</div>
                  </div>
                  <div className="rounded-lg bg-slate-950 p-2 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Expected Baseline</div>
                    <div className="text-sm font-bold text-slate-200">{anom.baselineValue}</div>
                  </div>
                  <div className="rounded-lg bg-slate-950 p-2 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Confidence</div>
                    <div className="text-sm font-bold text-emerald-400">{Math.round(anom.confidence * 100)}%</div>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-800/80 bg-slate-950/60 p-2.5 text-xs text-slate-300 leading-relaxed">
                  <span className="text-slate-400 font-semibold">Root-Cause Inference: </span>
                  {anom.explanation}
                </div>

                <div className="text-[11px] text-cyan-400 flex items-center gap-1 font-medium">
                  <Sparkles className="h-3 w-3" />
                  <span>
                    Action: {anom.isEmergencyAlert ? 'Dispatch priority response crew & field inspection team immediately.' : 'Deploy targeted maintenance route crew within 24 hours.'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 3: PRIORITIZATION ================= */}
      {activeTab === 'prioritization' && (
        <div className="space-y-6">
          {/* Weight Adjuster Bar */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-cyan-400" />
                  <span>Multi-Criteria Prioritization Weight Formulation</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tune decision support coefficients to reflect municipal policy priorities
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={resetWeights}
                  className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset Defaults</span>
                </button>
                <button
                  onClick={saveWeights}
                  disabled={savingWeights}
                  className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-4 py-1.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-colors disabled:opacity-50"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{savingWeights ? 'Saving...' : 'Apply & Recalculate'}</span>
                </button>
              </div>
            </div>

            {/* Sliders Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 pt-2">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300">Safety Severity</span>
                  <span className="font-mono text-cyan-400">{Math.round(weights.severity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.60"
                  step="0.05"
                  value={weights.severity}
                  onChange={(e) => setWeights({ ...weights, severity: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300">Recurrence Count</span>
                  <span className="font-mono text-cyan-400">{Math.round(weights.recurrence * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.50"
                  step="0.05"
                  value={weights.recurrence}
                  onChange={(e) => setWeights({ ...weights, recurrence: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300">Time Unresolved</span>
                  <span className="font-mono text-cyan-400">{Math.round(weights.timeUnresolved * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.50"
                  step="0.05"
                  value={weights.timeUnresolved}
                  onChange={(e) => setWeights({ ...weights, timeUnresolved: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300">Infra Criticality</span>
                  <span className="font-mono text-cyan-400">{Math.round(weights.infrastructureCriticality * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.40"
                  step="0.05"
                  value={weights.infrastructureCriticality}
                  onChange={(e) => setWeights({ ...weights, infrastructureCriticality: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300">Equity & Vulnerability</span>
                  <span className="font-mono text-cyan-400">{Math.round(weights.socialVulnerability * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.40"
                  step="0.05"
                  value={weights.socialVulnerability}
                  onChange={(e) => setWeights({ ...weights, socialVulnerability: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Scored Work Orders List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Top Ranked Work Orders by Composite Priority Score
            </h4>

            <div className="space-y-2">
              {scoredComplaints.slice(0, 8).map((sc, idx) => (
                <div
                  key={sc.complaint.id}
                  onClick={() => onSelectComplaint(sc.complaint)}
                  className="flex flex-col md:flex-row md:items-center justify-between rounded-xl border border-slate-800 bg-slate-900/80 p-4 hover:border-cyan-500/40 cursor-pointer transition-colors gap-3"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-800 font-mono text-xs font-bold text-slate-300">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-cyan-400 font-bold text-xs">
                          {sc.complaint.trackingNumber}
                        </span>
                        <span className="font-semibold text-slate-200 text-xs">
                          {sc.complaint.title}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>{sc.complaint.category}</span>
                        <span>•</span>
                        <span>{sc.complaint.location.zone}</span>
                        <span>•</span>
                        <span>{sc.complaint.daysOpen}d open</span>
                      </div>
                    </div>
                  </div>

                  {/* Factor Breakdown Bars */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <div className="text-right">
                        <div>Sev: <span className="text-slate-200 font-semibold">{sc.breakdown.severity}</span></div>
                        <div>Rec: <span className="text-slate-200 font-semibold">{sc.breakdown.recurrence}</span></div>
                      </div>
                      <div className="text-right">
                        <div>Time: <span className="text-slate-200 font-semibold">{sc.breakdown.timeUnresolved}</span></div>
                        <div>Infra: <span className="text-slate-200 font-semibold">{sc.breakdown.infrastructure}</span></div>
                      </div>
                    </div>

                    <div className="text-right min-w-[70px]">
                      <div className="text-base font-extrabold text-cyan-400">
                        {sc.compositeScore}
                      </div>
                      <div className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">
                        Score / 100
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
