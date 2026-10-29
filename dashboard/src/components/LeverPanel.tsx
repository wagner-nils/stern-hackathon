import { type Tier, assumption } from "../data/warehouse";
import { fmtUnit } from "../lib/format";
import { FIXED_IDS, LEVERS, spectrum } from "../state/levers";
import type { LeverState } from "../state/useLevers";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { SourceChips } from "./SourceChip";

const groupTitle: Record<Tier, string> = {
  TAM: "TAM · what counts as demand",
  SAM: "SAM · what narrows it",
  SOM: "SOM · what Isar wins",
};

/** All judgement calls of Q1: at most three levers per tier, then the fixed parameters with their reasons. */
export function LeverPanel({ state, selected, notes = {} }: { state: LeverState; selected: Tier; notes?: Partial<Record<Tier, string>> }) {
  return (
    <div className="panel">
      <div className="panel__head">
        <h3>Assumptions</h3>
        <button className="text-button" onClick={state.reset} disabled={state.isBase}>
          Reset
        </button>
      </div>

      {(["TAM", "SAM", "SOM"] as Tier[]).map((tier) => (
        <section key={tier} className={`lever-group${selected === tier ? " is-active" : ""}`}>
          <div className="overline">{groupTitle[tier]}</div>
          {LEVERS.filter((l) => l.tier === tier).map((l) => {
            const a = assumption(l.assumptionId);
            const value = state.levers[l.key];
            const changed = value !== a.value;
            return (
              <div key={l.key} className={`lever${changed ? " is-changed" : ""}`}>
                <div className="lever__top">
                  <span>{a.name}</span>
                  <strong>
                    {changed && <span className="lever__base">base {l.format(a.value)} →</span>}
                    {l.format(value)}
                  </strong>
                </div>
                {l.options ? (
                  <div className="seg" role="group" aria-label={a.name}>
                    {l.options.map((o) => (
                      <button key={o.value} className={value === o.value ? "is-active" : ""} onClick={() => state.set(l.key, o.value)}>
                        {o.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <>
                    {/* The datalist draws a tick at the warehouse base value. */}
                    <input
                      type="range"
                      aria-label={a.name}
                      min={a.low ?? 0}
                      max={a.high ?? 1}
                      step={l.step}
                      value={value}
                      list={`base-${l.key}`}
                      onChange={(e) => state.set(l.key, Number(e.target.value))}
                    />
                    <datalist id={`base-${l.key}`}>
                      <option value={a.value} />
                    </datalist>
                    <div className="lever__range">
                      <span>{l.format(a.low ?? 0)}</span>
                      <span>{l.format(a.high ?? 1)}</span>
                    </div>
                  </>
                )}
                <div className="lever__meta">
                  <ConfidenceBadge level={a.confidence} />
                  <span>{a.owner}</span>
                  <SourceChips ids={a.source_ids} />
                </div>
                <details className="lever__why">
                  <summary>Why {l.format(a.value)}?</summary>
                  <p>{a.rationale}</p>
                </details>
              </div>
            );
          })}
          {notes[tier] && <p className="lever-group__note">{notes[tier]}</p>}
        </section>
      ))}

      <section className="lever-group lever-group--fixed">
        <div className="overline">Fixed parameters · no slider</div>
        <ul className="fixed">
          <li title="Isar's published figures; no reference altitude is given for the SSO figure.">
            <span>Spectrum payload (vehicle fact)</span>
            <strong>
              {fmtUnit(spectrum.payload_sso_kg, "kg")} SSO · {fmtUnit(spectrum.payload_leo_kg, "kg")} LEO
            </strong>
            <SourceChips ids={[spectrum.source_id]} />
          </li>
          {FIXED_IDS.map((id) => {
            const a = assumption(id);
            return (
              <li key={id} title={a.rationale}>
                <span>{a.name}</span>
                <strong>{fmtUnit(a.value, a.unit)}</strong>
                <SourceChips ids={a.source_ids} />
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
