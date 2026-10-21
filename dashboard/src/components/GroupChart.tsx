import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DemandSegment } from "../data/types";
import { animation, tooltipProps } from "../lib/chartTheme";
import { fmtInt, fmtPct, share } from "../lib/format";
import { demandByGroup } from "../model/funnel";

/** Who launches: satellites per customer group, captive groups dimmed. */
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
        <Tooltip {...tooltipProps} formatter={(v: number) => [`${fmtInt(v)} satellites`, ""]} />
        <Bar dataKey="sats" barSize={16} radius={[0, 2, 2, 0]} {...animation}>
          {data.map((d) => (
            <Cell key={d.group} fill={d.captive ? "var(--bar)" : "var(--blue-bright)"} />
          ))}
          <LabelList dataKey="pct" position="right" formatter={(v: number) => fmtPct(v)} className="chart-label" />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
