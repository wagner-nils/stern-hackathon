import type { CostBase, ScenarioYear } from "./scenarios";

// RQ4 shock: Andøya closed for some months, Nova Scotia only for Canadian payloads. What a year keeps, with and
// without a pad share at Kourou held as insurance. Pure function on one scenario year.

export interface ShockResult {
  /** Revenue the year loses: launches that cannot fly plus the readiness fee that cannot be honoured. */
  revenueLostEur: number;
  /** Share of the year's revenue that survives the shock. */
  revenueKept: number;
  ebitEur: number;
  /** Launches moved to Kourou. */
  launchesMoved: number;
}

export function shock(y: ScenarioYear, c: CostBase, months: number, kourouLaunchesPerYear: number, kourouFeeEur: number): ShockResult {
  const f = Math.min(Math.max(months, 0), 12) / 12;
  const andoyaLost = y.andoyaFlown * y.successRate * f;
  // The anchor customer at Nova Scotia is Canadian and keeps flying; commercial launches there lose their windows.
  const nsLost = y.nsCommercialSold * f;
  const launchesMoved = Math.min(andoyaLost, kourouLaunchesPerYear * f);
  const launchesLost = andoyaLost + nsLost - launchesMoved;
  // Readiness can only be honoured from an open pad: the fee goes with the share of Andøya launches that cannot move.
  const feeRevenue = y.readinessRevenueEur * (1 - c.readinessLaunchShare);
  const feeLost = andoyaLost > 0 ? feeRevenue * f * (1 - launchesMoved / andoyaLost) : 0;
  const revenueLostEur = launchesLost * c.pricePerLaunchEur + feeLost;
  // Launches that do not fly do not cost a rocket; fixed costs keep running.
  const costSaved = (launchesLost / y.successRate) * y.unitCostEur;
  const ebitEur = y.ebitEur - launchesLost * c.pricePerLaunchEur - feeLost * c.readinessFeeMargin + costSaved - kourouFeeEur;
  return { revenueLostEur, revenueKept: y.revenueEur ? 1 - revenueLostEur / y.revenueEur : 0, ebitEur, launchesMoved };
}
