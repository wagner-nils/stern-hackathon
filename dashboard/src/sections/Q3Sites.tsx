import { useState } from "react";
import { ConfidenceBadge } from "../components/ConfidenceBadge";
import { SourceChips } from "../components/SourceChip";
import { type SiteNode, assumption, expansionFields, siteNodes } from "../data/warehouse";
import { fmtOne, fmtPct } from "../lib/format";
import { breakEvenLaunches } from "../model/q2";
import { type Load, type Q3Settings, launchesOf, relativeUnitCost, siteLoad } from "../model/q3";

const YEARS = [2030, 2035, 2040] as const;
type Year = (typeof YEARS)[number];

const PRICE = assumption("fixed_price_per_launch_eur").value;
const BASE = {
  wacc: assumption("q2_wacc").value,
  padCadence: assumption("q3_pad_cadence").value,
  nsAnchor: assumption("q3_ns_anchor_launches").value,
  learningRate: assumption("q3_learning_rate").value,
};
const readinessField = expansionFields.find((f) => f.id === "sovereign_readiness");
const nsField = expansionFields.find((f) => f.id === "site_nova_scotia");
const NS_BREAK_EVEN = nsField ? breakEvenLaunches(nsField, PRICE) : 0;

const decisionLabel: Record<SiteNode["decision"], string> = { keep: "Keep", expand: "Expand", option: "Option", hold: "Not now" };
const kindLabel: Record<SiteNode["kind"], string> = { hq: "Headquarters", production: "Production", test: "Testing", launch: "Launch" };
const siteName: Record<string, string> = {
  andoya: "Andøya",
  "nova-scotia": "Nova Scotia",
  kourou: "Kourou",
  "factory-parsdorf": "Plant Parsdorf (all Spectrum rockets)",
};

function LoadRow({ l }: { l: Load }) {
  const max = Math.max(l.capacityProposed, launchesOf(l), 1);
  const pct = (v: number) => `${(v / max) * 100}%`;
  const over = launchesOf(l) > l.capacityProposed + 1e-9;
  return (
    <div className="load__row">
      <span className="load__name">
        {siteName[l.siteId] ?? l.siteId}
        <small>
          capacity {fmtOne(l.capacityToday)} today → {fmtOne(l.capacityProposed)} proposed
        </small>
      </span>
      <span className="load__track">
        <span className="load__seg load__seg--pursue" style={{ width: pct(l.pursue) }} title={`${fmtOne(l.pursue)} launches from pursued fields`} />
        <span className="load__seg load__seg--conditional" style={{ width: pct(l.conditional) }} title={`${fmtOne(l.conditional)} from fields with a trigger`} />
        <span className="load__seg load__seg--anchor" style={{ width: pct(l.anchor) }} title={`${fmtOne(l.anchor)} anchor launches`} />
        <span className="load__cap load__cap--today" style={{ left: pct(l.capacityToday) }} />
        <span className="load__cap" style={{ left: pct(l.capacityProposed) }} />
      </span>
      <span className={`load__value${over ? " is-over" : ""}`}>
        <strong>{fmtOne(launchesOf(l))}</strong> / {fmtOne(l.capacityProposed)}
        <small>{fmtPct(l.loadProposed)}</small>
      </span>
    </div>
  );
}

function NodeCard({ n }: { n: SiteNode }) {
  return (
    <div className={`node node--${n.decision}`}>
      <div className="node__head">
        <span className="overline">
          {kindLabel[n.kind]} · {n.location}
        </span>
        <span className={`pill decision--${n.decision}`}>{decisionLabel[n.decision]}</span>
      </div>
      <strong>{n.name}</strong>
      <div className="node__today">
        <small>Today</small>
        {n.role_today}
      </div>
      <div className="node__proposed">
        <small>Proposed</small>
        {n.role_proposed}
      </div>
      {n.trigger && (
        <div className="node__trigger">
          <small>Trigger</small>
          {n.trigger}
        </div>
      )}
      <div className="node__foot">
        <ConfidenceBadge level={n.confidence} />
        <SourceChips ids={n.source_ids} />
      </div>
    </div>
  );
}

