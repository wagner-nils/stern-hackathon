import { useState } from "react";
import { ReliabilityLegend, SourceChips } from "../components/SourceChip";
import { ConfidenceBadge } from "../components/ConfidenceBadge";
import { type ExpansionField, assumption, expansionFields, launchGap } from "../data/warehouse";
import { fmtOne, fmtPct } from "../lib/format";
import { type Q2Settings, breakEvenLaunches, fieldYear, portfolio } from "../model/q2";

const YEARS = [2030, 2035, 2040] as const;
type Year = (typeof YEARS)[number];
type Rec = ExpansionField["recommendation"];

const recLabel: Record<Rec, string> = { pursue: "Pursue", conditional: "With trigger", not: "Deliberately not" };
const categoryLabel: Record<ExpansionField["category"], string> = {
  core: "Core launch",
  site: "New site",
  product: "New product",
  adjacent: "Beyond launch",
};

export const ASCENT = [
  { letter: "A", move: "Anchor contracts first", what: "Frame contracts over several launches with deposits. The launch count follows contracts, not factory capacity.", pattern: "Subscription, Lock-in" },
  { letter: "S", move: "Sovereign readiness", what: "States pay for readiness: reserved slots, a rocket on stock, lost satellites replaced within days together with Planet.", pattern: "Guaranteed Availability" },
  { letter: "C", move: "Core polar launches", what: "Dedicated launches to polar and sun-synchronous orbits from Andøya for commercial, institutional and defence customers.", pattern: "Aikido: the opposite of rideshare" },
  { letter: "E", move: "Extras on every launch", what: "Integration, insurance brokerage, drop-off in several orbits, selling spare capacity.", pattern: "Add-on" },
  { letter: "N", move: "No-go list", what: "No satellites, no own constellation, no transfer vehicle, no price war with rideshare.", pattern: "Not: Integrator, License, No Frills" },
  { letter: "T", move: "Triggers for expansion", what: "Nova Scotia, Kourou, hypersonic tests and a mid-class rocket only with an anchor customer, funding or proven cadence.", pattern: "EVA discipline" },
];

const PRICE = assumption("fixed_price_per_launch_eur").value;
const BASE_WACC = assumption("q2_wacc").value;
const readinessField = expansionFields.find((f) => f.id === "sovereign_readiness");

/** Millions with one decimal; billions for the big markets. */
const eur = (v: number) => (Math.abs(v) >= 1e9 ? `€${fmtOne(v / 1e9)} bn` : `€${fmtOne(v / 1e6)} M`);
const signed = (v: number) => `${v < -5e4 ? "−" : v > 5e4 ? "+" : "±"}${eur(Math.abs(v))}`;

function LaunchGapCard() {
  const max = Math.max(1, ...launchGap.map((g) => g.planned));
  return (
    <div className="card gap">
      <h4>The launch gap: planned launches against visible demand</h4>
      {launchGap.map((g) => (
        <div key={g.year} className="gap__row">
          <span className="gap__year">
            {g.year}
            <small>{g.planned_basis}</small>
          </span>
          <span className="gap__track" title={`${g.planned} planned launches`}>
            <span className="gap__bar gap__bar--market" style={{ width: `${(g.launches_filled / max) * 100}%` }} />
            <span className="gap__bar gap__bar--isar" style={{ width: `${(g.launches_filled_isar_share / max) * 100}%` }} />
            <span className="gap__planned" style={{ width: `${(g.planned / max) * 100}%` }} />
          </span>
          <span className="gap__value">
            <strong>{fmtOne(g.launches_filled_isar_share)}</strong> / {fmtOne(g.launches_filled)} / {g.planned}
          </span>
        </div>
      ))}
      <p className="caption">
        Dark blue: launches Isar can realistically win from today's flown demand (45 % against Rocket Lab). Light blue: all visible
        dedicated demand. Outline: launches Isar plans. Everything beyond the light bar needs contracts. SQL: v_q2_launch_gap.
      </p>
    </div>
  );
}

