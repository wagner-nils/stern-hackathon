import type { Source } from "./types";

export const sources: Record<string, Source> = {
  isarSpectrum: {
    id: "isarSpectrum",
    title: "Isar Aerospace – Spectrum launch vehicle",
    url: "https://isaraerospace.com/spectrum",
  },
  andoyaLicence: {
    id: "andoyaLicence",
    title: "CAA Norway – Andøya Spaceport (headings 280–360°, 30 launches/yr for the whole site)",
    url: "https://luftfartstilsynet.no/en/space/andoya-spaceport/",
  },
  andoyaSpace: {
    id: "andoyaSpace",
    title: "Andøya Space – reachable inclinations 90–110.6°",
    url: "https://andoyaspace.no/spaceport/efficient-way-to-space/",
  },
  isarFlightPlan: {
    id: "isarFlightPlan",
    title: "Payload – Isar plans 4 Spectrum flights in 2027, about 8 in 2028",
    url: "https://payloadspace.com/seops-books-five-launches-on-isars-spectrum-rocket/",
  },
  gcat: {
    id: "gcat",
    title: "J. McDowell – General Catalog of Artificial Space Objects (GCAT)",
    url: "https://planet4589.org/space/gcat/",
  },
  mcdowell2025: {
    id: "mcdowell2025",
    title: "J. McDowell – Space Activities in 2025",
    url: "https://planet4589.org/space/papers/space25.1.4.pdf",
  },
  siaSsir: {
    id: "siaSsir",
    title: "SIA – State of the Satellite Industry Report",
    url: "https://sia.org/news-resources/state-of-the-satellite-industry-report/",
  },
  rideshare2026: {
    id: "rideshare2026",
    title: "NewSpace Economy – SpaceX rideshare pricing, Feb 2026 (350k USD per 50 kg to SSO)",
    url: "https://newspaceeconomy.ca/2026/02/27/spacex-rideshare-pricing-as-of-february-2026-what-it-costs-whats-included-and-how-buyers-budget-a-mission/",
  },
  nspm17: {
    id: "nspm17",
    title: "US policy NSPM-17: US government payloads fly on US-built launchers",
  },
  orbitalMechanics: {
    id: "orbitalMechanics",
    title: "Launch azimuth and inclination: cos(i) = sin(Az) · cos(latitude)",
  },
  teamDraft: {
    id: "teamDraft",
    title: "Team draft (Benedikt), 2024 figures from BryceTech and McDowell, to be replaced by GCAT",
  },
  teamEstimate: {
    id: "teamEstimate",
    title: "Team estimate, to be validated",
  },
};
