import { describe, expect, it } from "vitest";
import { defaultValues } from "../data/assumptions";
import { demand } from "../data/demand";
import { sites } from "../data/sites";
import type { DemandSegment } from "../data/types";
import { spectrum } from "../data/vehicles";
import { computeFunnel, demandByInclination } from "./funnel";

describe("computeFunnel", () => {
  it("never grows from one stage to the next", () => {
    const { stages } = computeFunnel(demand, sites, spectrum, defaultValues);
    for (let k = 1; k < stages.length; k++) {
      expect(stages[k].sats).toBeLessThanOrEqual(stages[k - 1].sats + 1e-9);
      expect(stages[k].massKg).toBeLessThanOrEqual(stages[k - 1].massKg + 1e-9);
    }
  });

  it("drops GTO demand from Andøya", () => {
    const geo = demand.filter((s) => s.orbit === "GTO/GEO");
    const { stages } = computeFunnel(geo, sites, spectrum, defaultValues);
    expect(stages[1].sats).toBe(0);
  });

  it("serves nothing without launches and flags capacity as the bottleneck", () => {
    const result = computeFunnel(demand, sites, spectrum, { ...defaultValues, launchesPerYear: 0 });
    expect(result.stages.at(-1)?.sats).toBe(0);
    expect(result.bottleneck).toBe("capacity");
  });

  it("is demand-bound when capacity exceeds dedicated demand", () => {
    const small: DemandSegment[] = [
      { ...demand[3], satsPerYear: 1, avgMassKg: 100, inclination: [97, 98] },
    ];
    const result = computeFunnel(small, sites, spectrum, { ...defaultValues, dedicatedShare: 1, launchesPerYear: 10 });
    expect(result.bottleneck).toBe("demand");
    expect(result.stages.at(-1)?.sats).toBeCloseTo(1);
  });
});

describe("demandByInclination", () => {
  it("keeps the total number of satellites", () => {
    const total = demand.reduce((sum, s) => sum + s.satsPerYear, 0);
    const binned = demandByInclination(demand).reduce((sum, b) => sum + b.sats, 0);
    expect(binned).toBeCloseTo(total);
  });
});
