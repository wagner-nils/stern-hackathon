import { useState } from "react";
import { AssumptionPanel } from "../components/AssumptionPanel";
import { FunnelChart, type Metric } from "../components/FunnelChart";
import { InclinationChart } from "../components/InclinationChart";
import { KpiTile } from "../components/KpiTile";
import { demand } from "../data/demand";
import { sites } from "../data/sites";
import { spectrum } from "../data/vehicles";
import { fmtInt, fmtPct, fmtTonnes, share } from "../lib/format";
import { computeFunnel } from "../model/funnel";
import { reachableInclinations } from "../model/orbits";
import type { useScenario } from "../state/useScenario";

const andoya = sites.filter((s) => s.id === "andoya");

export function Q1Reach({ scenario }: { scenario: ReturnType<typeof useScenario> }) {
  const [metric, setMetric] = useState<Metric>("sats");
  const { stages, bottleneck, capacityKg } = computeFunnel(demand, andoya, spectrum, scenario.values);
  const reach = andoya.flatMap(reachableInclinations);
  const at = (id: string) => stages.find((s) => s.id === id)!;
  const total = at("global");
  const pct = (id: string) => share(at(id)[metric], total[metric]);
  const usesPlaceholders = demand.some((d) => d.confidence === "placeholder");

  return (
    <section className="chapter">
      <p className="eyebrow">Question 1 · Starting position</p>
      <h2>What share of global launch demand can Isar serve from Andøya?</h2>

      <div className="answer">
        <span className="answer__tag">Answer (draft)</span>
        From Andøya, Spectrum reaches <strong>{fmtPct(pct("reachable"))}</strong> of global satellite demand by orbit.
        Isar can fly <strong>{fmtPct(pct("served"))}</strong>; the binding constraint today is{" "}
        <strong>{bottleneck === "capacity" ? "Isar's launch capacity" : "addressable demand"}</strong>.
      </div>

      {usesPlaceholders && (
        <div className="notice">Demand figures are placeholders until the market research is in.</div>
      )}

      <div className="kpis">
        <KpiTile
          label="Global demand"
          value={metric === "sats" ? `${fmtInt(total.sats)} sats/yr` : `${fmtTonnes(total.massKg)}/yr`}
        />
        <KpiTile label="Orbit reachable from Andøya" value={fmtPct(pct("reachable"))} />
        <KpiTile label="Addressable for Spectrum" value={fmtPct(pct("dedicated"))} sub="reachable, fits, open, dedicated" />
        <KpiTile
          label="Isar can serve"
          value={fmtPct(pct("served"))}
          sub={`Capacity ${fmtTonnes(capacityKg)}/yr`}
          emphasis
        />
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card__head">
            <h3>From global demand to what Isar can fly</h3>
            <div className="toggle" role="group" aria-label="Metric">
              <button className={metric === "sats" ? "is-active" : ""} onClick={() => setMetric("sats")}>
                Satellites
              </button>
              <button className={metric === "massKg" ? "is-active" : ""} onClick={() => setMetric("massKg")}>
                Mass
              </button>
            </div>
          </div>
          <FunnelChart stages={stages} metric={metric} />
        </div>

        <div className="card">
          <div className="card__head">
            <h3>Demand by inclination: what Andøya reaches</h3>
          </div>
          <InclinationChart demand={demand} reach={reach} />
          <p className="caption">
            Andøya ({andoya[0].lat}° N) launches north over the sea and reaches{" "}
            {reach.map(([lo, hi]) => `${lo.toFixed(0)}–${hi.toFixed(0)}°`).join(", ")} inclination: polar and
            sun-synchronous orbits.
          </p>
        </div>
      </div>

      <AssumptionPanel
        values={scenario.values}
        onChange={scenario.set}
        onReset={scenario.reset}
        isDefault={scenario.isDefault}
      />
    </section>
  );
}
