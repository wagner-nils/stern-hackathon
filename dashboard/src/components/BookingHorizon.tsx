import { Fragment } from "react";
import { factsFor, launchSites, manifest, preferred } from "../data/warehouse";
import { fmtInt } from "../lib/format";
import { SourceChip } from "./SourceChip";

const YEARS = [2026, 2027, 2028, 2029, 2030];

/** "2027–2028" → [2027, 2028]; "not public" → null. */
function span(planned: string): [number, number] | null {
  const m = planned.match(/(\d{4})(?:\D+(\d{4}))?/);
  if (!m) return null;
  const from = Number(m[1]);
  return [from, Number(m[2] ?? from)];
}

/**
 * How long Spectrum is booked: contracted missions on a year axis, Isar's planned cadence per year,
 * and how much of Andøya's site licence (shared with future operators) that cadence uses.
 */
export function BookingHorizon() {
  const cap = preferred("site_launch_cap", { year: 2024, scope: "site", entity: "Andøya" });
  const andoya = launchSites.find((s) => s.id === "andoya")!;
  const planned = new Map(
    YEARS.flatMap((y) => factsFor("launches_planned", { year: y, scope: "company", entity: "Isar Aerospace" }).slice(0, 1).map((f) => [y, f] as const)),
  );
  const dated = manifest
    .map((m) => ({ ...m, span: span(m.planned) }))
    .filter((m): m is typeof m & { span: [number, number] } => m.span !== null)
    .sort((a, b) => a.span[0] - b.span[0] || a.span[1] - b.span[1]);
  const undated = manifest.filter((m) => !span(m.planned));
  const col = (year: number) => Math.min(Math.max(year, YEARS[0]), YEARS[YEARS.length - 1]) - YEARS[0] + 2;

  return (
    <div className="horizon">
      <div className="horizon__scroll">
        <div className="horizon__grid">
          <span className="horizon__corner">Contracted missions</span>
          {YEARS.map((y) => (
            <span key={y} className="horizon__year">
              {y}
            </span>
          ))}

          <span className="horizon__label">
            Isar's planned launches
            <small>share of Andøya's {fmtInt(cap.value)} site slots</small>
          </span>
          {YEARS.map((y) => {
            const f = planned.get(y);
            return (
              <span key={y} className="horizon__slots" title={f?.note ?? "No public plan for this year"}>
                {f ? (
                  <>
                    <strong>{fmtInt(f.value)}</strong> / {fmtInt(cap.value)}
                    <span className="horizon__meter">
                      <span style={{ width: `${(f.value / cap.value) * 100}%` }} />
                    </span>
                    <SourceChip id={f.source_id} />
                  </>
                ) : (
                  <span className="horizon__none">no public plan</span>
                )}
              </span>
            );
          })}

          {/* Explicit rows: auto-placement would pull the next label into the free cells after a bar. */}
          {dated.map((m, k) => (
            <Fragment key={m.id}>
              <span className="horizon__label horizon__label--mission" style={{ gridRow: k + 3, gridColumn: 1 }}>
                {m.customer}
                <small>{m.mission}</small>
              </span>
              <span
                className="horizon__bar"
                style={{ gridRow: k + 3, gridColumn: `${col(m.span[0])} / ${col(m.span[1]) + 1}` }}
                title={m.note ?? m.planned}
              >
                {m.planned}
                {m.site !== "Andøya" && ` · ${m.site}`}
              </span>
            </Fragment>
          ))}
        </div>
      </div>

      <div className="horizon__undated">
        <span>Booked, date not public:</span>
        {undated.map((m) => (
          <span key={m.id} className="horizon__tag" title={m.note ?? ""}>
            {m.customer} · {m.mission}
          </span>
        ))}
      </div>
      <p className="caption">
        {andoya.note} <SourceChip id={cap.source_id} />
      </p>
    </div>
  );
}
