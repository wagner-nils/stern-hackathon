import type { Figure } from "./types";

/** Market figures that are not scenario levers. Money in USD as published; converted with `eurPerUsd`. */
export const market = {
  launchRevenueUsd: {
    value: 12.4e9,
    label: "Global commercially procured launch revenue",
    confidence: "high",
    sourceId: "siaSsir2026",
    note: "2025; SIA counts captive launches, so Starlink is included",
  },
  rideshareUsdPerKg: {
    value: 7500,
    label: "Rideshare list price (SpaceX)",
    confidence: "high",
    sourceId: "spacexRideshare",
    note: "2027 list price, 50 kg minimum; about 10k USD/kg with separation system",
  },
  dedicatedUsdPerKg: {
    value: 20000,
    label: "Dedicated small-launch price",
    confidence: "medium",
    sourceId: "rocketLab10k",
    note: "€12 M for 700 kg is about 19k USD/kg; Electron earns about 28k USD/kg",
  },
  eurPerUsd: {
    value: 1 / 1.12,
    label: "EUR per USD",
    confidence: "high",
    sourceId: "ecb",
    note: "ECB reference rate, October 2026 average: 1.12 USD per EUR",
  },
} satisfies Record<string, Figure>;

/** Isar's launch plan by year: 4 in 2027 and about double in 2028 per Isar, then a ramp modelled on Electron. */
export const cadencePlan: Record<number, number> = { 2026: 1, 2027: 4, 2028: 7, 2029: 10, 2030: 12 };
