import { useState } from "react";
import { AssumptionPanel } from "../components/AssumptionPanel";
import { FunnelChart } from "../components/FunnelChart";
import { GroupChart } from "../components/GroupChart";
import { InclinationChart } from "../components/InclinationChart";
import { OrbitHero } from "../components/OrbitHero";
import { type Metric, TamSamSom } from "../components/TamSamSom";
import { type DemandYear, demandByYear } from "../data/demand";
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
const baseYears = Object.keys(demandByYear).map(Number) as DemandYear[];

export function Q1Reach({ scenario }: { scenario: Scenario }) {
  const [metric, setMetric] = useState<Metric>("sats");
  const [baseYear, setBaseYear] = useState<DemandYear>(2025);
  const dataset = demandByYear[baseYear];
  const demand = dataset.segments;
  const result = computeMarket(demand, andoya, spectrum, scenario.values, { baseYear: dataset.year, ...market });
  const { TAM, SAM, SOM } = result.tiers;
  const year = scenario.values.planningYear;
  const dedicated = result.steps.find((s) => s.id === "premium")!;

  return (
    <section className="chapter">
      <div className="hero">
        <header className="chapter__head">
          <div className="overline">Question 1 · Starting position</div>
          <h2>What share of global launch demand can Isar serve from Andøya?</h2>
        </header>
        <div className="card orbit-card">
          <div className="overline">Orbits customers buy</div>
          <OrbitHero reach={reach} siteLabel={`Andøya ${andoya[0].lat}° N · reaches ${reach.map(([lo, hi]) => `${lo.toFixed(0)}–${hi.toFixed(0)}°`).join(", ")}`} />
        </div>
      </div>

      <p className="answer">
        From Andøya, Isar can serve <strong>{fmtPct(share(SAM.sats, TAM.sats))}</strong> of global satellite demand, but
        only <strong>{fmtPct(share(SAM.massKg, TAM.massKg))}</strong> of its mass. In {year}, {fmtInt(SOM.launches)}{" "}
        launches capture {fmtPct(share(SOM.sats, SAM.sats))} of that serviceable market:{" "}
        {result.bottleneck === "capacity" ? "capacity, not demand, is the constraint." : "demand, not capacity, is the constraint."}
      </p>

      <div className="q1-layout">
        <div className="q1-main">
          <div className="toolbar">
            <div className="toolbar__group">
              <span className="overline">Flown demand</span>
              <div className="toggle" role="group" aria-label="Demand base year">
                {baseYears.map((y) => (
                  <button key={y} className={baseYear === y ? "is-active" : ""} onClick={() => setBaseYear(y)}>
                    {y}
                  </button>
                ))}
              </div>
              <span className="overline">grown to {year}</span>
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
            <p className="caption">
              Bottom-up from every payload launched in {dataset.year} (McDowell GCAT, {fmtInt(demand.reduce((n, s) => n + s.satsPerYear, 0))}{" "}
              satellites), grown at {fmtPct(scenario.values.marketGrowth)} p.a. Captive: Starlink, China, Russia, Kuiper and
              OneWeb.
            </p>
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
            Satellites launched in {dataset.year} by inclination; blue is reachable. Licensed headings 280–360° over the
            Norwegian Sea give {reach.map(([lo, hi]) => `${lo.toFixed(0)}–${hi.toFixed(0)}°`).join(", ")}.
          </p>
        </div>
        <div className="card">
          <div className="card__head">
            <h3>Most of the market is captive</h3>
          </div>
          <GroupChart demand={demand} />
          <p className="caption">
            Satellites launched in {dataset.year} by customer group; grey groups fly on their own or pre-contracted rockets.
          </p>
        </div>
      </div>

      <div className="insights">
        <article className="insight">
          <div className="insight__number">01</div>
          <h3>Orbit is the hard limit</h3>
          <p>
            The ISS orbit, the 53° constellation shells, 37–45° radar orbits and GTO are out of reach. What is left is
            light: many small Earth-observation satellites, little mass.
          </p>
        </article>
        <article className="insight">
          <div className="insight__number">02</div>
          <h3>Rideshare sets the price</h3>
          <p>
            Most SSO satellites ride SpaceX Transporter at $7.5k/kg. {fmtPct(scenario.values.premiumShare)} pay for a
            dedicated launch: {fmtInt(dedicated.sats)} satellites a year. SpaceX reportedly takes no new rideshare bookings
            beyond 2028.
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
