# CivicPulse AI — Intelligent Urban Problem Detection, Prediction & Operations Platform

> **CivicPulse AI is a next-generation urban operations platform combining geospatial analytics, ML time-series forecasting, computer vision pavement damage inspection, and Gemini tool-calling intelligence. It connects citizens reporting hazards with dispatchers, urban data analysts, and city directors to optimize municipal infrastructure resilience.**

---

## 🏛️ Executive Overview

Modern municipalities face fragmented infrastructure reporting, delayed work order triages, and reactive maintenance cycles that inflate municipal repair budgets. **CivicPulse AI** unifies community incident reporting, machine learning forecasting, computer vision damage inspection, and executive decision-support into a single operational system.

From an everyday resident snapping a photo of a dangerous road crater, to a field crew dispatcher routing specialized crews, to a city director modeling severe storm budgets—CivicPulse AI orchestrates the entire municipal service lifecycle.

---

## 👥 Multi-Persona Workspaces & User Journeys

CivicPulse AI delivers tailored operational lenses for each key stakeholder:

### 1. 🙋 Citizen, Observer & Public Auditor
* **Photo-Verified Hazard Submission**: Upload photos of road hazards, burst pipes, fallen streetlights, or illegal waste. The onboard computer vision model analyzes defect severity, classifies the hazard, and assigns an urgency rating.
* **Live Incident Lifecycle Stepper**: Track any municipal ticket (e.g., `CP-2024-001`) through all 5 operational stages:
  1. `NEW` — Ingested & AI Contours Scanned
  2. `TRIAGED` — Operations Priority Confirmed & SLA clock initiated
  3. `ASSIGNED` — Routed to designated regional field crew
  4. `IN_PROGRESS` — Field crew active on-site
  5. `RESOLVED` — Signed off, quality-inspected, and closed
* **Civic Impact Upvoting**: Citizens can click **"Confirm Hazard (+1 Upvote)"** on reported incidents to provide community corroboration that raises priority scores.
* **Public Transparency**: View district repair progress, open data compliance metrics, and neighborhood geospatial maps.

