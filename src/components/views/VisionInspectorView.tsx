import React from 'react';
import { VisionAssessment } from '../../types';
import {
  ScanEye,
  Camera,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  Maximize2,
  ShieldAlert,
  ArrowRight,
  Check
} from 'lucide-react';

const SAMPLES = [
  { id: 'pothole-deep-arterial.jpg', label: 'Severe Arterial Pothole', cat: 'Potholes & Pavement Cracks', img: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=60' },
  { id: 'alligator-cracking-junction.jpg', label: 'Alligator Fatigue Cracking', cat: 'Structural Hazard & Sidewalk', img: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=60' },
  { id: 'depressed-manhole-subbase.jpg', label: 'Depressed Utility Catch Basin', cat: 'Water Main & Drainage', img: 'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?w=600&auto=format&fit=crop&q=60' },
];

export const VisionInspectorView: React.FC = () => {
  const [selectedSample, setSelectedSample] = React.useState(SAMPLES[0]);
  const [assessment, setAssessment] = React.useState<VisionAssessment | null>(null);
  const [analyzing, setAnalyzing] = React.useState(false);
  const [approved, setApproved] = React.useState(false);

  const runAnalysis = async (sample = selectedSample) => {
    setAnalyzing(true);
    setApproved(false);
    try {
      const res = await fetch('/api/v1/vision/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageName: sample.id, category: sample.cat }),
      });
      const data = await res.json();
      setAssessment(data);
    } catch (err) {
      console.error('Vision analysis error:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  React.useEffect(() => {
    runAnalysis();
  }, [selectedSample.id]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <ScanEye className="h-5 w-5 text-cyan-400" />
          <h2 className="text-base font-bold text-white lg:text-lg">
            Computer Vision Infrastructure Defect Inspection Studio
          </h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Simulated high-resolution edge detection, pothole contour segmentation, and pavement distress index grading
        </p>
      </div>

      {/* Main Split: Inspector Stage vs Analytics Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Canvas & Image Viewer (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Inspection Optical Stage
            </h3>
            <span className="text-[11px] text-cyan-400 font-mono">
              Model: Spatial-YOLO-Pavement-v4
            </span>
          </div>

          {/* Sample Selector */}
          <div className="grid grid-cols-3 gap-2">
            {SAMPLES.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSample(s)}
                className={`rounded-xl border p-2 text-left transition-all ${
                  selectedSample.id === s.id
                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-200'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold truncate">{s.label}</div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">{s.cat}</div>
              </button>
            ))}
          </div>

          {/* Image & Bounding Box Canvas Container */}
          <div className="relative w-full h-80 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center">
            <img
              src={selectedSample.img}
              alt="Road Inspection"
              className="w-full h-full object-cover opacity-80"
              crossOrigin="anonymous"
            />

            {/* Simulated Bounding Box Overlay */}
            {assessment && !analyzing && (
              <div
                className="absolute border-2 border-rose-500 bg-rose-500/15 rounded pointer-events-none transition-all duration-300"
                style={{
                  top: `${assessment.boundingBox.y}%`,
                  left: `${assessment.boundingBox.x}%`,
                  width: `${assessment.boundingBox.width}%`,
                  height: `${assessment.boundingBox.height}%`,
                }}
              >
                <div className="absolute -top-5 left-0 rounded bg-rose-600 px-1.5 py-0.2 font-mono text-[9px] font-bold text-white uppercase tracking-wider">
                  {assessment.primaryDefect} ({Math.round(assessment.confidenceScore * 100)}%)
                </div>
              </div>
            )}

            {analyzing && (
              <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
                <div className="h-7 w-7 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                <span className="text-xs text-slate-300 font-medium">
                  Performing pixel contour segmentation & distress calculation...
                </span>
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-1">
            <div className="text-xs text-slate-400">
              Target ID: <span className="font-mono text-slate-200">{selectedSample.id}</span>
            </div>
            <button
              onClick={() => runAnalysis()}
              disabled={analyzing}
              className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>Re-Run Vision Inference</span>
            </button>
          </div>
        </div>

        {/* Right: Vision Analytics Breakdown & Review (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {assessment && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Defect Classification Assessment
                  </h3>
                  <h4 className="text-base font-bold text-white mt-1">
                    {assessment.primaryDefect}
                  </h4>
                </div>
                <div className="text-right">
                  <span
                    className={`rounded-lg border px-2.5 py-1 text-xs font-extrabold ${
                      assessment.severityLevel === 'CRITICAL'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}
                  >
                    {assessment.severityLevel}
                  </span>
                </div>
              </div>

              {/* Grid Metrics */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg border border-slate-800 bg-slate-950 p-2.5">
                  <div className="text-[10px] text-slate-400">Crack Severity Ratio</div>
                  <div className="text-base font-bold text-cyan-400">{assessment.crackSeverityRatio}%</div>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-950 p-2.5">
                  <div className="text-[10px] text-slate-400">Surface Roughness (IRI)</div>
                  <div className="text-base font-bold text-blue-400">{assessment.surfaceRoughnessIndex} m/km</div>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-950 p-2.5">
                  <div className="text-[10px] text-slate-400">Pothole Volume (Est.)</div>
                  <div className="text-base font-bold text-amber-400">
                    {assessment.estimatedPotholeVolumeLiters ? `${assessment.estimatedPotholeVolumeLiters} Liters` : 'N/A'}
                  </div>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-950 p-2.5">
                  <div className="text-[10px] text-slate-400">Model Confidence</div>
                  <div className="text-base font-bold text-emerald-400">
                    {Math.round(assessment.confidenceScore * 100)}%
                  </div>
                </div>
              </div>

              {/* Remediation Guidance */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-xs text-slate-300 leading-relaxed">
                <span className="text-slate-400 font-semibold">Remediation SOP: </span>
                {assessment.remediationGuidance}
              </div>

              {/* Human in the loop review button */}
              <div className="pt-2 border-t border-slate-800">
                <button
                  onClick={() => setApproved(true)}
                  disabled={approved}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all ${
                    approved
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                      : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-md shadow-cyan-500/20'
                  }`}
                >
                  {approved ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Approved: High-Priority Work Order Dispatched</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Approve AI Assessment & Dispatch Crew</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
