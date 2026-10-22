import { Fragment } from "react";
import type { Tier } from "../data/warehouse";
import { fmtEur, fmtInt, fmtPct, fmtTonnes, share } from "../lib/format";
import type { Q1Result, TierFlow } from "../model/q1";
import { Tween } from "./Tween";

export type Metric = "sats" | "massKg" | "revenue";

const copy = (from: string): Record<Tier, { title: string; scope: string }> => ({
  TAM: { title: "Global launch demand", scope: "Every satellite that reached orbit" },
  SAM: { title: `Serviceable from ${from}`, scope: "Open to Isar, fits on Spectrum, orbit reachable" },
  SOM: { title: "Obtainable by Isar", scope: "Buys a dedicated launch, chooses Isar, within its capacity" },
});

const units: Record<Metric, string> = { sats: "satellites / yr", massKg: "payload / yr", revenue: "launch revenue / yr" };

function Headline({ t, metric }: { t: TierFlow; metric: Metric }) {
  if (metric === "sats") return <Tween value={t.sats} format={fmtInt} />;
  if (metric === "massKg") return <Tween value={t.massKg} format={fmtTonnes} />;
  const [low, high] = t.revenueEur;
  if (Math.abs(high - low) < 1) return <Tween value={low} format={fmtEur} />;
  return (
    <>
      <Tween value={low} format={fmtEur} />–<Tween value={high} format={(v) => fmtEur(v).replace("€", "")} />
    </>
  );
}

function shareOfTam(t: TierFlow, tam: TierFlow, metric: Metric) {
  if (metric === "revenue") {
    const lo = share(t.revenueEur[0], tam.revenueEur[0]);
    const hi = share(t.revenueEur[1], tam.revenueEur[0]);
    return Math.abs(hi - lo) < 1e-4 ? fmtPct(lo) : `${fmtPct(lo)}–${fmtPct(hi)}`;
  }
  return fmtPct(share(t[metric], tam[metric]));
}

interface Props {
  result: Q1Result;
  metric: Metric;
  selected: Tier;
  onSelect: (t: Tier) => void;
  /** The launch sites in scope, e.g. "Andøya and Nova Scotia". */
  from: string;
}

/** TAM, SAM and SOM side by side; a click opens that tier's drill-down. */
export function TierCards({ result, metric, selected, onSelect, from }: Props) {
  const tiers: Tier[] = ["TAM", "SAM", "SOM"];
  const text = copy(from);
  return (
    <div className="tiers" role="tablist" aria-label="Market tiers">
      {tiers.map((id, k) => {
        const t = result.tiers[id];
        return (
          <Fragment key={id}>
            {k > 0 && (
              <span className="tiers__operator" aria-hidden>
                →
              </span>
            )}
            <button
              role="tab"
              aria-selected={selected === id}
              className={`tier tier--${id.toLowerCase()}${selected === id ? " is-selected" : ""}`}
              onClick={() => onSelect(id)}
            >
              <span className="tier__overline">{id}</span>
              <span className="tier__title">{text[id].title}</span>
              <span className="tier__figure">
                <Headline t={t} metric={metric} />
              </span>
              <span className="tier__unit">{units[metric]}</span>
              <span className="tier__share">{id === "TAM" ? "100%" : `${shareOfTam(t, result.tiers.TAM, metric)} of TAM`}</span>
              <span className="tier__scope">{text[id].scope}</span>
              <span className="tier__open">{selected === id ? "Shown below" : "Open details"}</span>
            </button>
          </Fragment>
        );
      })}
    </div>
  );
}
