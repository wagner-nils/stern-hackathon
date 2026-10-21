import raw2024 from "./generated/demand-2024.json";
import raw2025 from "./generated/demand-2025.json";
import type { CustomerType, DemandDataset, DemandSegment, OrbitClass } from "./types";

// Flown demand per year from McDowell's GCAT, built by pipeline/gcat_demand.py. Rerun the pipeline to refresh.

const orbits: OrbitClass[] = ["LEO", "SSO", "MEO", "GTO/GEO", "Beyond"];
const customers: CustomerType[] = ["open-commercial", "institutional-eu", "institutional-us", "institutional-other", "captive"];

interface RawDataset {
  meta: { year: number; dataVintage?: string };
  segments: {
    id: string;
    label: string;
    group: string;
    orbit: string;
    inclination: number[];
    avgMassKg: number;
    customer: string;
    satsPerYear: number;
  }[];
}

/** Checks a generated file against the model's types, so a broken pipeline run fails loudly instead of skewing figures. */
export function parseDemand(raw: RawDataset): DemandDataset & { vintage?: string } {
  const segments = raw.segments.map((s): DemandSegment => {
    const [lo, hi] = s.inclination;
    const valid =
      orbits.includes(s.orbit as OrbitClass) &&
      customers.includes(s.customer as CustomerType) &&
      s.inclination.length === 2 &&
      lo >= 0 &&
      hi <= 180 &&
      lo <= hi &&
      s.avgMassKg >= 0 &&
      s.satsPerYear >= 0;
    if (!valid) throw new Error(`Invalid demand segment ${s.id} in ${raw.meta.year}`);
    return { ...s, orbit: s.orbit as OrbitClass, customer: s.customer as CustomerType, inclination: [lo, hi] };
  });
  return { year: raw.meta.year, sourceId: "gcat", confidence: "high", segments, vintage: raw.meta.dataVintage };
}

export const demandByYear = {
  2024: parseDemand(raw2024),
  2025: parseDemand(raw2025),
};

export type DemandYear = keyof typeof demandByYear;
export const latestDemand = demandByYear[2025];
