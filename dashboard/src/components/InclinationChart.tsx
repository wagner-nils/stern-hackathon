import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DemandSegment } from "../data/types";
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
        <CartesianGrid vertical={false} stroke="var(--grey-200)" />
        <XAxis dataKey="label" interval={2} tickLine={false} />
        <YAxis tickFormatter={fmtInt} width={52} tickLine={false} axisLine={false} />
        <Tooltip
          formatter={(v: number) => [`${fmtInt(v)} satellites / yr`, ""]}
          separator=""
          labelFormatter={(l) => `Inclination ${l}`}
          cursor={{ fill: "var(--hover)" }}
        />
        <Bar dataKey="sats" isAnimationActive={false}>
          {data.map((d, k) => (
            <Cell key={k} fill={d.reachable ? "var(--primary)" : "var(--grey-300)"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
