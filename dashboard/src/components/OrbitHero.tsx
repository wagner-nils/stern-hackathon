import type { Interval } from "../model/orbits";

interface Orbit {
  label: string;
  inclination: number;
}

// Orbits customers buy, drawn as a schematic: the ellipse is tilted by the orbit's inclination.
const orbits: Orbit[] = [
  { label: "GEO 0°", inclination: 0 },
  { label: "SAR 40°", inclination: 40 },
  { label: "ISS 51.6°", inclination: 51.6 },
  { label: "Polar 90°", inclination: 90 },
  { label: "SSO 98°", inclination: 98 },
];

const cx = 230;
const cy = 150;
const rx = 128;
const ry = 28;
const ellipse = `M ${cx - rx} ${cy} a ${rx} ${ry} 0 1 0 ${2 * rx} 0 a ${rx} ${ry} 0 1 0 ${-2 * rx} 0`;

/** Which orbits a launch site reaches: reachable ones solid blue, the rest dashed grey. */
export function OrbitHero({ reach, siteLabel }: { reach: Interval[]; siteLabel: string }) {
  // Tolerance, because the polar edge comes out of acos() as 90.0000001°.
  const reachable = (i: number) => reach.some(([lo, hi]) => i >= lo - 0.01 && i <= hi + 0.01);

  return (
    <svg className="orbit-hero" viewBox="0 0 400 300" role="img" aria-label={`Orbits reachable from ${siteLabel}`}>
      <circle cx={cx} cy={cy} r={58} className="orbit-hero__earth" />

      {orbits.map((o) => (
        <g key={o.label} transform={`rotate(${-o.inclination} ${cx} ${cy})`} className={reachable(o.inclination) ? "orbit orbit--on" : "orbit"}>
          <path d={ellipse} fill="none" />
        </g>
      ))}

      {/* Andøya at 69° N on the visible face of the globe. */}
      <circle cx={cx + 12} cy={cy - 52} r={4} className="orbit__site" />

      {orbits.map((o, k) => (
        <text key={o.label} x={4} y={24 + k * 18} className={reachable(o.inclination) ? "orbit__label orbit__label--on" : "orbit__label"}>
          {reachable(o.inclination) ? "● " : "○ "}
          {o.label}
        </text>
      ))}
      <text x={4} y={294} className="orbit__label orbit__label--on">
        {siteLabel}
      </text>
    </svg>
  );
}
