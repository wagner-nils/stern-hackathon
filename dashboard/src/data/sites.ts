import type { LaunchSite } from "./types";

export const sites: LaunchSite[] = [
  {
    id: "andoya",
    name: "Andøya Spaceport",
    country: "Norway",
    lat: 69.1,
    lon: 15.6,
    // Site licence (Aug 2024): headings 280–360° over the Norwegian Sea, i.e. 90–110.6° inclination.
    azimuths: [{ from: 280, to: 360 }],
    status: "operational",
    confidence: "high",
    sourceId: "andoyaLicence",
  },
];
