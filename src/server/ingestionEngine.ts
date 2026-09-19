import { ComplaintRecord, ComplaintCategory, ComplaintStatus, PriorityLevel } from '../types';

export interface IngestionPreview {
  fileName: string;
  totalRowsDetected: number;
  validRowsCount: number;
  invalidRowsCount: number;
  detectedColumns: string[];
  columnMapping: Record<string, string>;
  missingValuesReport: Record<string, number>;
  sampleParsedRecords: ComplaintRecord[];
  dataQualityScore: number;
  warnings: string[];
}

export class DataIngestionEngine {
  public static parseCSV(csvText: string, fileName: string = 'upload.csv'): IngestionPreview {
    const lines = csvText.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) {
      throw new Error('CSV file contains insufficient rows (header + at least 1 record required).');
    }

    const header = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
    const rows = lines.slice(1);

    // Schema detection
    const mapping: Record<string, string> = {};
    const lowerHeaders = header.map(h => h.toLowerCase());

    const findMatch = (candidates: string[]) => {
      for (const c of candidates) {
        const idx = lowerHeaders.findIndex(h => h.includes(c));
        if (idx !== -1) return header[idx];
      }
      return null;
    };

    mapping['id'] = findMatch(['id', 'tracking', 'case', 'ticket', 'complaint_id']) || header[0];
    mapping['category'] = findMatch(['category', 'type', 'issue', 'complaint_type']) || 'category';
    mapping['title'] = findMatch(['title', 'summary', 'headline', 'subject']) || 'title';
    mapping['description'] = findMatch(['description', 'details', 'comment', 'notes']) || 'description';
    mapping['lat'] = findMatch(['lat', 'latitude', 'y']) || 'lat';
    mapping['lng'] = findMatch(['lng', 'lon', 'longitude', 'x']) || 'lng';
    mapping['address'] = findMatch(['address', 'location', 'street']) || 'address';
    mapping['zone'] = findMatch(['zone', 'district', 'borough', 'ward', 'neighborhood']) || 'zone';
    mapping['priority'] = findMatch(['priority', 'severity', 'urgency']) || 'priority';
    mapping['status'] = findMatch(['status', 'state']) || 'status';
    mapping['created_at'] = findMatch(['created', 'date', 'timestamp', 'opened']) || 'created_at';

    const missingValuesReport: Record<string, number> = {};
    for (const h of header) {
      missingValuesReport[h] = 0;
    }

    const sampleParsedRecords: ComplaintRecord[] = [];
    let validRows = 0;
    let invalidRows = 0;
    const warnings: string[] = [];

    const idIdx = header.indexOf(mapping['id']);
    const catIdx = header.indexOf(mapping['category']);
    const titleIdx = header.indexOf(mapping['title']);
    const descIdx = header.indexOf(mapping['description']);
    const latIdx = header.indexOf(mapping['lat']);
    const lngIdx = header.indexOf(mapping['lng']);
    const addrIdx = header.indexOf(mapping['address']);
    const zoneIdx = header.indexOf(mapping['zone']);
    const priorityIdx = header.indexOf(mapping['priority']);
    const statusIdx = header.indexOf(mapping['status']);
    const dateIdx = header.indexOf(mapping['created_at']);