function FieldDetail({ f, s, year }: { f: ExpansionField; s: Q2Settings; year: Year }) {
  const y = fieldYear(f, year, s);
  const growth = s.growthOverride?.id === f.id ? s.growthOverride.growth : f.growth;
  const breakEven = breakEvenLaunches(f, PRICE);
  return (
    <div className="card field-detail">
      <div className="site-detail__head">
        <div>
          <div className="overline">
            {categoryLabel[f.category]} · {f.sites ?? "–"} · from {f.start_year}
            {f.end_year ? ` to ${f.end_year}` : ""}
          </div>
          <h3>{f.name}</h3>
        </div>
        <div className="site-detail__tags">
          <span className={`pill rec--${f.recommendation}`}>{recLabel[f.recommendation]}</span>
          <ConfidenceBadge level={f.confidence} />
        </div>
      </div>
      <p className="field-detail__calc">
        {eur(f.market_2025_eur)} market 2025 × (1 + {fmtPct(growth)})<sup>{year - 2025}</sup> = {eur(y.marketEur)} in {year} × Isar share{" "}
        {fmtPct(f.isar_share)} = <strong>{eur(y.revenueEur)} revenue</strong> × {fmtPct(f.gross_margin)} margin = {eur(y.grossProfitEur)} gross profit −{" "}
        {eur(y.fixedCostEur)} fixed cost − {fmtPct(s.wacc)} × {eur(f.capex_eur)} capital = <strong>{signed(y.evaProxyEur)} EVA proxy</strong>
      </p>
      <dl className="site-detail__notes">
        <dt>Market</dt>
        <dd>{f.market_basis}</dd>
        <dt>Growth</dt>
        <dd>{f.growth_basis}</dd>
        <dt>Isar share</dt>
        <dd>{f.share_basis}</dd>
        <dt>Margin</dt>
        <dd>{f.margin_basis}</dd>
        <dt>Cost</dt>
        <dd>
          {f.cost_basis ?? "–"}
          {breakEven > 0 && (
            <>
              <br />
              <strong>Break-even:</strong> about {fmtOne(breakEven)} extra launches a year at €{fmtOne(PRICE / 1e6)} M each.
            </>
          )}
        </dd>
        {f.note && (
          <>
            <dt>Note</dt>
            <dd>{f.note}</dd>
          </>
        )}
        <dt>Sources</dt>
        <dd>
          <SourceChips ids={f.source_ids} />
        </dd>
      </dl>
    </div>
  );
}

