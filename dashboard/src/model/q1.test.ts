import { describe, expect, it } from "vitest";
import { launchSites, satellites, sqlFunnel } from "../data/warehouse";
import { baseFixed, baseLevers, tamRevenueUsd } from "../state/levers";
import { computeQ1 } from "./q1";

const base = () => computeQ1(satellites, launchSites, baseLevers, baseFixed, tamRevenueUsd(baseLevers.baseYear));

describe("Q1 model", () => {
  it("gives exactly the numbers of the SQL view v_q1_funnel", () => {
    const r = base();
    const byStep = [r.steps[0], r.steps[1], r.steps[2], r.steps[3], r.steps[4], r.steps[5]];
    sqlFunnel.forEach((row, k) => {
      expect(byStep[k].sats).toBeCloseTo(row.satellites, 6);
      expect(byStep[k].massKg).toBeCloseTo(row.mass_kg, 3);
    });
    expect(r.tiers.TAM.revenueEur[0]).toBeCloseTo(sqlFunnel[0].revenue_eur!, 0);
    expect(r.tiers.SAM.revenueEur[0]).toBeCloseTo(sqlFunnel[3].revenue_eur!, 0);
    expect(r.tiers.SAM.revenueEur[1]).toBeCloseTo(sqlFunnel[3].revenue_eur_high!, 0);
    expect(r.tiers.SOM.revenueEur[0]).toBeCloseTo(sqlFunnel[5].revenue_eur!, 0);
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

  it("is capacity-bound when demand exceeds successful launches", () => {
    const r = computeQ1(satellites, launchSites, { ...baseLevers, penetration: 0.15, launchesPerYear: 1 }, baseFixed, tamRevenueUsd(2025));
    expect(r.bottleneck).toBe("capacity");
    expect(r.somLaunches).toBeCloseTo(baseLevers.successRate);
    expect(r.tiers.SOM.revenueEur[0]).toBeCloseTo(baseLevers.successRate * baseFixed.pricePerLaunchEur);
  });
});
