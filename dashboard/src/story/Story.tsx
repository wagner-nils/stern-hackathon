import { type ReactNode, useEffect, useState } from "react";
import { FootprintMap } from "../components/FootprintMap";
import { ScenarioChart } from "../components/ScenarioChart";
import { type MapSite, SiteMap } from "../components/SiteMap";
import { expansionFields, launchGap, launchSites, preferred, scenarios, siteNodes, siteOverview, sqlFunnel } from "../data/warehouse";
import { fmtInt, fmtOne, fmtPct } from "../lib/format";
import { ASCENT } from "../sections/Q2Growth";
import { type ScenarioSettings, BASE_SETTINGS, isEdited, run } from "../state/scenario";

export type DeepDive = "q1" | "q2" | "q3" | "sites" | "scenarios";

const eurM = (v: number) => `€${fmtInt(Math.round(v / 1e6))} M`;
const signedM = (v: number) => `${v < 0 ? "−" : "+"}€${fmtInt(Math.abs(Math.round(v / 1e6)))} M`;

const gap2028 = launchGap.find((g) => g.year === 2028);
const tam = sqlFunnel.find((r) => r.tier === "TAM");
const reachable = [...sqlFunnel].reverse().find((r) => r.tier === "SAM");
const notFields = expansionFields.filter((f) => f.recommendation === "not");
const extras = expansionFields.find((f) => f.id === "mission_extras");
const elc = expansionFields.find((f) => f.id === "institutional_elc");
const insurance = preferred("launch_insurance_rate", { year: 2026, scope: "company", entity: "Isar Aerospace" });
const mapSites: MapSite[] = launchSites.map((s) => ({ ...s, activity: siteOverview.find((o) => o.id === s.id) }));
const ISAR_SITES = new Set(siteNodes.map((n) => n.launch_site_id).filter((x): x is string => !!x));

interface BeatProps {
  settings: ScenarioSettings;
  setSettings: (s: ScenarioSettings) => void;
  step: number;
  dive: (to: DeepDive) => void;
}

interface Beat {
  id: string;
  label: string;
  /** Sub-steps the arrow keys walk through before the next beat. */
  steps: number;
  render: (p: BeatProps) => ReactNode;
}

function Kpi({ value, label, note }: { value: string; label: string; note?: string }) {
  return (
    <div className="kpi">
      <strong>{value}</strong>
      <span>{label}</span>
      {note && <small>{note}</small>}
    </div>
  );
}

function Dive({ to, label, dive }: { to: DeepDive; label: string; dive: (to: DeepDive) => void }) {
  return (
    <button className="dive" onClick={() => dive(to)}>
      Deep dive · {label} →
    </button>
  );
}

function Recommendation({ settings, dive }: BeatProps) {
  const a = run("ascent", settings);
  const by2035 = a.contractsFor(2035);
  return (
    <div className="beat beat--hero">
      <div className="overline">Our recommendation to SSVE</div>
      <h1>
        Invest in Isar, in stages: back the <em>ASCENT</em> strategy and release each tranche at a dated gate.
      </h1>
      <div className="kpis">
        <Kpi value={eurM(a.at(2030).revenueEur)} label="revenue 2030" note="ASCENT base case" />
        <Kpi value={a.kpi.sustainedBreakEven ? String(a.kpi.sustainedBreakEven) : "not by 2040"} label="operating profit from" note="and positive every year after" />
        <Kpi value={eurM(-a.kpi.peakCumulativeLossEur)} label="peak cumulative operating loss" note={`deepest in ${a.kpi.peakLossYear}; not a funding plan`} />
      </div>
      <p className="beat__why">
        Why staged: today's flown demand fills only <strong>{fmtOne(gap2028?.launches_filled ?? 0)}</strong> of the{" "}
        <strong>{gap2028?.planned}</strong> launches Isar plans for 2028, and about <strong>{fmtOne(gap2028?.launches_filled_isar_share ?? 0)}</strong> of
        them are Isar's. Profit comes from contracts:
        {by2035 !== null && (
          <>
            {" "}
            about <strong>{Math.ceil(by2035)}</strong> frame-contract launches a year (base: {a.scenario.contract_launches}) bring break-even forward to 2035.
          </>
        )}
      </p>
      <div className="dives">
        <Dive to="q2" label="the launch gap" dive={dive} />
        <Dive to="scenarios" label="the scenarios" dive={dive} />
      </div>
    </div>
  );
}

