import { Bar, CartesianGrid, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { expansionFields, launchGap, preferred } from "../data/warehouse";
import { animation, tooltipProps } from "../lib/chartTheme";
import { fmtInt, fmtOne } from "../lib/format";
import { BASE_COST, BASE_SETTINGS, run } from "../state/scenario";

const eurM = (v: number) => `€${fmtInt(Math.round(v / 1e6))} M`;
const signedM = (v: number) => `${v < 0 ? "−" : "+"}€${fmtInt(Math.abs(Math.round(v / 1e6)))} M`;

/** The presentation: the base case (ASCENT) only, every number live from the warehouse. */
export function Present() {
  const a = run("ascent", BASE_SETTINGS);
  const y30 = a.at(2030);
  const y35 = a.at(2035);
  const gap = launchGap.find((g) => g.year === 2028);
  const funding = preferred("funding_round", { year: 2026, scope: "company", entity: "Isar Aerospace" });

  // Revenue 2030 that rests on unsigned contracts or the ESA programme ending in 2030.
  const elc = expansionFields.find((f) => f.id === "institutional_elc");
  const elc2030 = elc ? elc.market_2025_eur * Math.pow(1 + elc.growth, 2030 - 2025) * elc.isar_share : 0;
  const contracted = (a.scenario.contract_launches + a.scenario.ns_anchor_launches) * BASE_COST.pricePerLaunchEur + y30.readinessRevenueEur;
  const notSecured = (contracted + elc2030) / y30.revenueEur;

  // Margin of one sold launch after the cost of the flight and of re-flying failures; launches needed to carry the fixed cost.
  const margin = BASE_COST.pricePerLaunchEur - y30.unitCostEur / y30.successRate;
  const launchesNeeded = BASE_COST.fixedOpexEur / margin;

  const data = a.years.map((y) => ({ year: y.year, revenue: Math.round(y.revenueEur / 1e6), ebit: Math.round(y.ebitEur / 1e6) }));

  return (
    <section className="present">
      <header className="present__head">
        <div>
          <div className="overline">Our recommendation to SSVE · base case ASCENT</div>
          <h1>
            <em>Do not invest now:</em> even if ASCENT works, Isar makes losses until {a.kpi.sustainedBreakEven ? a.kpi.sustainedBreakEven - 1 : 2040}.
          </h1>
        </div>
      </header>

      <div className="present__kpis">
        <div className="card">
          <strong>{eurM(y30.revenueEur)}</strong>
          <span>revenue 2030</span>
          <small>{eurM(y35.revenueEur)} in 2035</small>
        </div>
        <div className="card">
          <strong className="is-neg">{signedM(y30.ebitEur)}</strong>
          <span>operating profit 2030</span>
          <small>{signedM(y35.ebitEur)} in 2035</small>
        </div>
        <div className="card">
          <strong>{a.kpi.sustainedBreakEven ?? "after 2040"}</strong>
          <span>first profitable year</span>
        </div>
        <div className="card">
          <strong className="is-neg">{eurM(-a.kpi.peakCumulativeLossEur)}</strong>
          <span>cumulative loss until then</span>
          <small>Isar's Series D: {eurM(funding.value)}</small>
        </div>
      </div>

      <div className="present__middle">
        <div className="card present__chart">
          <div className="overline">Revenue (bars) and operating profit (line), € M</div>
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="#eceef2" vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 12, fill: "#7a8399" }} tickLine={false} axisLine={{ stroke: "#e5e7eb" }} />
              <YAxis tick={{ fontSize: 12, fill: "#7a8399" }} tickLine={false} axisLine={false} width={48} />
              <ReferenceLine y={0} stroke="#000b27" />
              <Tooltip {...tooltipProps} formatter={(v: number, k: string) => [`€${v} M`, k === "revenue" ? "Revenue" : "Operating profit"]} />
              <Bar dataKey="revenue" fill="#c9d9f5" {...animation} />
              <Line dataKey="ebit" stroke="#095edd" strokeWidth={3} dot={false} {...animation} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="card present__list">
          <h4>Why not now</h4>
          <ol>
            <li>
              <strong>Revenue is not secured:</strong> {Math.round(notSecured * 100)} % of the {eurM(y30.revenueEur)} in 2030 rests on contracts nobody has signed or on the ESA
              programme that ends in 2030. Today only {fmtOne(gap?.launches_filled_isar_share ?? 0)} of {gap?.planned} planned 2028 launches have a buyer.
            </li>
            <li>
              <strong>Too little margin per launch:</strong> about {eurM(margin)} per launch after flight cost and re-flights, against {eurM(BASE_COST.fixedOpexEur)}{" "}
              fixed cost a year. Isar needs about {Math.round(launchesNeeded)} launches a year; in 2030 it sells {fmtOne(y30.launchesSold)}.
            </li>
            <li>
              <strong>Long loss phase:</strong> profit only from {a.kpi.sustainedBreakEven ?? "after 2040"}, {eurM(-a.kpi.peakCumulativeLossEur)} of losses until then,
              before any capex.
            </li>
          </ol>
          <p className="caption">Revisit when 3 of 4 flights reach orbit in 2027, a European state pays for readiness and frame contracts are signed.</p>
        </div>
      </div>

      <p className="caption">
        Base case ASCENT, real 2026 euros. Revenue from the RQ2 fields plus {a.scenario.contract_launches} frame-contract and {a.scenario.ns_anchor_launches} Nova Scotia anchor launches a year; launch cost from Rocket Lab's
        measured cost curve scaled to Spectrum; fixed cost {eurM(BASE_COST.fixedOpexEur)} a year; EBIT proxy before depreciation. SQL: v_scenarios.
      </p>
    </section>
  );
}
