import { ScenarioParameters, ScenarioSimulationResult } from '../types';

export class ScenarioEngine {
  public static runSimulation(params: any, baselineActive: number = 240, baselineHours: number = 32.5): any {
    const fleetCapacityMultiplier = params.fleetCapacityMultiplier ?? 1.0;
    const badWeatherSurgeFactor = params.badWeatherSurgeFactor ?? params.severeWeatherFactor ?? 1.0;
    const aiAutoTriageAdoptionRate = params.aiAutoTriageAdoptionRate ?? params.autoTriageRate ?? 0.5;
    const preventiveMaintenanceInvestmentUSD = params.preventiveMaintenanceInvestmentUSD ?? params.preventiveInvestmentUSD ?? 100000;

    // Daily net throughput calculation
    const baseDailyIntake = 35;
    const weatherImpact = badWeatherSurgeFactor;
    const preventiveDropFactor = Math.max(0.70, 1 - (preventiveMaintenanceInvestmentUSD / 500000) * 0.28);
    const simulatedIntake = baseDailyIntake * weatherImpact * preventiveDropFactor;

    // Daily resolution capacity
    const triageEfficiencyBoost = 1 + aiAutoTriageAdoptionRate * 0.24;
    const simulatedOutput = baseDailyIntake * fleetCapacityMultiplier * triageEfficiencyBoost;

    const netDailyDiff = simulatedIntake - simulatedOutput;
    const projectedBacklogChange = Math.round((netDailyDiff / (baseDailyIntake || 1)) * 100);
    const projectedBacklog = Math.max(10, Math.round(baselineActive * (1 + projectedBacklogChange / 100)));

    // Projected resolution hours
    const capacityRatio = simulatedOutput / (simulatedIntake || 1);
    const projectedAvgHours = Math.max(
      8.0,
      Math.round((baselineHours / (capacityRatio || 1)) * 10) / 10
    );

    // SLA breach reduction percent
    const slaBreachReduction = Math.min(
      85,
      Math.max(-40, Math.round(((capacityRatio - 1.0) * 65 + (aiAutoTriageAdoptionRate * 20))))
    );

    // Cost savings
    const emergencyRepairSavings = Math.round(
      (preventiveMaintenanceInvestmentUSD * 1.85) +
      (aiAutoTriageAdoptionRate * 85000) -
      (Math.max(0, fleetCapacityMultiplier - 1.0) * 140000)
    );

    // Workload stress index (0 - 100)
    const stress = Math.min(
      99,
      Math.max(10, Math.round((simulatedIntake / (simulatedOutput || 1)) * 55))
    );

    const riskNotes: string[] = [];
    if (fleetCapacityMultiplier < 0.9) {
      riskNotes.push('Fleet reduction risks cumulative queue stagnation during weekend spikes.');
    }
    if (badWeatherSurgeFactor > 1.5 && fleetCapacityMultiplier <= 1.0) {
      riskNotes.push('Extreme weather surge without temporary surge crews will breach Tier 1 SLAs.');
    }
    if (aiAutoTriageAdoptionRate > 0.85) {
      riskNotes.push('High auto-triage rate requires weekly validation audits to prevent misrouting edge cases.');
    }
    if (preventiveMaintenanceInvestmentUSD >= 250000) {
      riskNotes.push('Preventive asphalt resealing projected to decrease winter freeze-thaw complaints by 28%.');
    }

    let scenarioName = params.scenarioName || 'Custom Operational Scenario';
    if (!params.scenarioName) {
      if (fleetCapacityMultiplier >= 1.25 && aiAutoTriageAdoptionRate >= 0.75) {
        scenarioName = 'High-Efficiency Modernized Operations';
      } else if (badWeatherSurgeFactor >= 1.6) {
        scenarioName = 'Severe Weather Resilience Contingency';
      } else if (preventiveMaintenanceInvestmentUSD >= 300000) {
        scenarioName = 'Proactive Asset Preservation Strategy';
      }
    }

    const narrative = projectedBacklogChange <= 0
      ? `Under this operational strategy, field capacity exceeds intake by ${Math.round((capacityRatio - 1) * 100)}%, driving a ${Math.abs(projectedBacklogChange)}% reduction in active backlog and projected MTTR drop to ${projectedAvgHours} hours.`
      : `Intake exceeds field resolution bandwidth by ${Math.round((1 - capacityRatio) * 100)}%, leading to queue accumulation (+${projectedBacklogChange}% backlog) and extending average MTTR to ${projectedAvgHours} hours. Additional surge capacity is recommended.`;

    return {
      scenarioName,
      projectedBacklog,
      backlogShiftPercent: projectedBacklogChange,
      projectedBacklogChangePercent: projectedBacklogChange,
      projectedResolutionTimeHours: projectedAvgHours,
      projectedAvgResolutionHours: projectedAvgHours,
      slaBreachReductionPercent: slaBreachReduction,
      estimatedCostSavingsUSD: emergencyRepairSavings,
      workloadStressIndex: stress,
      narrativeSummary: narrative,
      riskNotes,
    };
  }
}
