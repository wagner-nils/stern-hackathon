import type { Assumption } from "./types";

export type AssumptionId = "dedicatedShare" | "usInstitutionalOpen" | "launchesPerYear" | "payloadUtilisation";
export type AssumptionValues = Record<AssumptionId, number>;

export const assumptions: Assumption<AssumptionId>[] = [
  {
    id: "launchesPerYear",
    label: "Spectrum launches per year from Andøya",
    value: 4,
    unit: "launches/yr",
    min: 0,
    max: 30,
    step: 1,
    confidence: "medium",
    owner: "Luca",
    sourceId: "isarFlightPlan",
    note: "Isar plan for 2027 (about 8 in 2028). Slider stops at the site licence cap of 30/yr, max 4 at night.",
  },
  {
    id: "payloadUtilisation",
    label: "Average payload utilisation per launch",
    value: 0.7,
    unit: "%",
    min: 0.3,
    max: 1,
    step: 0.05,
    confidence: "placeholder",
    owner: "Nils",
    sourceId: "placeholder",
  },
  {
    id: "dedicatedShare",
    label: "Share of open demand that buys a dedicated small launch (vs. rideshare)",
    value: 0.25,
    unit: "%",
    min: 0,
    max: 1,
    step: 0.05,
    confidence: "placeholder",
    owner: "Benedikt",
    sourceId: "placeholder",
  },
  {
    id: "usInstitutionalOpen",
    label: "Share of US government demand open to a European launcher",
    value: 0,
    unit: "%",
    min: 0,
    max: 1,
    step: 0.05,
    confidence: "placeholder",
    owner: "Benedikt",
    sourceId: "placeholder",
  },
];

export const defaultValues = Object.fromEntries(assumptions.map((a) => [a.id, a.value])) as AssumptionValues;
