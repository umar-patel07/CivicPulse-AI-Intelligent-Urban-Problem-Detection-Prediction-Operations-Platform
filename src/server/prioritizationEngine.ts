import { ComplaintRecord, PrioritizationWeights, PriorityScoreBreakdown } from '../types';

export class PrioritizationEngine {
  /**
   * Calculates transparent, multi-criteria prioritization scores for active work orders
   */
  public static scoreComplaints(
    complaints: ComplaintRecord[],
    weights: PrioritizationWeights
  ): PriorityScoreBreakdown[] {
    // Normalization factors
    const maxDays = Math.max(1, ...complaints.map(c => c.daysOpen));

    // Spatial density: count items within 300m of each complaint
    const nearbyCountMap = new Map<string, number>();
    for (let i = 0; i < complaints.length; i++) {
      let count = 0;
      const c1 = complaints[i];
      for (let j = 0; j < complaints.length; j++) {
        if (i === j) continue;
        const c2 = complaints[j];
        const distApprox = Math.sqrt(
          Math.pow(c1.location.lat - c2.location.lat, 2) +
          Math.pow(c1.location.lng - c2.location.lng, 2)
        );
        if (distApprox < 0.004) count++;
      }
      nearbyCountMap.set(c1.id, count);
    }

    const breakdowns: PriorityScoreBreakdown[] = complaints.map(c => {
      // 1. Severity factor (0 - 100)
      let severityScore = 40;
      if (c.priority === 'CRITICAL') severityScore = 98;
      else if (c.priority === 'HIGH') severityScore = 75;
      else if (c.priority === 'MEDIUM') severityScore = 48;
      else severityScore = 20;

      // 2. Recurrence / Spatial Density (0 - 100)
      const nearby = nearbyCountMap.get(c.id) || 0;
      const recurrenceScore = Math.min(100, (c.upvotes * 8) + (nearby * 18) + (c.duplicateOfId ? 25 : 0));

      // 3. Time Unresolved / Aging SLA (0 - 100)
      const agingRatio = Math.min(2.5, c.daysOpen / (c.slaTargetHours / 24 || 1));
      const timeUnresolvedScore = Math.min(100, Math.round((agingRatio / 2.5) * 100));

      // 4. Infrastructure Impact (0 - 100) based on category & subcategory
      let infraScore = 50;
      if (c.category === 'Traffic Signal Outage' || c.category === 'Water Main & Drainage') {
        infraScore = 92;
      } else if (c.category === 'Structural Hazard & Sidewalk' || c.category === 'Potholes & Pavement Cracks') {
        infraScore = 78;
      } else if (c.category === 'Streetlight & Electrical') {
        infraScore = 65;
      } else {
        infraScore = 40;
      }

      // 5. Public Vulnerability Index (0 - 100) based on transit corridors, school/hospital tags, and citizen sentiment
      let vulnerabilityScore = Math.round((c.urgencyScore * 0.7) + (Math.abs(c.sentimentScore) * 30));
      if (c.location.address.toLowerCase().includes('way') || c.location.address.toLowerCase().includes('blvd')) {
        vulnerabilityScore = Math.min(100, vulnerabilityScore + 15);
      }

      // Weighted combination with fallbacks
      const wSev = weights.severityWeight ?? weights.severity ?? 0.35;
      const wRec = weights.recurrenceDensityWeight ?? weights.recurrence ?? 0.20;
      const wTime = weights.timeUnresolvedWeight ?? weights.timeUnresolved ?? 0.20;
      const wInfra = weights.infrastructureImpactWeight ?? weights.infrastructureCriticality ?? 0.15;
      const wVuln = weights.publicVulnerabilityWeight ?? weights.socialVulnerability ?? 0.10;

      const totalWeight = wSev + wRec + wTime + wInfra + wVuln || 1;

      const rawTotal =
        (severityScore * wSev +
          recurrenceScore * wRec +
          timeUnresolvedScore * wTime +
          infraScore * wInfra +
          vulnerabilityScore * wVuln) / totalWeight;

      const totalScore = Math.min(100, Math.max(5, Math.round(rawTotal * 10) / 10));

      let tier: PriorityScoreBreakdown['tier'] = 'TIER_4_MONITOR';
      let recommendedAction = 'Monitor and batch with scheduled bi-weekly district route maintenance.';
      let estimatedEffortHours = 2.5;

      if (totalScore >= 80) {
        tier = 'TIER_1_IMMEDIATE';
        recommendedAction = 'Immediate Emergency Dispatch: Issue tactical crew ticket within 60 minutes. Secure perimeter.';
        estimatedEffortHours = 8.0;
      } else if (totalScore >= 62) {
        tier = 'TIER_2_URGENT';
        recommendedAction = 'Next Shift Deployment: Route to assigned zone foreman for 24-hour intervention.';
        estimatedEffortHours = 5.0;
      } else if (totalScore >= 42) {
        tier = 'TIER_3_SCHEDULED';
        recommendedAction = 'Scheduled Work Order: Queue for standard zone patrol within 72 hours.';
        estimatedEffortHours = 3.5;
      }

      return {
        complaintId: c.id,
        totalScore,
        tier,
        factors: {
          severity: Math.round(severityScore),
          recurrenceDensity: Math.round(recurrenceScore),
          timeUnresolved: Math.round(timeUnresolvedScore),
          infrastructureImpact: Math.round(infraScore),
          publicVulnerability: Math.round(vulnerabilityScore),
        },
        recommendedAction,
        estimatedEffortHours,
      };
    });

    return breakdowns.sort((a, b) => b.totalScore - a.totalScore);
  }
}
