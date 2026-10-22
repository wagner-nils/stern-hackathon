import { describe, expect, it } from "vitest";
import { assumptions, facts, launchSites, manifest, metrics, satellites, sources, vehicles } from "./warehouse";

describe("fact warehouse snapshot", () => {
  it("has a source for every fact, assumption, site, vehicle and contract", () => {
    for (const f of facts) expect(sources[f.source_id], f.metric_id).toBeDefined();
    for (const a of assumptions) for (const id of a.source_ids) expect(sources[id], a.id).toBeDefined();
    for (const row of [...launchSites, ...vehicles, ...manifest]) expect(sources[row.source_id], row.id).toBeDefined();
  });

  it("knows the metric of every fact", () => {
    for (const f of facts) expect(metrics[f.metric_id], f.metric_id).toBeDefined();
  });

  it("prefers exactly one value per metric, year, scope and entity", () => {
    const groups = new Map<string, number>();
    for (const f of facts) {
      const key = [f.metric_id, f.year, f.scope, f.entity].join("|");
      groups.set(key, (groups.get(key) ?? 0) + (f.is_preferred ? 1 : 0));
    }
    for (const [key, n] of groups) expect(n, key).toBe(1);
  });

  it("keeps every lever inside its range", () => {
    for (const a of assumptions.filter((x) => x.is_lever)) {
      expect(a.value, a.id).toBeGreaterThanOrEqual(a.low!);
      expect(a.value, a.id).toBeLessThanOrEqual(a.high!);
    }
  });

  it("holds all 4,521 satellites of 2025 with mass and inclination", () => {
    const y2025 = satellites.filter((s) => s.year === 2025);
    expect(y2025).toHaveLength(4521);
    expect(y2025.every((s) => s.massKg > 0 && Number.isFinite(s.inclination))).toBe(true);
  });
});
