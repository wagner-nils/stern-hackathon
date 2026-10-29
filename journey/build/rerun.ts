// Figures the journey quotes that the tool does not show on any captured screen, re-computed from the unchanged model.
// Run from the dashboard folder: npx vite-node ../journey/build/rerun.ts  → JSON on stdout, read by build.mjs.
import { expansionFields, siteNodes } from "../../dashboard/src/data/warehouse";
import { type ScenarioYear, kpis, unitCost } from "../../dashboard/src/model/scenarios";
import { BASE_COST, BASE_SETTINGS, KOUROU_FEE, run } from "../../dashboard/src/state/scenario";

const M = (v: number) => v / 1e6;
const base = run("ascent", BASE_SETTINGS);
const y30 = base.at(2030);
const fieldRevenue = (id: string, year: number) => {
  const f = expansionFields.find((x) => x.id === id)!;
  return f.market_2025_eur * Math.pow(1 + f.growth, year - 2025) * f.isar_share;
};

// Present's "not secured" share, with and without the signed ESA programme (Present.tsx, lines 19–23).
const contracted = (base.scenario.contract_launches + base.scenario.ns_anchor_launches) * BASE_COST.pricePerLaunchEur + y30.readinessRevenueEur;
const esa2030 = fieldRevenue("institutional_elc", 2030);

// Launch-only break-even on the cost curve: launches sold n with n × (price − unit cost of n ÷ success flights ÷ success) = fixed cost.
const launchOnly = (fixed: number) => {
  let n = 1;
  while (n < 60 && n * (BASE_COST.pricePerLaunchEur - unitCost(n / y30.successRate, BASE_COST) / y30.successRate) < fixed) n += 0.1;
  return Math.round(n);
};

const lever = (k: number) => {
  const r = run("ascent", { ...BASE_SETTINGS, contractLaunches: k });
  return { launches: k, profitableFrom: r.kpi.sustainedBreakEven, peakLossM: Math.round(-M(r.kpi.peakCumulativeLossEur)), revenue2030M: Math.round(M(r.at(2030).revenueEur)) };
};
const fixed = (eur: number) => {
  const r = run("ascent", { ...BASE_SETTINGS, fixedOpexEur: eur });
  return { fixedM: M(eur), profitableFrom: r.kpi.sustainedBreakEven, peakLossM: Math.round(-M(r.kpi.peakCumulativeLossEur)) };
};
const shock = (months: number) => {
  const s = run("ascent", { ...BASE_SETTINGS, shockMonths: months }).shock(2030);
  return { months, keptPct: +(100 * s.without.revenueKept).toFixed(1), keptWithKourouPct: +(100 * s.withKourou.revenueKept).toFixed(1), ebitM: Math.round(M(s.without.ebitEur)), ebitWithKourouM: Math.round(M(s.withKourou.ebitEur)) };
};

// The Kourou pad share as a standing cost from 2028 (the Q4 site condition), everything else unchanged.
const withKourouFee = (years: ScenarioYear[]) => {
  let cumulative = 0;
  return years.map((y) => {
    const ebitEur = y.ebitEur - (y.year >= 2028 ? KOUROU_FEE : 0);
    cumulative += ebitEur;
    return { ...y, ebitEur, cumulativeEbitEur: cumulative };
  });
};
const kourouCase = (k: number) => {
  const r = kpis(withKourouFee(run("ascent", { ...BASE_SETTINGS, contractLaunches: k }).years));
  return { launches: k, profitableFrom: r.sustainedBreakEven, peakLossM: Math.round(-M(r.peakCumulativeLossEur)) };
};
const plant = siteNodes.find((n) => n.id === "factory-parsdorf")!;

// Sensitivity of the break-even year: each lever at the low and the high end of its range, everything else at base.
const be = (settings: Partial<typeof BASE_SETTINGS>) => run("ascent", { ...BASE_SETTINGS, ...settings }).kpi.sustainedBreakEven;
const tornado = [
  { lever: "Frame-contract launches a year", base: 2, low: 0, high: 6, lowYear: be({ contractLaunches: 0 }), highYear: be({ contractLaunches: 6 }) },
  { lever: "Fixed cost base a year (€ M)", base: 60, low: 90, high: 40, lowYear: be({ fixedOpexEur: 90e6 }), highYear: be({ fixedOpexEur: 40e6 }) },
  { lever: "Spectrum cost vs Electron (×)", base: 1.5, low: 2.0, high: 1.2, lowYear: be({ sizeFactor: 2.0 }), highYear: be({ sizeFactor: 1.2 }) },
  { lever: "Paid readiness growth a year (%)", base: 15, low: 10, high: 25, lowYear: be({ readinessGrowth: 0.1 }), highYear: be({ readinessGrowth: 0.25 }) },
  { lever: "Success rate from 2030 (%)", base: 92, low: 85, high: 95, lowYear: be({ success2030: 0.85 }), highYear: be({ success2030: 0.95 }) },
];

const pursued = ["institutional_elc", "core_polar", "core_dedicated_shift", "sovereign_readiness", "mission_extras"];
console.log(
  JSON.stringify({
    revenue2030M: +M(y30.revenueEur).toFixed(1),
    // Cost bridge 2030: scenario gross profit less fixed cost and site fees = operating result.
    grossProfit2030M: +M(y30.grossProfitEur).toFixed(1),
    fixedCost2030M: +M(y30.fixedCostEur).toFixed(1),
    ebit2030M: Math.round(M(y30.ebitEur)),
    unsecuredPct: Math.round((100 * (contracted + esa2030)) / y30.revenueEur),
    unsecuredWithoutEsaPct: Math.round((100 * contracted) / y30.revenueEur),
    ebit2031M: Math.round(M(base.at(2031).ebitEur)),
    launchesSold2030: +y30.launchesSold.toFixed(1),
    launchOnlyBreakEven: [launchOnly(BASE_COST.fixedOpexEur), launchOnly(y30.fixedCostEur)],
    levers: [2, 3, 4, 5, 6].map(lever),
    fixedCost: [40e6, 60e6, 90e6].map(fixed),
    shock: [3, 6, 12].map(shock),
    kourouFeeM: M(KOUROU_FEE),
    baseBreakEven: base.kpi.sustainedBreakEven,
    bullOverCapacityFrom: run("bull", BASE_SETTINGS).overCapacityFrom,
    tornado,
    withKourouFee: [2, 6].map(kourouCase),
    // Physical plant load: rockets flown (incl. re-flights) against the plant's proposed capacity.
    plantLoad2030Pct: +((100 * y30.launchesFlown) / (plant.capacity_proposed ?? 1)).toFixed(1),
    novaScotiaNet: { y2030M: Math.round(M(base.nsNet(2030) ?? 0)), y2031M: Math.round(M(base.nsNet(2031) ?? 0)) },
    bridge2030M: {
      pursuedFieldsM: +M(pursued.reduce((s, id) => s + fieldRevenue(id, 2030), 0)).toFixed(1),
      frameContractsM: Math.round(M(base.scenario.contract_launches * BASE_COST.pricePerLaunchEur)),
      novaScotiaAnchorsM: Math.round(M(base.scenario.ns_anchor_launches * BASE_COST.pricePerLaunchEur)),
      novaScotiaCommercialM: +M(fieldRevenue("site_nova_scotia", 2030)).toFixed(1),
    },
  }),
);
