import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { animation, tooltipProps } from "../lib/chartTheme";
import { fmtInt, fmtPct, fmtTonnes, share } from "../lib/format";
import type { Step } from "../model/funnel";

const tierOf: Partial<Record<Step["id"], string>> = { tam: "TAM", reachable: "SAM", som: "SOM" };

export function FunnelChart({ steps, metric }: { steps: Step[]; metric: "sats" | "massKg" }) {
  const total = steps[0]?.[metric] ?? 0;
  const data = steps.map((s) => ({
    label: tierOf[s.id] ? `${s.label} (${tierOf[s.id]})` : s.label,
    value: s[metric],
    pct: share(s[metric], total),
    id: s.id,
  }));
  const format = metric === "sats" ? (v: number) => `${fmtInt(v)} satellites` : fmtTonnes;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 72, bottom: 4, left: 8 }}>
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="label" width={250} tickLine={false} axisLine={false} />
        <Tooltip {...tooltipProps} formatter={(v: number) => [format(v), ""]} />
        <Bar dataKey="value" barSize={20} radius={[0, 2, 2, 0]} {...animation}>
          {data.map((d) => (
            <Cell
              key={d.id}
              fill={d.id === "som" ? "var(--blue)" : d.id === "reachable" ? "var(--text)" : "var(--bar)"}
            />
          ))}
          <LabelList dataKey="pct" position="right" formatter={(v: number) => fmtPct(v)} className="chart-label" />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
