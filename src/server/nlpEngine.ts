import { ComplaintRecord, ComplaintCategory } from '../types';

export class NLPEngine {
  private static STOP_WORDS = new Set([
    'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'in', 'for', 'to', 'of', 'with', 'by',
    'it', 'this', 'that', 'from', 'as', 'be', 'are', 'was', 'were', 'been', 'there', 'has', 'have',
    'very', 'near', 'causing', 'reported', 'please', 'we', 'they', 'our', 'all'
  ]);

  /**
   * Tokenizes text into lowercase cleaned stems/tokens
   */
  public static tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !NLPEngine.STOP_WORDS.has(w));
  }

  /**
   * Calculates Jaccard similarity between two token arrays
   */
  public static tokenJaccard(tokensA: string[], tokensB: string[]): number {
    const setA = new Set(tokensA);
    const setB = new Set(tokensB);
    if (setA.size === 0 && setB.size === 0) return 1;
    let intersection = 0;
    for (const t of setA) {
      if (setB.has(t)) intersection++;
    }
    const union = setA.size + setB.size - intersection;
    return union === 0 ? 0 : intersection / union;
  }

  /**
   * Fast Levenshtein distance for strings
   */
  public static levenshteinSimilarity(s1: string, s2: string): number {
    const longer = s1.length >= s2.length ? s1 : s2;
    const shorter = s1.length < s2.length ? s1 : s2;
    if (longer.length === 0) return 1.0;

    const costs: number[] = [];
    for (let i = 0; i <= longer.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= shorter.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (longer.charAt(i - 1) !== shorter.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[shorter.length] = lastValue;
    }
    return (longer.length - costs[shorter.length]) / longer.length;
  }

  /**
   * Classify category from raw text description using keyword frequency and weights
   */
  public static classifyText(text: string): {
    predictedCategory: ComplaintCategory;
    confidence: number;
    topKeywords: string[];
    urgencyScore: number;
    entities: { type: string; value: string }[];
  } {
    const tokens = NLPEngine.tokenize(text);
    const lower = text.toLowerCase();

    const categoryKeywords: Record<ComplaintCategory, string[]> = {
      'Potholes & Pavement Cracks': ['pothole', 'asphalt', 'crater', 'pavement', 'tire', 'trench', 'cracks', 'road', 'curb', 'fissure'],
      'Water Main & Drainage': ['water', 'drain', 'flood', 'sewer', 'pipe', 'leak', 'catch basin', 'bubbling', 'pressure', 'storm', 'gutter'],
      'Streetlight & Electrical': ['streetlight', 'light', 'lamp', 'dark', 'conduit', 'wire', 'luminaire', 'strobe', 'flicker', 'pole', 'electric'],
      'Illegal Dumping & Waste': ['dumping', 'trash', 'debris', 'mattress', 'refrigerator', 'drums', 'chemical', 'rubble', 'garbage', 'waste'],
      'Traffic Signal Outage': ['signal', 'traffic light', 'intersection', 'red flash', 'green', 'blackout', 'pedestrian button', 'cycle'],
      'Noise & Public Nuisance': ['noise', 'loud', 'vibration', 'decibel', 'chiller', 'hvac', 'construction', 'night', 'compressor', 'alarm'],
      'Structural Hazard & Sidewalk': ['sidewalk', 'trip', 'concrete', 'retaining wall', 'spalling', 'bridge', 'hazard', 'pedestrian', 'scaffold']
    };

    const scores: Record<string, number> = {};
    for (const [cat, kws] of Object.entries(categoryKeywords)) {
      let score = 0;
      for (const kw of kws) {
        if (kw.includes(' ')) {
          if (lower.includes(kw)) score += 3.5;
        } else {
          for (const t of tokens) {
            if (t === kw || t.startsWith(kw) || kw.startsWith(t)) score += 1.8;
          }
        }
      }
      scores[cat] = score;
    }

    let bestCat: ComplaintCategory = 'Potholes & Pavement Cracks';
    let maxScore = -1;
    let totalScore = 0;

    for (const [cat, sc] of Object.entries(scores)) {
      totalScore += sc;
      if (sc > maxScore) {
        maxScore = sc;
        bestCat = cat as ComplaintCategory;
      }
    }

    const confidence = totalScore > 0 ? Math.min(0.96, Math.max(0.55, Math.round((maxScore / totalScore) * 100) / 100)) : 0.65;

    // Detect urgency
    const urgentWords = ['urgent', 'emergency', 'danger', 'hazard', 'severe', 'swerving', 'collapse', 'blackout', 'injury', 'accident', 'immediate'];
    let urgency = 45;
    for (const uw of urgentWords) {
      if (lower.includes(uw)) urgency += 12;
    }
    urgency = Math.min(99, Math.max(20, urgency));

    // Entity extraction (addresses, intersections, dimensions)
    const entities: { type: string; value: string }[] = [];
    const addressMatch = text.match(/\b\d{1,5}\s+[A-Z][a-z0-9]+\s+(St|Street|Ave|Avenue|Blvd|Boulevard|Way|Road|Rd|Parkway)\b/i);
    if (addressMatch) {
      entities.push({ type: 'ADDRESS', value: addressMatch[0] });
    }

    const dimMatch = text.match(/\b\d+(\.\d+)?\s*(cm|mm|inches|feet|yards|gallons|db)\b/i);
    if (dimMatch) {
      entities.push({ type: 'MEASUREMENT', value: dimMatch[0] });
    }

    const interMatch = text.match(/intersection\s+of\s+([A-Z][a-z0-9]+)\s+and\s+([A-Z][a-z0-9]+)/i);
    if (interMatch) {
      entities.push({ type: 'INTERSECTION', value: `${interMatch[1]} & ${interMatch[2]}` });
    }

    return {
      predictedCategory: bestCat,
      confidence,
      topKeywords: tokens.slice(0, 5),
      urgencyScore: urgency,
      entities,
    };
  }

  /**
   * Find duplicates for a target complaint within existing complaints
   */
  public static findDuplicates(target: ComplaintRecord, allComplaints: ComplaintRecord[], threshold: number = 0.68): {
    match: ComplaintRecord;
    similarity: number;
    reasons: string[];
  }[] {
    const matches: { match: ComplaintRecord; similarity: number; reasons: string[] }[] = [];
    const targetTokens = NLPEngine.tokenize(`${target.title} ${target.description}`);

    for (const other of allComplaints) {
      if (other.id === target.id) continue;
      if (other.category !== target.category) continue;

      // Coordinate distance check: must be within ~500m
      const latDiff = Math.abs(target.location.lat - other.location.lat);
      const lngDiff = Math.abs(target.location.lng - other.location.lng);
      const approxDistM = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111000;

      if (approxDistM > 600) continue;

      const otherTokens = NLPEngine.tokenize(`${other.title} ${other.description}`);
      const textSim = NLPEngine.tokenJaccard(targetTokens, otherTokens);
      const titleSim = NLPEngine.levenshteinSimilarity(target.title.toLowerCase(), other.title.toLowerCase());

      const spatialSim = Math.max(0, 1 - approxDistM / 600);
      const compositeScore = textSim * 0.45 + titleSim * 0.35 + spatialSim * 0.20;

      if (compositeScore >= threshold) {
        const reasons: string[] = [];
        if (approxDistM < 150) reasons.push(`Close spatial proximity (${Math.round(approxDistM)}m away)`);
        if (titleSim > 0.6) reasons.push('High title lexical match');
        if (textSim > 0.5) reasons.push('Shared keyword description profile');

        matches.push({
          match: other,
          similarity: Math.round(compositeScore * 100) / 100,
          reasons,
        });
      }
    }

    return matches.sort((a, b) => b.similarity - a.similarity);
  }
}
