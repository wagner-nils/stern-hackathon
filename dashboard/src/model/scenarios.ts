import type { ExpansionField, Scenario } from "../data/warehouse";

// Final: three P&L scenarios in real 2026 euros. Mirrors the SQL view v_scenarios; a test keeps both equal.
// Revenue reuses the RQ2 expansion fields; launch cost follows Rocket Lab's measured cost curve scaled to Spectrum.

export const FIRST_YEAR = 2027;
export const LAST_YEAR = 2040;
export const YEARS = Array.from({ length: LAST_YEAR - FIRST_YEAR + 1 }, (_, k) => FIRST_YEAR + k);

/** Fields that are services, not Spectrum launches. */
const READINESS = "sovereign_readiness";
const EXTRAS = "mission_extras";
const NOVA_SCOTIA = "site_nova_scotia";

export interface CostBase {
  pricePerLaunchEur: number;
  learningRate: number;
  /** Rocket Lab's cost per Electron launch (USD) at the reference cadence. */
  refCostUsd: number;
  usdPerEur: number;
  /** Spectrum cost per launch relative to Electron. */
  sizeFactor: number;
  refCadence: number;
  fixedOpexEur: number;
  readinessLaunchShare: number;
  readinessFeeMargin: number;
  nsFeeStartYear: number;
}

export interface ScenarioYear {
  year: number;
  launchesSold: number;
  launchesFlown: number;
  successRate: number;
  unitCostEur: number;
  launchRevenueEur: number;
  readinessRevenueEur: number;
  extrasRevenueEur: number;
  revenueEur: number;
  grossProfitEur: number;
  fixedCostEur: number;
  ebitEur: number;
  cumulativeEbitEur: number;
  /** Launches flown from Andøya (fields that fly from there, flown readiness and frame contracts). */
  andoyaFlown: number;
}

const active = (f: ExpansionField, year: number) => year >= f.start_year && year <= (f.end_year ?? 9999);

/** Revenue of a field in a year; after a programme ends, a successor keeps a share of its last level. */
function fieldRevenue(f: ExpansionField, year: number, sc: Scenario): number {
  const growth = f.id === READINESS ? sc.readiness_growth : f.growth;
  if (active(f, year)) return f.market_2025_eur * Math.pow(1 + growth, year - 2025) * f.isar_share;
  if (f.end_year !== null && year > f.end_year) return sc.institutional_after_end * f.market_2025_eur * Math.pow(1 + f.growth, f.end_year - 2025) * f.isar_share;
  return 0;
}

export function successRate(sc: Scenario, year: number): number {
  if (year <= 2027) return sc.success_2027;
  if (year >= 2030) return sc.success_2030;
  return sc.success_2027 + ((sc.success_2030 - sc.success_2027) * (year - 2027)) / 3;
}

/** Cost per launch at a yearly cadence: Rocket Lab's curve, no learning beyond the volume it has measured. */
export function unitCost(flown: number, c: CostBase): number {
  const ref = (c.refCostUsd * c.sizeFactor) / c.usdPerEur;
  return ref * Math.pow(Math.min(Math.max(flown, 1), c.refCadence) / c.refCadence, Math.log2(c.learningRate));
}