/** RQ2: which business areas to pursue, in numbers. Every figure comes from expansion_fields and the Q2 views. */
export function Q2Growth() {
  const [year, setYear] = useState<Year>(2030);
  const [wacc, setWacc] = useState(BASE_WACC);
  const [readinessGrowth, setReadinessGrowth] = useState(readinessField?.growth ?? 0.15);
  const [selected, setSelected] = useState("sovereign_readiness");

  const s: Q2Settings = { wacc, growthOverride: readinessField ? { id: readinessField.id, growth: readinessGrowth } : undefined };
  const rows = expansionFields.map((f) => ({ f, y: fieldYear(f, year, s) })).sort((a, b) => b.y.evaProxyEur - a.y.evaProxyEur);
  const maxAbs = Math.max(1, ...rows.map((r) => Math.abs(r.y.evaProxyEur)));
  const byRec = (rec: Rec) => portfolio(expansionFields.filter((f) => f.recommendation === rec), year, s);
  const pursue = byRec("pursue");
  const gap2028 = launchGap.find((g) => g.year === 2028);
  const changed = wacc !== BASE_WACC || (readinessField && readinessGrowth !== readinessField.growth);
  const detail = expansionFields.find((f) => f.id === selected);

  return (
    <section className="chapter">
      <header className="chapter__head">
        <div className="overline">Question 2 · Growth areas</div>
        <h2>Which business areas should Isar pursue, and which deliberately not?</h2>
      </header>

      <p className="answer">
        Isar should stay a launch provider and grow through <strong>contracts</strong>, not rockets on stock. In {year} the fields we
        recommend bring about <strong>{eur(pursue.revenueEur)}</strong> revenue, the equivalent of {fmtOne(pursue.revenueEur / PRICE)}{" "}
        Spectrum launches, and an EVA proxy of <strong>{signed(pursue.evaProxyEur)}</strong>.
        {gap2028 &&
          ` Today's flown demand fills only ${fmtOne(gap2028.launches_filled)} of the ${gap2028.planned} launches planned for 2028, of which Isar can win about ${fmtOne(gap2028.launches_filled_isar_share)}.`}
      </p>

      <LaunchGapCard />

      <div>
        <div className="toolbar">
          <div className="overline">Strategy ASCENT: anchor contracts first, then rockets</div>
        </div>
        <div className="ascent">
          {ASCENT.map((a) => (
            <div key={a.move} className="ascent__card">
              <span className="ascent__letter">{a.letter}</span>
              <strong>{a.move}</strong>
              <span>{a.what}</span>
              <small>{a.pattern}</small>
            </div>
          ))}
        </div>
      </div>

      <div className="toolbar">
        <div className="overline">Expansion fields in numbers</div>
        <div className="toggle" role="group" aria-label="Year">
          {YEARS.map((y) => (
            <button key={y} className={year === y ? "is-active" : ""} onClick={() => setYear(y)}>
              {y}
            </button>
          ))}
        </div>
      </div>

      <div className="card whatif">
        <label>
          <span>
            Growth of paid readiness <strong>{fmtPct(readinessGrowth)} a year</strong>
          </span>
          <input type="range" min={0.1} max={0.25} step={0.01} value={readinessGrowth} onChange={(e) => setReadinessGrowth(Number(e.target.value))} />
          <small>No European budget is published; the US programme is the proxy. Range 10–25 %.</small>
        </label>
        <label>
          <span>
            Cost of capital (WACC) <strong>{fmtPct(wacc)}</strong>
          </span>
          <input type="range" min={0.1} max={0.15} step={0.005} value={wacc} onChange={(e) => setWacc(Number(e.target.value))} />
          <small>Charged on capital a field ties up, from 2027 on.</small>
        </label>
        {changed && (
          <button
            className="text-button"
            onClick={() => {
              setWacc(BASE_WACC);
              if (readinessField) setReadinessGrowth(readinessField.growth);
            }}
          >
            Back to base
          </button>
        )}
      </div>

      <div className="card table-wrap">
        <table className="sites-table fields-table">
          <thead>
            <tr>
              <th>Field</th>
              <th className="num">Market 2025</th>
              <th className="num">Isar revenue {year}</th>
              <th className="num">Gross profit</th>
              <th>EVA proxy {year}</th>
              <th>Recommendation</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ f, y }) => (
              <tr key={f.id} className={f.id === selected ? "is-selected" : ""} onClick={() => setSelected(f.id)}>
                <td>
                  <strong>{f.name}</strong>
                  <small>
                    {categoryLabel[f.category]} · {f.sites ?? "–"}
                  </small>
                </td>
                <td className="num">{eur(f.market_2025_eur)}</td>
                <td className="num">{y.revenueEur ? eur(y.revenueEur) : "–"}</td>
                <td className="num">{y.grossProfitEur ? eur(y.grossProfitEur) : "–"}</td>
                <td>
                  <span className="eva">
                    <span className="eva__track">
                      <span
                        className={`eva__bar eva__bar--${y.evaProxyEur < 0 ? "neg" : "pos"}`}
                        style={{ width: `${(Math.abs(y.evaProxyEur) / maxAbs) * 50}%` }}
                      />
                    </span>
                    <span className={`eva__value${y.evaProxyEur < 0 ? " is-neg" : ""}`}>{signed(y.evaProxyEur)}</span>
                  </span>
                </td>
                <td>
                  <span className={`pill rec--${f.recommendation}`}>{recLabel[f.recommendation]}</span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            {(["pursue", "conditional", "not"] as Rec[]).map((rec) => {
              const t = byRec(rec);
              return (
                <tr key={rec}>
                  <td>
                    <strong>All “{recLabel[rec]}” fields</strong>
                  </td>
                  <td />
                  <td className="num">{eur(t.revenueEur)}</td>
                  <td className="num">{eur(t.grossProfitEur)}</td>
                  <td>
                    <span className={`eva__value${t.evaProxyEur < 0 ? " is-neg" : ""}`}>{signed(t.evaProxyEur)}</span>
                  </td>
                  <td />
                </tr>
              );
            })}
          </tfoot>
        </table>
        <p className="caption">
          EVA proxy = gross profit − fixed cost − WACC × capital tied up. Gross profit stands in for operating profit after tax, so it
          ranks the fields; it is not a valuation. Click a row for the calculation and its sources. SQL: v_q2_expansion_fields.
        </p>
        <ReliabilityLegend />
      </div>

      {detail && <FieldDetail f={detail} s={s} year={year} />}
    </section>
  );
}
