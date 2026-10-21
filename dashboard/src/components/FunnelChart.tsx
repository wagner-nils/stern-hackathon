import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
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
        <Tooltip formatter={(v: number) => [format(v), ""]} separator="" cursor={{ fill: "var(--hover)" }} />
        <Bar dataKey="value" isAnimationActive={false} barSize={22}>
          {data.map((d) => (
            <Cell
              key={d.id}
              fill={d.id === "som" ? "var(--primary)" : d.id === "reachable" ? "var(--ink)" : "var(--grey-300)"}
            />
          ))}
          <LabelList dataKey="pct" position="right" formatter={(v: number) => fmtPct(v)} className="chart-label" />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
