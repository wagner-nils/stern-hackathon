import { ConfidenceBadge } from "../components/ConfidenceBadge";
import { ScenarioChart } from "../components/ScenarioChart";
import { SourceChips } from "../components/SourceChip";
import { assumptions, expansionFields, scenarios } from "../data/warehouse";
import { fmtInt, fmtOne, fmtPct } from "../lib/format";
import { type ScenarioSettings, BASE_COST, BASE_SETTINGS, isEdited, run } from "../state/scenario";

const m = (v: number) => fmtInt(Math.round(v / 1e6));
const NS_FEE = expansionFields.find((f) => f.id === "site_nova_scotia")?.fixed_cost_eur ?? 0;
const COST_IDS = [
  "scen_fixed_opex_eur",
  "scen_size_factor",
  "scen_ref_cadence",
  "scen_readiness_launch_share",
  "scen_readiness_fee_margin",
  "scen_ns_fee_start_year",
  "q3_learning_rate",
  "fixed_price_per_launch_eur",
];

/** Final: the three P&L scenarios as a decision tool. Every number from table scenarios and v_scenarios (TS mirror). */
export function Scenarios({ settings, setSettings }: { settings: ScenarioSettings; setSettings: (s: ScenarioSettings) => void }) {
  const runs = Object.fromEntries(scenarios.map((s) => [s.id, run(s.id, settings).years]));
  const r = run(settings.scenarioId, settings);
  const contracts = settings.contractLaunches ?? r.scenario.contract_launches;
  const capacity = (year: number) => r.andoyaCapacity(year);
  const costRows = COST_IDS.map((id) => assumptions.find((a) => a.id === id)).filter((a) => !!a);

  return (
    <section className="chapter">
      <header className="chapter__head">
        <div className="overline">Final · Scenarios</div>
        <h2>How do revenue and profit develop under our assumptions?</h2>
      </header>

      <p className="answer">
        <strong>
          {r.scenario.name}: {r.kpi.sustainedBreakEven ? `profitable from ${r.kpi.sustainedBreakEven}` : "no operating profit by 2040"}.
        </strong>{" "}
        Revenue €{m(r.at(2030).revenueEur)} M in 2030 and €{m(r.at(2035).revenueEur)} M in 2035; the cumulative operating loss bottoms out at €
        {m(-r.kpi.peakCumulativeLossEur)} M in {r.kpi.peakLossYear}. {r.scenario.tagline}.
      </p>

      <div className="toolbar">
        <div className="toggle" role="group" aria-label="Scenario">
          {scenarios.map((s) => (
            <button key={s.id} className={settings.scenarioId === s.id ? "is-active" : ""} onClick={() => setSettings({ ...settings, scenarioId: s.id, contractLaunches: null })}>
              {s.name}
            </button>
          ))}
        </div>
        {isEdited(settings) && (
          <button className="text-button" onClick={() => setSettings({ ...BASE_SETTINGS, scenarioId: settings.scenarioId })}>
            Back to base
          </button>
        )}
      </div>

      <div className="card">
        <ScenarioChart runs={runs} selected={settings.scenarioId} />
      </div>

      <div className="card whatif">
        <label>
          <span>
            Frame-contract launches a year from {r.scenario.contract_start_year} <strong>{fmtOne(contracts)}</strong>
          </span>
          <input type="range" min={0} max={8} step={1} value={contracts} onChange={(e) => setSettings({ ...settings, contractLaunches: Number(e.target.value) })} />
          <small>The A in ASCENT: launches sold beyond today's visible demand. Base: {scenarios.find((s) => s.id === settings.scenarioId)?.contract_launches}.</small>
        </label>
        <label>
          <span>
            Fixed cost base a year <strong>€{m(settings.fixedOpexEur)} M</strong>
          </span>
          <input
            type="range"
            min={40e6}
            max={90e6}
            step={5e6}
            value={settings.fixedOpexEur}
            onChange={(e) => setSettings({ ...settings, fixedOpexEur: Number(e.target.value) })}
          />
          <small>The least certain input: R&D and overhead. Base €{m(BASE_COST.fixedOpexEur)} M.</small>
        </label>
        <label>
          <span>
            Spectrum cost per launch vs Electron <strong>{fmtOne(settings.sizeFactor)}×</strong>
          </span>
          <input type="range" min={1.2} max={2} step={0.1} value={settings.sizeFactor} onChange={(e) => setSettings({ ...settings, sizeFactor: Number(e.target.value) })} />
          <small>Spectrum carries about 3× Electron's payload with the same engine count. Base {fmtOne(BASE_COST.sizeFactor)}×.</small>
        </label>
      </div>

      <div className="card pnl">
        <h4>P&L of {r.scenario.name}, € M (real 2026 euros)</h4>
        <div className="pnl__scroll">
          <table>
            <thead>
              <tr>
                <th />
                {r.years.map((y) => (
                  <th key={y.year}>{y.year}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>Launches sold</th>
                {r.years.map((y) => (
                  <td key={y.year}>{fmtOne(y.launchesSold)}</td>
                ))}
              </tr>
              <tr>
                <th>Flights incl. re-flights</th>
                {r.years.map((y) => (
                  <td key={y.year} className={y.andoyaFlown > capacity(y.year) + 1e-9 ? "is-over" : ""} title={`Andøya: ${fmtOne(y.andoyaFlown)} of ${fmtOne(capacity(y.year))}`}>
                    {fmtOne(y.launchesFlown)}
                  </td>
                ))}
              </tr>
              <tr>
                <th>Success rate</th>
                {r.years.map((y) => (
                  <td key={y.year}>{fmtPct(y.successRate)}</td>
                ))}
              </tr>
              <tr>
                <th>Cost per flight</th>
                {r.years.map((y) => (
                  <td key={y.year}>{fmtOne(y.unitCostEur / 1e6)}</td>
                ))}
              </tr>
              <tr>
                <th>Launch revenue</th>
                {r.years.map((y) => (
                  <td key={y.year}>{m(y.launchRevenueEur)}</td>
                ))}
              </tr>
              <tr>
                <th>Paid readiness</th>
                {r.years.map((y) => (
                  <td key={y.year}>{m(y.readinessRevenueEur)}</td>
                ))}
              </tr>
              <tr>
                <th>Extras</th>
                {r.years.map((y) => (
                  <td key={y.year}>{m(y.extrasRevenueEur)}</td>
                ))}
              </tr>
              <tr className="pnl__total">
                <th>Revenue</th>
                {r.years.map((y) => (
                  <td key={y.year}>{m(y.revenueEur)}</td>
                ))}
              </tr>
              <tr>
                <th>Gross profit</th>
                {r.years.map((y) => (
                  <td key={y.year}>{m(y.grossProfitEur)}</td>
                ))}
              </tr>
              <tr>
                <th>Fixed cost and site fees</th>
                {r.years.map((y) => (
                  <td key={y.year}>{m(-y.fixedCostEur)}</td>
                ))}
              </tr>
              <tr className="pnl__total">
                <th>Operating profit (EBIT proxy)</th>
                {r.years.map((y) => (
                  <td key={y.year} className={y.ebitEur < 0 ? "is-neg" : "is-pos"}>
                    {m(y.ebitEur)}
                  </td>
                ))}
              </tr>
              <tr>
                <th>Cumulative</th>
                {r.years.map((y) => (
                  <td key={y.year} className={y.cumulativeEbitEur < 0 ? "is-neg" : "is-pos"}>
                    {m(y.cumulativeEbitEur)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <p className="caption">
          Red flights: more flights from Andøya than its proposed capacity (pad A plus half of pad 2, RQ3). Launch cost = Rocket Lab's cost of revenue per launch
          (incl. allocated production overhead) × size factor, rising by 1 ÷ {fmtPct(BASE_COST.learningRate)} for every halving of cadence below{" "}
          {BASE_COST.refCadence}, flat above. Fixed cost = R&D and overhead plus site fees (Nova Scotia from May 2029, pro rata). Depreciation of plant and
          pads is not modelled. RQ3's site load converts all field revenue into launches; here readiness is mostly a fee and failed launches are re-flown, so the
          launch counts differ. SQL: v_scenarios.
        </p>
      </div>

      <div className="card">
        <h4>The three scenarios</h4>
        <div className="scenario-cards">
          {scenarios.map((s) => (
            <div key={s.id} className={`scenario-card${s.id === settings.scenarioId ? " is-active" : ""}`}>
              <div className="site-detail__head">
                <strong>{s.name}</strong>
                <ConfidenceBadge level={s.confidence} />
              </div>
              <p>{s.rationale}</p>
              <dl>
                <dt>Readiness growth</dt>
                <dd>{s.fields.includes("sovereign_readiness") ? fmtPct(s.readiness_growth) : "no contract"}</dd>
                <dt>Frame-contract launches</dt>
                <dd>
                  {s.contract_launches} a year from {s.contract_start_year}
                </dd>
                <dt>Nova Scotia anchor</dt>
                <dd>
                  {s.fields.includes("site_nova_scotia")
                    ? `${s.ns_anchor_launches} launches a year`
                    : `site not taken up; if the fee is binding, another −€${m(NS_FEE)} M a year`}
                </dd>
                <dt>ESA level after 2030</dt>
                <dd>{fmtPct(s.institutional_after_end)}</dd>
                <dt>Success 2027 → 2030</dt>
                <dd>
                  {fmtPct(s.success_2027)} → {fmtPct(s.success_2030)}
                </dd>
              </dl>
              <SourceChips ids={s.source_ids} />
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h4>Cost base</h4>
        <ul className="assumption-list">
          {costRows.map((a) => (
            <li key={a!.id}>
              <span>
                <strong>{a!.name}</strong>
                <small>{a!.rationale}</small>
              </span>
              <span className="assumption-list__value">
                {a!.unit === "EUR" ? `€${m(a!.value)} M` : a!.unit === "share" ? fmtPct(a!.value) : a!.unit === "year" ? String(a!.value) : fmtOne(a!.value)}
                {a!.low !== null && a!.high !== null && (
                  <small>
                    {a!.unit === "EUR" ? `€${m(a!.low)}–${m(a!.high)} M` : a!.unit === "share" ? `${fmtPct(a!.low)}–${fmtPct(a!.high)}` : a!.unit === "year" ? `${a!.low}–${a!.high}` : `${fmtOne(a!.low)}–${fmtOne(a!.high)}`}
                  </small>
                )}
              </span>
              <span>
                <ConfidenceBadge level={a!.confidence} />
                <SourceChips ids={a!.source_ids} />
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
