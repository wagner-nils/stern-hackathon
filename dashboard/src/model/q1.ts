import type { LaunchSite, Satellite } from "../data/warehouse";
import { type Interval, coveredShare, mergeIntervals } from "./orbits";

// Q1 funnel, satellite by satellite. Mirrors the SQL view v_q1_funnel in warehouse/schema.sql; a test keeps both equal.

export interface Q1Levers {
  baseYear: number;
  /** 0 = Andøya, 1 = plus Nova Scotia, 2 = plus Kourou. */
  siteScope: number;
  payloadLimitKg: number;
  otherGovOpen: number;
  penetration: number;
  launchesPerYear: number;
  successRate: number;
}

export interface Q1Fixed {
  fillRate: number;
  pricePerLaunchEur: number;
  rideshareUsdPerKg: number;
  dedicatedUsdPerKg: number;
  usdPerEur: number;
  usGovOpen: number;
}

export interface Flow {
  sats: number;
  massKg: number;
}

export type StepId = "tam" | "access" | "payload" | "orbit" | "penetration" | "capacity";

export interface Step extends Flow {
  id: StepId;
  label: string;
}

export interface TierFlow extends Flow {
  /** Low and high estimate in EUR; equal when the tier has one price. */
  revenueEur: [number, number];
}

export interface Q1Result {
  steps: Step[];
  tiers: { TAM: TierFlow; SAM: TierFlow; SOM: TierFlow };
  reach: Interval[];
  wantKg: number;
  capacityKg: number;
  /** Spectrum launches the SOM fills: the smaller of demand and successful launches. */
  somLaunches: number;
  bottleneck: "demand" | "capacity";
}

const SITE_ORDER = ["andoya", "nova-scotia", "kourou"];

export function sitesInScope(scope: number, sites: LaunchSite[]): LaunchSite[] {
  return SITE_ORDER.slice(0, scope + 1).map((id) => {
    const site = sites.find((s) => s.id === id);
    if (!site) throw new Error(`Launch site ${id} is missing in the warehouse`);
    return site;
  });
}

function openWeight(customerType: string, l: Q1Levers, f: Q1Fixed): number {
  if (customerType === "open-commercial" || customerType === "institutional-eu") return 1;
  if (customerType === "institutional-other") return l.otherGovOpen;
  if (customerType === "institutional-us") return f.usGovOpen;
  return 0;
}

/** Spectrum's limit is quoted for SSO; low-inclination LEO from other sites gets the LEO figure, scaled alike. */
const payloadLimit = (orbitClass: string, l: Q1Levers) =>
  orbitClass === "SSO" ? l.payloadLimitKg : (l.payloadLimitKg * 1000) / 700;

export function computeQ1(
  sats: Satellite[],
  sites: LaunchSite[],
  l: Q1Levers,
  f: Q1Fixed,
  tamRevenueUsd: number,
): Q1Result {
  const reach = mergeIntervals(sitesInScope(l.siteScope, sites).map((s): Interval => [s.inclination_min, s.inclination_max]));
  const inReach = (inc: number) => reach.some(([lo, hi]) => inc >= lo && inc <= hi);

  const flows: Record<"tam" | "access" | "payload" | "orbit", Flow> = {
    tam: { sats: 0, massKg: 0 },
    access: { sats: 0, massKg: 0 },
    payload: { sats: 0, massKg: 0 },
    orbit: { sats: 0, massKg: 0 },
  };
  for (const s of sats) {
    if (s.year !== l.baseYear) continue;
    const open = openWeight(s.customerType, l, f);
    const fits = open * (s.massKg <= payloadLimit(s.orbitClass, l) ? 1 : 0);
    const reached = fits * (inReach(s.inclination) ? 1 : 0);
    for (const [key, w] of [["tam", 1], ["access", open], ["payload", fits], ["orbit", reached]] as const) {
      flows[key].sats += w;
      flows[key].massKg += w * s.massKg;
    }
  }

  const sam = flows.orbit;
  const want: Flow = { sats: sam.sats * l.penetration, massKg: sam.massKg * l.penetration };
  const perLaunchKg = l.payloadLimitKg * f.fillRate;
  const capacityKg = l.launchesPerYear * l.successRate * perLaunchKg;
  const somKg = Math.min(want.massKg, capacityKg);
  const som: Flow = { sats: want.massKg > 0 ? want.sats * (somKg / want.massKg) : 0, massKg: somKg };
  const somLaunches = perLaunchKg > 0 ? somKg / perLaunchKg : 0;
  const tamRevenue = tamRevenueUsd / f.usdPerEur;
  const somRevenue = somLaunches * f.pricePerLaunchEur;

  return {
    steps: [
      { id: "tam", label: "All satellites that reached orbit", ...flows.tam },
      { id: "access", label: "Open to a European launcher", ...flows.access },
      { id: "payload", label: "Fits on Spectrum", ...flows.payload },
      { id: "orbit", label: "Orbit reachable", ...sam },
      { id: "penetration", label: "Buys a dedicated launch", ...want },
      { id: "capacity", label: "Isar can fly", ...som },
    ],
    tiers: {
      TAM: { ...flows.tam, revenueEur: [tamRevenue, tamRevenue] },
      SAM: {
        ...sam,
        revenueEur: [(sam.massKg * f.rideshareUsdPerKg) / f.usdPerEur, (sam.massKg * f.dedicatedUsdPerKg) / f.usdPerEur],
      },
      SOM: { ...som, revenueEur: [somRevenue, somRevenue] },
    },
    reach,
    wantKg: want.massKg,
    capacityKg,
    somLaunches,
    bottleneck: capacityKg < want.massKg ? "capacity" : "demand",
  };
}

/** Satellites per inclination bin, split into reachable or not, for the orbit chart. */
export function byInclination(sats: Satellite[], reach: Interval[], binDeg = 5) {
  const bins = Array.from({ length: Math.ceil(180 / binDeg) }, (_, k) => ({ from: k * binDeg, to: (k + 1) * binDeg, sats: 0 }));
  for (const s of sats) bins[Math.min(bins.length - 1, Math.floor(s.inclination / binDeg))].sats += 1;
  return bins.map((b) => ({ ...b, reachable: coveredShare([b.from, b.to], reach) > 0 }));
}

/** Count and mass per value of one satellite attribute, largest first. */
export function groupBy(sats: Satellite[], key: keyof Satellite, weight: (s: Satellite) => number = () => 1) {
  const groups = new Map<string, Flow>();
  for (const s of sats) {
    const w = weight(s);
    if (w === 0) continue;
    const name = String(s[key]);
    const g = groups.get(name) ?? { sats: 0, massKg: 0 };
    groups.set(name, { sats: g.sats + w, massKg: g.massKg + w * s.massKg });
  }
  return [...groups].map(([name, flow]) => ({ name, ...flow })).sort((a, b) => b.sats - a.sats);
}

/** Weight of a satellite in the SAM: the same three filters as computeQ1, for the drill-down tables. */
export function samWeight(l: Q1Levers, f: Q1Fixed, reach: Interval[]) {
  return (s: Satellite) => {
    if (s.year !== l.baseYear) return 0;
    const open = openWeight(s.customerType, l, f);
    const fits = s.massKg <= payloadLimit(s.orbitClass, l) ? 1 : 0;
    const reached = reach.some(([lo, hi]) => s.inclination >= lo && s.inclination <= hi) ? 1 : 0;
    return open * fits * reached;
  };
}
