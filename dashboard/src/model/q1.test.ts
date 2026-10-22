import { describe, expect, it } from "vitest";
import { launchSites, satellites, sqlFunnel } from "../data/warehouse";
import { baseFixed, baseLevers, tamRevenueUsd } from "../state/levers";
import { computeQ1 } from "./q1";

const base = () => computeQ1(satellites, launchSites, baseLevers, baseFixed, tamRevenueUsd(baseLevers.baseYear));

describe("Q1 model", () => {
  it("gives exactly the numbers of the SQL view v_q1_funnel", () => {
    const r = base();
    const byStep = r.steps;
    expect(sqlFunnel).toHaveLength(byStep.length);
    sqlFunnel.forEach((row, k) => {
      expect(byStep[k].sats).toBeCloseTo(row.satellites, 6);
      expect(byStep[k].massKg).toBeCloseTo(row.mass_kg, 3);
    });
    expect(r.tiers.TAM.revenueEur[0]).toBeCloseTo(sqlFunnel[0].revenue_eur!, 0);
    expect(r.tiers.SAM.revenueEur[0]).toBeCloseTo(sqlFunnel[3].revenue_eur!, 0);
    expect(r.tiers.SAM.revenueEur[1]).toBeCloseTo(sqlFunnel[3].revenue_eur_high!, 0);
    expect(r.tiers.SOM.revenueEur[0]).toBeCloseTo(sqlFunnel[6].revenue_eur!, 0);
  });

  it("never grows from one filter to the next", () => {
    const { steps } = base();
    for (let k = 1; k < steps.length; k++) {
      expect(steps[k].sats).toBeLessThanOrEqual(steps[k - 1].sats + 1e-9);
      expect(steps[k].massKg).toBeLessThanOrEqual(steps[k - 1].massKg + 1e-9);
    }
  });

  it("serves more satellites when Nova Scotia adds its orbits", () => {
    const andoya = base().tiers.SAM.sats;
    const plusNovaScotia = computeQ1(satellites, launchSites, { ...baseLevers, siteScope: 1 }, baseFixed, tamRevenueUsd(2025));
    expect(plusNovaScotia.tiers.SAM.sats).toBeGreaterThan(andoya);
  });

  it("needs more launches at a lower success rate while demand sets the SOM", () => {
    const at = (successRate: number) =>
      computeQ1(satellites, launchSites, { ...baseLevers, successRate }, baseFixed, tamRevenueUsd(2025));
    const [low, high] = [at(0.75), at(0.92)];
    expect(low.bottleneck).toBe("demand");
    expect(low.tiers.SOM.massKg).toBeCloseTo(high.tiers.SOM.massKg);
    expect(low.launchesNeeded).toBeGreaterThan(high.launchesNeeded);
    expect(low.launchesNeeded).toBeCloseTo(low.somLaunches / 0.75);
  });

  it("passes only Isar's win share of the dedicated demand on to the SOM", () => {
    const all = computeQ1(satellites, launchSites, { ...baseLevers, winShare: 1 }, baseFixed, tamRevenueUsd(2025));
    const r = base();
    expect(r.dedicatedKg).toBeCloseTo(all.dedicatedKg);
    expect(r.wantKg).toBeCloseTo(all.wantKg * baseLevers.winShare);
  });

  it("is capacity-bound when demand exceeds successful launches", () => {
    const r = computeQ1(satellites, launchSites, { ...baseLevers, penetration: 0.15, winShare: 1, launchesPerYear: 1 }, baseFixed, tamRevenueUsd(2025));
    expect(r.bottleneck).toBe("capacity");
    expect(r.somLaunches).toBeCloseTo(baseLevers.successRate);
    expect(r.tiers.SOM.revenueEur[0]).toBeCloseTo(baseLevers.successRate * baseFixed.pricePerLaunchEur);
  });
});
