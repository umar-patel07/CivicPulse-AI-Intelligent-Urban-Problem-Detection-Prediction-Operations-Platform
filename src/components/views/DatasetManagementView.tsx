import React from 'react';
import { IngestionPreview } from '../../server/ingestionEngine';
import {
  Database,
  Upload,
  Sparkles,
  FileText,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Check
} from 'lucide-react';

interface DatasetManagementProps {
  onRefresh: () => void;
  datasetCount: number;
}

export const DatasetManagementView: React.FC<DatasetManagementProps> = ({
  onRefresh,
  datasetCount,
}) => {
  const [synthCount, setSynthCount] = React.useState(500);
  const [synthSeed, setSynthSeed] = React.useState(42);
  const [anomalyRate, setAnomalyRate] = React.useState(0.06);
  const [generating, setGenerating] = React.useState(false);

  // CSV State
  const [csvText, setCsvText] = React.useState('');
  const [fileName, setFileName] = React.useState('complaints_field_batch.csv');
  const [preview, setPreview] = React.useState<IngestionPreview | null>(null);
  const [parsing, setParsing] = React.useState(false);
  const [imported, setImported] = React.useState(false);

  const sampleCSVTemplate = `complaint_id,category,title,description,address,zone,priority,status,created_at
CP-9901,Potholes & Pavement Cracks,Severe asphalt cavity on junction,Deep crater puncturing bus tires,480 Industrial Blvd,Industrial Heights,CRITICAL,NEW,2026-03-12T08:30:00Z
CP-9902,Traffic Signal Outage,Main arterial lights blinking yellow,Signal controller lost phase sync,220 Center St,Downtown North,HIGH,TRIAGED,2026-03-12T09:15:00Z
CP-9903,Water Main & Drainage,Storm catch basin clogged with debris,Street flooding near pedestrian crosswalk,750 Riverbank Way,River District,HIGH,IN_PROGRESS,2026-03-12T10:00:00Z
CP-9904,Illegal Dumping & Waste,Commercial masonry debris on shoulder,Drywall and bricks piled along sidewalk,140 Hillside Ave,West Hills,MEDIUM,NEW,2026-03-12T11:20:00Z`;

  const handleGenerateSynthetic = async () => {
    setGenerating(true);
    try {
      await fetch('/api/v1/complaints/generate-synthetic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          count: synthCount,
          seed: synthSeed,
          anomalyRate,
        }),
      });
      onRefresh();
    } catch (err) {
      console.error('Synthetic generation err:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleParseCSV = async (textToParse = csvText, commit = false) => {
    if (!textToParse.trim()) return;
    setParsing(true);
    try {
      const res = await fetch('/api/v1/complaints/upload-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          csvText: textToParse,
          fileName,
          commit,
        }),
      });
      const data = await res.json();
      setPreview(data);
      if (commit) {
        setImported(true);
        onRefresh();
      }
    } catch (err) {
      console.error('CSV parse err:', err);
    } finally {
      setParsing(false);
    }
  };

  const loadSampleCSV = () => {
    setCsvText(sampleCSVTemplate);
    handleParseCSV(sampleCSVTemplate, false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-cyan-400" />
          <h2 className="text-base font-bold text-white lg:text-lg">
            Dataset Ingestion & Synthetic Data Factory
          </h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Currently managing {datasetCount} active municipal records. Load realistic synthetic streams or ingest CSV data.
        </p>
      </div>

      {/* Main Split: Synthetic Generator vs CSV Ingestion */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Synthetic Data Factory (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span>Realistic Synthetic Data Factory</span>
            </h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Generates realistic urban municipal complaints with realistic diurnal timestamps, Poisson clustering, text descriptions, and emergency anomalies.
          </p>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Generated Record Volume</span>
                <span className="font-mono text-cyan-400">{synthCount} records</span>
              </div>
              <input
                type="range"
                min="100"
                max="1500"
                step="50"
                value={synthCount}
                onChange={(e) => setSynthCount(parseInt(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Statistical Anomaly Injection Rate</span>
                <span className="font-mono text-amber-400">{Math.round(anomalyRate * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.01"
                max="0.15"
                step="0.01"
                value={anomalyRate}
                onChange={(e) => setAnomalyRate(parseFloat(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Pseudorandom Seed</span>
                <span className="font-mono text-slate-400">{synthSeed}</span>
              </div>
              <input
                type="number"
                value={synthSeed}
                onChange={(e) => setSynthSeed(parseInt(e.target.value) || 42)}
                className="h-8 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 text-xs text-slate-200"
              />
            </div>

            <button
              onClick={handleGenerateSynthetic}
              disabled={generating}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-colors shadow-md shadow-cyan-500/20 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${generating ? 'animate-spin' : ''}`} />
              <span>{generating ? 'Synthesizing Records...' : 'Generate & Load Dataset'}</span>
            </button>
          </div>
        </div>

        {/* Right: CSV File Ingest & Schema Detector (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Upload className="h-4 w-4 text-blue-400" />
              <span>CSV Ingestion & Schema Detector</span>
            </h3>
            <button
              onClick={loadSampleCSV}
              className="text-[11px] text-cyan-400 hover:underline font-medium"
            >
              Load Sample 311 CSV Template
            </button>
          </div>

          <p className="text-xs text-slate-400">
            Paste raw comma-separated text or sample file to inspect column mappings, missing value ratios, and validate records.
          </p>

          <textarea
            rows={5}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder="complaint_id,category,title,description,address,zone,priority,status,created_at..."
            className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-slate-300 placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
          />

          <div className="flex items-center justify-between">
            <button
              onClick={() => handleParseCSV(csvText, false)}
              disabled={!csvText.trim() || parsing}
              className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              <span>Validate & Preview Schema</span>
            </button>

            {preview && !imported && (
              <button
                onClick={() => handleParseCSV(csvText, true)}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition-colors"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Import {preview.validRowsCount} Records to Store</span>
              </button>
            )}

            {imported && (
              <span className="flex items-center gap-1 text-xs text-emerald-400 font-bold">
                <Check className="h-4 w-4" /> Successfully Ingested!
              </span>
            )}
          </div>

          {/* Preview Details */}
          {preview && (
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">
                  Data Quality Score: <span className="text-emerald-400">{preview.dataQualityScore}%</span>
                </span>
                <span className="text-slate-400">
                  {preview.validRowsCount} valid rows parsed
                </span>
              </div>

              {/* Detected Mappings */}
              <div className="text-[11px] text-slate-400 flex flex-wrap gap-2">
                <span className="font-semibold text-slate-300">Detected Columns:</span>
                {Object.entries(preview.columnMapping).map(([k, v]) => (
                  <span key={k} className="rounded bg-slate-900 border border-slate-800 px-1.5 py-0.5 font-mono">
                    {k} &rarr; <span className="text-cyan-300">{v}</span>
                  </span>
                ))}
              </div>

              {preview.warnings.length > 0 && (
                <div className="rounded border border-amber-900/40 bg-amber-950/20 p-2 text-[11px] text-amber-300">
                  {preview.warnings.join(' ')}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
