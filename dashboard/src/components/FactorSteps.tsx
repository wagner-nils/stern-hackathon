import { fmtInt, fmtPct, fmtTonnes, share } from "../lib/format";
import type { Flow } from "../model/q1";
import { SourceChips } from "./SourceChip";

export interface FactorRow {
  id: string;
  factor: string;
  rule: string;
  from: Flow;
  to: Flow;
  sources: string[];
}

function Cut({ kept, label }: { kept: number; label: string }) {
  return (
    <div className="cut" title={`${fmtPct(kept)} kept`}>
      <div className="cut__track">
        <div className="cut__keep" style={{ width: `${Math.max(0.5, kept * 100)}%` }} />
      </div>
      <span className="cut__label">
        {label} <em>{kept >= 0.9995 ? "not binding" : `−${fmtPct(1 - kept)}`}</em>
      </span>
    </div>
  );
}

/** The narrowing factors of one tier as a staircase: what each filter keeps, in satellites and in mass. */
export function FactorSteps({ start, rows }: { start: { label: string; flow: Flow }; rows: FactorRow[] }) {
  return (
    <ol className="steps">
      <li className="steps__start">
        <span className="steps__num">○</span>
        <div className="steps__body">
          <strong>{start.label}</strong>
        </div>
        <div className="steps__values">
          {fmtInt(start.flow.sats)} sats · {fmtTonnes(start.flow.massKg)}
        </div>
      </li>
      {rows.map((r, k) => (
        <li key={r.id}>
          <span className="steps__num">{k + 1}</span>
          <div className="steps__body">
            <strong>{r.factor}</strong>
            <span className="steps__rule">{r.rule}</span>
            <SourceChips ids={r.sources} />
          </div>
          <div className="steps__values">
            <Cut kept={share(r.to.sats, r.from.sats)} label={`${fmtInt(r.to.sats)} sats`} />
            <Cut kept={share(r.to.massKg, r.from.massKg)} label={fmtTonnes(r.to.massKg)} />
          </div>
        </li>
      ))}
    </ol>
  );
}