function Ascent({ settings, dive }: BeatProps) {
  const [open, setOpen] = useState<string | null>(null);
  const a = run("ascent", settings);
  const ns = a.nsBreakEven(2030);
  const number: Record<string, [string, string]> = {
    A: [`${fmtOne(gap2028?.launches_filled_isar_share ?? 0)} of ${gap2028?.planned}`, "planned 2028 launches Isar can win from today's demand"],
    S: [eurM(a.at(2030).readinessRevenueEur), "paid readiness revenue 2030"],
    C: [fmtInt(reachable?.satellites ?? 0), `of ${fmtInt(tam?.satellites ?? 0)} satellites launched in 2025 reachable from Andøya`],
    E: [fmtPct(extras?.gross_margin ?? 0), "margin on add-ons sold with every launch"],
    N: [String(notFields.length), "fields we deliberately leave to others"],
    T: [ns ? `≈ ${Math.ceil(ns)}` : "–", "anchor launches a year before Nova Scotia pays its fee"],
  };
  return (
    <div className="beat">
      <div className="overline">The strategy</div>
      <h2>ASCENT: first the contract, then the rocket.</h2>
      <div className="ascent">
        {ASCENT.map((m) => (
          <button key={m.letter} className={`ascent__tile${open === m.letter ? " is-open" : ""}`} onClick={() => setOpen(open === m.letter ? null : m.letter)}>
            <span className="ascent__letter">{m.letter}</span>
            <span className="ascent__move">{m.move}</span>
            <strong className="ascent__number">{number[m.letter]?.[0]}</strong>
            <small>{number[m.letter]?.[1]}</small>
            {open === m.letter && <span className="ascent__what">{m.what}</span>}
          </button>
        ))}
      </div>
      <p className="caption">Click a letter for what it means. The economic logic is EVA: grow only where profit beats the cost of capital.</p>
      <div className="dives">
        <Dive to="q2" label="business areas (RQ2)" dive={dive} />
      </div>
    </div>
  );
}

function Geography({ step, dive, settings }: BeatProps) {
  const a = run("ascent", settings);
  const operational = launchSites.filter((s) => s.status === "operational").length;
  const andoya = a.at(2030).andoyaFlown;
  const capacity = a.andoyaCapacity(2030);
  if (step === 0)
    return (
      <div className="beat">
        <div className="overline">Geography · the world</div>
        <h2>The launch site decides the orbit, and the orbit decides the customers.</h2>
        <div className="geo">
          <SiteMap sites={mapSites} selected="andoya" onSelect={() => undefined} highlight={ISAR_SITES} />
          <div className="kpis kpis--column">
            <Kpi value={fmtInt(launchSites.length)} label="spaceports in our register" note={`${operational} operational`} />
            <Kpi value={fmtPct((reachable?.satellites ?? 0) / (tam?.satellites ?? 1))} label="of satellites launched in 2025 reachable from Andøya" note={`${fmtInt(reachable?.satellites ?? 0)} of ${fmtInt(tam?.satellites ?? 0)}: polar and sun-synchronous, up to 700 kg`} />
          </div>
        </div>
        <p className="caption">Highlighted: the sites in Isar's portfolio. Next: zoom in on the footprint.</p>
        <div className="dives">
          <Dive to="sites" label="all spaceports" dive={dive} />
          <Dive to="q1" label="reach from Andøya (RQ1)" dive={dive} />
        </div>
      </div>
    );
  return (
    <div className="beat">
      <div className="overline">Geography · Isar's footprint</div>
      <h2>One plant, one core spaceport with a second pad, one sovereign option abroad.</h2>
      <div className="geo">
        <FootprintMap nodes={siteNodes} />
        <ul className="footprint__list">
          {siteNodes
            .filter((n) => n.kind !== "hq")
            .map((n) => (
              <li key={n.id}>
                <span className={`pill decision--${n.decision}`}>{{ keep: "Keep", expand: "Expand", option: "Option", hold: "Not now" }[n.decision]}</span>
                <span>
                  <strong>{n.name}</strong>
                  <small title={n.trigger ?? n.role_proposed}>{n.trigger ?? n.role_proposed}</small>
                </span>
              </li>
            ))}
        </ul>
      </div>
      <p className="caption">
        ASCENT 2030: about {fmtOne(andoya)} flights from Andøya against a proposed capacity of {fmtOne(capacity)}. The plant is built for 40 rockets a year; a second
        plant only from about 30 contracted launches.
      </p>
      <div className="dives">
        <Dive to="q3" label="site portfolio (RQ3)" dive={dive} />
      </div>
    </div>
  );
}

