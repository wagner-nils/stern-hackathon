import raw from "./warehouse.json";

// The fact warehouse snapshot, exported from Supabase by warehouse/export.py. Every number in the tool comes from here.

export type Confidence = "high" | "medium" | "low";
export type Tier = "TAM" | "SAM" | "SOM";

export interface Source {
  id: string;
  title: string;
  publisher: string;
  url: string | null;
  published: string | null;
  kind: string;
  reliability: Confidence;
  note: string | null;
  /** Citation label for chips, e.g. GCAT or SIA 2026. */
  short: string | null;
}

export interface Metric {
  id: string;
  name: string;
  unit: string;
  definition: string;
}

export interface Fact {
  metric_id: string;
  year: number | null;
  scope: string;
  entity: string;
  value: number;
  source_id: string;
  is_preferred: boolean;
  confidence: Confidence;
  note: string | null;
}

export interface Assumption {
  id: string;
  name: string;
  question: string;
  tier: Tier | "fixed" | "outlook";
  value: number;
  low: number | null;
  high: number | null;
  unit: string;
  is_lever: boolean;
  rationale: string;
  source_ids: string[];
  owner: string;
  confidence: Confidence;
}

export interface LaunchSite {
  id: string;
  name: string;
  country: string;
  latitude: number;
  inclination_min: number;
  inclination_max: number;
  status: string;
  isar_access: string;
  max_launches_per_year: number | null;
  note: string | null;
  source_id: string;
}

export interface Vehicle {
  id: string;
  name: string;
  operator: string;
  payload_leo_kg: number | null;
  payload_sso_kg: number | null;
  price_usd: number | null;
  class: string;
  note: string | null;
  source_id: string;
}

export interface ManifestEntry {
  id: string;
  customer: string;
  mission: string;
  planned: string;
  site: string;
  status: string;
  note: string | null;
  source_id: string;
}

export interface Satellite {
  year: number;
  inclination: number;
  massKg: number;
  customerType: string;
  customerGroup: string;
  orbitClass: string;
  launchVehicle: string;
  launcherClass: string;
  operator: string;
  mission: string;
}

export interface FunnelRow {
  step: number;
  tier: Tier;
  label: string;
  satellites: number;
  mass_kg: number;
  revenue_eur: number | null;
  revenue_eur_high: number | null;
}

interface RawSnapshot {
  generatedAt: string;
  sources: Source[];
  metrics: Metric[];
  facts: Fact[];
  assumptions: Assumption[];
  launch_sites: LaunchSite[];
  vehicles: Vehicle[];
  manifest: ManifestEntry[];
  satellites: {
    count: number;
    year: number[];
    inclination: number[];
    massKg: number[];
    codes: Record<string, number[]>;
    dictionaries: Record<string, string[]>;
  };
  q1Funnel: FunnelRow[];
  samLaunchers: { launch_vehicle: string; launcher_class: string; satellites: number; mass_kg: number }[];
}

const snapshot = raw as unknown as RawSnapshot;

export const generatedAt = snapshot.generatedAt;
export const sources: Record<string, Source> = Object.fromEntries(snapshot.sources.map((s) => [s.id, s]));
export const metrics: Record<string, Metric> = Object.fromEntries(snapshot.metrics.map((m) => [m.id, m]));
export const facts = snapshot.facts;
export const assumptions = snapshot.assumptions;
export const launchSites = snapshot.launch_sites;
export const vehicles = snapshot.vehicles;
export const manifest = snapshot.manifest;
export const sqlFunnel = snapshot.q1Funnel;
export const sqlSamLaunchers = snapshot.samLaunchers;

/** Satellites are stored column by column with repeated strings once; this turns them back into rows. */
function decodeSatellites(s: RawSnapshot["satellites"]): Satellite[] {
  const text = (column: string, k: number) => s.dictionaries[column][s.codes[column][k]];
  return Array.from({ length: s.count }, (_, k) => ({
    year: s.year[k],
    inclination: s.inclination[k],
    massKg: s.massKg[k],
    customerType: text("customer_type", k),
    customerGroup: text("customer_group", k),
    orbitClass: text("orbit_class", k),
    launchVehicle: text("launch_vehicle", k),
    launcherClass: text("launcher_class", k),
    operator: text("operator", k),
    mission: text("mission", k),
  }));
}

export const satellites = decodeSatellites(snapshot.satellites);

export function assumption(id: string): Assumption {
  const a = assumptions.find((x) => x.id === id);
  if (!a) throw new Error(`Assumption ${id} is missing in the warehouse snapshot`);
  return a;
}

interface FactQuery {
  year?: number;
  scope?: string;
  entity?: string;
}

const matches = (f: Fact, metricId: string, q: FactQuery) =>
  f.metric_id === metricId &&
  (q.year === undefined || f.year === q.year) &&
  f.scope === (q.scope ?? "global") &&
  f.entity === (q.entity ?? "");

/** All reported values of a metric, the preferred one first. */
export function factsFor(metricId: string, q: FactQuery = {}): Fact[] {
  return facts.filter((f) => matches(f, metricId, q)).sort((a, b) => Number(b.is_preferred) - Number(a.is_preferred));
}

export function preferred(metricId: string, q: FactQuery = {}): Fact {
  const f = facts.find((x) => x.is_preferred && matches(x, metricId, q));
  if (!f) throw new Error(`No preferred fact for ${metricId} ${JSON.stringify(q)}`);
  return f;
}
