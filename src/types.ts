export type ComplaintCategory =
  | 'Potholes & Pavement Cracks'
  | 'Water Main & Drainage'
  | 'Streetlight & Electrical'
  | 'Illegal Dumping & Waste'
  | 'Traffic Signal Outage'
  | 'Noise & Public Nuisance'
  | 'Structural Hazard & Sidewalk';

export type ComplaintStatus = 'NEW' | 'TRIAGED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface LocationPoint {
  lat: number;
  lng: number;
  address: string;
  zone: string;
  districtId: string;
}

export interface ComplaintRecord {
  id: string;
  trackingNumber: string;
  category: ComplaintCategory;
  subcategory: string;
  title: string;
  description: string;
  createdAt: string; // ISO 8601
  updatedAt: string;
  resolvedAt?: string | null;
  status: ComplaintStatus;
  priority: PriorityLevel;
  location: LocationPoint;
  sourceChannel: 'MOBILE_APP' | 'HOTLINE_311' | 'WEB_PORTAL' | 'IOT_SENSOR' | 'FIELD_INSPECTOR';
  reporterType: 'CITIZEN' | 'CITY_CREW' | 'AUTOMATED_SENSOR' | 'BUSINESS';
  daysOpen: number;
  slaBreached: boolean;
  slaTargetHours: number;
  actualResolutionHours?: number | null;
  upvotes: number;
  duplicateOfId?: string | null;
  similarityScore?: number;
  sentimentScore: number; // -1 to 1
  urgencyScore: number; // 0 to 100
  assignedTeam?: string;
  estimatedRepairCostUSD?: number;
  tags: string[];
  imageUrl?: string;
}

export interface ZoneSummary {
  zoneId: string;
  name: string;
  centerLat: number;
  centerLng: number;
  population: number;
  areaSqKm: number;
  activeComplaints: number;
  resolvedComplaints: number;
  criticalIssues: number;
  avgResolutionHours: number;
  riskIndex: number; // 0 to 100
  topCategory: string;
}

export interface HexBin {
  id: string;
  lat: number;
  lng: number;
  count: number;
  criticalCount: number;
  dominantCategory: string;
  intensity: number; // 0 to 1
}

export interface SpatialCluster {
  id: string;
  centerLat: number;
  centerLng: number;
  radiusMeters: number;
  pointCount: number;
  category: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  label: string;
}

export interface AnomalyRecord {
  id: string;
  detectedAt: string;
  type: 'VOLUME_SURGE' | 'GEOGRAPHIC_SPIKE' | 'SLA_BOTTLENECK' | 'RECURRENCE_CLUSTER';
  category: ComplaintCategory;
  zone: string;
  anomalyScore: number; // 0 to 100
  zScore: number;
  baselineValue: number;
  observedValue: number;
  confidence: number; // 0 to 1
  explanation: string;
  factors: { name: string; contributionPercent: number }[];
  isEmergencyAlert: boolean;
}

export interface ForecastPoint {
  date: string;
  historical?: number;
  forecast?: number;
  lowerBound?: number;
  upperBound?: number;
  isProjected: boolean;
}

export interface ModelMetrics {
  mae: number;
  rmse: number;
  mape: number;
  baselineComparison: string;
  validationMethod: string;
  lastTrainedDate: string;
  modelType: string;
  parameters: Record<string, any>;
}

export interface PrioritizationWeights {
  severity: number;
  recurrence: number;
  timeUnresolved: number;
  infrastructureCriticality: number;
  socialVulnerability: number;
  severityWeight?: number;
  recurrenceDensityWeight?: number;
  timeUnresolvedWeight?: number;
  infrastructureImpactWeight?: number;
  publicVulnerabilityWeight?: number;
}

export type AnomalyDetectionResult = AnomalyRecord;

