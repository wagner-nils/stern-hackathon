import { ConfidenceBadge } from "../components/ConfidenceBadge";
import { assumptions } from "../data/assumptions";
import { demand } from "../data/demand";
import { sites } from "../data/sites";
import { sources } from "../data/sources";
import type { Confidence } from "../data/types";
import { spectrum } from "../data/vehicles";
import { fmtInt, fmtPct } from "../lib/format";

interface Row {
  item: string;
  value: string;
  confidence: Confidence;
  sourceId: string;
}

const rows: Row[] = [
  ...sites.map((s) => ({
    item: `${s.name}: latitude and launch corridor`,
    value: `${s.lat}° N, azimuth ${s.azimuths.map((a) => `${a.from}°–${a.to}°`).join(", ")}`,
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
  ...assumptions.map((a) => ({
    item: a.label,
    value: a.unit === "%" ? fmtPct(a.value) : `${a.value} ${a.unit}`,
    confidence: a.confidence,
    sourceId: a.sourceId,
  })),
  ...demand.map((d) => ({
    item: `Demand: ${d.label}`,
    value: `${fmtInt(d.satsPerYear)} sats/yr, ${fmtInt(d.avgMassKg)} kg, ${d.inclination[0]}–${d.inclination[1]}°`,
    confidence: d.confidence,
    sourceId: d.sourceId,
  })),
];

export function Sources() {
  return (
    <section className="chapter">
      <p className="eyebrow">Transparency</p>
      <h2>Assumptions and sources</h2>
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
                      source?.title ?? r.sourceId
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
