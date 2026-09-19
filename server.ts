import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { UrbanDataStore } from './src/server/dataStore';
import { generateSyntheticDataset } from './src/server/syntheticEngine';
import { GeospatialEngine } from './src/server/geospatialEngine';
import { MLForecastingEngine } from './src/server/mlForecastingEngine';
import { AnomalyDetectionEngine } from './src/server/anomalyEngine';
import { PrioritizationEngine } from './src/server/prioritizationEngine';
import { NLPEngine } from './src/server/nlpEngine';
import { VisionEngine } from './src/server/visionEngine';
import { ScenarioEngine } from './src/server/scenarioEngine';
import { RAGEngine } from './src/server/ragEngine';
import { GeminiUrbanService } from './src/server/geminiService';
import { DataIngestionEngine } from './src/server/ingestionEngine';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // Initialize DataStore with realistic urban complaint stream
  const store = UrbanDataStore.getInstance();
  const initialRecords = generateSyntheticDataset({ count: 480, seed: 42, anomalyRate: 0.05 });
  store.setComplaints(initialRecords, true);

  console.log(`[CivicPulse AI] DataStore initialized with ${initialRecords.length} records across ${store.zones.length} zones.`);

  // ==========================================
  // API ROUTES (/api/v1/*)
  // ==========================================

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/api/v1/health', (req, res) => {
    res.json({
      status: 'OPERATIONAL',
      platform: 'CivicPulse AI Urban Intelligence Engine',
      version: '2.6.4-prod',
      timestamp: new Date().toISOString(),
      datasetRecords: store.complaints.length,
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
      activeZones: store.zones.length,
    });
  });

  // Metadata
  app.get('/api/v1/metadata', (req, res) => {
    res.json(store.datasetMetadata);
  });

  // Complaints query & pagination
  app.get('/api/v1/complaints', (req, res) => {
    let list = [...store.complaints];
    const { category, zone, status, priority, search, page = '1', limit = '25', sort = 'date_desc' } = req.query;

    if (category) {
      const cats = Array.isArray(category) ? category : [category];
      list = list.filter(c => cats.includes(c.category));
    }
    if (zone) {
      const zones = Array.isArray(zone) ? zone : [zone];
      list = list.filter(c => zones.includes(c.location.zone));
    }
    if (status) {
      const statuses = Array.isArray(status) ? status : [status];
      list = list.filter(c => statuses.includes(c.status));
    }
    if (priority) {
      const priorities = Array.isArray(priority) ? priority : [priority];
      list = list.filter(c => priorities.includes(c.priority));
    }
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.location.address.toLowerCase().includes(q) ||
        c.trackingNumber.toLowerCase().includes(q) ||
        c.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // Sort
    if (sort === 'date_asc') {
      list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sort === 'urgency_desc') {
      list.sort((a, b) => b.urgencyScore - a.urgencyScore);
    } else if (sort === 'days_desc') {
      list.sort((a, b) => b.daysOpen - a.daysOpen);
    } else {
      // date_desc
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const pageNum = Math.max(1, parseInt(String(page)) || 1);
    const pageSize = Math.max(1, Math.min(100, parseInt(String(limit)) || 25));
    const total = list.length;
    const startIndex = (pageNum - 1) * pageSize;
    const items = list.slice(startIndex, startIndex + pageSize);

    res.json({
      items,
      pagination: {
        page: pageNum,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  });

  // Complaint statistics
  app.get('/api/v1/complaints/stats', (req, res) => {
    const list = store.complaints;
    const total = list.length;
    let active = 0;
    let resolved = 0;
    let critical = 0;
    let slaBreached = 0;
    let totalResolutionHours = 0;
    let countResolutionHours = 0;

    const categoryBreakdown: Record<string, number> = {};
    const zoneBreakdown: Record<string, { active: number; total: number }> = {};
    const statusBreakdown: Record<string, number> = {};
    const priorityBreakdown: Record<string, number> = {};

    for (const c of list) {
      if (c.status === 'RESOLVED' || c.status === 'CLOSED') {
        resolved++;
        if (c.actualResolutionHours) {
          totalResolutionHours += c.actualResolutionHours;
          countResolutionHours++;
        }
      } else {
        active++;
      }

      if (c.priority === 'CRITICAL') critical++;
      if (c.slaBreached) slaBreached++;

      categoryBreakdown[c.category] = (categoryBreakdown[c.category] || 0) + 1;
      statusBreakdown[c.status] = (statusBreakdown[c.status] || 0) + 1;
      priorityBreakdown[c.priority] = (priorityBreakdown[c.priority] || 0) + 1;

      if (!zoneBreakdown[c.location.zone]) {
        zoneBreakdown[c.location.zone] = { active: 0, total: 0 };
      }
      zoneBreakdown[c.location.zone].total++;
      if (c.status !== 'RESOLVED' && c.status !== 'CLOSED') {
        zoneBreakdown[c.location.zone].active++;
      }
    }

    const avgResolutionHours = countResolutionHours > 0
      ? Math.round((totalResolutionHours / countResolutionHours) * 10) / 10
      : 32.4;

    const slaComplianceRate = total > 0
      ? Math.round(((total - slaBreached) / total) * 1000) / 10
      : 84.5;

    res.json({
      total,
      active,
      resolved,
      critical,
      slaBreached,
      avgResolutionHours,
      slaComplianceRate,
      categoryBreakdown,
      zoneBreakdown,
      statusBreakdown,
      priorityBreakdown,
      zones: store.zones,
    });
  });

  // Create single complaint
  app.post('/api/v1/complaints', (req, res) => {
    try {
      const data = req.body;
      const nlp = NLPEngine.classifyText(`${data.title || ''} ${data.description || ''}`);

      const record = {
        id: `rec-${Date.now()}`,
        trackingNumber: `CP-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000 + 10000)}`,
        category: data.category || nlp.predictedCategory,
        subcategory: data.subcategory || 'Citizen Field Report',
        title: data.title || 'Reported Urban Incident',
        description: data.description || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'NEW' as const,
        priority: data.priority || (nlp.urgencyScore > 80 ? 'CRITICAL' : 'MEDIUM'),
        location: {
          lat: parseFloat(data.lat) || 40.7589,
          lng: parseFloat(data.lng) || -73.9851,
          address: data.address || 'Reported Location',
          zone: data.zone || 'Downtown North',
          districtId: data.zone === 'Downtown North' ? 'ZONE-DN' : data.zone === 'South Quarter' ? 'ZONE-SQ' : data.zone === 'Industrial Heights' ? 'ZONE-IH' : data.zone === 'River District' ? 'ZONE-RD' : 'ZONE-ME',
        },
        sourceChannel: data.sourceChannel || 'MOBILE_APP',
        reporterType: data.reporterType || 'CITIZEN',
        daysOpen: 0.05,
        slaBreached: false,
        slaTargetHours: data.priority === 'CRITICAL' ? 12 : data.priority === 'HIGH' ? 24 : 72,
        upvotes: 1,
        sentimentScore: data.sentimentScore ?? -0.65,
        urgencyScore: data.urgencyScore || nlp.urgencyScore || 75,
        tags: data.tags && data.tags.length > 0 ? data.tags : nlp.topKeywords,
        imageUrl: data.imageUrl,
        assignedTeam: data.assignedTeam || (
          data.zone === 'Downtown North' ? 'Crew DN-1 (Rapid Asphalt & Electric)' :
          data.zone === 'South Quarter' ? 'Crew SQ-2 (Sanitation & Storm Drainage)' :
          data.zone === 'Industrial Heights' ? 'Crew IH-1 (Heavy Civil Infrastructure)' :
          data.zone === 'River District' ? 'Crew RD-3 (Hydraulics & Water Works)' :
          'Crew ME-2 (Metropolitan Rapid Response)'
        ),
        estimatedRepairCostUSD: data.estimatedRepairCostUSD || (data.priority === 'CRITICAL' ? 2450 : 850),
      };

      store.addComplaint(record);
      store.recordAuditLog('CREATE_COMPLAINT', 'FIELD_DISPATCHER', `Created ticket ${record.trackingNumber} (${record.category}) in ${record.location.zone}`, 'Complaints');

      res.status(201).json(record);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Update complaint
  app.patch('/api/v1/complaints/:id', (req, res) => {
    const updated = store.updateComplaint(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Complaint not found' });
    }
    store.recordAuditLog('UPDATE_COMPLAINT', 'OPERATIONS_DIRECTOR', `Updated ticket ${updated.trackingNumber} status to ${updated.status}`, 'Complaints');
    res.json(updated);
  });

  // Generate synthetic dataset
  app.post('/api/v1/complaints/generate-synthetic', (req, res) => {
    const { count = 500, seed = Date.now(), anomalyRate = 0.06 } = req.body;
    const generated = generateSyntheticDataset({
      count: Math.min(2000, Math.max(50, parseInt(count))),
      seed: parseInt(seed),
      anomalyRate: parseFloat(anomalyRate),
    });

    store.setComplaints(generated, true);
    store.recordAuditLog('GENERATE_SYNTHETIC', 'PLATFORM_ADMIN', `Generated ${generated.length} synthetic records (seed=${seed}, anomalyRate=${anomalyRate})`, 'SyntheticEngine');

    res.json({
      message: 'Synthetic dataset generated and loaded into active store.',
      recordsGenerated: generated.length,
      metadata: store.datasetMetadata,
    });
  });

  // CSV Upload & Preview / Commit
  app.post('/api/v1/complaints/upload-csv', (req, res) => {
    try {
      const { csvText, fileName = 'upload.csv', commit = false } = req.body;
      if (!csvText) {
        return res.status(400).json({ error: 'csvText is required' });
      }

      const preview = DataIngestionEngine.parseCSV(csvText, fileName);

      if (commit && preview.sampleParsedRecords.length > 0) {
        // Merge or replace
        for (const rec of preview.sampleParsedRecords) {
          store.addComplaint(rec);
        }
        store.recordAuditLog('IMPORT_CSV', 'LEAD_ANALYST', `Imported ${preview.validRowsCount} rows from ${fileName}`, 'IngestionEngine');
      }

      res.json(preview);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Geospatial intelligence
  app.get('/api/v1/geospatial', (req, res) => {
    const hexBins = GeospatialEngine.computeHexBins(store.complaints);
    const clusters = GeospatialEngine.computeSpatialClusters(store.complaints);
    res.json({
      zones: store.zones,
      hexBins: hexBins.slice(0, 150),
      clusters: clusters.slice(0, 20),
    });
  });

  // ML forecasting
  app.get('/api/v1/ml/forecast', (req, res) => {
    const horizon = parseInt(String(req.query.horizon || '14')) || 14;
    const forecast = MLForecastingEngine.generateForecast(store.complaints, horizon);
    res.json(forecast);
  });

  // Anomaly detection
  app.get('/api/v1/ml/anomalies', (req, res) => {
    const anomalies = AnomalyDetectionEngine.detectAnomalies(store.complaints);
    res.json(anomalies);
  });

  // Prioritization decision support
  app.get('/api/v1/ml/prioritization', (req, res) => {
    const active = store.complaints.filter(c => c.status !== 'RESOLVED' && c.status !== 'CLOSED');
    const scored = PrioritizationEngine.scoreComplaints(active, store.prioritizationWeights);
    res.json({
      weights: store.prioritizationWeights,
      scoredComplaints: scored.slice(0, 100),
      totalActive: active.length,
    });
  });

  app.post('/api/v1/ml/prioritization/weights', (req, res) => {
    const newWeights = req.body;
    store.prioritizationWeights = {
      ...store.prioritizationWeights,
      ...newWeights,
    };
    store.recordAuditLog('UPDATE_WEIGHTS', 'OPERATIONS_DIRECTOR', `Updated multi-criteria prioritization weights`, 'PrioritizationEngine');
    res.json({ weights: store.prioritizationWeights });
  });

  // NLP text analysis
  app.post('/api/v1/nlp/classify', (req, res) => {
    const { text = '' } = req.body;
    const result = NLPEngine.classifyText(text);
    res.json(result);
  });

  app.post('/api/v1/nlp/duplicates', (req, res) => {
    const { complaintId } = req.body;
    const target = store.complaints.find(c => c.id === complaintId);
    if (!target) {
      return res.status(404).json({ error: 'Complaint not found' });
    }
    const matches = NLPEngine.findDuplicates(target, store.complaints);
    res.json({ targetId: complaintId, matches });
  });

  // Vision inspection
  app.post('/api/v1/vision/analyze', (req, res) => {
    const { imageName = 'pothole-sample-1.jpg', category } = req.body;
    const assessment = VisionEngine.analyzePavementImage(imageName, { category });
    store.recordAuditLog('VISION_INSPECT', 'FIELD_DISPATCHER', `Executed CV crack/pothole assessment on ${imageName}: ${assessment.primaryDefect} (${assessment.severityLevel})`, 'VisionEngine');
    res.json(assessment);
  });

  // Scenario simulation
  app.post('/api/v1/scenario/simulate', (req, res) => {
    const params = req.body;
    const activeCount = store.complaints.filter(c => c.status !== 'RESOLVED' && c.status !== 'CLOSED').length;
    const simulation = ScenarioEngine.runSimulation(params, activeCount, 32.5);
    store.recordAuditLog('RUN_SIMULATION', 'LEAD_ANALYST', `Ran scenario simulation: ${simulation.scenarioName} (Cost saving: $${simulation.estimatedCostSavingsUSD.toLocaleString()})`, 'ScenarioEngine');
    res.json(simulation);
  });

  // RAG knowledge base
  app.get('/api/v1/rag/search', (req, res) => {
    const query = String(req.query.q || '');
    const results = RAGEngine.searchKnowledgeBase(query);
    res.json(results);
  });

  // Natural Language Data Analyst with Gemini tool calling
  app.post('/api/v1/ai/query', async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'prompt is required' });
      }
      const answer = await GeminiUrbanService.queryAnalyst(prompt);
      store.recordAuditLog('AI_QUERY', 'LEAD_ANALYST', `Executed Natural Language Analyst query: "${prompt.slice(0, 60)}..."`, 'GeminiUrbanService');
      res.json(answer);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // AI Executive Report Generator
  app.post('/api/v1/ai/report', async (req, res) => {
    try {
      const { zone } = req.body;
      const report = await GeminiUrbanService.generateReport(zone);
      store.recordAuditLog('GENERATE_REPORT', 'OPERATIONS_DIRECTOR', `Generated AI Municipal Executive Audit Report`, 'GeminiUrbanService');
      res.json(report);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Audit logs
  app.get('/api/v1/audit-logs', (req, res) => {
    res.json(store.auditLogs);
  });

  // ==========================================
  // VITE MIDDLEWARE OR STATIC SERVING
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CivicPulse AI Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
