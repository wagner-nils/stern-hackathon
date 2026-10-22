import { describe, expect, it } from "vitest";
import { expansionFields, scenarios } from "../data/warehouse";
import { BASE_COST } from "../state/scenario";
import { shock } from "./q4";
import { scenarioYears } from "./scenarios";

const ascent2030 = scenarioYears(scenarios.find((s) => s.id === "ascent")!, expansionFields, BASE_COST).find((y) => y.year === 2030)!;

describe("RQ4 shock", () => {
  it("changes nothing without a closure and without Kourou", () => {
    const r = shock(ascent2030, BASE_COST, 0, 0, 0);
    expect(r.revenueLostEur).toBe(0);
    expect(r.ebitEur).toBeCloseTo(ascent2030.ebitEur, 0);
  });

  it("loses all Andøya and commercial Nova Scotia launches for a full year, keeps the Canadian anchor", () => {
    const r = shock(ascent2030, BASE_COST, 12, 0, 0);
    const lost = ascent2030.andoyaFlown * ascent2030.successRate + ascent2030.nsCommercialSold;
    const fee = ascent2030.readinessRevenueEur * (1 - BASE_COST.readinessLaunchShare);
    expect(r.revenueLostEur).toBeCloseTo(lost * BASE_COST.pricePerLaunchEur + fee, 0);
    expect(r.revenueKept).toBeGreaterThan(0);
  });

  it("keeps more with a Kourou pad, and never moves more than Kourou carries", () => {
    const without = shock(ascent2030, BASE_COST, 12, 0, 0);
    const withKourou = shock(ascent2030, BASE_COST, 12, 2.4, 5e6);
    expect(withKourou.launchesMoved).toBeLessThanOrEqual(2.4 + 1e-9);
    expect(withKourou.revenueKept).toBeGreaterThan(without.revenueKept);
  });
});
