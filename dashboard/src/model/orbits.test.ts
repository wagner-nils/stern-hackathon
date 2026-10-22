import { describe, expect, it } from "vitest";
import { launchSites } from "../data/warehouse";
import { coveredShare, inclinationFromAzimuth, inclinationsFromCorridor, mergeIntervals } from "./orbits";

describe("inclinationFromAzimuth", () => {
  it("due east gives the site latitude", () => {
    expect(inclinationFromAzimuth(0, 90)).toBeCloseTo(0);
    expect(inclinationFromAzimuth(28.5, 90)).toBeCloseTo(28.5);
  });

  it("due north gives a polar orbit at any latitude", () => {
    expect(inclinationFromAzimuth(69.1, 0)).toBeCloseTo(90);
  });

  it("westward launches are retrograde", () => {
    expect(inclinationFromAzimuth(28.5, 270)).toBeCloseTo(151.5);
  });
});

describe("Andøya in the warehouse", () => {
  it("matches the physics of its licensed headings 280–360° at 69.1° N", () => {
    const andoya = launchSites.find((s) => s.id === "andoya")!;
    const [lo, hi] = inclinationsFromCorridor(andoya.latitude!, { from: 280, to: 360 });
    expect(lo).toBeCloseTo(andoya.inclination_min!, 0);
    expect(hi).toBeCloseTo(andoya.inclination_max!, 0);
  });
});

describe("intervals", () => {
  it("returns the overlapping fraction of a band", () => {
    expect(coveredShare([90, 100], [[95, 120]])).toBeCloseTo(0.5);
    expect(coveredShare([0, 28], [[88, 99]])).toBe(0);
  });

  it("merges overlaps and keeps gaps", () => {
    expect(mergeIntervals([[5, 8], [0, 3], [2, 4]])).toEqual([[0, 4], [5, 8]]);
  });
});