export function scenarioYears(sc: Scenario, fields: ExpansionField[], c: CostBase): ScenarioYear[] {
  const used = fields.filter((f) => sc.fields.includes(f.id));
  const nsStart = fields.find((f) => f.id === NOVA_SCOTIA)?.start_year ?? 9999;
  const hasNs = sc.fields.includes(NOVA_SCOTIA);
  let cumulative = 0;
  return YEARS.map((year) => {
    const launchFields = used.filter((f) => f.id !== READINESS && f.id !== EXTRAS);
    const contracts = year >= sc.contract_start_year ? sc.contract_launches : 0;
    const anchors = hasNs && year >= nsStart ? sc.ns_anchor_launches : 0;
    const launchRevenueEur = launchFields.reduce((n, f) => n + fieldRevenue(f, year, sc), 0) + (anchors + contracts) * c.pricePerLaunchEur;
    const readiness = used.find((f) => f.id === READINESS);
    const extras = used.find((f) => f.id === EXTRAS);
    const readinessRevenueEur = readiness ? fieldRevenue(readiness, year, sc) : 0;
    const extrasRevenueEur = extras ? fieldRevenue(extras, year, sc) : 0;

    const launchesSold = launchRevenueEur / c.pricePerLaunchEur + (readinessRevenueEur * c.readinessLaunchShare) / c.pricePerLaunchEur;
    const rate = successRate(sc, year);
    // A failed launch is re-flown at Isar's cost.
    const launchesFlown = launchesSold / rate;
    const unitCostEur = unitCost(launchesFlown, c);
    const grossProfitEur =
      launchRevenueEur +
      readinessRevenueEur * c.readinessLaunchShare -
      launchesFlown * unitCostEur +
      readinessRevenueEur * (1 - c.readinessLaunchShare) * c.readinessFeeMargin +
      extrasRevenueEur * (extras?.gross_margin ?? 0);
    // Field fixed costs (e.g. a site fee) run while the field is active; Nova Scotia's fee only after the waiver.
    const fieldFixed = used
      .filter((f) => active(f, year) && (f.id !== NOVA_SCOTIA || year >= c.nsFeeStartYear))
      .reduce((n, f) => n + f.fixed_cost_eur, 0);
    const fixedCostEur = c.fixedOpexEur + fieldFixed;
    const ebitEur = grossProfitEur - fixedCostEur;
    cumulative += ebitEur;

    const andoyaRevenue = launchFields.filter((f) => f.launch_site_id === "andoya").reduce((n, f) => n + fieldRevenue(f, year, sc), 0);
    const andoyaFlown = (andoyaRevenue / c.pricePerLaunchEur + (readinessRevenueEur * c.readinessLaunchShare) / c.pricePerLaunchEur + contracts) / rate;

    return {
      year,
      launchesSold,
      launchesFlown,
      successRate: rate,
      unitCostEur,
      launchRevenueEur,
      readinessRevenueEur,
      extrasRevenueEur,
      revenueEur: launchRevenueEur + readinessRevenueEur + extrasRevenueEur,
      grossProfitEur,
      fixedCostEur,
      ebitEur,
      cumulativeEbitEur: cumulative,
      andoyaFlown,
    };
  });
}

export interface ScenarioKpis {
  /** First year from which EBIT stays at or above zero through the horizon; null if never. */
  sustainedBreakEven: number | null;
  /** Deepest point of the cumulative operating result (≤ 0). */
  peakCumulativeLossEur: number;
  peakLossYear: number;
}

export function kpis(years: ScenarioYear[]): ScenarioKpis {
  let sustainedBreakEven: number | null = null;
  for (let k = years.length - 1; k >= 0 && years[k].ebitEur >= 0; k--) sustainedBreakEven = years[k].year;
  const peak = years.reduce((m, y) => (y.cumulativeEbitEur < m.cumulativeEbitEur ? y : m), years[0]);
  return { sustainedBreakEven, peakCumulativeLossEur: Math.min(0, peak.cumulativeEbitEur), peakLossYear: peak.year };
}

/**
 * Frame-contract launches a year a scenario needs for EBIT ≥ 0 in a given year, other inputs held. Contracts fly from
 * Andøya, so the answer must fit its proposed capacity; null when even a full Andøya does not break even.
 */
export function contractsToBreakEven(sc: Scenario, fields: ExpansionField[], c: CostBase, year: number, andoyaCapacity: number): number | null {
  const at = (n: number) => scenarioYears({ ...sc, contract_launches: n }, fields, c).find((y) => y.year === year)!;
  if (at(0).ebitEur >= 0) return 0;
  // Most contracts that still fit Andøya once its other launches are counted.
  const base = at(0);
  const room = andoyaCapacity * base.successRate - base.andoyaFlown * base.successRate;
  if (room <= 0 || at(room).ebitEur < 0) return null;
  let lo = 0;
  let hi = room;
  for (let k = 0; k < 40; k++) {
    const mid = (lo + hi) / 2;
    if (at(mid).ebitEur >= 0) hi = mid;
    else lo = mid;
  }
  return hi;
}

/** Anchor launches a year that pay for the Nova Scotia fee at the scenario's cost level in a year. */
export function nsBreakEvenLaunches(sc: Scenario, fields: ExpansionField[], c: CostBase, year: number): number | null {
  const ns = fields.find((f) => f.id === NOVA_SCOTIA);
  if (!ns) return null;
  const y = scenarioYears(sc, fields, c).find((r) => r.year === year)!;
  const contribution = c.pricePerLaunchEur - y.unitCostEur / y.successRate;
  return contribution > 0 ? ns.fixed_cost_eur / contribution : null;
}
