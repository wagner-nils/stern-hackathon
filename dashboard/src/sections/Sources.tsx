import { ConfidenceBadge } from "../components/ConfidenceBadge";
import { assumptions } from "../data/assumptions";
import { latestDemand } from "../data/demand";
import { cadencePlan, market, premiumPlan, successPlan } from "../data/market";
import { sites } from "../data/sites";
import { sources } from "../data/sources";
import type { Confidence, Figure } from "../data/types";
import { spectrum } from "../data/vehicles";
import { fmtInt, fmtPct, fmtTonnes } from "../lib/format";
import { demandByGroup } from "../model/funnel";

interface Row {
  item: string;
  value: string;
  confidence: Confidence;
  sourceId: string;
}

const usd = (v: number) => (v >= 1e9 ? `$${(v / 1e9).toFixed(1)} bn` : `$${fmtInt(v)}`);

const rows: Row[] = [
  ...sites.map((s) => ({
    item: `${s.name}: latitude and launch corridor`,
    value: `${s.lat}° N, headings ${s.azimuths.map((a) => `${a.from}°–${a.to}°`).join(", ")}`,
    confidence: s.confidence,
    sourceId: s.sourceId,
  })),
  {
    item: `${spectrum.name}: payload`,
    value: Object.entries(spectrum.payloadKg)
      .map(([orbit, kg]) => `${orbit} ${fmtInt(kg)} kg`)
      .join(", "),
    confidence: spectrum.confidence,
    sourceId: spectrum.sourceId,
  },
  {
    item: "Isar launch plan",
    value: Object.entries(cadencePlan)
      .map(([year, n]) => `${year}: ${n}`)
      .join(", "),
    confidence: "medium",
    sourceId: "isarFlightPlan",
  },
  {
    item: "Launch success rate by year",
    value: Object.entries(successPlan)
      .map(([year, r]) => `${year}: ${fmtPct(r)}`)
      .join(", "),
    confidence: "medium",
    sourceId: "expertSchingler",
  },
  {
    item: "Share paying for a dedicated launch, by year",
    value: Object.entries(premiumPlan)
      .map(([year, r]) => `${year}: ${fmtPct(r)}`)
      .join(", "),
    confidence: "medium",
    sourceId: "brycetech2026",
  },
  ...(Object.values(market) as Figure[]).map((f) => ({
    item: f.note ? `${f.label} (${f.note})` : f.label,
    value: f.label.startsWith("EUR") ? f.value.toFixed(3) : usd(f.value),
    confidence: f.confidence,
    sourceId: f.sourceId,
  })),
  ...assumptions.map((a) => ({
    item: a.label,
    value: a.unit === "%" ? fmtPct(a.value) : a.unit === "€ M" ? `€${a.value} M` : `${a.value}`,
    confidence: a.confidence,
    sourceId: a.sourceId,
  })),
  ...demandByGroup(latestDemand.segments).map((g) => ({
    item: `Demand ${latestDemand.year}: ${g.group}`,
    value: `${fmtInt(g.sats)} satellites, ${fmtTonnes(g.massKg)}`,
    confidence: latestDemand.confidence,
    sourceId: latestDemand.sourceId,
  })),
];

export function Sources() {
  return (
    <section className="chapter">
      <header className="chapter__head">
        <div className="overline overline--primary">Transparency</div>
        <h2>Assumptions and sources</h2>
      </header>
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Input</th>
              <th>Base case</th>
              <th>Confidence</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const source = sources[r.sourceId];
              return (
                <tr key={r.item}>
                  <td>{r.item}</td>
                  <td>{r.value}</td>
                  <td>
                    <ConfidenceBadge level={r.confidence} />
                  </td>
                  <td>
                    {source?.url ? (
                      <a href={source.url} target="_blank" rel="noreferrer">
                        {source.title}
                      </a>
                    ) : (
                      (source?.title ?? r.sourceId)
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
