import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fmtInt, fmtPct, fmtTonnes, share } from "../lib/format";
import type { FunnelStage } from "../model/funnel";

export type Metric = "sats" | "massKg";

export function FunnelChart({ stages, metric }: { stages: FunnelStage[]; metric: Metric }) {
  const total = stages[0]?.[metric] ?? 0;
  const data = stages.map((s) => ({ label: s.label, value: s[metric], pct: share(s[metric], total) }));
  const format = metric === "sats" ? fmtInt : fmtTonnes;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 64, bottom: 4, left: 8 }}>
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="label" width={190} tickLine={false} axisLine={false} />
        <Tooltip formatter={(v: number) => format(v)} cursor={{ fill: "var(--hover)" }} />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} isAnimationActive={false}>
          {data.map((_, k) => (
            <Cell key={k} fill={k === data.length - 1 ? "var(--accent)" : "var(--bar)"} />
          ))}
          <LabelList dataKey="pct" position="right" formatter={(v: number) => fmtPct(v)} className="chart-label" />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