export interface PriorityScoreBreakdown {
  complaintId: string;
  totalScore: number;
  tier: 'TIER_1_IMMEDIATE' | 'TIER_2_URGENT' | 'TIER_3_SCHEDULED' | 'TIER_4_MONITOR';
  factors: {
    severity: number;
    recurrenceDensity: number;
    timeUnresolved: number;
    infrastructureImpact: number;
    publicVulnerability: number;
  };
  recommendedAction: string;
  estimatedEffortHours: number;
}

export interface VisionDamageAssessment {
  id: string;
  analyzedAt: string;
  imageFileName: string;
  primaryDefect: 'Severe Pothole' | 'Alligator Cracking' | 'Transverse Pavement Crack' | 'Surface Spalling' | 'Normal Pavement' | string;
  severityLevel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  confidenceScore: number;
  damagedAreaPercentage: number;
  detectedContoursCount: number;
  surfaceRoughnessIndex: number;
  boundingBoxes: { x: number; y: number; width: number; height: number; label: string }[];
  humanReviewRequired: boolean;
  engineerNotes: string;
}

export interface ScenarioParameters {
  fleetCapacityMultiplier: number;
  badWeatherSurgeFactor: number;
  aiAutoTriageAdoptionRate: number;
  preventiveMaintenanceInvestmentUSD: number;
}

export interface ScenarioSimulationResult {
  scenarioName: string;
  projectedBacklogChangePercent: number;
  projectedAvgResolutionHours: number;
  slaBreachReductionPercent: number;
  estimatedCostSavingsUSD: number;
  workloadStressIndex: number;
  riskNotes: string[];
}

export interface MLForecastResult {
  points: ForecastPoint[];
  metrics: ModelMetrics;
  categoryTrends: { category: string; growthRate: number; trend: 'SURGING' | 'STABLE' | 'DECLINING' }[];
}

export interface ScoredComplaint {
  complaint: ComplaintRecord;
  compositeScore: number;
  breakdown: {
    severity: number;
    recurrence: number;
    timeUnresolved: number;
    infrastructure: number;
    vulnerability: number;
  };
  recommendedAction: string;
}

export interface RAGDocument {
  id: string;
  title: string;
  category: string;
  source: string;
  content: string;
  keywords: string[];
  lastUpdated: string;
}

export interface RAGSearchResult {
  document: RAGDocument;
  score: number;
  matchedSnippet: string;
}

export interface VisionAssessment {
  id: string;
  imageFileName: string;
  analyzedAt: string;
  primaryDefect: string;
  severityLevel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  confidenceScore: number;
  crackSeverityRatio: number;
  surfaceRoughnessIndex: number;
  estimatedPotholeVolumeLiters?: number;
  remediationGuidance: string;
  boundingBox: { x: number; y: number; width: number; height: number };
}

export interface ScenarioParams {
  scenarioName: string;
  fleetCapacityMultiplier: number;
  severeWeatherFactor: number;
  autoTriageRate: number;
  preventiveInvestmentUSD: number;
}

export interface SimulationResult {
  scenarioName: string;
  projectedBacklog: number;
  backlogShiftPercent: number;
  projectedResolutionTimeHours: number;
  estimatedCostSavingsUSD: number;
  workloadStressIndex: number;
  narrativeSummary: string;
}

export type UserRole =
  | 'PLATFORM_ADMIN'
  | 'OPERATIONS_DIRECTOR'
  | 'LEAD_ANALYST'
  | 'FIELD_DISPATCHER'
  | 'PUBLIC_AUDITOR';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userEmail: string;
  userName?: string;
  userRole: UserRole;
  action: string;
  module: string;
  entityType?: string;
  details: string;
  ipAddress?: string;
}

export interface FilterState {
  searchQuery: string;
  selectedCategories: ComplaintCategory[];
  selectedZones: string[];
  selectedStatuses: ComplaintStatus[];
  selectedPriorities: PriorityLevel[];
  dateRange: {
    start: string;
    end: string;
  };
}
