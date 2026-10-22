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

export type SiteStatus = "operational" | "under construction" | "planned" | "inactive";
export type SiteAccess = "sovereign" | "national-commercial" | "international";

/** A spaceport in the global register. The model only needs id, latitude and the inclination band. */
export interface LaunchSite {
  id: string;
  name: string;
  country: string;
  country_code: string | null;
  operator: string | null;
  ownership: string | null;
  /** Empty for planned sites without published coordinates. */
  latitude: number | null;
  longitude: number | null;
  /** Direct-ascent inclination band; null where nobody has published one. */
  inclination_min: number | null;
  inclination_max: number | null;
  launch_azimuth: string | null;
  status: SiteStatus;
  first_orbital_launch: number | null;
  orbital_pads: number | null;
  max_vehicle_class: string | null;
  polar_sso: boolean | null;
  access: SiteAccess | null;
  max_launches_per_year: number | null;
  cap_basis: string | null;
  expansion: string | null;
  isar_access: string | null;
  note: string | null;
  gcat_codes: string[];
  source_id: string;
  source_ids: string[];
  confidence: Confidence;
}

export interface Vehicle {
  id: string;
  name: string;
  operator: string;
  country_code: string | null;
  class: string;
  payload_leo_kg: number | null;
  payload_sso_kg: number | null;
  payload_gto_kg: number | null;
  payload_estimated: boolean;
  reusable: boolean | null;
  status: string | null;
  first_flight: number | null;
  price_usd: number | null;
  gcat_names: string[];
  note: string | null;
  source_id: string;
}

/** Who launches what from where. */
export interface SiteVehicle {
  site_id: string;
  vehicle_id: string;
  status: "active" | "planned" | "contracted" | "retired";
  orbits: string[];
  pad: string | null;
  since: number | null;
  note: string | null;
  source_id: string;
}

/** One row of the SQL view v_launch_site_overview. */
export interface SiteOverview {
  id: string;
  launches_2024: number;
  launches_2025: number;
  launches_2026_ytd: number;
  payload_t_2025: number | null;
  satellites_2025: number | null;
  cap_used_2025: number | null;
  providers: string | null;
  provider_countries: string | null;
  orbits: string | null;
  max_payload_leo_kg: number | null;
  max_payload_sso_kg: number | null;
  max_payload_gto_kg: number | null;
}

/** One row of v_launch_site_activity: a spaceport in one year, from GCAT. */
export interface SiteActivity {
  site_id: string;
  year: number;
  launches: number;
  failures: number;
  payload_t: number | null;
  satellites: number | null;
  to_leo: number;
  to_sso: number;
  to_geo: number;
  to_other: number;
  vehicles: string;
  agencies: string;
}

/** Launches per launch provider (company or agency) and year, from v_launches_by_provider. */
export interface ProviderLaunches {
  provider: string;
  provider_country: string | null;
  year: number;
  launches: number;
  successes: number;
  payload_t: number | null;
  vehicles: string | null;
}

/** Launches per country of the launch provider and year, from v_launches_by_country. */
export interface CountryLaunches {
  country_code: string | null;
  year: number;
  launches: number;
  successes: number;
  payload_t: number | null;
  providers: number;
  provider_names: string | null;
}

export interface VehicleActivity {
  vehicle_id: string;
  year: number;
  launches: number;
  successes: number;
  payload_t: number | null;
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
  launch_site_vehicles: SiteVehicle[];
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
  siteOverview: SiteOverview[];
  siteActivity: SiteActivity[];
  vehicleActivity: VehicleActivity[];
  launchesByProvider: ProviderLaunches[];
  launchesByCountry: CountryLaunches[];
}

const snapshot = raw as unknown as RawSnapshot;

export const generatedAt = snapshot.generatedAt;
export const sources: Record<string, Source> = Object.fromEntries(snapshot.sources.map((s) => [s.id, s]));
export const metrics: Record<string, Metric> = Object.fromEntries(snapshot.metrics.map((m) => [m.id, m]));
export const facts = snapshot.facts;
export const assumptions = snapshot.assumptions;
export const launchSites = snapshot.launch_sites;
export const vehicles = snapshot.vehicles;
// The site register is newer than some snapshots; an older snapshot shows an empty register instead of failing.
export const siteVehicles = snapshot.launch_site_vehicles ?? [];
export const siteOverview = snapshot.siteOverview ?? [];
export const siteActivity = snapshot.siteActivity ?? [];
export const vehicleActivity = snapshot.vehicleActivity ?? [];
export const launchesByProvider = snapshot.launchesByProvider ?? [];
export const launchesByCountry = snapshot.launchesByCountry ?? [];
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
