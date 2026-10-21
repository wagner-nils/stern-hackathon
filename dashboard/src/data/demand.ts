import type { DemandDataset, DemandSegment } from "./types";

type Row = Omit<DemandSegment, "id" | "label">;

// PLACEHOLDER until the GCAT pipeline writes generated/demand-2025.json: rough 2024 shape from the team draft.
const rows: Row[] = [
  { group: "Starlink", customer: "captive", orbit: "LEO", inclination: [43, 53], avgMassKg: 800, satsPerYear: 1950 },
  { group: "China", customer: "captive", orbit: "LEO", inclination: [35, 98], avgMassKg: 770, satsPerYear: 260 },
  { group: "Russia", customer: "captive", orbit: "LEO", inclination: [50, 98], avgMassKg: 780, satsPerYear: 90 },
  { group: "US government", customer: "institutional-us", orbit: "LEO", inclination: [40, 98], avgMassKg: 800, satsPerYear: 100 },
  { group: "Commercial (open)", customer: "open-commercial", orbit: "SSO", inclination: [95, 99], avgMassKg: 220, satsPerYear: 300 },
  { group: "Commercial (open)", customer: "open-commercial", orbit: "LEO", inclination: [40, 60], avgMassKg: 220, satsPerYear: 130 },
  { group: "Commercial (open)", customer: "open-commercial", orbit: "GTO/GEO", inclination: [0, 28], avgMassKg: 4000, satsPerYear: 50 },
  { group: "European institutional", customer: "institutional-eu", orbit: "SSO", inclination: [96, 99], avgMassKg: 220, satsPerYear: 20 },
];

export const demand2025: DemandDataset = {
  year: 2024,
  sourceId: "teamDraft",
  confidence: "placeholder",
  segments: rows.map((r, k) => ({ ...r, id: `seg-${k}`, label: `${r.group} · ${r.orbit}` })),
};
