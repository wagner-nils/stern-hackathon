import { Bar, BarChart, CartesianGrid, Cell, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Satellite } from "../data/warehouse";
import { animation, tooltipProps } from "../lib/chartTheme";
import { fmtInt } from "../lib/format";
import type { Interval } from "../model/orbits";
import { byInclination } from "../model/q1";

/** Satellites by orbital inclination, with the band the chosen launch sites reach shaded and its bins highlighted. */
export function InclinationChart({ sats, reach }: { sats: Satellite[]; reach: Interval[] }) {
  const bins = byInclination(sats, reach);
  const data = bins.map((b) => ({ label: `${b.from}°`, sats: b.sats, reachable: b.reachable }));
  // One shaded band per reachable interval, from its first to its last bin.
  const bands = reach.map(([lo, hi]) => {
    const inside = bins.filter((b) => b.to > lo && b.from < hi);
    return { lo, hi, x1: `${inside[0].from}°`, x2: `${inside[inside.length - 1].from}°` };
  });
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 22, right: 8, bottom: 4, left: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--grid)" />
        {bands.map((b) => (
          <ReferenceArea
            key={b.lo}
            x1={b.x1}
            x2={b.x2}
            fill="var(--blue)"
            fillOpacity={0.07}
            stroke="var(--blue)"
            strokeOpacity={0.25}
            strokeDasharray="3 3"
            label={{ value: `reach ${b.lo}–${b.hi}°`, position: "top", fill: "var(--blue)", fontSize: 11 }}
          />
        ))}
        <XAxis dataKey="label" interval={2} tickLine={false} axisLine={{ stroke: "var(--grid)" }} />
        <YAxis tickFormatter={fmtInt} width={52} tickLine={false} axisLine={false} />
        <Tooltip
          {...tooltipProps}
          formatter={(v: number) => [`${fmtInt(v)} satellites`, ""]}
          labelFormatter={(l) => `Inclination ${l}`}
        />
        <Bar dataKey="sats" radius={[2, 2, 0, 0]} {...animation}>
          {data.map((d, k) => (
            <Cell key={k} fill={d.reachable ? "var(--blue)" : "var(--bar)"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
