import { cadencePlan } from "./market";
import type { Assumption } from "./types";

export type AssumptionId =
  | "planningYear"
  | "launchesPerYear"
  | "fillRate"
  | "pricePerLaunchEurM"
  | "marketGrowth"
  | "premiumShare"
  | "usInstitutionalOpen"
  | "otherGovOpen";
export type AssumptionValues = Record<AssumptionId, number>;

export const assumptions: Assumption<AssumptionId>[] = [
  {
    id: "planningYear",
    label: "Planning year",
    group: "isar",
    value: 2027,
    unit: "year",
    min: 2026,
    max: 2030,
    step: 1,
    confidence: "high",
    owner: "Nils",
    sourceId: "teamEstimate",
    note: "Moving the year resets launches to Isar's plan for that year.",
  },
  {
    id: "launchesPerYear",
    label: "Spectrum launches from Andøya",
    group: "isar",
    value: cadencePlan[2027],
    unit: "launches/yr",
    min: 0,
    max: 30,
    step: 1,
    confidence: "medium",
    owner: "Luca",
    sourceId: "isarFlightPlan",
    note: "Plan: 4 in 2027, about 8 in 2028. Slider stops at the site licence of 30/yr for all of Andøya.",
  },
  {
    id: "fillRate",
    label: "Payload fill rate per launch",
    group: "isar",
    value: 0.7,
    unit: "%",
    min: 0.3,
    max: 1,
    step: 0.05,
    confidence: "low",
    owner: "Benedikt",
    sourceId: "teamEstimate",
  },
  {
    id: "pricePerLaunchEurM",
    label: "Price per Spectrum launch",
    group: "isar",
    value: 12,
    unit: "€ M",
    min: 5,
    max: 25,
    step: 0.5,
    confidence: "low",
    owner: "Luca",
    sourceId: "teamEstimate",
    note: "Not published; Electron earns about 8.5 M USD per launch.",
  },
  {
    id: "marketGrowth",
    label: "Market growth p.a.",
    group: "market",
    value: 0.07,
    unit: "%",
    min: 0,
    max: 0.25,
    step: 0.01,
    confidence: "low",
    owner: "Benedikt",
    sourceId: "teamEstimate",
  },
  {
    id: "premiumShare",
    label: "Share that pays for a dedicated launch",
    group: "market",
    value: 0.25,
    unit: "%",
    min: 0,
    max: 0.6,
    step: 0.05,
    confidence: "low",
    owner: "Benedikt",
    sourceId: "teamEstimate",
    note: "The rest flies rideshare, which is cheaper per kg.",
  },
  {
    id: "usInstitutionalOpen",
    label: "US government demand open to Isar",
    group: "market",
    value: 0,
    unit: "%",
    min: 0,
    max: 1,
    step: 0.05,
    confidence: "medium",
    owner: "Nils",
    sourceId: "nspm17",
  },
  {
    id: "otherGovOpen",
    label: "Other governments' demand open to Isar",
    group: "market",
    value: 0.2,
    unit: "%",
    min: 0,
    max: 1,
    step: 0.05,
    confidence: "low",
    owner: "Benedikt",
    sourceId: "teamEstimate",
    note: "Japan, India, Korea and others mostly fly on their own launchers.",
  },
];

export const defaultValues = Object.fromEntries(assumptions.map((a) => [a.id, a.value])) as AssumptionValues;
