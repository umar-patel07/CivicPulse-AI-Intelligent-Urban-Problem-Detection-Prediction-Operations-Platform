import React, { useState, useRef } from 'react';
import { ComplaintCategory, ComplaintRecord, PriorityLevel } from '../types';
import {
  Camera,
  Upload,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Send,
  X,
  Radio,
  FileCheck,
  Building2,
  Clock,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  Truck,
  Eye,
  ScanEye,
  RefreshCw,
  Search,
  ThumbsUp
} from 'lucide-react';

interface CitizenReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplaintCreated: (newComplaint: ComplaintRecord) => void;
  onNavigateToOperations: (complaint: ComplaintRecord) => void;
  onNavigateToMap: (complaint: ComplaintRecord) => void;
  onInspectComplaint: (complaint: ComplaintRecord) => void;
  availableZones: string[];
  allComplaints?: ComplaintRecord[];
}

interface PhotoPreset {
  id: string;
  label: string;
  category: ComplaintCategory;
  title: string;
  description: string;
  address: string;
  zone: string;
  priority: PriorityLevel;
  urgency: number;
  imageUrl: string;
  defectLabel: string;
  confidence: number;
  repairGuidance: string;
}

const PHOTO_PRESETS: PhotoPreset[] = [
  {
    id: 'pothole-arterial',
    label: 'Deep Road Crater',
    category: 'Potholes & Pavement Cracks',
    title: 'Severe deep asphalt crater on arterial avenue lane',
    description: 'Wheel-busting pothole measuring over 10cm depth with fractured edges. Multiple cars swerving into oncoming traffic.',
    address: '412 Lexington Ave, Downtown North',
    zone: 'Downtown North',
    priority: 'CRITICAL',
    urgency: 92,
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=700&auto=format&fit=crop&q=80',
    defectLabel: 'Severe Arterial Pothole (Depth > 10cm)',
    confidence: 0.95,
    repairGuidance: 'High vehicle tire hazard. Requires cold-milling and 18-liter hot asphalt compaction.',
  },
  {
    id: 'water-curb-leak',
    label: 'Pressurized Water Leak',
    category: 'Water Main & Drainage',
    title: 'Pressurized water bubbling up through curb and asphalt',
    description: 'Fresh municipal water streaming continuously onto the street. Catch basin overflowing and asphalt sub-base eroding.',
    address: '89 Waterfront Blvd, River District',
    zone: 'River District',
    priority: 'CRITICAL',
    urgency: 88,
    imageUrl: 'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?w=700&auto=format&fit=crop&q=80',
    defectLabel: 'Sub-base Pressurized Pipe Fracture',
    confidence: 0.91,
    repairGuidance: 'Isolate line valve at Sector 4-B. Trenching required to assess pipe collar joint.',
  },
  {
    id: 'traffic-signal-dark',
    label: 'Dark Traffic Signal',
    category: 'Traffic Signal Outage',
    title: 'Traffic lights completely dead at busy 4-way intersection',
    description: 'All 4 signal heads dark following electrical transient. High accident risk during afternoon rush hour.',
    address: 'Grand Concourse & 14th St, Midtown East',
    zone: 'Midtown East',
    priority: 'CRITICAL',
    urgency: 96,
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=700&auto=format&fit=crop&q=80',
    defectLabel: 'Controller Cabinet Relay Failure',
    confidence: 0.97,
    repairGuidance: 'Emergency traffic management required. Reset circuit breaker cabinet #12 and dispatch police.',
  },
  {
    id: 'illegal-waste-spill',
    label: 'Hazardous Waste Dump',
    category: 'Illegal Dumping & Waste',
    title: 'Abandoned unlabeled 55-gallon drums with chemical odor',
    description: 'Three metal drums dumped on the sidewalk verge near storm drain. Solvent odor present.',
    address: '520 Foundry Way, Industrial Heights',
    zone: 'Industrial Heights',
    priority: 'HIGH',
    urgency: 84,
    imageUrl: 'https://images.unsplash.com/photo-1611288875785-b17196238b18?w=700&auto=format&fit=crop&q=80',
    defectLabel: 'Industrial Chemical Receptacle Spill Hazard',
    confidence: 0.89,
    repairGuidance: 'HAZMAT containment protocol. Deploy absorption boom before storm run-off.',
  },
];