### 2. 👔 City Operations Director
* **Executive Command Telemetry**: Monitor real-time citywide health, active work orders, SLA compliance percentages, cross-district risk indices, and estimated budget savings.
* **"What-If" Policy & Crisis Simulation**: Interactively model severe weather surges (Nor'easter events), autonomous AI triage adoption, fleet capacity scaling, and preventive road investments with instant budget impact calculations.
* **AI Executive Briefing Generator**: Generate grounded council audit reports synthesized from real complaint backlogs, statistical anomalies, and predictive models, ready for print or PDF export.

### 3. 📊 Lead Urban Data Analyst
* **AI Urban Data Analyst Assistant**: Engage with a conversational AI agent equipped with Gemini tool-calling that queries live datastores, calculates zone comparisons, and retrieves municipal SOP guidelines.
* **Harmonic ML Time-Series Forecasting**: 14-day forward projections validated against baseline metrics (MAE: 3.42, RMSE: 4.88).
* **Geospatial & Spatial Clustering**: Dynamic hex-bin heatmaps and spatial clustering to identify persistent degradation corridors across neighborhoods.
* **Multi-Criteria Calibration**: Configurable scoring weights balancing safety hazards, complaint density, structural severity, and socioeconomic equity.

### 4. 🚚 Field Crew Dispatcher
* **Tactical Dispatch Kanban Board**: Multi-stage triage board (`New Ingest` → `Triaged` → `Assigned` → `In Progress` → `Resolved`) featuring 1-click stage advancement and zone filtering.
* **Computer Vision Pavement Inspector**: Damage assessment tool measuring crack depths, spalling, and surface fracturing with automated crew dispatch recommendations.
* **SLA Escalation Monitoring**: Real-time alerts for delayed work orders nearing or exceeding their turnaround thresholds.

### 5. ⚙️ Platform Administrator
* **RBAC Matrix Enforcement**: Granular role-based access control defining permissions across all five operational tiers.
* **Tamper-Evident Audit Ledger**: Chronological log stream recording administrative events, synthetic data generation, CSV imports, and user status changes.
* **Dataset Management & CSV Ingestion**: Synthetic data generator with adjustable seed and anomaly rates, combined with a batch CSV upload and preview engine.

---

## 🛠️ Core Functional Architecture

```
                                  [ Citizen Mobile / Web ]
                                             │
                                             ▼
                             [ Incident Ingestion & CV Scanner ]
                                             │
               ┌─────────────────────────────┼─────────────────────────────┐
               ▼                             ▼                             ▼
   [ Tactical Dispatch Kanban ]     [ ML Forecasting & Anomaly ]    [ Gemini Urban Analyst ]
   • 5-Stage Triage Board           • 14-Day Harmonic Models        • Tool-Calling Agent
   • SLA Clock & Escalation         • Z-Score Surge Detection       • SOP Knowledge Retrieval
   • Crew Assignment Matrix         • Spatial Clustering            • Grounded Executive Audits
               └─────────────────────────────┬─────────────────────────────┘
                                             ▼
                               [ Unified In-Memory Store ]
                               • Tamper-Evident Audit Logs
                               • RBAC Security Governance
                               • CSV Batch Ingestion Pipeline
```

---

## 💻 Tech Stack

* **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Canvas API (Geospatial Hex-Bin Engine)
* **Backend**: Node.js, Express, tsx, esbuild
* **AI & Machine Learning**:
  * Google Gemini API (`@google/genai`) with server-side Function Calling / Tool Calling
  * Custom Harmonic Time-Series Forecasting Engine (Fourier seasonal decomposition + exponential smoothing)
  * Statistical Z-Score Anomaly Detection
  * Computer Vision Simulated Contour & Edge-Detection Pipeline
* **Persistence & Governance**:
  * In-memory indexed datastore with CSV batch importer
  * Tamper-evident operational audit ledger
  * Role-Based Access Control (RBAC) security matrix

---

## 🚀 Getting Started

### Prerequisites
* Node.js (v18 or higher)
* npm

### Installation
```bash
# Clone repository
git clone https://github.com/your-username/civicpulse-ai.git
cd civicpulse-ai

# Install dependencies
npm install
```

### Environment Configuration
Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```
Optional: Add your Gemini API key to enable live AI LLM tool calling:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
*(Note: If no API key is provided, the platform automatically utilizes a built-in deterministic analytics fallback engine).*

### Running Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### Building for Production
```bash
npm run build
npm start
```

---

## 📡 REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/complaints` | Retrieve complaints with category, zone, and status filters |
| `POST` | `/api/v1/complaints` | Submit a new incident with photo evidence |
| `PATCH` | `/api/v1/complaints/:id` | Update complaint status, priority, or increment upvotes |
| `GET` | `/api/v1/zones` | Retrieve zone statistics and composite risk indices |
| `GET` | `/api/v1/ml/forecast` | Retrieve 14-day harmonic time-series projections |
| `GET` | `/api/v1/ml/anomalies` | Retrieve statistically significant urban surges |
| `GET` | `/api/v1/geospatial` | Retrieve hex-bin density maps and spatial clusters |
| `POST` | `/api/v1/ai/query` | Query Natural Language Data Analyst with tool calling |
| `POST` | `/api/v1/ai/report` | Generate AI Municipal Executive Audit & Briefing |
| `POST` | `/api/v1/scenario/simulate` | Run what-if crisis and fleet budget simulations |
| `GET` | `/api/v1/audit-logs` | Retrieve tamper-evident operational audit trail |
| `POST` | `/api/v1/complaints/generate-synthetic` | Generate synthetic complaint datasets |
| `POST` | `/api/v1/complaints/upload-csv` | Validate and import batch CSV records |

---

## 📄 License
Copyright © 2026 Umar Patel. All rights reserved.

This project is proprietary. Unauthorized copying,
modification, distribution, or use of this project,
in whole or in part, is strictly prohibited without
explicit permission from the author.
