import type { AssumptionValues } from "../data/assumptions";
import type { CustomerType, DemandSegment, LaunchSite, Vehicle } from "../data/types";
import { coveredShare, reachableInclinations } from "./orbits";

export interface Flow {
  sats: number;
  massKg: number;
}

export type StageId = "global" | "reachable" | "fits" | "open" | "dedicated" | "served";

export interface FunnelStage extends Flow {
  id: StageId;
  label: string;
}

export interface FunnelResult {
  stages: FunnelStage[];
  /** Payload mass Isar can fly per year from the given sites. */
  capacityKg: number;
  /** Whether demand or Isar's launch capacity limits what is served. */
  bottleneck: "demand" | "capacity";
}

const openShare = (customer: CustomerType, p: AssumptionValues): number =>
  ({
    "open-commercial": 1,
    "institutional-eu": 1,
    "institutional-us": p.usInstitutionalOpen,
    captive: 0,
  })[customer];

export function computeFunnel(
  demand: DemandSegment[],
  sites: LaunchSite[],
  vehicle: Vehicle,
  p: AssumptionValues,
): FunnelResult {
  const reach = sites.flatMap(reachableInclinations);
  const capacityFor = (s: DemandSegment) => vehicle.payloadKg[s.orbit] ?? 0;

  const reachable = (s: DemandSegment) => coveredShare(s.inclination, reach);
  const fits = (s: DemandSegment) => reachable(s) * (s.avgMassKg <= capacityFor(s) ? 1 : 0);
  const open = (s: DemandSegment) => fits(s) * openShare(s.customer, p);
  const dedicated = (s: DemandSegment) => open(s) * p.dedicatedShare;

  const sum = (weight: (s: DemandSegment) => number): Flow =>
    demand.reduce(
      (acc, s) => {
        const w = weight(s);
        return { sats: acc.sats + s.satsPerYear * w, massKg: acc.massKg + s.satsPerYear * s.avgMassKg * w };
      },
      { sats: 0, massKg: 0 },
    );

  const dedicatedFlow = sum(dedicated);
  // Capacity uses the payload of the orbits actually in demand, weighted by their mass.
  const weightedPayload =
    dedicatedFlow.massKg > 0
      ? demand.reduce((acc, s) => acc + s.satsPerYear * s.avgMassKg * dedicated(s) * capacityFor(s), 0) /
        dedicatedFlow.massKg
      : 0;
  const capacityKg = p.launchesPerYear * p.payloadUtilisation * weightedPayload;
  const scale = dedicatedFlow.massKg > 0 ? Math.min(1, capacityKg / dedicatedFlow.massKg) : 0;

  const stages: FunnelStage[] = [
    { id: "global", label: "Global satellite demand", ...sum(() => 1) },
    { id: "reachable", label: "Orbit reachable from site", ...sum(reachable) },
    { id: "fits", label: "Fits Spectrum payload", ...sum(fits) },
    { id: "open", label: "Open to a European launcher", ...sum(open) },
    { id: "dedicated", label: "Wants a dedicated launch", ...dedicatedFlow },
    { id: "served", label: "Isar can fly (capacity)", sats: dedicatedFlow.sats * scale, massKg: dedicatedFlow.massKg * scale },
  ];

  return { stages, capacityKg, bottleneck: scale < 1 ? "capacity" : "demand" };
}

/** Satellites per year in inclination bins, for the reach chart. */
export function demandByInclination(demand: DemandSegment[], binDeg = 5): { from: number; to: number; sats: number }[] {
  const bins = Array.from({ length: Math.ceil(180 / binDeg) }, (_, k) => ({ from: k * binDeg, to: (k + 1) * binDeg, sats: 0 }));
  for (const s of demand) {
    for (const bin of bins) {
      bin.sats += s.satsPerYear * coveredShare(s.inclination, [[bin.from, bin.to]]);
    }
  }
  return bins;
}
