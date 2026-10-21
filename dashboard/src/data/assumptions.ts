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
    note: "Isar: 4 in 2027, about double in 2028 (fully booked); ramp 7/10/12 to 2030. Slider stops at the site licence of 30/yr for all of Andøya.",
  },
  {
    id: "fillRate",
    label: "Payload fill rate per launch",
    group: "isar",
    value: 0.6,
    unit: "%",
    min: 0.4,
    max: 1,
    step: 0.05,
    confidence: "low",
    owner: "Benedikt",
    sourceId: "teamEstimate",
    note: "No public data. Shared rideshare-style flights fill about 60%; a single 200 kg customer fills only 30%.",
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
    sourceId: "spectrumPrice",
    note: "Not published; estimates €10–15 M. Electron earns 8.5 M USD for a third of the capacity, Firefly Alpha about 15 M USD.",
  },
  {
    id: "marketGrowth",
    label: "Market growth p.a.",
    group: "market",
    value: 0.09,
    unit: "%",
    min: 0,
    max: 0.2,
    step: 0.01,
    confidence: "medium",
    owner: "Benedikt",
    sourceId: "novaspace",
    note: "Novaspace forecast implies about 9% p.a. outside the megaconstellations; BryceTech 2021–25 history 13–17%.",
  },
  {
    id: "premiumShare",
    label: "Share that pays for a dedicated launch",
    group: "market",
    value: 0.2,
    unit: "%",
    min: 0,
    max: 0.5,
    step: 0.05,
    confidence: "medium",
    owner: "Benedikt",
    sourceId: "brycetech2026",
    note: "Today 17–23% of non-broadband smallsats fly on small launchers (about 10–14% in the West). SpaceX reportedly stops new rideshare bookings beyond 2028, and defence demand pushes this up.",
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