function Numbers({ settings, setSettings, dive }: BeatProps) {
  const runs = Object.fromEntries(scenarios.map((s) => [s.id, run(s.id, settings).years]));
  const r = run(settings.scenarioId, settings);
  const contracts = settings.contractLaunches ?? r.scenario.contract_launches;
  return (
    <div className="beat">
      <div className="overline">The numbers · three scenarios under our assumptions</div>
      <h2>ASCENT makes money in the late 2030s; contracts decide how early.</h2>
      <div className="toolbar">
        <div className="toggle" role="group" aria-label="Scenario">
          {scenarios.map((s) => (
            <button key={s.id} className={settings.scenarioId === s.id ? "is-active" : ""} onClick={() => setSettings({ ...settings, scenarioId: s.id, contractLaunches: null })}>
              {s.name}
            </button>
          ))}
        </div>
        <span className="caption">{r.scenario.tagline}</span>
      </div>
      <div className="numbers">
        <div>
          <ScenarioChart runs={runs} selected={settings.scenarioId} height={190} />
          <label className="slider">
            <span>
              Frame-contract launches a year from {r.scenario.contract_start_year} <strong>{fmtOne(contracts)}</strong>
            </span>
            <input
              type="range"
              min={0}
              max={8}
              step={1}
              value={contracts}
              onChange={(e) => setSettings({ ...settings, contractLaunches: Number(e.target.value) })}
            />
            {isEdited(settings) && (
              <button className="text-button" onClick={() => setSettings({ ...BASE_SETTINGS, scenarioId: settings.scenarioId })}>
                edited · back to base
              </button>
            )}
          </label>
        </div>
        <div className="kpis kpis--column">
          <Kpi value={eurM(r.at(2030).revenueEur)} label="revenue 2030" note={`${eurM(r.at(2035).revenueEur)} in 2035`} />
          <Kpi value={signedM(r.at(2035).ebitEur)} label="operating profit 2035" note={`${signedM(r.at(2040).ebitEur)} in 2040`} />
          <Kpi value={r.kpi.sustainedBreakEven ? String(r.kpi.sustainedBreakEven) : "never"} label="profitable from" note={`peak loss ${eurM(-r.kpi.peakCumulativeLossEur)}`} />
        </div>
      </div>
      <p className="caption">
        Real 2026 euros. Revenue from the RQ2 fields; launch cost from Rocket Lab's measured cost curve scaled to Spectrum; failed launches are re-flown at Isar's
        cost; EBIT proxy before depreciation of plant and pads. Not a valuation.
      </p>
      <div className="dives">
        <Dive to="scenarios" label="P&L and assumptions" dive={dive} />
      </div>
    </div>
  );
}

function Gates({ settings, dive }: BeatProps) {
  const a = run("ascent", settings);
  const bear = run("bear", BASE_SETTINGS);
  const ns = a.nsBreakEven(2030);
  const elc2030 = elc ? elc.market_2025_eur * Math.pow(1 + elc.growth, 2030 - 2025) * elc.isar_share : 0;
  const gates = [
    {
      when: "2027",
      what: "Reliability",
      metric: "At least 3 of 4 flights reach orbit",
      miss: "Hold the next tranche",
    },
    {
      when: "2029",
      what: "Contracts",
      metric: "Frame contracts for 2+ launches a year beyond today's demand, plus one paid readiness contract with a European state",
      miss: `We are in Bear: ${bear.kpi.sustainedBreakEven ? `profit only from ${bear.kpi.sustainedBreakEven}` : "no profit by 2040"}`,
    },
    {
      when: "before the fee starts in 2030",
      what: "Nova Scotia",
      metric: `A signed anchor covering the fee: about ${ns ? Math.ceil(ns) : "–"} launches a year at ASCENT's cost`,
      miss: "Do not open the site",
    },
  ];
  const risks = [
    { risk: "One pad", number: "1 pad", note: "Andøya pad A carries every launch until pad 2; a failure blocks it for months" },
    { risk: "ESA programme ends 2030", number: eurM(elc2030), note: "revenue a year without a successor programme" },
    { risk: "Canada anchor open", number: ns ? `${Math.ceil(ns)} vs ${a.scenario.ns_anchor_launches}` : "–", note: "anchor launches needed to cover the fee vs assumed in ASCENT" },
    { risk: "Reliability", number: fmtPct(insurance.value), note: "insurance premium for Isar's next flight" },
  ];
  return (
    <div className="beat">
      <div className="overline">Gates and risks</div>
      <h2>Three gates release the money; a missed gate tells us which scenario we are in.</h2>
      <ol className="gates">
        {gates.map((g, k) => (
          <li key={g.what}>
            <span className="gates__n">{k + 1}</span>
            <span className="overline">{g.when}</span>
            <strong>{g.what}</strong>
            <span>{g.metric}</span>
            <small>If missed: {g.miss}</small>
          </li>
        ))}
      </ol>
      <div className="risks">
        {risks.map((r) => (
          <div key={r.risk} className="risks__item">
            <strong>{r.number}</strong>
            <span>{r.risk}</span>
            <small>{r.note}</small>
          </div>
        ))}
      </div>
      <div className="dives">
        <Dive to="q3" label="sites and triggers" dive={dive} />
        <Dive to="scenarios" label="the scenarios" dive={dive} />
      </div>
    </div>
  );
}