export const CitizenReportModal: React.FC<CitizenReportModalProps> = ({
  isOpen,
  onClose,
  onComplaintCreated,
  onNavigateToOperations,
  onNavigateToMap,
  onInspectComplaint,
  availableZones,
  allComplaints = [],
}) => {
  const [activeTab, setActiveTab] = useState<'REPORT' | 'TRACK'>('REPORT');
  const [trackQuery, setTrackQuery] = useState('');
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [upvotedIds, setUpvotedIds] = useState<Record<string, boolean>>({});

  const [selectedPreset, setSelectedPreset] = useState<PhotoPreset | null>(PHOTO_PRESETS[0]);
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>(PHOTO_PRESETS[0].imageUrl);
  
  // Form fields
  const [title, setTitle] = useState(PHOTO_PRESETS[0].title);
  const [description, setDescription] = useState(PHOTO_PRESETS[0].description);
  const [category, setCategory] = useState<ComplaintCategory>(PHOTO_PRESETS[0].category);
  const [zone, setZone] = useState(PHOTO_PRESETS[0].zone);
  const [address, setAddress] = useState(PHOTO_PRESETS[0].address);
  const [priority, setPriority] = useState<PriorityLevel>(PHOTO_PRESETS[0].priority);
  const [reporterType, setReporterType] = useState<'CITIZEN' | 'BUSINESS' | 'FIELD_INSPECTOR'>('CITIZEN');

  // AI analysis state
  const [analyzingPhoto, setAnalyzingPhoto] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState({
    defect: PHOTO_PRESETS[0].defectLabel,
    confidence: PHOTO_PRESETS[0].confidence,
    guidance: PHOTO_PRESETS[0].repairGuidance,
    urgencyScore: PHOTO_PRESETS[0].urgency,
  });

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<ComplaintRecord | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Select preset photo
  const handleSelectPreset = (preset: PhotoPreset) => {
    setSelectedPreset(preset);
    setCustomPhotoUrl(null);
    setPhotoPreview(preset.imageUrl);
    setTitle(preset.title);
    setDescription(preset.description);
    setCategory(preset.category);
    setZone(preset.zone);
    setAddress(preset.address);
    setPriority(preset.priority);
    setAiAnalysisResult({
      defect: preset.defectLabel,
      confidence: preset.confidence,
      guidance: preset.repairGuidance,
      urgencyScore: preset.urgency,
    });
  };

  // Upload user file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzingPhoto(true);
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      setPhotoPreview(result);
      setCustomPhotoUrl(result);
      setSelectedPreset(null);

      // Trigger simulated AI vision scan
      setTimeout(() => {
        setAnalyzingPhoto(false);
        setAiAnalysisResult({
          defect: 'Verified Surface Obstruction / Structural Distress',
          confidence: 0.93,
          guidance: 'Optical analysis confirmed physical infrastructure damage. Immediate dispatch recommended.',
          urgencyScore: 86,
        });
        if (!title || title.includes('arterial')) {
          setTitle(`Reported hazard: ${file.name.replace(/\.[^/.]+$/, "")}`);
        }
      }, 700);
    };
    reader.readAsDataURL(file);
  };

  // Submit report to live server
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        title,
        description,
        category,
        zone,
        address,
        priority,
        sourceChannel: 'MOBILE_APP',
        reporterType,
        imageUrl: photoPreview,
        urgencyScore: aiAnalysisResult.urgencyScore,
        tags: [
          'citizen_report',
          'photo_verified',
          category.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
          zone.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
        ],
      };

      const res = await fetch('/api/v1/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to create incident report');

      const data: ComplaintRecord = await res.json();
      setCreatedTicket(data);
      onComplaintCreated(data);
    } catch (err) {
      console.error('Error submitting report:', err);
      alert('Could not submit report to city dispatch. Please retry.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setCreatedTicket(null);
    handleSelectPreset(PHOTO_PRESETS[0]);
  };

  // Filter complaints for tracking
  const filteredTrackComplaints = allComplaints.filter((c) => {
    if (!trackQuery.trim()) return true;
    const q = trackQuery.toLowerCase();
    return (
      c.trackingNumber.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.location.address.toLowerCase().includes(q) ||
      c.location.zone.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q)
    );
  });

  const selectedTrackComplaint =
    allComplaints.find((c) => c.id === selectedTrackId) ||
    filteredTrackComplaints[0] ||
    null;

  const handleUpvote = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (upvotedIds[id]) return;
    setUpvotedIds((prev) => ({ ...prev, [id]: true }));
    try {
      await fetch(`/api/v1/complaints/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ upvotesIncrement: 1 }),
      });
    } catch (err) {
      console.error('Failed to upvote:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl shadow-cyan-950/40 my-auto overflow-hidden">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/90 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-md shadow-cyan-500/20 text-white">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Observer & Citizen Incident Reporter
                </h2>
                <span className="rounded-full bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-0.5 text-[10px] font-semibold text-cyan-300">
                  Real-Time AI Vision Triage
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Submit an infrastructure photo to instantly trigger computer vision classification and operational dispatch.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs: Submit vs Track */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-6">
          <button
            type="button"
            onClick={() => setActiveTab('REPORT')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 text-xs font-bold transition-colors ${
              activeTab === 'REPORT'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="h-4 w-4" />
            <span>Submit Photo Incident Report</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('TRACK')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 text-xs font-bold transition-colors ${
              activeTab === 'TRACK'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="h-4 w-4" />
            <span>Track Incident Status & Live Dispatch ({allComplaints.length})</span>
          </button>
        </div>

        {/* Modal Body: Either Submit Report OR Track Incident */}
        {activeTab === 'REPORT' ? (
          !createdTicket ? (
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* Step 1: Photo Selection & AI Computer Vision Scan */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Photo Upload / Preset Selector (5 cols) */}
              <div className="lg:col-span-5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Camera className="h-3.5 w-3.5 text-cyan-400" />
                    <span>1. Photo Evidence</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    <Upload className="h-3 w-3" />
                    <span>Upload Your Own</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {/* Main Photo Preview with AI Bounding Box */}
                <div className="relative h-56 w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center group">
                  <img
                    src={photoPreview}
                    alt="Defect Preview"
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* AI Scan Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

                  {/* Bounding box badge */}
                  <div className="absolute top-3 left-3 rounded-lg border border-cyan-500/40 bg-slate-900/80 backdrop-blur-sm px-2.5 py-1 flex items-center gap-1.5 text-[11px] font-semibold text-cyan-200">
                    <ScanEye className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
                    <span>AI Vision Active</span>
                  </div>

                  {/* Detected defect chip */}
                  <div className="absolute bottom-3 left-3 right-3 rounded-lg border border-slate-800 bg-slate-900/90 backdrop-blur-md p-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Classified Defect:</span>
                      <span className="font-bold text-rose-400 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {aiAnalysisResult.defect}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                      <span>Model Confidence:</span>
                      <span className="font-mono text-cyan-300 font-semibold">
                        {Math.round(aiAnalysisResult.confidence * 100)}%
                      </span>
                    </div>
                  </div>

                  {analyzingPhoto && (
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="h-6 w-6 text-cyan-400 animate-spin" />
                      <span className="text-xs font-semibold text-slate-200">
                        Running Computer Vision Segmentation...
                      </span>
                    </div>
                  )}
                </div>

                {/* Quick Presets Carousel */}
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Or select standard municipal test capture:
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {PHOTO_PRESETS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectPreset(p)}
                        className={`rounded-lg border p-2 text-left transition-all ${
                          selectedPreset?.id === p.id
                            ? 'border-cyan-500 bg-cyan-500/15 text-cyan-200 shadow-sm'
                            : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                        }`}
                      >
                        <div className="text-[11px] font-bold truncate">{p.label}</div>
                        <div className="text-[9px] text-slate-500 truncate">{p.zone}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Form Inputs & Routing Parameters (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                  <span>2. Incident Details & Location</span>
                </label>

                {/* Title */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Incident Title / Summary
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Deep pothole on 4th Ave causing tire punctures"
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                {/* Category and Priority Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">
                      Problem Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    >
                      <option value="Potholes & Pavement Cracks">Potholes & Pavement Cracks</option>
                      <option value="Water Main & Drainage">Water Main & Drainage</option>
                      <option value="Streetlight & Electrical">Streetlight & Electrical</option>
                      <option value="Illegal Dumping & Waste">Illegal Dumping & Waste</option>
                      <option value="Traffic Signal Outage">Traffic Signal Outage</option>
                      <option value="Noise & Public Nuisance">Noise & Public Nuisance</option>
                      <option value="Structural Hazard & Sidewalk">Structural Hazard & Sidewalk</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">
                      Priority Level
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    >
                      <option value="CRITICAL">CRITICAL (12h SLA - Immediate)</option>
                      <option value="HIGH">HIGH (24h SLA - Priority)</option>
                      <option value="MEDIUM">MEDIUM (72h SLA - Standard)</option>
                      <option value="LOW">LOW (168h SLA - Routine)</option>
                    </select>
                  </div>
                </div>

                {/* Zone and Address Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">
                      Municipal District / Zone
                    </label>
                    <select
                      value={zone}
                      onChange={(e) => setZone(e.target.value)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    >
                      {availableZones.length > 0 ? (
                        availableZones.map((z) => (
                          <option key={z} value={z}>{z}</option>
                        ))
                      ) : (
                        <>
                          <option value="Downtown North">Downtown North</option>
                          <option value="South Quarter">South Quarter</option>
                          <option value="Industrial Heights">Industrial Heights</option>
                          <option value="River District">River District</option>
                          <option value="Midtown East">Midtown East</option>
                          <option value="Westside Corridor">Westside Corridor</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">
                      Street Address / Landmarks
                    </label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. 412 Lexington Ave, near school"
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Observer Observations & Context
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what you observed, safety impacts, or urgency notes..."
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                {/* Observer Persona Role Selection */}
                <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 p-2.5">
                  <div className="text-[11px] text-slate-400">
                    Submitting as:
                  </div>
                  <div className="flex gap-2">
                    {[
                      { id: 'CITIZEN', label: 'Resident / Commuter' },
                      { id: 'BUSINESS', label: 'Local Business' },
                      { id: 'FIELD_INSPECTOR', label: 'Field Scout' },
                    ].map((rep) => (
                      <button
                        key={rep.id}
                        type="button"
                        onClick={() => setReporterType(rep.id as any)}
                        className={`rounded-md px-2.5 py-1 text-[10px] font-semibold transition-colors ${
                          reporterType === rep.id
                            ? 'bg-cyan-500 text-slate-950 font-bold'
                            : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {rep.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex items-center justify-between border-t border-slate-800 pt-4">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                <span>AI will auto-triage ticket and route to corresponding district crew immediately upon submission.</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-500 transition-all disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Submitting to City Command...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Submit Report with Photo</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* =========================================================================
             POST-SUBMISSION SCREEN: "WHO GETS THE REQUEST AND WHAT HAPPENS NEXT?"
             ========================================================================= */
          <div className="p-6 space-y-6">
            
            {/* Top Success Banner */}
            <div className="rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">
                        Incident Report Successfully Registered & Dispatched!
                      </h3>
                      <span className="rounded-md bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-300">
                        {createdTicket.trackingNumber}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      The photo evidence has been parsed by AI vision, scored for urgency, and placed directly in the active municipal response pipeline.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Status:</span>
                  <span className="rounded-full bg-cyan-500/20 border border-cyan-500/30 px-3 py-1 text-xs font-bold text-cyan-300">
                    NEW / AUTO-TRIAGED
                  </span>
                </div>
              </div>
            </div>

            {/* Crucial Explanation Box: "Who Gets This Request?" */}
            <div className="rounded-xl border border-cyan-500/30 bg-slate-950/80 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-cyan-400" />
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                    Who Gets This Request & What Happens Next?
                  </h4>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  SLA Window: {createdTicket.slaTargetHours} Hours Max
                </span>
              </div>

              {/* 4-Step Interactive Flow Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Step 1: AI Urban Triage */}
                <div className="flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-900/60 p-3.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-cyan-300">1. AI Urban Triage Engine</div>
                    <div className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                      Scored urgency at <span className="font-bold text-amber-400">{createdTicket.urgencyScore}/100</span>. Verified image contour and established an active <span className="font-semibold text-rose-300">{createdTicket.slaTargetHours}-hour SLA countdown timer</span> to prevent city backlog breach.
                    </div>
                  </div>
                </div>

                {/* Step 2: Operations Dispatcher */}
                <div className="flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-900/60 p-3.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400 border border-blue-500/30">
                    <Radio className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-blue-300">2. Central Operations Dispatcher</div>
                    <div className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                      Placed directly into the <span className="font-semibold text-cyan-300">"NEW"</span> column on the live <span className="font-semibold text-slate-100">Operations Triage Board</span>. Dispatchers monitor this board in real time to verify and route tickets.
                    </div>
                  </div>
                </div>

                {/* Step 3: Assigned Field Crew */}
                <div className="flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-900/60 p-3.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <Truck className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-300">3. Assigned Field Maintenance Crew</div>
                    <div className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                      Routed to <span className="font-bold text-white">{createdTicket.assignedTeam || 'District Response Unit'}</span>. The crew receives your photo, exact street coordinates (<span className="font-mono text-cyan-300">{createdTicket.location.lat.toFixed(3)}, {createdTicket.location.lng.toFixed(3)}</span>), and repair instructions on their field tablets.
                    </div>
                  </div>
                </div>

                {/* Step 4: Operations Director & Public Auditor */}
                <div className="flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-900/60 p-3.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/15 text-purple-400 border border-purple-500/30">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-purple-300">4. Operations Director & Public Auditor</div>
                    <div className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                      Recorded in the city's tamper-evident audit ledger. Added to zone <span className="font-semibold text-white">{createdTicket.location.zone}</span> risk indicators and visible in public transparency reporting.
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Ticket Summary Card */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={createdTicket.imageUrl || photoPreview}
                  alt="Reported Photo"
                  className="h-16 w-16 rounded-lg object-cover border border-slate-800"
                />
                <div>
                  <div className="text-xs font-bold text-white">{createdTicket.title}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                    <span>{createdTicket.location.address}</span>
                    <span>•</span>
                    <span className="text-cyan-400 font-semibold">{createdTicket.location.zone}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-2">
                    <span>Priority: <strong className="text-rose-400">{createdTicket.priority}</strong></span>
                    <span>•</span>
                    <span>Est. Cost: <strong>${createdTicket.estimatedRepairCostUSD || 850}</strong></span>
                  </div>
                </div>
              </div>

              {/* Action Buttons to View Exactly Where It Went */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToOperations(createdTicket);
                  }}
                  className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-colors shadow-md"
                >
                  <Radio className="h-3.5 w-3.5" />
                  <span>See on Operations Board</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToMap(createdTicket);
                  }}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
                >
                  <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                  <span>View on City Map</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onInspectComplaint(createdTicket);
                  }}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
                >
                  <Eye className="h-3.5 w-3.5 text-slate-400" />
                  <span>Inspect Ticket</span>
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-slate-800 pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
              >
                <Camera className="h-3.5 w-3.5" />
                <span>Submit Another Photo Report</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition-colors"
              >
                Close Window
              </button>
            </div>

          </div>
        )
      ) : (
          /* Track Incident Tab Interface */
          <div className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
            {/* Top Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={trackQuery}
                  onChange={(e) => setTrackQuery(e.target.value)}
                  placeholder="Enter Tracking # (e.g. CP-2024-001) or search by street / defect..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/80 pl-10 pr-9 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 font-mono"
                />
                {trackQuery && (
                  <button
                    type="button"
                    onClick={() => setTrackQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0">
                <span>Showing:</span>
                <span className="font-mono font-bold text-cyan-400">
                  {filteredTrackComplaints.length}
                </span>
                <span>incident records</span>
              </div>
            </div>

            {/* Split View: List on left (4 cols), Detail on right (8 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Column: Incidents List */}
              <div className="lg:col-span-4 space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {filteredTrackComplaints.length === 0 ? (
                  <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-6 text-center text-xs text-slate-400">
                    No matching incidents found for "{trackQuery}". Try searching a street or category.
                  </div>
                ) : (
                  filteredTrackComplaints.slice(0, 15).map((comp) => {
                    const isSelected = selectedTrackComplaint?.id === comp.id;
                    return (
                      <div
                        key={comp.id}
                        onClick={() => setSelectedTrackId(comp.id)}
                        className={`rounded-xl border p-3 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-cyan-500/60 bg-cyan-500/10 shadow-md shadow-cyan-950/40'
                            : 'border-slate-800/80 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/60'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-mono font-bold text-cyan-400">
                            {comp.trackingNumber}
                          </span>
                          <span
                            className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                              comp.status === 'RESOLVED'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : comp.status === 'IN_PROGRESS'
                                ? 'bg-blue-500/20 text-blue-300'
                                : comp.status === 'ASSIGNED'
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {comp.status}
                          </span>
                        </div>

                        <div className="text-xs font-semibold text-slate-200 truncate">
                          {comp.title}
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                          <span className="truncate">{comp.location.zone}</span>
                          <span className="font-mono text-slate-500">{comp.daysOpen}d ago</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Right Column: Selected Incident Deep Inspector */}
              <div className="lg:col-span-8">
                {selectedTrackComplaint ? (
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-5 space-y-4">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-cyan-400">
                            {selectedTrackComplaint.trackingNumber}
                          </span>
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                              selectedTrackComplaint.priority === 'CRITICAL'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                : selectedTrackComplaint.priority === 'HIGH'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {selectedTrackComplaint.priority} Priority
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-white mt-1">
                          {selectedTrackComplaint.title}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                          <MapPin className="h-3.5 w-3.5 text-slate-500" />
                          <span>{selectedTrackComplaint.location.address}</span>
                          <span>•</span>
                          <span className="text-cyan-400 font-medium">
                            {selectedTrackComplaint.location.zone}
                          </span>
                        </div>
                      </div>

                      {/* Upvote Button */}
                      <button
                        type="button"
                        onClick={(e) => handleUpvote(selectedTrackComplaint.id, e)}
                        className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all self-start sm:self-center ${
                          upvotedIds[selectedTrackComplaint.id]
                            ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300'
                            : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-cyan-500 hover:text-white'
                        }`}
                      >
                        <ThumbsUp className="h-3.5 w-3.5" />
                        <span>
                          {upvotedIds[selectedTrackComplaint.id] ? 'Upvoted!' : 'Confirm Hazard'}
                        </span>
                        <span className="font-mono font-bold text-cyan-400">
                          +{selectedTrackComplaint.upvotes + (upvotedIds[selectedTrackComplaint.id] ? 1 : 0)}
                        </span>
                      </button>
                    </div>

                    {/* 5-Stage Lifecycle Stepper */}
                    <div className="space-y-2">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-cyan-400" />
                        <span>Live Incident Lifecycle Stepper</span>
                      </div>

                      <div className="grid grid-cols-5 gap-1.5 pt-1">
                        {[
                          { stage: 'NEW', label: '1. Ingested', desc: 'AI Scanned' },
                          { stage: 'TRIAGED', label: '2. Triaged', desc: 'Priority Set' },
                          { stage: 'ASSIGNED', label: '3. Assigned', desc: 'Crew Dispatched' },
                          { stage: 'IN_PROGRESS', label: '4. In Progress', desc: 'Active On-Site' },
                          { stage: 'RESOLVED', label: '5. Resolved', desc: 'Certified Closed' },
                        ].map((step, idx) => {
                          const stages = ['NEW', 'TRIAGED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
                          const currentIdx = stages.indexOf(selectedTrackComplaint.status);
                          const isPassed = currentIdx >= idx;
                          const isCurrent = currentIdx === idx || (idx === 4 && selectedTrackComplaint.status === 'CLOSED');

                          return (
                            <div
                              key={step.stage}
                              className={`rounded-xl border p-2 text-center transition-all ${
                                isCurrent
                                  ? 'border-cyan-400 bg-cyan-500/15 shadow-sm shadow-cyan-950'
                                  : isPassed
                                  ? 'border-emerald-500/40 bg-emerald-950/20'
                                  : 'border-slate-800 bg-slate-900/40 opacity-60'
                              }`}
                            >
                              <div
                                className={`text-[10px] font-bold ${
                                  isCurrent
                                    ? 'text-cyan-300'
                                    : isPassed
                                    ? 'text-emerald-400'
                                    : 'text-slate-400'
                                }`}
                              >
                                {step.label}
                              </div>
                              <div className="text-[9px] text-slate-400 truncate mt-0.5">
                                {step.desc}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Operational Assignment & SLA Metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Truck className="h-3 w-3 text-cyan-400" />
                          <span>Assigned Field Crew</span>
                        </div>
                        <div className="text-xs font-bold text-white mt-1">
                          {selectedTrackComplaint.assignedTeam || 'Routing via Operations Desk'}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Remediation Target: {selectedTrackComplaint.slaTargetHours} hours
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <ShieldAlert className="h-3 w-3 text-amber-400" />
                          <span>SLA Performance Status</span>
                        </div>
                        <div
                          className={`text-xs font-bold mt-1 ${
                            selectedTrackComplaint.slaBreached
                              ? 'text-rose-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {selectedTrackComplaint.slaBreached
                            ? 'SLA Window Escalated'
                            : 'On Track Within SLA Target'}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Estimated Repair Budget: $
                          {(selectedTrackComplaint.estimatedRepairCostUSD || 850).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onNavigateToMap(selectedTrackComplaint);
                        }}
                        className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:border-cyan-500 hover:text-white transition-colors"
                      >
                        <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                        <span>View on City Map</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onNavigateToOperations(selectedTrackComplaint);
                        }}
                        className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:border-cyan-500 hover:text-white transition-colors"
                      >
                        <Radio className="h-3.5 w-3.5 text-amber-400" />
                        <span>See on Operations Kanban</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onInspectComplaint(selectedTrackComplaint);
                        }}
                        className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-colors shadow-md ml-auto"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Open Full Ticket Details</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-12 text-center text-xs text-slate-400">
                    Select an incident from the list to track its real-time operational status.
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Close */}
            <div className="flex items-center justify-between border-t border-slate-800 pt-4">
              <button
                type="button"
                onClick={() => setActiveTab('REPORT')}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5"
              >
                <Camera className="h-3.5 w-3.5" />
                <span>Submit a New Photo Report</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition-colors"
              >
                Close Window
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
