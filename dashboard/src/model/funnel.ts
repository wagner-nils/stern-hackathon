import type { AssumptionValues } from "../data/assumptions";
import type { CustomerType, DemandSegment, Figure, LaunchSite, Vehicle } from "../data/types";
import { coveredShare, reachableInclinations } from "./orbits";

export interface Flow {
  sats: number;
  massKg: number;
}

export type StepId = "tam" | "open" | "fits" | "reachable" | "premium" | "som";

export interface Step extends Flow {
  id: StepId;
  label: string;
}

export type TierId = "TAM" | "SAM" | "SOM";

export interface Tier extends Flow {
  id: TierId;
  /** Low and high estimate in EUR; equal when the tier has a single price. */
  revenueEur: [number, number];
  /** Spectrum launches needed to fly the tier at the assumed fill rate. */
  launches: number;
}

export interface MarketInputs {
  baseYear: number;
  launchRevenueUsd: Figure;
  rideshareUsdPerKg: Figure;
  dedicatedUsdPerKg: Figure;
  eurPerUsd: Figure;
}

export interface MarketResult {
  steps: Step[];
  tiers: Record<TierId, Tier>;
  /** Demand multiplier from the base year to the planning year. */
  growth: number;
  bottleneck: "demand" | "capacity";
}

const openShare = (customer: CustomerType, p: AssumptionValues): number =>
  ({
    "open-commercial": 1,
    "institutional-eu": 1,
    "institutional-us": p.usInstitutionalOpen,
    "institutional-other": p.otherGovOpen,
    captive: 0,
  })[customer];

export function computeMarket(
  demand: DemandSegment[],
  sites: LaunchSite[],
  vehicle: Vehicle,
  p: AssumptionValues,
  m: MarketInputs,
): MarketResult {
  const growth = Math.pow(1 + p.marketGrowth, Math.max(0, p.planningYear - m.baseYear));
  const reach = sites.flatMap(reachableInclinations);
  const capacityFor = (s: DemandSegment) => vehicle.payloadKg[s.orbit] ?? 0;

  const open = (s: DemandSegment) => openShare(s.customer, p);
  const fits = (s: DemandSegment) => open(s) * (s.avgMassKg <= capacityFor(s) ? 1 : 0);
  const reachable = (s: DemandSegment) => fits(s) * coveredShare(s.inclination, reach);
  const premium = (s: DemandSegment) => reachable(s) * p.premiumShare;

  const sum = (weight: (s: DemandSegment) => number): Flow =>
    demand.reduce(
      (acc, s) => {
        const sats = s.satsPerYear * weight(s) * growth;
        return { sats: acc.sats + sats, massKg: acc.massKg + sats * s.avgMassKg };
      },
      { sats: 0, massKg: 0 },
    );

  // Launch-equivalents: mass of each segment over what one Spectrum carries to that orbit.
  const launchesFor = (weight: (s: DemandSegment) => number) =>
    demand.reduce((acc, s) => {
      const perLaunch = capacityFor(s) * p.fillRate;
      return perLaunch > 0 ? acc + (s.satsPerYear * weight(s) * growth * s.avgMassKg) / perLaunch : acc;
    }, 0);

  const tam = sum(() => 1);
  const sam = sum(reachable);
  const winnable = sum(premium);
  const winnableLaunches = launchesFor(premium);
  const somLaunches = Math.min(p.launchesPerYear, winnableLaunches);
  const scale = winnableLaunches > 0 ? somLaunches / winnableLaunches : 0;
  const som = { sats: winnable.sats * scale, massKg: winnable.massKg * scale };

  const fx = m.eurPerUsd.value;
  const samRevenue: [number, number] = [
    sam.massKg * m.rideshareUsdPerKg.value * fx,
    sam.massKg * m.dedicatedUsdPerKg.value * fx,
  ];
  const tamRevenue = m.launchRevenueUsd.value * fx * growth;
  const somRevenue = somLaunches * p.pricePerLaunchEurM * 1e6;

  return {
    steps: [
      { id: "tam", label: "Global satellite demand", ...tam },
      { id: "open", label: "Open to a European launcher", ...sum(open) },
      { id: "fits", label: "Fits on Spectrum", ...sum(fits) },
      { id: "reachable", label: "Reachable from Andøya", ...sam },
      { id: "premium", label: "Pays for a dedicated launch", ...winnable },
      { id: "som", label: "Isar can fly", ...som },
    ],
    tiers: {
      TAM: { id: "TAM", ...tam, revenueEur: [tamRevenue, tamRevenue], launches: launchesFor(() => 1) },
      SAM: { id: "SAM", ...sam, revenueEur: samRevenue, launches: launchesFor(reachable) },
      SOM: { id: "SOM", ...som, revenueEur: [somRevenue, somRevenue], launches: somLaunches },
    },
    growth,
    bottleneck: somLaunches < winnableLaunches ? "capacity" : "demand",
  };
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

/** Satellites and mass per display group, largest first. */
export function demandByGroup(demand: DemandSegment[]): ({ group: string } & Flow)[] {
  const groups = new Map<string, Flow>();
  for (const s of demand) {
    const g = groups.get(s.group) ?? { sats: 0, massKg: 0 };
    groups.set(s.group, { sats: g.sats + s.satsPerYear, massKg: g.massKg + s.satsPerYear * s.avgMassKg });
  }
  return [...groups].map(([group, flow]) => ({ group, ...flow })).sort((a, b) => b.sats - a.sats);
}
