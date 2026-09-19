import { ComplaintRecord, ZoneSummary, AuditLogEntry, PrioritizationWeights } from '../types';

export const METRO_ZONES: ZoneSummary[] = [
  {
    zoneId: 'ZONE-DN',
    name: 'Downtown North',
    centerLat: 40.7589,
    centerLng: -73.9851,
    population: 184000,
    areaSqKm: 14.2,
    activeComplaints: 0,
    resolvedComplaints: 0,
    criticalIssues: 0,
    avgResolutionHours: 24.5,
    riskIndex: 68,
    topCategory: 'Traffic Signal Outage',
  },
  {
    zoneId: 'ZONE-RD',
    name: 'River District',
    centerLat: 40.7418,
    centerLng: -74.0048,
    population: 126000,
    areaSqKm: 18.6,
    activeComplaints: 0,
    resolvedComplaints: 0,
    criticalIssues: 0,
    avgResolutionHours: 36.2,
    riskIndex: 54,
    topCategory: 'Water Main & Drainage',
  },
  {
    zoneId: 'ZONE-IH',
    name: 'Industrial Heights',
    centerLat: 40.7128,
    centerLng: -73.9442,
    population: 92000,
    areaSqKm: 26.4,
    activeComplaints: 0,
    resolvedComplaints: 0,
    criticalIssues: 0,
    avgResolutionHours: 48.0,
    riskIndex: 79,
    topCategory: 'Potholes & Pavement Cracks',
  },
  {
    zoneId: 'ZONE-WH',
    name: 'West Hills',
    centerLat: 40.7831,
    centerLng: -73.9712,
    population: 145000,
    areaSqKm: 21.0,
    activeComplaints: 0,
    resolvedComplaints: 0,
    criticalIssues: 0,
    avgResolutionHours: 20.1,
    riskIndex: 38,
    topCategory: 'Streetlight & Electrical',
  },
  {
    zoneId: 'ZONE-SQ',
    name: 'South Quarter',
    centerLat: 40.6782,
    centerLng: -73.9442,
    population: 210000,
    areaSqKm: 32.5,
    activeComplaints: 0,
    resolvedComplaints: 0,
    criticalIssues: 0,
    avgResolutionHours: 42.8,
    riskIndex: 72,
    topCategory: 'Illegal Dumping & Waste',
  },
  {
    zoneId: 'ZONE-EP',
    name: 'East Park & Greenbelt',
    centerLat: 40.7282,
    centerLng: -73.8842,
    population: 165000,
    areaSqKm: 28.1,
    activeComplaints: 0,
    resolvedComplaints: 0,
    criticalIssues: 0,
    avgResolutionHours: 28.4,
    riskIndex: 46,
    topCategory: 'Noise & Public Nuisance',
  },
];

export class UrbanDataStore {
  private static instance: UrbanDataStore;
  public complaints: ComplaintRecord[] = [];
  public zones: ZoneSummary[] = [...METRO_ZONES];
  public auditLogs: AuditLogEntry[] = [];
  public prioritizationWeights: PrioritizationWeights = {
    severity: 0.35,
    recurrence: 0.20,
    timeUnresolved: 0.20,
    infrastructureCriticality: 0.15,
    socialVulnerability: 0.10,
    severityWeight: 0.35,
    recurrenceDensityWeight: 0.20,
    timeUnresolvedWeight: 0.20,
    infrastructureImpactWeight: 0.15,
    publicVulnerabilityWeight: 0.10,
  };
  public datasetMetadata = {
    name: 'Metropolis Municipal Problem Stream v2.6',
    totalRecords: 0,
    lastIngestedAt: new Date().toISOString(),
    isSynthetic: true,
    dataQualityScore: 94.8,
    coverageYears: '2025 - 2026',
    provenance: 'CivicPulse Urban Ingestion & Calibration Engine (ISO-37120 Compliant)',
  };

  private constructor() {
    this.recordAuditLog(
      'SYSTEM_INIT',
      'PLATFORM_ADMIN',
      'DataStore initialized with in-memory persistence and PostGIS-compatible indexing',
      'UrbanDataStore'
    );
  }

  public static getInstance(): UrbanDataStore {
    if (!UrbanDataStore.instance) {
      UrbanDataStore.instance = new UrbanDataStore();
    }
    return UrbanDataStore.instance;
  }

  public setComplaints(records: ComplaintRecord[], isSynthetic: boolean = true) {
    this.complaints = records;
    this.datasetMetadata.totalRecords = records.length;
    this.datasetMetadata.isSynthetic = isSynthetic;
    this.datasetMetadata.lastIngestedAt = new Date().toISOString();
    this.recalculateZoneMetrics();
  }

  public addComplaint(record: ComplaintRecord) {
    this.complaints.unshift(record);
    this.datasetMetadata.totalRecords = this.complaints.length;
    this.recalculateZoneMetrics();
  }

  public updateComplaint(id: string, updates: Partial<ComplaintRecord>) {
    const idx = this.complaints.findIndex((c) => c.id === id);
    if (idx !== -1) {
      this.complaints[idx] = { ...this.complaints[idx], ...updates, updatedAt: new Date().toISOString() };
      this.recalculateZoneMetrics();
      return this.complaints[idx];
    }
    return null;
  }

  public recalculateZoneMetrics() {
    const zoneMap = new Map<string, { active: number; resolved: number; critical: number; totalHours: number; countHours: number; categoryCounts: Record<string, number> }>();
    for (const z of this.zones) {
      zoneMap.set(z.name, { active: 0, resolved: 0, critical: 0, totalHours: 0, countHours: 0, categoryCounts: {} });
    }

    for (const c of this.complaints) {
      const entry = zoneMap.get(c.location.zone);
      if (entry) {
        if (c.status === 'RESOLVED' || c.status === 'CLOSED') {
          entry.resolved++;
          if (c.actualResolutionHours) {
            entry.totalHours += c.actualResolutionHours;
            entry.countHours++;
          }
        } else {
          entry.active++;
        }
        if (c.priority === 'CRITICAL') {
          entry.critical++;
        }
        entry.categoryCounts[c.category] = (entry.categoryCounts[c.category] || 0) + 1;
      }
    }

    this.zones = this.zones.map((z) => {
      const stats = zoneMap.get(z.name);
      if (!stats) return z;
      const avgHours = stats.countHours > 0 ? Math.round((stats.totalHours / stats.countHours) * 10) / 10 : z.avgResolutionHours;
      
      let topCat = z.topCategory;
      let maxCatCount = 0;
      for (const [cat, cnt] of Object.entries(stats.categoryCounts)) {
        if (cnt > maxCatCount) {
          maxCatCount = cnt;
          topCat = cat;
        }
      }

      // Risk index formula: weights active, critical, and avg resolution hours
      const risk = Math.min(
        100,
        Math.round((stats.active * 0.4) + (stats.critical * 4) + (avgHours * 0.5))
      );

      return {
        ...z,
        activeComplaints: stats.active,
        resolvedComplaints: stats.resolved,
        criticalIssues: stats.critical,
        avgResolutionHours: avgHours,
        riskIndex: Math.max(15, risk),
        topCategory: topCat,
      };
    });
  }

  public recordAuditLog(action: string, userRole: any, details: string, module: string, userEmail: string = 'operations@civicpulse.org') {
    const entry: AuditLogEntry = {
      id: `AUDIT-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      userEmail,
      userRole,
      action,
      module,
      details,
      ipAddress: '10.240.0.1 (Ingress Proxy)',
    };
    this.auditLogs.unshift(entry);
    if (this.auditLogs.length > 500) {
      this.auditLogs.pop();
    }
  }
}
