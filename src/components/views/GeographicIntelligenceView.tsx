import React from 'react';
import { ComplaintRecord, ZoneSummary, HexBin, SpatialCluster } from '../../types';
import {
  MapPin,
  Layers,
  Flame,
  Hexagon,
  Eye,
  Filter,
  Info,
  Maximize2,
  Crosshair,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';

interface GeographicIntelligenceProps {
  complaints: ComplaintRecord[];
  zones: ZoneSummary[];
  onSelectComplaint: (c: ComplaintRecord) => void;
}

export const GeographicIntelligenceView: React.FC<GeographicIntelligenceProps> = ({
  complaints,
  zones,
  onSelectComplaint,
}) => {
  const [hexBins, setHexBins] = React.useState<HexBin[]>([]);
  const [clusters, setClusters] = React.useState<SpatialCluster[]>([]);
  const [selectedZone, setSelectedZone] = React.useState<string | null>(null);
  const [showHexGrid, setShowHexGrid] = React.useState(true);
  const [showClusters, setShowClusters] = React.useState(true);
  const [showIncidentPins, setShowIncidentPins] = React.useState(true);
  const [activeCategoryFilter, setActiveCategoryFilter] = React.useState<string>('ALL');
  const [selectedPoint, setSelectedPoint] = React.useState<ComplaintRecord | null>(null);

  React.useEffect(() => {
    fetch('/api/v1/geospatial')
      .then(r => r.json())
      .then(data => {
        setHexBins(data.hexBins || []);
        setClusters(data.clusters || []);
      })
      .catch(err => console.error('Geospatial load error:', err));
  }, [complaints.length]);

  // Coordinate projection helper
  // Latitude roughly 40.66 to 40.80
  // Longitude roughly -74.02 to -73.86
  const minLat = 40.66;
  const maxLat = 40.81;
  const minLng = -74.03;
  const maxLng = -73.86;

  const projectCoords = (lat: number, lng: number, width: number, height: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * width;
    const y = ((maxLat - lat) / (maxLat - minLat)) * height;
    return { x, y };
  };

  const filteredComplaints = activeCategoryFilter === 'ALL'
    ? complaints
    : complaints.filter(c => c.category === activeCategoryFilter);

  const categories = Array.from(new Set(complaints.map(c => c.category)));

  const zoneObj = zones.find(z => z.name === selectedZone);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white lg:text-lg">
              Geospatial Intelligence & Spatial Hotspot Engine
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Hexagonal spatial binning, DBSCAN incident clustering, and territory choropleth risk overlays
          </p>
        </div>

        {/* Layer Toggles & Category Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 p-1 text-xs">
            <button
              onClick={() => setShowHexGrid(!showHexGrid)}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 transition-all ${
                showHexGrid ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Hexagon className="h-3 w-3" />
              <span>Hex Grid</span>
            </button>

            <button
              onClick={() => setShowClusters(!showClusters)}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 transition-all ${
                showClusters ? 'bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Flame className="h-3 w-3" />
              <span>DBSCAN Hotspots</span>
            </button>

            <button
              onClick={() => setShowIncidentPins(!showIncidentPins)}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 transition-all ${
                showIncidentPins ? 'bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              <MapPin className="h-3 w-3" />
              <span>Pins</span>
            </button>
          </div>

          <select
            value={activeCategoryFilter}
            onChange={(e) => setActiveCategoryFilter(e.target.value)}
            className="h-8 rounded-lg border border-slate-800 bg-slate-900 px-3 text-xs text-slate-300 focus:border-cyan-500 focus:outline-none"
          >
            <option value="ALL">All Incident Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Map View & Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Canvas Map (8 cols) */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-800 bg-slate-950 p-4 relative overflow-hidden shadow-2xl min-h-[580px] flex flex-col justify-between">
          {/* Map Status Bar */}
          <div className="flex items-center justify-between z-10 text-[11px] text-slate-400 bg-slate-900/80 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="font-semibold text-slate-200">Metropolis Spatial Coordinate Grid</span>
              <span>(WGS84 EPSG:4326)</span>
            </div>
            <div className="flex items-center gap-3">
              <span>{filteredComplaints.length} plotted incidents</span>
              <span>•</span>
              <span>{hexBins.length} active hex bins</span>
              <span>•</span>
              <span>{clusters.length} density clusters</span>
            </div>
          </div>

          {/* SVG Map Container */}
          <div className="relative w-full h-[500px] my-2 select-none">
            <svg
              viewBox="0 0 800 500"
              className="w-full h-full rounded-xl bg-slate-950"
            >
              {/* Background Grid Lines */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(30, 41, 59, 0.4)" strokeWidth="1" />
                </pattern>
                <radialGradient id="hotspotGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(244, 63, 94, 0.5)" />
                  <stop offset="60%" stopColor="rgba(244, 63, 94, 0.2)" />
                  <stop offset="100%" stopColor="rgba(244, 63, 94, 0)" />
                </radialGradient>
              </defs>

              <rect width="800" height="500" fill="url(#grid)" />

              {/* Water River Path Overlay (Stylized Hudson/River representation) */}
              <path
                d="M 160 0 Q 180 180 140 320 T 110 500 L 70 500 Q 100 320 120 180 T 110 0 Z"
                fill="rgba(14, 116, 144, 0.15)"
                stroke="rgba(6, 182, 212, 0.2)"
                strokeWidth="1"
              />

              {/* Zones Base Regions */}
              {zones.map((z) => {
                const center = projectCoords(z.centerLat, z.centerLng, 800, 500);
                const isSelected = selectedZone === z.name;
                const riskHue = z.riskIndex >= 70 ? '244, 63, 94' : z.riskIndex >= 50 ? '245, 158, 11' : '16, 185, 129';

                return (
                  <g
                    key={z.zoneId}
                    className="cursor-pointer transition-all duration-300"
                    onClick={() => setSelectedZone(selectedZone === z.name ? null : z.name)}
                  >
                    {/* Zone bounding bubble */}
                    <circle
                      cx={center.x}
                      cy={center.y}
                      r="65"
                      fill={`rgba(${riskHue}, ${isSelected ? 0.22 : 0.08})`}
                      stroke={`rgba(${riskHue}, ${isSelected ? 0.8 : 0.3})`}
                      strokeWidth={isSelected ? 2 : 1}
                      strokeDasharray={isSelected ? 'none' : '4 3'}
                    />

                    {/* Zone Label */}
                    <text
                      x={center.x}
                      y={center.y - 45}
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize="10"
                      fontWeight="bold"
                      className="pointer-events-none uppercase tracking-wider"
                    >
                      {z.name}
                    </text>
                    <text
                      x={center.x}
                      y={center.y - 32}
                      textAnchor="middle"
                      fill={z.riskIndex >= 70 ? '#f43f5e' : '#38bdf8'}
                      fontSize="9"
                      fontWeight="600"
                      className="pointer-events-none"
                    >
                      Risk {z.riskIndex}
                    </text>
                  </g>
                );
              })}

              {/* Hexagonal Density Bins Layer */}
              {showHexGrid && hexBins.map((bin) => {
                const pos = projectCoords(bin.lat, bin.lng, 800, 500);
                const radius = Math.min(22, Math.max(10, bin.intensity * 24));
                const fillColor = bin.criticalCount > 0 ? 'rgba(239, 68, 68, 0.45)' : 'rgba(6, 182, 212, 0.35)';
                const strokeColor = bin.criticalCount > 0 ? 'rgba(239, 68, 68, 0.8)' : 'rgba(6, 182, 212, 0.7)';

                return (
                  <g key={bin.id} className="transition-all hover:opacity-100 opacity-80">
                    <polygon
                      points={`${pos.x},${pos.y - radius} ${pos.x + radius * 0.866},${pos.y - radius * 0.5} ${pos.x + radius * 0.866},${pos.y + radius * 0.5} ${pos.x},${pos.y + radius} ${pos.x - radius * 0.866},${pos.y + radius * 0.5} ${pos.x - radius * 0.866},${pos.y - radius * 0.5}`}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth="1"
                    />
                    {bin.count >= 4 && (
                      <text
                        x={pos.x}
                        y={pos.y + 3}
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="9"
                        fontWeight="bold"
                        className="pointer-events-none"
                      >
                        {bin.count}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* DBSCAN Hotspot Clusters Layer */}
              {showClusters && clusters.map((clust) => {
                const pos = projectCoords(clust.centerLat, clust.centerLng, 800, 500);
                const r = Math.min(55, Math.max(25, (clust.radiusMeters / 1000) * 120));

                return (
                  <g key={clust.id} className="animate-pulse pointer-events-none">
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={r}
                      fill="url(#hotspotGrad)"
                    />
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={6}
                      fill="#f43f5e"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                  </g>
                );
              })}

              {/* Individual Incident Pins Layer */}
              {showIncidentPins && filteredComplaints.slice(0, 180).map((c) => {
                const pos = projectCoords(c.location.lat, c.location.lng, 800, 500);
                const isCritical = c.priority === 'CRITICAL';
                const isSelected = selectedPoint?.id === c.id;

                const pinColor = isCritical
                  ? '#f43f5e'
                  : c.priority === 'HIGH'
                  ? '#f59e0b'
                  : '#06b6d4';

                return (
                  <circle
                    key={c.id}
                    cx={pos.x}
                    cy={pos.y}
                    r={isSelected ? 6 : isCritical ? 4.5 : 3}
                    fill={pinColor}
                    stroke={isSelected ? '#ffffff' : 'rgba(15, 23, 42, 0.8)'}
                    strokeWidth={isSelected ? 2 : 1}
                    className="cursor-pointer hover:scale-150 transition-transform"
                    onClick={() => {
                      setSelectedPoint(c);
                      onSelectComplaint(c);
                    }}
                  />
                );
              })}
            </svg>
          </div>

          {/* Map Legend */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-4">
              <span className="font-semibold text-slate-300">Map Legend:</span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                <span>Critical Priority Incident</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
                <span>Standard Incident</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded bg-cyan-500/40 border border-cyan-500/60" />
                <span>H3 Spatial Hex Bin</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500/30 border border-rose-500" />
                <span>DBSCAN Density Cluster</span>
              </span>
            </div>
            <span className="text-[10px] text-slate-500">Click any marker or zone to inspect</span>
          </div>
        </div>

        {/* Right: Selected Zone & Cluster Inspector (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Zone Detail Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Zone Intelligence Inspector
              </h3>
              {zoneObj && (
                <button
                  onClick={() => setSelectedZone(null)}
                  className="text-[11px] text-cyan-400 hover:underline"
                >
                  Clear Selection
                </button>
              )}
            </div>

            {zoneObj ? (
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-base font-extrabold text-white">{zoneObj.name}</h4>
                    <span className="font-mono text-xs text-slate-400">{zoneObj.zoneId}</span>
                  </div>
                  <div className="text-right">
                    <span className="rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2.5 py-1 text-xs font-extrabold">
                      Risk {zoneObj.riskIndex} / 100
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg border border-slate-800 bg-slate-950 p-2.5">
                    <div className="text-[10px] text-slate-400">Active Work Orders</div>
                    <div className="text-base font-bold text-cyan-400">{zoneObj.activeComplaints}</div>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-950 p-2.5">
                    <div className="text-[10px] text-slate-400">Critical Issues</div>
                    <div className="text-base font-bold text-rose-400">{zoneObj.criticalIssues}</div>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-950 p-2.5">
                    <div className="text-[10px] text-slate-400">Avg Resolution</div>
                    <div className="text-base font-bold text-slate-200">{zoneObj.avgResolutionHours}h</div>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-950 p-2.5">
                    <div className="text-[10px] text-slate-400">Population</div>
                    <div className="text-base font-bold text-slate-200">{zoneObj.population.toLocaleString()}</div>
                  </div>
                </div>

                <div className="text-xs text-slate-300 pt-1">
                  <span className="text-slate-500 font-medium">Predominant Infrastructure Issue: </span>
                  <span className="font-semibold text-cyan-300">{zoneObj.topCategory}</span>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-500 italic">
                Click any zone boundary on the map to inspect its municipal demographic risk metrics and SLA profiles.
              </div>
            )}
          </div>

          {/* Top Spatial Density Clusters */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Flame className="h-3.5 w-3.5 text-rose-400" />
                <span>Detected Spatial Clusters ({clusters.length})</span>
              </h3>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1 text-xs">
              {clusters.map((c) => (
                <div
                  key={c.id}
                  className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 hover:border-cyan-500/40 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-200">{c.category} Hotspot</span>
                    <span className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                      c.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {c.severity}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {c.pointCount} active complaints concentrated within {c.radiusMeters}m radius
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Coordinates: ({c.centerLat}, {c.centerLng})
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
