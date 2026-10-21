import { describe, expect, it } from "vitest";
import { assumptions, defaultValues } from "./assumptions";
import { cadencePlan, premiumPlan, successPlan } from "./market";

describe("year plans", () => {
  const years = Object.keys(cadencePlan).map(Number);

  it("cover the same years", () => {
    expect(Object.keys(premiumPlan).map(Number)).toEqual(years);
    expect(Object.keys(successPlan).map(Number)).toEqual(years);
  });

  it("never fall from one year to the next", () => {
    for (const plan of [cadencePlan, premiumPlan, successPlan]) {
      for (let k = 1; k < years.length; k++) expect(plan[years[k]]).toBeGreaterThanOrEqual(plan[years[k - 1]]);
    }
  });

  it("stay inside the slider ranges", () => {
    const range = (id: string) => assumptions.find((a) => a.id === id)!;
    for (const year of years) {
      for (const [id, plan] of [["launchesPerYear", cadencePlan], ["premiumShare", premiumPlan], ["launchSuccessRate", successPlan]] as const) {
        expect(plan[year]).toBeGreaterThanOrEqual(range(id).min);
        expect(plan[year]).toBeLessThanOrEqual(range(id).max);
      }
    }
  });

  it("start the base case on the default planning year", () => {
    const y = defaultValues.planningYear;
    expect(defaultValues.launchesPerYear).toBe(cadencePlan[y]);
    expect(defaultValues.premiumShare).toBe(premiumPlan[y]);
    expect(defaultValues.launchSuccessRate).toBe(successPlan[y]);
  });
});
