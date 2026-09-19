export interface KnowledgeDocument {
  id: string;
  title: string;
  category: string;
  source: string;
  content: string;
  tags: string[];
}

export const URBAN_KNOWLEDGE_BASE: KnowledgeDocument[] = [
  {
    id: 'DOC-SOP-01',
    title: 'Standard Operating Procedure: Pothole & Road Surface Remediation',
    category: 'Pavement & Roadway',
    source: 'Department of Transportation Urban Operations Manual §4.2',
    content: `Classification of Pavement Failures:
1. Potholes greater than 50mm (2 inches) depth on designated Arterials or Transit Corridors mandate Tier 1 Emergency Dispatch within 12 hours.
2. Cold-pour asphalt mastic is authorized for temporary emergency winter stabilization (air temperature < 4°C).
3. Permanent repairs require hot-mix asphalt (HMA) square-cut edge tacking with infrared joint sealing.
4. If water ponding is observed in adjacent catch basin within 15 meters, the drainage division must be cross-notified prior to closing the work order.`,
    tags: ['pothole', 'asphalt', 'hma', 'remediation', 'sla', 'arterial']
  },
  {
    id: 'DOC-SOP-02',
    title: 'Water Main Break and Subterranean Leak Response Protocol',
    category: 'Water & Utilities',
    source: 'Bureau of Water & Sewer Emergency Response Guidelines Rev 3.1',
    content: `Water Main Breach Levels:
- Level A (Catastrophic): Visible cratering, foundation undermining, or loss of municipal system pressure < 20 PSI. Immediate valve isolation by first arriving district utility crew.
- Level B (Pressurized Seep): Potable water surfacing through asphalt joint without structural cavitation. Target isolation within 4 hours; repair within 24 hours.
- Environmental Safeguard: Silt containment fences must be placed around downstream storm grates to prevent chlorinated water effluent from entering natural watercourses.`,
    tags: ['water', 'leak', 'main', 'drainage', 'sewer', 'psi', 'emergency']
  },
  {
    id: 'DOC-SOP-03',
    title: 'Traffic Signal Controller Cabinet Fail-Safe and Outage Standard',
    category: 'Traffic & Signals',
    source: 'Traffic Engineering Bureau Field Manual Art. VII',
    content: `Conflict Monitor Interlock Protocol:
- If a signal controller experiences conflicting green outputs, the Malfunction Management Unit (MMU) automatically reverts the intersection to an all-way flashing red configuration.
- Total signal power outage (dark intersection) mandates immediate dispatch of emergency stop signs and notification of municipal traffic police within 15 minutes.
- Inductive vehicle loop detector failures should be placed in soft-recall mode to ensure cross-traffic receives minimum cycle progression.`,
    tags: ['traffic', 'signal', 'intersection', 'mmu', 'blackout', 'controller']
  },
  {
    id: 'DOC-SOP-04',
    title: 'Municipal Solid Waste & Hazardous Illegal Dumping Enforcement',
    category: 'Sanitation & Environment',
    source: 'Department of Sanitation Code Enforcement Manual §19-102',
    content: `Hazardous Waste Screening:
- Any abandoned drum, chemical tote, or unmarked pressurized cylinder must be treated as hazardous until inspected by hazardous materials (HAZMAT) personnel. Do NOT move with standard compactor equipment.
- Construction and Demolition (C&D) debris in excess of 1 cubic yard triggers commercial code violation investigation with drone aerial imagery documentation.
- Mattress and soft bulky furniture disposal must follow vector-control plastic wrapping protocols prior to transfer station entry.`,
    tags: ['dumping', 'waste', 'trash', 'hazardous', 'hazmat', 'rubble']
  },
  {
    id: 'DOC-SOP-05',
    title: 'Municipal Environmental Noise Code & Acoustic Variance Guidelines',
    category: 'Environmental Acoustics',
    source: 'City Environmental Protection Code Title 24 Chapter 2',
    content: `Decibel Limits & Curfews:
- Continuous commercial HVAC / chiller noise measured at residential property boundary must not exceed 45 dB(A) between 22:00 and 07:00, and 55 dB(A) daytime.
- Low-frequency pure tone resonance (rumble) carries a 5 dB penalty due to enhanced indoor sleep disturbance.
- Emergency utility excavation is exempt from nighttime curfew provided a formal emergency permit declaration is filed within 24 hours of dispatch.`,
    tags: ['noise', 'decibels', 'hvac', 'chiller', 'curfew', 'nuisance']
  },
  {
    id: 'DOC-SOP-06',
    title: 'Sidewalk Concrete Maintenance and ADA Accessibility Standards',
    category: 'Pedestrian Infrastructure',
    source: 'Public Works Division Sidewalk Inspection & Repair Manual §12',
    content: `Vertical Displacement Thresholds:
- Any vertical step or fault exceeding 6mm (1/4 inch) constitutes an ADA trip hazard.
- Vertical faults between 6mm and 13mm may be beveled with horizontal concrete grinding at a slope no steeper than 1:2.
- Vertical faults exceeding 13mm (1/2 inch) require full panel demolition and concrete replacement with non-slip broom finish.`,
    tags: ['sidewalk', 'concrete', 'ada', 'trip hazard', 'accessibility']
  }
];

export class RAGEngine {
  public static searchKnowledgeBase(query: string, maxResults: number = 3): {
    document: KnowledgeDocument;
    score: number;
    matchedSnippet: string;
  }[] {
    const qTokens = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const results: { document: KnowledgeDocument; score: number; matchedSnippet: string }[] = [];

    for (const doc of URBAN_KNOWLEDGE_BASE) {
      let score = 0;
      const lowerTitle = doc.title.toLowerCase();
      const lowerContent = doc.content.toLowerCase();

      for (const t of qTokens) {
        if (lowerTitle.includes(t)) score += 4.0;
        if (doc.tags.some(tag => tag.includes(t))) score += 3.0;
        if (lowerContent.includes(t)) score += 1.5;
      }

      if (score > 0) {
        // Extract most relevant excerpt
        const lines = doc.content.split('\n');
        let bestLine = lines[0];
        let maxLineScore = 0;
        for (const line of lines) {
          let lScore = 0;
          for (const t of qTokens) {
            if (line.toLowerCase().includes(t)) lScore++;
          }
          if (lScore > maxLineScore) {
            maxLineScore = lScore;
            bestLine = line;
          }
        }

        results.push({
          document: doc,
          score: Math.round(score * 10) / 10,
          matchedSnippet: bestLine.trim(),
        });
      }
    }

    return results.sort((a, b) => b.score - a.score).slice(0, maxResults);
  }
}
