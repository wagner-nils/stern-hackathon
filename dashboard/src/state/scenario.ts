import { assumption, expansionFields, preferred, scenarios, siteNodes } from "../data/warehouse";
import { type CostBase, contractsToBreakEven, kpis, nsBreakEvenLaunches, scenarioYears } from "../model/scenarios";
import { siteLoad } from "../model/q3";

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

/** What partners can change; everything else stays at the warehouse value. */
export interface ScenarioSettings {
  scenarioId: string;
  contractLaunches: number | null;
  fixedOpexEur: number;
  sizeFactor: number;
}

export const BASE_SETTINGS: ScenarioSettings = {
  scenarioId: "ascent",
  contractLaunches: null,
  fixedOpexEur: BASE_COST.fixedOpexEur,
  sizeFactor: BASE_COST.sizeFactor,
};

export const isEdited = (s: ScenarioSettings) =>
  s.contractLaunches !== null || s.fixedOpexEur !== BASE_COST.fixedOpexEur || s.sizeFactor !== BASE_COST.sizeFactor;

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
  const sc = s.contractLaunches !== null && id === s.scenarioId ? { ...sc0, contract_launches: s.contractLaunches } : sc0;
  const cost: CostBase = { ...BASE_COST, fixedOpexEur: s.fixedOpexEur, sizeFactor: s.sizeFactor };
  const years = scenarioYears(sc, expansionFields, cost);
  return {
    scenario: sc,
    years,
    kpi: kpis(years),
    at: (year: number) => years.find((y) => y.year === year)!,
    contractsFor: (year: number) => contractsToBreakEven(sc, expansionFields, cost, year, andoyaCapacity(year)),
    nsBreakEven: (year: number) => nsBreakEvenLaunches(sc, expansionFields, cost, year),
    andoyaCapacity,
  };
}
