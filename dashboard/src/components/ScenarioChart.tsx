import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { scenarios } from "../data/warehouse";
import { animation, tooltipProps } from "../lib/chartTheme";
import { fmtOne } from "../lib/format";
import type { ScenarioYear } from "../model/scenarios";

/** One hue in three steps: Bear light, ASCENT Isar blue, Bull navy. */
export const scenarioColor: Record<string, string> = { bear: "#8fb0e6", ascent: "#095edd", bull: "#0a2a63" };

const millions = (v: number) => `€${fmtOne(v)} M`;

function Panel({
  title,
  runs,
  metric,
  selected,
  height,
}: {
  title: string;
  runs: Record<string, ScenarioYear[]>;
  metric: "revenueEur" | "ebitEur";
  selected: string;
  height: number;
}) {
  const data = runs[selected].map((row, k) => ({
    year: row.year,
    ...Object.fromEntries(scenarios.map((s) => [s.id, Math.round(runs[s.id][k][metric] / 1e5) / 10])),
  }));
  return (
    <figure className="scenario-chart__panel">
      <figcaption className="overline">{title}</figcaption>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="#eceef2" vertical={false} />
          <XAxis dataKey="year" tick={{ fontSize: 12, fill: "#7a8399" }} tickLine={false} axisLine={{ stroke: "#e5e7eb" }} interval={2} />
          <YAxis tick={{ fontSize: 12, fill: "#7a8399" }} tickLine={false} axisLine={false} width={56} tickFormatter={(v) => `€${v} M`} />
          {metric === "ebitEur" && <ReferenceLine y={0} stroke="#000b27" strokeWidth={1} />}
          <Tooltip {...tooltipProps} formatter={(v: number, id: string) => [millions(v), scenarios.find((s) => s.id === id)?.name ?? id]} />
          {scenarios.map((s) => (
            <Line
              key={s.id}
              dataKey={s.id}
              stroke={scenarioColor[s.id] ?? "#7a8399"}
              strokeWidth={s.id === selected ? 3 : 1.5}
              strokeOpacity={s.id === selected ? 1 : 0.45}
              dot={false}
              {...animation}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </figure>
  );
}

/** Revenue and operating profit of all three scenarios, the selected one drawn strong. */
export function ScenarioChart({ runs, selected, height = 240 }: { runs: Record<string, ScenarioYear[]>; selected: string; height?: number }) {
  return (
    <div className="scenario-chart">
      <Panel title="Revenue per year" runs={runs} metric="revenueEur" selected={selected} height={height} />
      <Panel title="Operating profit (EBIT proxy) per year" runs={runs} metric="ebitEur" selected={selected} height={height} />
      <div className="scenario-chart__legend">
        {scenarios.map((s) => (
          <span key={s.id} className={s.id === selected ? "is-active" : ""}>
            <i style={{ background: scenarioColor[s.id] }} />
            {s.name}
          </span>
        ))}
      </div>
    </div>
  );
}
