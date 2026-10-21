import type { LaunchSite } from "./types";

export const sites: LaunchSite[] = [
  {
    id: "andoya",
    name: "Andøya Spaceport",
    country: "Norway",
    lat: 69.3,
    lon: 16.0,
    // Launches go north over the Norwegian Sea: polar to sun-synchronous. Exact corridor still to verify.
    azimuths: [{ from: 335, to: 5 }],
    status: "operational",
    confidence: "medium",
    sourceId: "andoya",
  },
];
