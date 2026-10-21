export type Confidence = "high" | "medium" | "low" | "placeholder";
export type Owner = "Nils" | "Luca" | "Benedikt";

export interface Source {
  id: string;
  title: string;
  url?: string;
}

/** Degrees clockwise from north. A corridor may wrap through north, e.g. from 335 to 5. */
export interface AzimuthCorridor {
  from: number;
  to: number;
}

export interface LaunchSite {
  id: string;
  name: string;
  country: string;
  lat: number;
  lon: number;
  azimuths: AzimuthCorridor[];
  status: "operational" | "planned" | "candidate";
  confidence: Confidence;
  sourceId: string;
}

export type OrbitClass = "LEO" | "SSO" | "MEO" | "GTO/GEO" | "Beyond";
export type CustomerType =
  | "open-commercial"
  | "institutional-eu"
  | "institutional-us"
  | "institutional-other"
  | "captive";

export interface DemandSegment {
  id: string;
  label: string;
  /** Display group, e.g. "Starlink" or "Commercial (open)". */
  group: string;
  orbit: OrbitClass;
  /** Inclination band in degrees; demand is assumed to be spread evenly across it. */
  inclination: [number, number];
  avgMassKg: number;
  customer: CustomerType;
  satsPerYear: number;
}

export interface DemandDataset {
  year: number;
  sourceId: string;
  confidence: Confidence;
  segments: DemandSegment[];
}

export interface Vehicle {
  id: string;
  name: string;
  /** Payload capacity by orbit class; classes left out are out of reach. */
  payloadKg: Partial<Record<OrbitClass, number>>;
  confidence: Confidence;
  sourceId: string;
}

export type Unit = "%" | "launches/yr" | "year" | "€ M";

export interface Assumption<Id extends string = string> {
  id: Id;
  label: string;
  group: "market" | "isar";
  /** Shares are stored as fractions (0–1) and shown as per cent. */
  value: number;
  unit: Unit;
  min: number;
  max: number;
  step: number;
  confidence: Confidence;
  owner: Owner;
  sourceId: string;
  note?: string;
}

export interface Figure {
  value: number;
  label: string;
  confidence: Confidence;
  sourceId: string;
  note?: string;
}
