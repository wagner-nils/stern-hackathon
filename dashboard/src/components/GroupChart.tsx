import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DemandSegment } from "../data/types";
import { fmtInt, fmtPct, share } from "../lib/format";
import { demandByGroup } from "../model/funnel";

/** Who launches: satellites per customer group, captive groups greyed out. */
export function GroupChart({ demand }: { demand: DemandSegment[] }) {
  const captive = new Set(demand.filter((s) => s.customer === "captive").map((s) => s.group));
  const groups = demandByGroup(demand);
  const total = groups.reduce((sum, g) => sum + g.sats, 0);
  const data = groups.map((g) => ({ ...g, pct: share(g.sats, total), captive: captive.has(g.group) }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 56, bottom: 4, left: 8 }}>
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="group" width={170} tickLine={false} axisLine={false} />
        <Tooltip formatter={(v: number) => [`${fmtInt(v)} satellites`, ""]} separator="" cursor={{ fill: "var(--hover)" }} />
        <Bar dataKey="sats" isAnimationActive={false} barSize={18}>
          {data.map((d) => (
            <Cell key={d.group} fill={d.captive ? "var(--grey-300)" : "var(--ink)"} />
          ))}
          <LabelList dataKey="pct" position="right" formatter={(v: number) => fmtPct(v)} className="chart-label" />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
