import type { Vehicle } from "./types";

export const spectrum: Vehicle = {
  id: "spectrum",
  name: "Spectrum",
  payloadKg: { LEO: 1000, SSO: 700 },
  confidence: "high",
  sourceId: "isarSpectrum",
};
