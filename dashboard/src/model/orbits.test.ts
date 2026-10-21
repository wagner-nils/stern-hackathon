import { describe, expect, it } from "vitest";
import type { LaunchSite } from "../data/types";
import { coveredShare, inclinationFromAzimuth, mergeIntervals, reachableInclinations } from "./orbits";

describe("inclinationFromAzimuth", () => {
  it("due east gives the site latitude", () => {
    expect(inclinationFromAzimuth(0, 90)).toBeCloseTo(0);
    expect(inclinationFromAzimuth(28.5, 90)).toBeCloseTo(28.5);
  });

  it("due north gives a polar orbit at any latitude", () => {
    expect(inclinationFromAzimuth(69.3, 0)).toBeCloseTo(90);
  });

  it("westward launches are retrograde", () => {
    expect(inclinationFromAzimuth(28.5, 270)).toBeCloseTo(151.5);
  });
});

describe("reachableInclinations", () => {
  it("covers polar to SSO for a corridor that wraps through north", () => {
    const site = { lat: 69.3, azimuths: [{ from: 335, to: 5 }] } as LaunchSite;
    const [[lo, hi]] = reachableInclinations(site);
    expect(lo).toBeCloseTo(88.2, 1);
    expect(hi).toBeCloseTo(98.6, 1);
  });
});

describe("coveredShare", () => {
  it("returns the overlapping fraction of a band", () => {
    expect(coveredShare([90, 100], [[95, 120]])).toBeCloseTo(0.5);
    expect(coveredShare([0, 28], [[88, 99]])).toBe(0);
  });

  it("does not double count overlapping intervals", () => {
    expect(coveredShare([0, 10], [[0, 6], [4, 10]])).toBeCloseTo(1);
  });

  it("treats a zero-width band as a point", () => {
    expect(coveredShare([97.4, 97.4], [[90, 99]])).toBe(1);
  });
});

describe("mergeIntervals", () => {
  it("merges overlaps and keeps gaps", () => {
    expect(mergeIntervals([[5, 8], [0, 3], [2, 4]])).toEqual([[0, 4], [5, 8]]);
  });
});
