import { Fragment } from "react";
import { fmtEurRange, fmtInt, fmtPct, fmtTonnes, share } from "../lib/format";
import type { MarketResult, Tier, TierId } from "../model/funnel";

export type Metric = "sats" | "massKg" | "revenue";

const copy: Record<TierId, { title: string; scope: string }> = {
  TAM: { title: "Global launch demand", scope: "Every satellite launched worldwide" },
  SAM: { title: "Serviceable from Andøya", scope: "Open to a European launcher, fits on Spectrum, orbit reachable" },
  SOM: { title: "Obtainable by Isar", scope: "Pays for a dedicated launch, within Isar's launch capacity" },
};

function headline(t: Tier, metric: Metric) {
  if (metric === "sats") return { value: fmtInt(t.sats), unit: "satellites / yr" };
  if (metric === "massKg") return { value: fmtTonnes(t.massKg), unit: "payload / yr" };
  return { value: fmtEurRange(t.revenueEur), unit: "launch revenue / yr" };
}

/** The two metrics not shown as the headline, so every tile carries all three. */
function otherMetrics(t: Tier, metric: Metric) {
  return [
    metric !== "sats" && `${fmtInt(t.sats)} satellites`,
    metric !== "massKg" && fmtTonnes(t.massKg),
    metric !== "revenue" && fmtEurRange(t.revenueEur),
  ]
    .filter(Boolean)
    .join(" · ");
}

function shareOf(t: Tier, of: Tier, metric: Metric) {
  if (metric === "revenue") {
    const lo = share(t.revenueEur[0], of.revenueEur[1]);
    const hi = share(t.revenueEur[1], of.revenueEur[0]);
    return Math.abs(hi - lo) < 1e-4 ? fmtPct(lo) : `${fmtPct(lo)}–${fmtPct(hi)}`;
  }
  return fmtPct(share(t[metric], of[metric]));
}

export function TamSamSom({ result, metric }: { result: MarketResult; metric: Metric }) {
  const { TAM, SAM, SOM } = result.tiers;
  const tiers = [TAM, SAM, SOM];

  return (
    <div className="tiers">
      {tiers.map((t, k) => {
        const { value, unit } = headline(t, metric);
        return (
          <Fragment key={t.id}>
            {k > 0 && (
              <span className="tiers__operator" aria-hidden>
                ›
              </span>
            )}
            <article className={`tier tier--${t.id.toLowerCase()}`}>
              <div className="tier__overline">{t.id}</div>
              <h3 className="tier__title">{copy[t.id].title}</h3>
              <div className="tier__figure">{value}</div>
              <div className="tier__unit">{unit}</div>
              <div className="tier__shares">
                {t.id !== "TAM" && <span>{shareOf(t, TAM, metric)} of TAM</span>}
                {t.id === "SOM" && <span>{shareOf(t, SAM, metric)} of SAM</span>}
              </div>
              <p className="tier__scope">{copy[t.id].scope}</p>
              <div className="tier__meta">
                <div>{otherMetrics(t, metric)}</div>
                {t.id === "SAM" && <div>≈ {fmtInt(t.launches)} Spectrum loads</div>}
                {t.id === "SOM" && <div>{fmtInt(t.launches)} Spectrum launches</div>}
              </div>
            </article>
          </Fragment>
        );
      })}
    </div>
  );
}