/** The storyline. Q4's beat goes before "Gates" once its answer is in. */
export const BEATS: Beat[] = [
  { id: "recommendation", label: "Recommendation", steps: 1, render: (p) => <Recommendation {...p} /> },
  { id: "ascent", label: "ASCENT", steps: 1, render: (p) => <Ascent {...p} /> },
  { id: "geography", label: "Geography", steps: 2, render: (p) => <Geography {...p} /> },
  { id: "numbers", label: "Numbers", steps: 1, render: (p) => <Numbers {...p} /> },
  { id: "gates", label: "Gates & risks", steps: 1, render: (p) => <Gates {...p} /> },
];

export interface StoryPosition {
  beat: number;
  step: number;
}

/** Full-screen story mode: arrow keys, space and page keys move on, Esc leaves. */
export function Story({
  at,
  setAt,
  settings,
  setSettings,
  dive,
  exit,
}: {
  at: StoryPosition;
  setAt: (p: StoryPosition) => void;
  settings: ScenarioSettings;
  setSettings: (s: ScenarioSettings) => void;
  dive: (to: DeepDive) => void;
  exit: () => void;
}) {
  // The button that opened the story keeps focus otherwise, and Space would press it.
  useEffect(() => {
    (document.activeElement as HTMLElement | null)?.blur();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "SELECT" || t.tagName === "TEXTAREA")) return;
      if (e.key === "Escape") return exit();
      const forward = e.key === "ArrowRight" || e.key === "PageDown" || (e.key === " " && t?.tagName !== "BUTTON");
      const back = e.key === "ArrowLeft" || e.key === "PageUp";
      if (!forward && !back) return;
      e.preventDefault();
      if (forward) {
        if (at.step + 1 < BEATS[at.beat].steps) setAt({ beat: at.beat, step: at.step + 1 });
        else if (at.beat + 1 < BEATS.length) setAt({ beat: at.beat + 1, step: 0 });
      } else if (at.step > 0) setAt({ beat: at.beat, step: at.step - 1 });
      else if (at.beat > 0) setAt({ beat: at.beat - 1, step: BEATS[at.beat - 1].steps - 1 });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [at, setAt, exit]);

  const beat = BEATS[at.beat];
  return (
    <section className="story" key={`${at.beat}-${at.step}`}>
      {beat.render({ settings, setSettings, step: at.step, dive })}
      <nav className="story__nav" aria-label="Story">
        <button className="text-button" disabled={at.beat === 0 && at.step === 0} onClick={() => setAt(at.step > 0 ? { ...at, step: at.step - 1 } : { beat: at.beat - 1, step: 0 })}>
          ← Back
        </button>
        <span className="story__hint">← → to move · Esc to explore</span>
        <button
          className="text-button"
          disabled={at.beat === BEATS.length - 1}
          onClick={() => setAt(at.step + 1 < beat.steps ? { ...at, step: at.step + 1 } : { beat: at.beat + 1, step: 0 })}
        >
          Next →
        </button>
      </nav>
    </section>
  );
}
