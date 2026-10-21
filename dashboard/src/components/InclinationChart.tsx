import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DemandSegment } from "../data/types";
import { animation, tooltipProps } from "../lib/chartTheme";
import { fmtInt } from "../lib/format";
import { demandByInclination } from "../model/funnel";
import { type Interval, coveredShare } from "../model/orbits";

interface Props {
  demand: DemandSegment[];
  reach: Interval[];
}

/** Satellite demand by orbital inclination, with the bins a site reaches highlighted. */
export function InclinationChart({ demand, reach }: Props) {
  const data = demandByInclination(demand).map((bin) => ({
    label: `${bin.from}°`,
    sats: bin.sats,
    reachable: coveredShare([bin.from, bin.to], reach) > 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--grid)" />
        <XAxis dataKey="label" interval={2} tickLine={false} axisLine={{ stroke: "var(--grid)" }} />
        <YAxis tickFormatter={fmtInt} width={52} tickLine={false} axisLine={false} />
        <Tooltip
          {...tooltipProps}
          formatter={(v: number) => [`${fmtInt(v)} satellites / yr`, ""]}
          labelFormatter={(l) => `Inclination ${l}`}
        />
        <Bar dataKey="sats" radius={[2, 2, 0, 0]} {...animation}>
          {data.map((d, k) => (
            <Cell key={k} fill={d.reachable ? "var(--blue-bright)" : "var(--bar)"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
