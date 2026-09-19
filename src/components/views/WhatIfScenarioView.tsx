import React from 'react';
import { ScenarioParams, SimulationResult } from '../../types';
import {
  Sliders,
  TrendingUp,
  DollarSign,
  Clock,
  AlertCircle,
  Play,
  RotateCcw,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

const PRESETS: { name: string; params: ScenarioParams }[] = [
  {
    name: 'Smart City Autonomous Triage',
    params: {
      scenarioName: 'Smart City Autonomous Triage',
      fleetCapacityMultiplier: 1.1,
      severeWeatherFactor: 1.0,
      autoTriageRate: 0.85,
      preventiveInvestmentUSD: 120000,
    },
  },
  {
    name: 'Severe Nor’easter Storm Surge',
    params: {
      scenarioName: 'Severe Nor’easter Storm Surge',
      fleetCapacityMultiplier: 0.9,
      severeWeatherFactor: 2.2,
      autoTriageRate: 0.40,
      preventiveInvestmentUSD: 0,
    },
  },
  {
    name: 'Aggressive Capital Pavement Rehabilitation',
    params: {
      scenarioName: 'Aggressive Capital Pavement Rehabilitation',
      fleetCapacityMultiplier: 1.35,
      severeWeatherFactor: 1.0,
      autoTriageRate: 0.70,
      preventiveInvestmentUSD: 450000,
    },
  },
  {
    name: 'Budget Austerity & Hiring Freeze',
    params: {
      scenarioName: 'Budget Austerity & Hiring Freeze',
      fleetCapacityMultiplier: 0.75,
      severeWeatherFactor: 1.2,
      autoTriageRate: 0.25,
      preventiveInvestmentUSD: 20000,
    },
  },
];

export const WhatIfScenarioView: React.FC = () => {
  const [params, setParams] = React.useState<ScenarioParams>({
    scenarioName: 'Custom Municipal Simulation',
    fleetCapacityMultiplier: 1.0,
    severeWeatherFactor: 1.0,
    autoTriageRate: 0.5,
    preventiveInvestmentUSD: 100000,
  });

  const [result, setResult] = React.useState<SimulationResult | null>(null);
  const [simulating, setSimulating] = React.useState(false);

  const runSimulation = async (customParams = params) => {
    setSimulating(true);
    try {
      const res = await fetch('/api/v1/scenario/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customParams),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setSimulating(false);
    }
  };

  React.useEffect(() => {
    runSimulation();
  }, []);

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setParams(preset.params);
    runSimulation(preset.params);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <Sliders className="h-5 w-5 text-cyan-400" />
          <h2 className="text-base font-bold text-white lg:text-lg">
            What-If Urban Operations & Capital Budget Simulator
          </h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Predict the operational and fiscal impact of fleet reallocation, weather surges, and AI automation
        </p>
      </div>

      {/* Preset Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-semibold text-slate-400 shrink-0 mr-1">Load Presets:</span>
        {PRESETS.map((p) => (
          <button
            key={p.name}
            onClick={() => applyPreset(p)}
            className="shrink-0 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 hover:border-cyan-500/50 hover:text-white transition-colors"
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Main Split: Control Sliders vs Simulation Projections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Control Inputs (6 cols) */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Operational Input Parameters
            </h3>
            <button
              onClick={() => runSimulation()}
              disabled={simulating}
              className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-colors disabled:opacity-50"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>{simulating ? 'Simulating...' : 'Run Simulation'}</span>
            </button>
          </div>

          {/* Slider 1: Fleet Capacity */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Field Crew & Fleet Capacity Multiplier</span>
              <span className="font-mono text-cyan-400">{Math.round(params.fleetCapacityMultiplier * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.8"
              step="0.05"
              value={params.fleetCapacityMultiplier}
              onChange={(e) => setParams({ ...params, fleetCapacityMultiplier: parseFloat(e.target.value) })}
              className="w-full accent-cyan-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Severe shortage (-50%)</span>
              <span>Nominal (100%)</span>
              <span>Surge fleet (+80%)</span>
            </div>
          </div>

          {/* Slider 2: Weather Surge */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Severe Weather & Freeze-Thaw Surge Factor</span>
              <span className="font-mono text-amber-400">{params.severeWeatherFactor}x Volume</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="2.5"
              step="0.1"
              value={params.severeWeatherFactor}
              onChange={(e) => setParams({ ...params, severeWeatherFactor: parseFloat(e.target.value) })}
              className="w-full accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Baseline weather (1.0x)</span>
              <span>Catastrophic storm (2.5x)</span>
            </div>
          </div>

          {/* Slider 3: AI Auto-Triage */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Autonomous AI Triage & Routing Adoption</span>
              <span className="font-mono text-cyan-400">{Math.round(params.autoTriageRate * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={params.autoTriageRate}
              onChange={(e) => setParams({ ...params, autoTriageRate: parseFloat(e.target.value) })}
              className="w-full accent-cyan-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Manual dispatch (0%)</span>
              <span>Fully autonomous (100%)</span>
            </div>
          </div>

          {/* Slider 4: Capital Investment */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Preventive Infrastructure Maintenance Budget</span>
              <span className="font-mono text-emerald-400">${params.preventiveInvestmentUSD.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="0"
              max="500000"
              step="25000"
              value={params.preventiveInvestmentUSD}
              onChange={(e) => setParams({ ...params, preventiveInvestmentUSD: parseInt(e.target.value) })}
              className="w-full accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>$0 (Reactive only)</span>
              <span>$500,000 (Major preventive campaign)</span>
            </div>
          </div>
        </div>

        {/* Right: Simulation Projections (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {result && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Simulated Operational Impact
                </h3>
                <span className="text-[11px] font-mono text-cyan-400 font-bold">
                  {result.scenarioName}
                </span>
              </div>

              {/* Grid Projections */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <div className="text-[10px] text-slate-400">Projected Active Backlog</div>
                  <div className="text-xl font-extrabold text-white mt-0.5">
                    {result.projectedBacklog} cases
                  </div>
                  <div
                    className={`text-[11px] font-bold mt-1 ${
                      result.backlogShiftPercent <= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {result.backlogShiftPercent > 0 ? `+${result.backlogShiftPercent}%` : `${result.backlogShiftPercent}%`} backlog shift
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <div className="text-[10px] text-slate-400">Mean Time to Resolve (MTTR)</div>
                  <div className="text-xl font-extrabold text-blue-400 mt-0.5">
                    {result.projectedResolutionTimeHours}h
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Baseline: 32.5h
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <div className="text-[10px] text-slate-400">Estimated Fiscal Net Impact</div>
                  <div
                    className={`text-xl font-extrabold mt-0.5 ${
                      result.estimatedCostSavingsUSD >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {result.estimatedCostSavingsUSD >= 0 ? '+' : ''}${result.estimatedCostSavingsUSD.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Preventative ROI + crew overtime
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <div className="text-[10px] text-slate-400">Workforce Stress Index</div>
                  <div
                    className={`text-xl font-extrabold mt-0.5 ${
                      result.workloadStressIndex > 75
                        ? 'text-rose-400'
                        : result.workloadStressIndex > 50
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {result.workloadStressIndex} / 100
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Fleet burnout risk
                  </div>
                </div>
              </div>

              {/* Tactical Summary Narrative */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-xs text-slate-300 leading-relaxed">
                <span className="text-slate-400 font-semibold">Executive Operational Finding: </span>
                {result.narrativeSummary}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
