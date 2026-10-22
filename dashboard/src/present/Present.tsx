import { ScenarioChart, scenarioColor } from "../components/ScenarioChart";
import { assumption, expansionFields, scenarios } from "../data/warehouse";
import { fmtInt, fmtOne, fmtPct } from "../lib/format";
import { fieldYear } from "../model/q2";
import { type ScenarioSettings, BASE_COST, BASE_SETTINGS, KOUROU_FEE, KOUROU_LAUNCHES, isEdited, run } from "../state/scenario";

const eurM = (v: number) => `€${fmtInt(Math.round(v / 1e6))} M`;
const signedM = (v: number) => `${v < 0 ? "−" : "+"}€${fmtInt(Math.abs(Math.round(v / 1e6)))} M`;
const SHOCK_YEAR = 2030;
const WACC = assumption("q2_wacc").value;

// Short labels for the RQ2 fields; the full names live in expansion_fields and the Q2 chapter.
const shortName: Record<string, string> = {
  institutional_elc: "European institutional launches (ESA)",
  sovereign_readiness: "Paid launch readiness for states",
  core_polar: "Dedicated polar and SSO launches",
  core_dedicated_shift: "Customers leaving rideshare",
  mission_extras: "Extras on every launch",
  site_nova_scotia: "Nova Scotia",
  site_kourou: "Kourou",
  hypersonic_tests: "Hypersonic test flights",
  mid_class_rocket: "Mid-class rocket",
  satellite_manufacturing: "Satellites",
  satellite_data: "Own data",
  orbital_transfer: "Transfer vehicle",
  engines: "Engines for others",
};

