import type { ExpansionField, SiteNode } from "../data/warehouse";
import { type Q2Settings, fieldYear } from "./q2";

// RQ3 site load. Mirrors the SQL view v_q3_site_load; a test keeps both equal.

export interface Q3Settings extends Q2Settings {
  /** Launches one pad can carry in a year. */
  padCadence: number;
  /** Anchor launches a year at Nova Scotia (Canadian or NATO customer), from its first launch on. */
  nsAnchor: number;
  pricePerLaunchEur: number;
}

export interface Load {
  siteId: string;
  pursue: number;
  conditional: number;
  anchor: number;
  capacityToday: number;
  capacityProposed: number;
  /** All launches against proposed capacity; above 1 the site needs more pads (or the plant more output). */
  loadProposed: number;
}

const total = (l: Load) => l.pursue + l.conditional + l.anchor;

export function siteLoad(fields: ExpansionField[], nodes: SiteNode[], year: number, s: Q3Settings): Load[] {
  const nsStart = fields.find((f) => f.id === "site_nova_scotia")?.start_year ?? 9999;
  const siteIds = [...new Set(fields.map((f) => f.launch_site_id).filter((x): x is string => !!x))].sort();
  const sites = siteIds.map((siteId): Load => {
    const launches = (rec: (f: ExpansionField) => boolean) =>
      fields.filter((f) => f.launch_site_id === siteId && rec(f)).reduce((n, f) => n + fieldYear(f, year, s).revenueEur, 0) / s.pricePerLaunchEur;
    const pads = (k: "pads_today" | "pads_proposed") =>
      nodes.filter((n) => n.kind === "launch" && n.launch_site_id === siteId).reduce((n, x) => n + (x[k] ?? 0) * (x.pad_share ?? 1), 0);
    const l: Load = {
      siteId,
      pursue: launches((f) => f.recommendation === "pursue"),
      conditional: launches((f) => f.recommendation !== "pursue"),
      anchor: siteId === "nova-scotia" && year >= nsStart ? s.nsAnchor : 0,
      capacityToday: pads("pads_today") * s.padCadence,
      capacityProposed: pads("pads_proposed") * s.padCadence,
      loadProposed: 0,
    };
    return { ...l, loadProposed: l.capacityProposed ? total(l) / l.capacityProposed : 0 };
  });
  const plant = (k: "capacity_today" | "capacity_proposed") => nodes.filter((n) => n.kind === "production").reduce((n, x) => n + (x[k] ?? 0), 0);
  const factory: Load = {
    siteId: "factory-parsdorf",
    pursue: sites.reduce((n, l) => n + l.pursue, 0),
    conditional: sites.reduce((n, l) => n + l.conditional, 0),
    anchor: sites.reduce((n, l) => n + l.anchor, 0),
    capacityToday: plant("capacity_today"),
    capacityProposed: plant("capacity_proposed"),
    loadProposed: 0,
  };
  factory.loadProposed = factory.capacityProposed ? total(factory) / factory.capacityProposed : 0;
  return [...sites, factory];
}

export const launchesOf = total;

/** Cost per rocket of a line building `volume` a year relative to one building `reference`, by the learning rate per doubling. */
export const relativeUnitCost = (volume: number, reference: number, learningRate: number) =>
  volume > 0 && reference > 0 ? Math.pow(volume / reference, Math.log2(learningRate)) : 0;