    for (let r = 0; r < rows.length; r++) {
      // Split with quotes support
      const rowTokens = rows[r].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || rows[r].split(',');
      const cleanTokens = rowTokens.map(t => t.trim().replace(/^["']|["']$/g, ''));

      for (let c = 0; c < header.length; c++) {
        if (!cleanTokens[c] || cleanTokens[c].trim() === '') {
          missingValuesReport[header[c]] = (missingValuesReport[header[c]] || 0) + 1;
        }
      }

      // Check lat/lng
      let lat = latIdx !== -1 ? parseFloat(cleanTokens[latIdx]) : NaN;
      let lng = lngIdx !== -1 ? parseFloat(cleanTokens[lngIdx]) : NaN;

      if (isNaN(lat) || isNaN(lng)) {
        // Approximate to default zone
        lat = 40.75 + (Math.random() - 0.5) * 0.05;
        lng = -73.98 + (Math.random() - 0.5) * 0.05;
      }

      const rawCat = catIdx !== -1 ? cleanTokens[catIdx] : 'General Infrastructure';
      let category: ComplaintCategory = 'Potholes & Pavement Cracks';
      if (rawCat.toLowerCase().includes('water') || rawCat.toLowerCase().includes('drain')) category = 'Water Main & Drainage';
      else if (rawCat.toLowerCase().includes('light') || rawCat.toLowerCase().includes('electric')) category = 'Streetlight & Electrical';
      else if (rawCat.toLowerCase().includes('dump') || rawCat.toLowerCase().includes('trash') || rawCat.toLowerCase().includes('waste')) category = 'Illegal Dumping & Waste';
      else if (rawCat.toLowerCase().includes('traffic') || rawCat.toLowerCase().includes('signal')) category = 'Traffic Signal Outage';
      else if (rawCat.toLowerCase().includes('noise') || rawCat.toLowerCase().includes('sound')) category = 'Noise & Public Nuisance';
      else if (rawCat.toLowerCase().includes('sidewalk') || rawCat.toLowerCase().includes('hazard')) category = 'Structural Hazard & Sidewalk';

      const title = titleIdx !== -1 && cleanTokens[titleIdx] ? cleanTokens[titleIdx] : `${category} Incident Report`;
      const description = descIdx !== -1 && cleanTokens[descIdx] ? cleanTokens[descIdx] : title;
      const zone = zoneIdx !== -1 && cleanTokens[zoneIdx] ? cleanTokens[zoneIdx] : 'Downtown North';
      const address = addrIdx !== -1 && cleanTokens[addrIdx] ? cleanTokens[addrIdx] : `Ward Location, ${zone}`;

      const rawPriority = priorityIdx !== -1 ? cleanTokens[priorityIdx]?.toUpperCase() : 'MEDIUM';
      const priority: PriorityLevel = ['CRITICAL', 'HIGH', 'LOW'].includes(rawPriority) ? rawPriority as PriorityLevel : 'MEDIUM';

      const rawStatus = statusIdx !== -1 ? cleanTokens[statusIdx]?.toUpperCase() : 'NEW';
      const status: ComplaintStatus = ['RESOLVED', 'IN_PROGRESS', 'ASSIGNED', 'TRIAGED', 'CLOSED'].includes(rawStatus) ? rawStatus as ComplaintStatus : 'NEW';

      const createdAt = dateIdx !== -1 && cleanTokens[dateIdx] && !isNaN(Date.parse(cleanTokens[dateIdx]))
        ? new Date(cleanTokens[dateIdx]).toISOString()
        : new Date(Date.now() - r * 3600000).toISOString();

      validRows++;

      if (sampleParsedRecords.length < 50) {
        sampleParsedRecords.push({
          id: `imp-${r + 1}`,
          trackingNumber: `IMP-${new Date(createdAt).getFullYear()}-${String(r + 1).padStart(5, '0')}`,
          category,
          subcategory: 'Imported Field Observation',
          title,
          description,
          createdAt,
          updatedAt: createdAt,
          resolvedAt: status === 'RESOLVED' ? new Date().toISOString() : null,
          status,
          priority,
          location: {
            lat: Math.round(lat * 100000) / 100000,
            lng: Math.round(lng * 100000) / 100000,
            address,
            zone,
            districtId: 'ZONE-IMP',
          },
          sourceChannel: 'WEB_PORTAL',
          reporterType: 'CITIZEN',
          daysOpen: Math.round((Date.now() - new Date(createdAt).getTime()) / 86400000 * 10) / 10,
          slaBreached: false,
          slaTargetHours: 72,
          upvotes: 0,
          sentimentScore: -0.4,
          urgencyScore: 60,
          tags: ['imported_batch', 'csv_upload'],
        });
      }
    }

    const totalMissing = Object.values(missingValuesReport).reduce((a, b) => a + b, 0);
    const totalCells = header.length * rows.length;
    const completeness = totalCells > 0 ? (1 - (totalMissing / totalCells)) : 1;
    const dataQualityScore = Math.round(completeness * 1000) / 10;

    if (totalMissing > 0) {
      warnings.push(`Detected ${totalMissing} empty or unformatted cells across ${rows.length} rows; default values assigned.`);
    }

    return {
      fileName,
      totalRowsDetected: rows.length,
      validRowsCount: validRows,
      invalidRowsCount: invalidRows,
      detectedColumns: header,
      columnMapping: mapping,
      missingValuesReport,
      sampleParsedRecords,
      dataQualityScore,
      warnings,
    };
  }
}
