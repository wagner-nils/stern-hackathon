import { useState } from "react";
import { AssumptionPanel } from "../components/AssumptionPanel";
import { FunnelChart } from "../components/FunnelChart";
import { GroupChart } from "../components/GroupChart";
import { InclinationChart } from "../components/InclinationChart";
import { type Metric, TamSamSom } from "../components/TamSamSom";
import { demand2025 } from "../data/demand";
import { market } from "../data/market";
import { sites } from "../data/sites";
import { spectrum } from "../data/vehicles";
import { fmtInt, fmtPct, share } from "../lib/format";
import { computeMarket } from "../model/funnel";
import { reachableInclinations } from "../model/orbits";
import type { Scenario } from "../state/useScenario";

const andoya = sites.filter((s) => s.id === "andoya");
const reach = andoya.flatMap(reachableInclinations);
const metrics: { id: Metric; label: string }[] = [
  { id: "sats", label: "Satellites" },
  { id: "massKg", label: "Mass" },
  { id: "revenue", label: "Revenue" },
];

export function Q1Reach({ scenario }: { scenario: Scenario }) {
  const [metric, setMetric] = useState<Metric>("sats");
  const demand = demand2025.segments;
  const result = computeMarket(demand, andoya, spectrum, scenario.values, { baseYear: demand2025.year, ...market });
  const { TAM, SAM, SOM } = result.tiers;
  const year = scenario.values.planningYear;
  const dedicated = result.steps.find((s) => s.id === "premium")!;

  return (
    <section className="chapter">
      <header className="chapter__head">
        <div className="overline overline--primary">Question 1 · Starting position</div>
        <h2>What share of global launch demand can Isar serve from Andøya?</h2>
      </header>

      <p className="answer">
        From Andøya, Isar can serve <strong>{fmtPct(share(SAM.sats, TAM.sats))}</strong> of global satellite demand (
        {fmtPct(share(SAM.massKg, TAM.massKg))} by mass). In {year}, {fmtInt(SOM.launches)} launches capture{" "}
        <strong>{fmtPct(share(SOM.sats, SAM.sats))}</strong> of that serviceable market:{" "}
        {result.bottleneck === "capacity" ? "capacity, not demand, is the constraint." : "demand, not capacity, is the constraint."}
      </p>

      {demand2025.confidence === "placeholder" && (
        <div className="notice">Demand shows the team draft until the GCAT satellite data is loaded.</div>
      )}

      <div className="q1-layout">
        <div className="q1-main">
          <div className="toolbar">
            <div className="overline">
              Market sizing {year} · demand base {demand2025.year}
            </div>
            <div className="toggle" role="group" aria-label="Metric">
              {metrics.map((m) => (
                <button key={m.id} className={metric === m.id ? "is-active" : ""} onClick={() => setMetric(m.id)}>
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <TamSamSom result={result} metric={metric} />

          <div className="card">
            <div className="card__head">
              <h3>From TAM to SOM, filter by filter</h3>
            </div>
            <FunnelChart steps={result.steps} metric={metric === "massKg" ? "massKg" : "sats"} />
          </div>
        </div>

        <aside className="q1-side">
          <AssumptionPanel
            values={scenario.values}
            onChange={scenario.set}
            onReset={scenario.reset}
            isDefault={scenario.isDefault}
          />
        </aside>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card__head">
            <h3>Andøya reaches polar and SSO orbits only</h3>
          </div>
          <InclinationChart demand={demand} reach={reach} />
          <p className="caption">
            Satellites per year by inclination; red is reachable. Licensed headings 280–360° over the Norwegian Sea give{" "}
            {reach.map(([lo, hi]) => `${lo.toFixed(0)}–${hi.toFixed(0)}°`).join(", ")}.
          </p>
        </div>
        <div className="card">
          <div className="card__head">
            <h3>Most of the market is captive</h3>
          </div>
          <GroupChart demand={demand} />
          <p className="caption">Satellites per year by customer group; grey groups fly on their own or contracted rockets.</p>
        </div>
      </div>

      <div className="insights">
        <article className="insight">
          <div className="insight__number">01</div>
          <h3>Orbit is the hard limit</h3>
          <p>The ISS orbit, the 53° constellation shells, 37–45° radar orbits and GTO are out of reach from Andøya.</p>
        </article>
        <article className="insight">
          <div className="insight__number">02</div>
          <h3>Rideshare sets the price</h3>
          <p>
            Most SSO satellites ride SpaceX Transporter at about $7k/kg. Only {fmtPct(scenario.values.premiumShare)} are
            assumed to pay for a dedicated launch: {fmtInt(dedicated.sats)} satellites a year.
          </p>
        </article>
        <article className="insight">
          <div className="insight__number">03</div>
          <h3>{result.bottleneck === "capacity" ? "Capacity binds first" : "Demand binds first"}</h3>
          <p>
            {fmtInt(SOM.launches)} launches in {year} fly {fmtPct(share(SOM.sats, dedicated.sats))} of the dedicated demand
            Isar can reach. Growth needs cadence and new orbits: the case for a second site.
          </p>
        </article>
      </div>
    </section>
  );
}
