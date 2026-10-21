import { describe, expect, it } from "vitest";
import { defaultValues } from "../data/assumptions";
import { latestDemand } from "../data/demand";
import { market } from "../data/market";
import { sites } from "../data/sites";
import type { DemandSegment } from "../data/types";
import { spectrum } from "../data/vehicles";
import { computeMarket, demandByGroup, demandByInclination } from "./funnel";

const inputs = { baseYear: 2025, ...market };
const demand = latestDemand.segments;
const base = { ...defaultValues, planningYear: 2025 };

const segment = (over: Partial<DemandSegment>): DemandSegment => ({
  id: "x",
  label: "x",
  group: "Commercial (open)",
  customer: "open-commercial",
  orbit: "SSO",
  inclination: [97, 98],
  avgMassKg: 100,
  satsPerYear: 10,
  ...over,
});

describe("computeMarket", () => {
  it("never grows from one filter to the next", () => {
    const { steps } = computeMarket(demand, sites, spectrum, base, inputs);
    for (let k = 1; k < steps.length; k++) {
      expect(steps[k].sats).toBeLessThanOrEqual(steps[k - 1].sats + 1e-9);
      expect(steps[k].massKg).toBeLessThanOrEqual(steps[k - 1].massKg + 1e-9);
    }
  });

  it("keeps captive, too heavy and unreachable demand out of the SAM", () => {
    const rows = [
      segment({ customer: "captive" }),
      segment({ avgMassKg: 900 }),
      segment({ orbit: "LEO", inclination: [51, 52] }),
    ];
    const { tiers } = computeMarket(rows, sites, spectrum, base, inputs);
    expect(tiers.TAM.sats).toBe(30);
    expect(tiers.SAM.sats).toBe(0);
  });

  it("is capacity-bound when demand exceeds Isar's launches", () => {
    const rows = [segment({ satsPerYear: 1000 })];
    const p = { ...base, premiumShare: 1, launchesPerYear: 2, fillRate: 0.7 };
    const result = computeMarket(rows, sites, spectrum, p, inputs);
    expect(result.bottleneck).toBe("capacity");
    expect(result.tiers.SOM.launches).toBe(2);
    // Two launches at 70% of 700 kg carry 980 kg, i.e. 9.8 satellites of 100 kg.
    expect(result.tiers.SOM.sats).toBeCloseTo(9.8);
    expect(result.tiers.SOM.revenueEur[0]).toBe(2 * base.pricePerLaunchEurM * 1e6);
  });

  it("is demand-bound when Isar has spare launches", () => {
    const result = computeMarket([segment({ satsPerYear: 1 })], sites, spectrum, { ...base, premiumShare: 1 }, inputs);
    expect(result.bottleneck).toBe("demand");
    expect(result.tiers.SOM.sats).toBeCloseTo(1);
  });

  it("grows demand from the base year to the planning year", () => {
    const p = { ...base, planningYear: 2027, marketGrowth: 0.1 };
    const { tiers, growth } = computeMarket([segment({})], sites, spectrum, p, inputs);
    expect(growth).toBeCloseTo(1.21);
    expect(tiers.TAM.sats).toBeCloseTo(12.1);
  });

  it("opens other governments' demand only by the assumed share", () => {
    const rows = [segment({ customer: "institutional-other" })];
    const { tiers } = computeMarket(rows, sites, spectrum, { ...base, otherGovOpen: 0.5 }, inputs);
    expect(tiers.SAM.sats).toBeCloseTo(5);
  });
});

describe("demand helpers", () => {
  it("binning keeps the total number of satellites", () => {
    const total = demand.reduce((sum, s) => sum + s.satsPerYear, 0);
    const binned = demandByInclination(demand).reduce((sum, b) => sum + b.sats, 0);
    expect(binned).toBeCloseTo(total);
  });

  it("groups add up to the total", () => {
    const total = demand.reduce((sum, s) => sum + s.satsPerYear, 0);
    expect(demandByGroup(demand).reduce((sum, g) => sum + g.sats, 0)).toBeCloseTo(total);
  });
});
