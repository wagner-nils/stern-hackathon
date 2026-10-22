import { fmtOne } from "../lib/format";
import type { Q1Result, TierFlow } from "../model/q1";
import type { Metric } from "./TierCards";

const CELLS = 1000;
const ROWS = 20;
const SIZE = 8;
const GAP = 2;

const unitOf: Record<Metric, (year: number) => string> = {
  sats: (y) => `satellites launched in ${y}`,
  massKg: (y) => `tonnes of payload launched in ${y}`,
  revenue: (y) => `euros of launch revenue in ${y}`,
};

/** Rounded to whole cells, but a tier that exists never disappears. */
const cells = (perMille: number) => (perMille > 0 ? Math.max(1, Math.round(perMille)) : 0);

/** Out of every 1,000 units of global demand: what Isar can serve (SAM) and what it wins (SOM). */
export function Waffle({ result, metric, year }: { result: Q1Result; metric: Metric; year: number }) {
  const { TAM, SAM, SOM } = result.tiers;
  const value = (t: TierFlow, k: 0 | 1 = 0) => (metric === "revenue" ? t.revenueEur[k] : t[metric]);
  const perMille = (t: TierFlow, k: 0 | 1 = 0) => (value(t, k) / value(TAM)) * CELLS;

  const som = perMille(SOM);
  const sam = perMille(SAM);
  const samHigh = perMille(SAM, 1);
  const nSom = cells(som);
  const nSam = Math.max(nSom, cells(sam));
  const cols = CELLS / ROWS;
  const samLabel = metric === "revenue" && samHigh - sam > 0.5 ? `${fmtOne(sam)}–${fmtOne(samHigh)}` : fmtOne(sam);

  return (
    <figure className="waffle">
      <figcaption className="overline">Out of every 1,000 {unitOf[metric](year)}</figcaption>
      <svg viewBox={`0 0 ${cols * (SIZE + GAP) - GAP} ${ROWS * (SIZE + GAP) - GAP}`} role="img" aria-label={`${samLabel} serviceable, ${fmtOne(som)} won`}>
        {Array.from({ length: CELLS }, (_, i) => {
          // Column by column, so SOM and SAM form one block on the left.
          const x = Math.floor(i / ROWS) * (SIZE + GAP);
          const y = (i % ROWS) * (SIZE + GAP);
          const tone = i < nSom ? "som" : i < nSam ? "sam" : "rest";
          return <rect key={i} x={x} y={y} width={SIZE} height={SIZE} rx={1.5} className={`waffle__cell waffle__cell--${tone}`} />;
        })}
      </svg>
      <div className="waffle__legend">
        <span className="waffle__key waffle__key--sam">
          <strong>{samLabel}</strong> Isar can serve <em>SAM</em>
        </span>
        <span className="waffle__key waffle__key--som">
          <strong>{fmtOne(som)}</strong> Isar wins <em>SOM</em>
        </span>
      </div>
      {metric === "revenue" && <p className="caption">SAM revenue as a range: priced at rideshare to dedicated cost per kg.</p>}
    </figure>
  );
}