function Slider({
  label,
  value,
  shown,
  base,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  shown: string;
  base: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="present__slider">
      <span>
        {label} <strong>{shown}</strong> <small>base {base}</small>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}

/** The presentation: the investment case on one page, every number live from the warehouse and the five levers. */
export function Present({ settings, setSettings }: { settings: ScenarioSettings; setSettings: (s: ScenarioSettings) => void }) {
  const runs = Object.fromEntries(scenarios.map((s) => [s.id, run(s.id, settings)]));
  const sel = runs[settings.scenarioId];
  const base = scenarios.find((s) => s.id === settings.scenarioId)!;
  const a = runs.ascent;
  const by2035 = a.contractsFor(2035);
  const ns = a.nsBreakEven(2030);
  const nsNet = a.nsNet(2031);
  const sh = sel.shock(SHOCK_YEAR);
  const set = (patch: Partial<ScenarioSettings>) => setSettings({ ...settings, ...patch });

  const fields = (rec: "pursue" | "conditional" | "not") =>
    expansionFields
      .filter((f) => f.recommendation === rec)
      .map((f) => ({ f, revenue: fieldYear(f, 2030, { wacc: WACC }).revenueEur }))
      .sort((x, y) => y.revenue - x.revenue);

  return (
    <section className="present">
      <header className="present__head">
        <div>
          <div className="overline">Our recommendation to SSVE</div>
          <h1>
            Invest in Isar, in stages, on the <em>ASCENT</em> path.
          </h1>
        </div>
        {isEdited(settings) && (
          <button className="text-button" onClick={() => setSettings({ ...BASE_SETTINGS, scenarioId: settings.scenarioId })}>
            edited · back to base
          </button>
        )}
      </header>

      <div className="present__scenarios">
        {scenarios.map((s) => {
          const r = runs[s.id];
          return (
            <button
              key={s.id}
              className={`present__scenario${s.id === settings.scenarioId ? " is-active" : ""}`}
              style={{ borderTopColor: scenarioColor[s.id] }}
              onClick={() => set({ scenarioId: s.id, contractLaunches: null, readinessGrowth: null, success2030: null })}
            >
              <span className="present__scenario-name">
                {s.id === "ascent" ? "ASCENT · base" : s.id === "bear" ? "Bear · ASCENT fails" : "Bull · Europe buys at scale"}
              </span>
              <span className="present__nums">
                <span>
                  <strong>{eurM(r.at(2030).revenueEur)}</strong>
                  <small>revenue 2030</small>
                </span>
                <span>
                  <strong>{eurM(r.at(2035).revenueEur)}</strong>
                  <small>revenue 2035</small>
                </span>
                <span>
                  <strong className={r.at(2035).ebitEur < 0 ? "is-neg" : "is-pos"}>{signedM(r.at(2035).ebitEur)}</strong>
                  <small>EBIT 2035</small>
                </span>
                <span>
                  <strong>{r.kpi.sustainedBreakEven ?? "–"}</strong>
                  <small>{r.kpi.sustainedBreakEven ? "profitable from" : "no profit by 2040"}</small>
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="present__middle">
        <div className="card present__chart">
          <ScenarioChart runs={Object.fromEntries(scenarios.map((s) => [s.id, runs[s.id].years]))} selected={settings.scenarioId} height={118} />
          <p className="caption">
            Real 2026 euros, EBIT proxy before depreciation. Peak cumulative loss of {base.name}: {eurM(-sel.kpi.peakCumulativeLossEur)} ({sel.kpi.peakLossYear}).
            {sel.overCapacityFrom ? ` Needs more pads at Andøya from ${sel.overCapacityFrom}; their cost is not included.` : ""}
          </p>
        </div>
        <div className="card present__levers">
          <div className="overline">Five assumptions to test · {base.name}</div>
          <Slider
            label="Frame-contract launches a year"
            value={settings.contractLaunches ?? base.contract_launches}
            shown={fmtOne(settings.contractLaunches ?? base.contract_launches)}
            base={String(base.contract_launches)}
            min={0}
            max={8}
            step={1}
            onChange={(v) => set({ contractLaunches: v })}
          />
          <Slider
            label="Paid readiness grows"
            value={settings.readinessGrowth ?? base.readiness_growth}
            shown={`${fmtPct(settings.readinessGrowth ?? base.readiness_growth)} a year`}
            base={base.fields.includes("sovereign_readiness") ? fmtPct(base.readiness_growth) : "no contract in Bear"}
            min={0.1}
            max={0.25}
            step={0.01}
            onChange={(v) => set({ readinessGrowth: v })}
          />
          <Slider
            label="Success rate from 2030"
            value={settings.success2030 ?? base.success_2030}
            shown={fmtPct(settings.success2030 ?? base.success_2030)}
            base={fmtPct(base.success_2030)}
            min={0.75}
            max={0.97}
            step={0.01}
            onChange={(v) => set({ success2030: v })}
          />
          <Slider
            label="Fixed cost base (all scenarios)"
            value={settings.fixedOpexEur}
            shown={`${eurM(settings.fixedOpexEur)} a year`}
            base={eurM(BASE_COST.fixedOpexEur)}
            min={40e6}
            max={90e6}
            step={5e6}
            onChange={(v) => set({ fixedOpexEur: v })}
          />
          <Slider
            label={`Q4 shock: Andøya closed in ${SHOCK_YEAR}`}
            value={settings.shockMonths}
            shown={`${settings.shockMonths} months`}
            base="0"
            min={0}
            max={12}
            step={1}
            onChange={(v) => set({ shockMonths: v })}
          />
        </div>
      </div>

      <div className="present__bottom">
        <div className="card present__list">
          <h4>How ASCENT makes money</h4>
          <ul>
            <li>
              <strong>Contracts first:</strong>{" "}
              {by2035 !== null ? `about ${Math.ceil(by2035)} frame-contract launches a year make it profitable by 2035 (with ${a.scenario.contract_launches}: ${a.kpi.sustainedBreakEven ? `from ${a.kpi.sustainedBreakEven}` : "not by 2040"}).` : "with these settings no number of contracts that fits Andøya gets there by 2035."}
            </li>
            <li>
              <strong>Paid readiness:</strong> {eurM(a.at(2030).readinessRevenueEur)} in 2030, mostly a fee at {fmtPct(BASE_COST.readinessFeeMargin)} margin.
            </li>
            <li>
              <strong>Reliability:</strong> every failed flight is a rocket re-flown at Isar's cost; {fmtPct(a.at(2030).successRate)} success by 2030.
            </li>
            <li>
              <strong>Nova Scotia only with an anchor:</strong> about {ns ? Math.ceil(ns) : "–"} launches a year cover the fee; at {a.scenario.ns_anchor_launches} the site
              costs {nsNet !== null ? eurM(-nsNet) : "–"} a year.
            </li>
            <li>
              <strong>No-go list:</strong> no satellites, own data, transfer vehicle or engines for others; capital stays in launch.
            </li>
          </ul>
        </div>
        <div className="card present__list">
          <h4>Growth fields (Q2) · Isar revenue 2030</h4>
          <ul className="present__fields">
            {fields("pursue").map(({ f, revenue }) => (
              <li key={f.id}>
                <span>{shortName[f.id] ?? f.name}</span>
                <strong>{eurM(revenue)}</strong>
              </li>
            ))}
          </ul>
          <p className="present__more">
            <strong>With a trigger:</strong> {fields("conditional").map(({ f }) => shortName[f.id] ?? f.name).join(", ")}.<br />
            <strong>Not:</strong> {fields("not").map(({ f }) => shortName[f.id] ?? f.name).join(", ")}.
          </p>
        </div>
        <div className="card present__list present__shock">
          <h4>Q4 shock · Andøya closed, Nova Scotia only Canadian</h4>
          {settings.shockMonths === 0 ? (
            <p className="caption">Move the last slider: months Andøya is closed in {SHOCK_YEAR}.</p>
          ) : (
            <div className="present__nums">
              <span>
                <strong>{fmtPct(sh.without.revenueKept)}</strong>
                <small>revenue kept, Andøya and Nova Scotia only</small>
              </span>
              <span>
                <strong>{fmtPct(sh.withKourou.revenueKept)}</strong>
                <small>with a Kourou pad share</small>
              </span>
              <span>
                <strong className={sh.withKourou.ebitEur < 0 ? "is-neg" : "is-pos"}>{signedM(sh.withKourou.ebitEur)}</strong>
                <small>EBIT {SHOCK_YEAR} (base {signedM(sel.at(SHOCK_YEAR).ebitEur)})</small>
              </span>
            </div>
          )}
          <p>
            <strong>Second ocean:</strong> production is not hit, the launch site is. Hold a Kourou pad share as insurance ({fmtOne(KOUROU_LAUNCHES)} launches, about{" "}
            {eurM(KOUROU_FEE)} a year), let Nova Scotia fly Canadian payloads, and keep a fallback site in every readiness contract.
          </p>
        </div>
      </div>
    </section>
  );
}
