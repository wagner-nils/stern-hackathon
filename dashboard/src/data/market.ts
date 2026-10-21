import type { Figure } from "./types";

/** Market figures that are not scenario levers. Money in USD as published; converted with `eurPerUsd`. */
export const market = {
  launchRevenueUsd: {
    value: 7.5e9,
    label: "Global launch services revenue",
    confidence: "medium",
    sourceId: "siaSsir",
    note: "2024, excludes SpaceX launches for its own Starlink",
  },
  rideshareUsdPerKg: {
    value: 7000,
    label: "Rideshare price to SSO (SpaceX Transporter)",
    confidence: "medium",
    sourceId: "rideshare2026",
  },
  dedicatedUsdPerKg: {
    value: 15000,
    label: "Blended dedicated small-launch price",
    confidence: "low",
    sourceId: "teamEstimate",
    note: "Between rideshare and Electron (about 25k USD/kg)",
  },
  eurPerUsd: {
    value: 0.9,
    label: "EUR per USD",
    confidence: "medium",
    sourceId: "teamEstimate",
  },
} satisfies Record<string, Figure>;

/** Isar's launch plan by year: 2027–2028 from Isar, 2029–2030 team ramp modelled on Electron. */
export const cadencePlan: Record<number, number> = { 2026: 1, 2027: 4, 2028: 8, 2029: 10, 2030: 15 };
