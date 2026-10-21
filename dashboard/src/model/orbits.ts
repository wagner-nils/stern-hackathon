import type { AzimuthCorridor, LaunchSite } from "../data/types";

export type Interval = [number, number];

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

/** Inclination reached by a direct ascent: cos(i) = sin(azimuth) · cos(latitude). */
export function inclinationFromAzimuth(latDeg: number, azimuthDeg: number): number {
  return deg(Math.acos(Math.sin(rad(azimuthDeg)) * Math.cos(rad(latDeg))));
}

function sampleCorridor({ from, to }: AzimuthCorridor, stepDeg = 0.25): number[] {
  const span = (((to - from) % 360) + 360) % 360;
  const n = Math.max(1, Math.ceil(span / stepDeg));
  return Array.from({ length: n + 1 }, (_, k) => from + (span * k) / n);
}

/** Inclination intervals a site reaches by direct ascent, one per azimuth corridor (no doglegs). */
export function reachableInclinations(site: LaunchSite): Interval[] {
  return site.azimuths.map((corridor) => {
    const inclinations = sampleCorridor(corridor).map((az) => inclinationFromAzimuth(site.lat, az));
    return [Math.min(...inclinations), Math.max(...inclinations)];
  });
}

export function mergeIntervals(intervals: Interval[]): Interval[] {
  const sorted = [...intervals].sort((a, b) => a[0] - b[0]);
  const merged: Interval[] = [];
  for (const [a, b] of sorted) {
    const last = merged[merged.length - 1];
    if (last && a <= last[1]) last[1] = Math.max(last[1], b);
    else merged.push([a, b]);
  }
  return merged;
}

/** Share of the band [lo, hi] covered by the intervals, with demand spread evenly over the band. */
export function coveredShare([lo, hi]: Interval, intervals: Interval[]): number {
  if (hi <= lo) return intervals.some(([a, b]) => lo >= a && lo <= b) ? 1 : 0;
  const clipped = intervals
    .map(([a, b]): Interval => [Math.max(a, lo), Math.min(b, hi)])
    .filter(([a, b]) => b > a);
  const covered = mergeIntervals(clipped).reduce((sum, [a, b]) => sum + (b - a), 0);
  return covered / (hi - lo);
}
