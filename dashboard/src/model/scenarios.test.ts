import { describe, expect, it } from "vitest";
import { expansionFields, scenarios, sqlScenarioPnl } from "../data/warehouse";
import { BASE_COST } from "../state/scenario";
import { kpis, scenarioYears, unitCost } from "./scenarios";

describe("P&L scenarios", () => {
  it("gives exactly the numbers of the SQL view v_scenarios", () => {
    expect(sqlScenarioPnl.length).toBe(scenarios.length * 14);
    for (const row of sqlScenarioPnl) {
      const sc = scenarios.find((s) => s.id === row.scenario_id)!;
      const y = scenarioYears(sc, expansionFields, BASE_COST).find((r) => r.year === row.year)!;
      expect(y.launchesSold).toBeCloseTo(row.launches_sold, 1);
      expect(y.revenueEur / 1e6).toBeCloseTo(row.revenue_eur / 1e6, 2);
      expect(y.grossProfitEur / 1e6).toBeCloseTo(row.gross_profit_eur / 1e6, 2);
      expect(y.ebitEur / 1e6).toBeCloseTo(row.ebit_eur / 1e6, 2);
      expect(y.cumulativeEbitEur / 1e6).toBeCloseTo(row.cumulative_ebit_eur / 1e6, 1);
    }
  });

  it("keeps the accounting identities", () => {
    for (const sc of scenarios)
      for (const y of scenarioYears(sc, expansionFields, BASE_COST)) {
        expect(y.revenueEur).toBeCloseTo(y.launchRevenueEur + y.readinessRevenueEur + y.extrasRevenueEur, 0);
        expect(y.ebitEur).toBeCloseTo(y.grossProfitEur - y.fixedCostEur, 0);
        expect(y.launchesFlown).toBeGreaterThanOrEqual(y.launchesSold);
      }
  });

  it("loses exactly the fixed cost when nothing is sold", () => {
    const empty = { ...scenarios[0], fields: [], contract_launches: 0, ns_anchor_launches: 0 };
    for (const y of scenarioYears(empty, expansionFields, BASE_COST)) expect(y.ebitEur).toBeCloseTo(-BASE_COST.fixedOpexEur, 0);
  });

  it("matches a hand-computed unit cost: 4.8 M USD × 1.5 ÷ 1.12 at 21 launches, ×2^0.515 at half the cadence", () => {
    const c = { ...BASE_COST, refCostUsd: 4.8e6, sizeFactor: 1.5, usdPerEur: 1.12, refCadence: 21, learningRate: 0.7 };
    expect(unitCost(21, c) / 1e6).toBeCloseTo(6.43, 2);
    expect(unitCost(10.5, c) / unitCost(21, c)).toBeCloseTo(1 / 0.7, 3);
    expect(unitCost(40, c)).toBeCloseTo(unitCost(21, c), 0);
  });

  it("ends the ESA programme in Bear and charges Nova Scotia's fee only after the waiver", () => {
    const bear = scenarios.find((s) => s.id === "bear")!;
    const ascent = scenarios.find((s) => s.id === "ascent")!;
    const b = scenarioYears(bear, expansionFields, BASE_COST);
    expect(b.find((y) => y.year === 2031)!.launchRevenueEur).toBeLessThan(b.find((y) => y.year === 2030)!.launchRevenueEur * 0.6);
    const a = scenarioYears(ascent, expansionFields, BASE_COST);
    const fee = expansionFields.find((f) => f.id === "site_nova_scotia")!.fixed_cost_eur;
    expect(a.find((y) => y.year === BASE_COST.nsFeeStartYear)!.fixedCostEur - a.find((y) => y.year === BASE_COST.nsFeeStartYear - 1)!.fixedCostEur).toBeCloseTo(fee, 0);
  });

  it("orders the scenarios: Bear never breaks even, Bull before ASCENT", () => {
    const k = Object.fromEntries(scenarios.map((s) => [s.id, kpis(scenarioYears(s, expansionFields, BASE_COST))]));
    expect(k.bear.sustainedBreakEven).toBeNull();
    expect(k.bull.sustainedBreakEven!).toBeLessThan(k.ascent.sustainedBreakEven ?? 9999);
  });
});
