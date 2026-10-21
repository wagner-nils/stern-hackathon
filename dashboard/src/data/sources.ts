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
  siaSsir2026: {
    id: "siaSsir2026",
    title: "SIA – 29th State of the Satellite Industry Report (2025: 12.4 bn USD launch revenue, 325 launches)",
    url: "https://sia.org/affordability-productivity-drive-historic-satellite-industry-growth-satellite-industry-association-releases-29th-annual-state-of-the-satellite-industry-report/",
  },
  spacexRideshare: {
    id: "spacexRideshare",
    title: "SpaceX rideshare price API (6.5k / 7k / 7.5k USD per kg for 2025 / 2026 / 2027, 50 kg minimum plate)",
    url: "https://api-rideshare.spacex.com/api/v2/price",
  },
  rideshareFreeze: {
    id: "rideshareFreeze",
    title: "SatNews – SpaceX limits rideshare bookings past 2028 (reported, not confirmed by SpaceX)",
    url: "https://satnews.com/2026/07/20/spacex-limits-future-commercial-rideshare-bookings-past-2028-amid-severe-manifest-saturation/",
  },
  rocketLab10k: {
    id: "rocketLab10k",
    title: "Rocket Lab 10-K 2025 – Electron revenue 8.5 M USD per launch",
    url: "https://www.sec.gov/Archives/edgar/data/1819994/000181999426000013/rklb-20251231.htm",
  },
  brycetech2026: {
    id: "brycetech2026",
    title: "BryceTech – Smallsats by the Numbers 2026, p. 29 (17–23% of non-broadband smallsats on small launchers)",
    url: "https://brycetech.com/reports/report-documents/smallsats-2026/BryceTech_Smallsats-by-the-Numbers-2026.pdf",
  },
  novaspace: {
    id: "novaspace",
    title: "Novaspace – more than 43,000 satellites to launch by 2035; 66% of 2025–2034 launches from five megaconstellations",
    url: "https://nova.space/press-release/novaspace-projects-665b-in-satellite-build-and-launch-activity/",
  },
  spectrumPrice: {
    id: "spectrumPrice",
    title: "Spectrum price not published; industry estimates €10–15 M per launch",
    url: "https://www.newspace.im/launchers/isar-aerospace",
  },
  ecb: {
    id: "ecb",
    title: "ECB euro reference rate USD/EUR",
    url: "https://data-api.ecb.europa.eu/service/data/EXR/D.USD.EUR.SP00.A",
  },
  nspm17: {
    id: "nspm17",
    title: "NSPM-17 (Federal Register, 20 Aug 2026): US government payloads generally fly on US-built launchers",
    url: "https://www.federalregister.gov/d/2026-17372",
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
