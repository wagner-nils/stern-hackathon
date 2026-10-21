import type { Source } from "./types";

export const sources: Record<string, Source> = {
  isarSpectrum: {
    id: "isarSpectrum",
    title: "Isar Aerospace – Spectrum launch vehicle",
    url: "https://isaraerospace.com/spectrum",
  },
  andoyaLicence: {
    id: "andoyaLicence",
    title: "European Spaceflight – Andøya receives launch site operator licence (headings 280–360°, 30 launches/yr)",
    url: "https://europeanspaceflight.com/norways-andoya-spaceport-receives-launch-site-operator-license/",
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
  mcdowell2025: {
    id: "mcdowell2025",
    title: "J. McDowell – Space Activities in 2025",
    url: "https://planet4589.org/space/papers/space25.1.4.pdf",
  },
  orbitalMechanics: {
    id: "orbitalMechanics",
    title: "Launch azimuth and inclination: cos(i) = sin(Az) · cos(latitude)",
  },
  placeholder: {
    id: "placeholder",
    title: "Placeholder – to be replaced by team research",
  },
};
