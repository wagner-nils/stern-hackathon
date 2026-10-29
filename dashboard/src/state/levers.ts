import { type Tier, assumption, preferred, vehicles } from "../data/warehouse";
import { fmtPct } from "../lib/format";
import type { Q1Fixed, Q1Levers } from "../model/q1";

// The Q1 levers, each backed by an assumption row in the warehouse: three per tier, four for the SOM since
// penetration is split into the dedicated share and Isar's share of it.

export interface LeverDef {
  key: keyof Q1Levers;
  assumptionId: string;
  tier: Tier;
  step: number;
  options?: { value: number; label: string }[];
  format: (v: number) => string;
}

export const LEVERS: LeverDef[] = [
  {
    key: "baseYear",
    assumptionId: "tam_base_year",
    tier: "TAM",
    step: 1,
    options: [
      { value: 2024, label: "2024" },
      { value: 2025, label: "2025" },
    ],
    format: String,
  },
  {
    key: "siteScope",
    assumptionId: "sam_site_scope",
    tier: "SAM",
    step: 1,
    options: [
      { value: 0, label: "Andøya" },
      { value: 1, label: "+ Nova Scotia" },
      { value: 2, label: "+ Kourou" },
    ],
    format: (v) => ["Andøya", "Andøya + Nova Scotia", "Andøya + Nova Scotia + Kourou"][v],
  },
  { key: "otherGovOpen", assumptionId: "sam_other_gov_open", tier: "SAM", step: 0.05, format: fmtPct },
  { key: "penetration", assumptionId: "som_penetration", tier: "SOM", step: 0.01, format: fmtPct },
  { key: "winShare", assumptionId: "som_win_share", tier: "SOM", step: 0.05, format: fmtPct },
  { key: "launchesPerYear", assumptionId: "som_launches_per_year", tier: "SOM", step: 1, format: (v) => `${v} / yr` },
  { key: "successRate", assumptionId: "som_success_rate", tier: "SOM", step: 0.01, format: fmtPct },
];

export const FIXED_IDS = [
  "fixed_fill_rate",
  "fixed_price_per_launch_eur",
  "fixed_rideshare_usd_per_kg",
  "fixed_dedicated_usd_per_kg",
  "fixed_usd_per_eur",
  "sam_us_gov_open",
];

export const baseLevers = Object.fromEntries(
  LEVERS.map((l) => [l.key, assumption(l.assumptionId).value]),
) as unknown as Q1Levers;

/** Isar's own payload figures, a sourced vehicle fact rather than an assumption. */
export const spectrum = (() => {
  const v = vehicles.find((x) => x.id === "spectrum");
  if (!v || v.payload_sso_kg === null || v.payload_leo_kg === null) throw new Error("Spectrum payload is missing in the warehouse");
  return { ...v, payload_sso_kg: v.payload_sso_kg, payload_leo_kg: v.payload_leo_kg };
})();

export const baseFixed: Q1Fixed = {
  payloadSsoKg: spectrum.payload_sso_kg,
  payloadLeoKg: spectrum.payload_leo_kg,
  fillRate: assumption("fixed_fill_rate").value,
  pricePerLaunchEur: assumption("fixed_price_per_launch_eur").value,
  rideshareUsdPerKg: assumption("fixed_rideshare_usd_per_kg").value,
  dedicatedUsdPerKg: assumption("fixed_dedicated_usd_per_kg").value,
  usdPerEur: assumption("fixed_usd_per_eur").value,
  usGovOpen: assumption("sam_us_gov_open").value,
};

/** Global launch revenue of the base year, the preferred fact in the warehouse. */
export const tamRevenueUsd = (year: number) => preferred("launch_revenue", { year }).value;
