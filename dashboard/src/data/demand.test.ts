import { describe, expect, it } from "vitest";
import { demandByYear, parseDemand } from "./demand";

describe("generated demand", () => {
  it("matches McDowell's 2025 total of payloads that reached orbit", () => {
    const sats = demandByYear[2025].segments.reduce((sum, s) => sum + s.satsPerYear, 0);
    expect(sats).toBe(4521);
  });

  it("rejects a segment with an unknown orbit class", () => {
    const raw = {
      meta: { year: 2025 },
      segments: [{ id: "x", label: "x", group: "x", orbit: "LUNAR", inclination: [0, 2], avgMassKg: 1, customer: "captive", satsPerYear: 1 }],
    };
    expect(() => parseDemand(raw)).toThrow(/Invalid demand segment/);
  });
});
