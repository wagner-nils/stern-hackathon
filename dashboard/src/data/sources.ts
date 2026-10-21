import type { Source } from "./types";

export const sources: Record<string, Source> = {
  isarSpectrum: {
    id: "isarSpectrum",
    title: "Isar Aerospace – Spectrum launch vehicle",
    url: "https://www.isaraerospace.com/",
  },
  andoya: {
    id: "andoya",
    title: "Andøya Space – Andøya Spaceport",
    url: "https://www.andoyaspace.no/",
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