/** RQ3: one plant, one core spaceport with a second pad, one sovereign site abroad; every number from site_nodes and the Q2/Q3 views. */
export function Q3Sites() {
  const [year, setYear] = useState<Year>(2030);
  const [padCadence, setPadCadence] = useState(BASE.padCadence);
  const [nsAnchor, setNsAnchor] = useState(BASE.nsAnchor);
  const [readinessGrowth, setReadinessGrowth] = useState(readinessField?.growth ?? 0.15);
  const [canadaVolume, setCanadaVolume] = useState(3);

  const s: Q3Settings = {
    wacc: BASE.wacc,
    padCadence,
    nsAnchor,
    pricePerLaunchEur: PRICE,
    growthOverride: readinessField ? { id: readinessField.id, growth: readinessGrowth } : undefined,
  };
  const loads = siteLoad(expansionFields, siteNodes, year, s);
  const factory = loads.find((l) => l.siteId === "factory-parsdorf")!;
  const andoya = loads.find((l) => l.siteId === "andoya");
  const ns = loads.find((l) => l.siteId === "nova-scotia");
  const plantLoad = factory.capacityProposed ? launchesOf(factory) / factory.capacityProposed : 0;
  const homeVolume = Math.max(launchesOf(factory) - canadaVolume, 1);
  const canadaCost = relativeUnitCost(canadaVolume, homeVolume + canadaVolume, BASE.learningRate);
  const changed = padCadence !== BASE.padCadence || nsAnchor !== BASE.nsAnchor || (readinessField && readinessGrowth !== readinessField.growth);

  const order: SiteNode["kind"][] = ["production", "test", "launch", "hq"];
  // Along the flow plant → test → pads; what we advise against comes last.
  const nodes = [...siteNodes].sort(
    (a, b) => Number(a.decision === "hold") - Number(b.decision === "hold") || order.indexOf(a.kind) - order.indexOf(b.kind),
  );

  return (
    <section className="chapter">
      <header className="chapter__head">
        <div className="overline">Question 3 · Site portfolio</div>
        <h2>How should Isar structure its production and launch sites?</h2>
      </header>

      <p className="answer">
        <strong>One plant, one core spaceport with a second pad, one sovereign site abroad.</strong> Production stays in Bavaria;
        launch sites follow customers and contracts. In {year} Isar flies about <strong>{fmtOne(launchesOf(factory))} launches</strong>:
        {andoya && ` ${fmtOne(launchesOf(andoya))} from Andøya (${fmtPct(andoya.loadProposed)} of its proposed capacity)`}
        {ns && `, ${fmtOne(launchesOf(ns))} from Nova Scotia`}. The plant runs at <strong>{fmtPct(plantLoad)}</strong> of its 40 rockets a
        year, so a second plant is not needed.
      </p>

      <div className="toolbar">
        <div className="overline">Launches each site has to carry</div>
        <div className="toggle" role="group" aria-label="Year">
          {YEARS.map((y) => (
            <button key={y} className={year === y ? "is-active" : ""} onClick={() => setYear(y)}>
              {y}
            </button>
          ))}
        </div>
      </div>

      <div className="card load">
        {loads.map((l) => (
          <LoadRow key={l.siteId} l={l} />
        ))}
        <div className="load__legend">
          <span className="load__key load__key--pursue">pursued fields (RQ2)</span>
          <span className="load__key load__key--conditional">fields with a trigger</span>
          <span className="load__key load__key--anchor">anchor launches (Nova Scotia)</span>
          <span className="load__key load__key--cap">capacity: dashed today, solid proposed</span>
        </div>
        <p className="caption">
          Launches = Isar revenue of each RQ2 field ÷ {fmtOne(PRICE / 1e6)} M EUR per launch, assigned to the site it flies from. Capacity
          = pads × launches per pad (Isar's share of shared pads). SQL: v_q3_site_load.
        </p>
      </div>

      <div className="card whatif">
        <label>
          <span>
            Launches per pad and year <strong>{padCadence}</strong>
          </span>
          <input type="range" min={8} max={20} step={1} value={padCadence} onChange={(e) => setPadCadence(Number(e.target.value))} />
          <small>Rocket Lab flew 8.5 per pad in 2025 while ramping; Andøya's licence caps the site at 30.</small>
        </label>
        <label>
          <span>
            Anchor launches at Nova Scotia <strong>{nsAnchor} a year</strong>
          </span>
          <input type="range" min={0} max={6} step={1} value={nsAnchor} onChange={(e) => setNsAnchor(Number(e.target.value))} />
          <small>
            {nsAnchor >= NS_BREAK_EVEN
              ? `Covers the 13.4 M EUR fee (break-even about ${fmtOne(NS_BREAK_EVEN)}).`
              : `Below the ${fmtOne(NS_BREAK_EVEN)} launches needed to earn the 13.4 M EUR fee.`}
          </small>
        </label>
        <label>
          <span>
            Growth of paid readiness <strong>{fmtPct(readinessGrowth)} a year</strong>
          </span>
          <input type="range" min={0.1} max={0.25} step={0.01} value={readinessGrowth} onChange={(e) => setReadinessGrowth(Number(e.target.value))} />
          <small>Drives Andøya's load and the case for the second pad.</small>
        </label>
        {changed && (
          <button
            className="text-button"
            onClick={() => {
              setPadCadence(BASE.padCadence);
              setNsAnchor(BASE.nsAnchor);
              if (readinessField) setReadinessGrowth(readinessField.growth);
            }}
          >
            Back to base
          </button>
        )}
      </div>

      <div className="card canada">
        <h4>Canada: build rockets there or ship them?</h4>
        <label>
          <span>
            Rockets a year a Canadian line would build <strong>{canadaVolume}</strong>
          </span>
          <input type="range" min={1} max={12} step={1} value={canadaVolume} onChange={(e) => setCanadaVolume(Number(e.target.value))} />
        </label>
        <p>
          A second line building {canadaVolume} of {fmtOne(launchesOf(factory))} rockets a year costs about{" "}
          <strong>{fmtOne(canadaCost)}× as much per rocket</strong> as one plant building all of them (cost falls to{" "}
          {fmtPct(BASE.learningRate)} with every doubling of annual output, as at Rocket Lab 2023–2025). Shipping stages across the
          Atlantic and integrating them at the pad keeps the scale in Bavaria.
        </p>
        <p className="caption">
          A Canadian plant only makes sense if a Canadian anchor contract demands local value that integration, launch operations and
          Canadian suppliers cannot deliver, and volume exceeds about 10 rockets a year.
        </p>
      </div>

      <div className="card questions">
        <h4>Questions for Isar's management</h4>
        <ol>
          <li>Who is the anchor customer at Nova Scotia, and when does it sign?</li>
          <li>Where should up to 40 launches a year at Nova Scotia come from while US-built satellites cannot launch from Canada?</li>
          <li>Who uses Andøya's second pad, and does Isar get reserved slots for readiness contracts?</li>
          <li>Production or only final integration in Canada, and how much local value does the customer require?</li>
          <li>From which contracted cadence would Isar build a second plant?</li>
        </ol>
      </div>

      <div className="toolbar">
        <div className="overline">The portfolio today and as proposed</div>
      </div>
      <div className="nodes">
        {nodes.map((n) => (
          <NodeCard key={n.id} n={n} />
        ))}
      </div>
    </section>
  );
}
