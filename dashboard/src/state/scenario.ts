import { assumption, expansionFields, preferred, scenarios, siteNodes } from "../data/warehouse";
import { type CostBase, contractsToBreakEven, kpis, nsBreakEvenLaunches, nsNet, scenarioYears } from "../model/scenarios";
import { siteLoad } from "../model/q3";
import { shock } from "../model/q4";

/** The cost base of all scenarios, every value from the warehouse. */
export const BASE_COST: CostBase = {
  pricePerLaunchEur: assumption("fixed_price_per_launch_eur").value,
  learningRate: assumption("q3_learning_rate").value,
  refCostUsd: preferred("cost_per_launch", { year: 2025, scope: "company", entity: "Rocket Lab" }).value,
  usdPerEur: assumption("fixed_usd_per_eur").value,
  sizeFactor: assumption("scen_size_factor").value,
  refCadence: assumption("scen_ref_cadence").value,
  fixedOpexEur: assumption("scen_fixed_opex_eur").value,
  readinessLaunchShare: assumption("scen_readiness_launch_share").value,
  readinessFeeMargin: assumption("scen_readiness_fee_margin").value,
  nsFeeStartYear: assumption("scen_ns_fee_start_year").value,
};

/**
 * What partners can change; everything else stays at the warehouse value. Scenario levers (null = the scenario's own
 * value) change only the selected scenario; cost levers change all three.
 */
export interface ScenarioSettings {
  scenarioId: string;
  contractLaunches: number | null;
  readinessGrowth: number | null;
  success2030: number | null;
  fixedOpexEur: number;
  sizeFactor: number;
  /** RQ4: months Andøya is closed in the shock year. */
  shockMonths: number;
}

export const BASE_SETTINGS: ScenarioSettings = {
  scenarioId: "ascent",
  contractLaunches: null,
  readinessGrowth: null,
  success2030: null,
  fixedOpexEur: BASE_COST.fixedOpexEur,
  sizeFactor: BASE_COST.sizeFactor,
  shockMonths: 0,
};

export const isEdited = (s: ScenarioSettings) =>
  s.contractLaunches !== null ||
  s.readinessGrowth !== null ||
  s.success2030 !== null ||
  s.fixedOpexEur !== BASE_COST.fixedOpexEur ||
  s.sizeFactor !== BASE_COST.sizeFactor ||
  s.shockMonths !== 0;

/** Andøya's proposed capacity in launches a year (RQ3: pad A plus half of pad 2). */
const andoyaCapacity = (year: number) =>
  siteLoad(expansionFields, siteNodes, year, {
    wacc: assumption("q2_wacc").value,
    padCadence: assumption("q3_pad_cadence").value,
    nsAnchor: assumption("q3_ns_anchor_launches").value,
    pricePerLaunchEur: BASE_COST.pricePerLaunchEur,
  }).find((l) => l.siteId === "andoya")?.capacityProposed ?? 0;

/** One scenario run with the partners' settings applied (edits only change the selected scenario's contracts). */
export function run(id: string, s: ScenarioSettings) {
  const sc0 = scenarios.find((x) => x.id === id)!;
  const mine = id === s.scenarioId;
  const sc = {
    ...sc0,
    contract_launches: mine && s.contractLaunches !== null ? s.contractLaunches : sc0.contract_launches,
    readiness_growth: mine && s.readinessGrowth !== null ? s.readinessGrowth : sc0.readiness_growth,
    success_2030: mine && s.success2030 !== null ? s.success2030 : sc0.success_2030,
  };
  const cost: CostBase = { ...BASE_COST, fixedOpexEur: s.fixedOpexEur, sizeFactor: s.sizeFactor };
  const years = scenarioYears(sc, expansionFields, cost);
  return {
    scenario: sc,
    years,
    kpi: kpis(years),
    at: (year: number) => years.find((y) => y.year === year)!,
    contractsFor: (year: number) => contractsToBreakEven(sc, expansionFields, cost, year, andoyaCapacity(year)),
    nsBreakEven: (year: number) => nsBreakEvenLaunches(sc, expansionFields, cost, year),
    nsNet: (year: number) => nsNet(sc, expansionFields, cost, year),
    /** First year Andøya would need more flights than its proposed pads carry; the cost of more pads is not in the P&L. */
    overCapacityFrom: years.find((y) => y.andoyaFlown > andoyaCapacity(y.year) + 1e-9)?.year ?? null,
    andoyaCapacity,
    /** RQ4: the year under the shock, without and with a pad share at Kourou held as insurance. */
    shock: (year: number) => ({
      without: shock(years.find((y) => y.year === year)!, cost, s.shockMonths, 0, 0),
      withKourou: shock(years.find((y) => y.year === year)!, cost, s.shockMonths, KOUROU_LAUNCHES, KOUROU_FEE),
    }),
  };
}

/** Kourou as insurance: Isar's share of the Diamant pad (RQ3) and its yearly fee (team estimate in expansion_fields). */
export const KOUROU_LAUNCHES =
  siteNodes.filter((n) => n.launch_site_id === "kourou").reduce((n, x) => n + (x.pads_proposed ?? 0) * (x.pad_share ?? 1), 0) *
  assumption("q3_pad_cadence").value;
export const KOUROU_FEE = expansionFields.find((f) => f.id === "site_kourou")?.fixed_cost_eur ?? 0;
