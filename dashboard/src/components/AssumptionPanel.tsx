import { type AssumptionId, type AssumptionValues, assumptions } from "../data/assumptions";
import type { Assumption } from "../data/types";
import { fmtInt, fmtPct } from "../lib/format";
import { ConfidenceBadge } from "./ConfidenceBadge";

interface Props {
  values: AssumptionValues;
  onChange: (id: AssumptionId, value: number) => void;
  onReset: () => void;
  isDefault: boolean;
}

function show(a: Assumption, value: number) {
  if (a.unit === "%") return fmtPct(value);
  if (a.unit === "year") return String(value);
  if (a.unit === "€ M") return `€${value} M`;
  return `${fmtInt(value)} / yr`;
}

const groups = [
  { id: "isar", title: "Isar" },
  { id: "market", title: "Market" },
] as const;

export function AssumptionPanel({ values, onChange, onReset, isDefault }: Props) {
  return (
    <div className="panel">
      <div className="panel__head">
        <h3>Assumptions</h3>
        <button className="text-button" onClick={onReset} disabled={isDefault}>
          Reset
        </button>
      </div>
      {groups.map((g) => (
        <div key={g.id} className="panel__group">
          <div className="overline">{g.title}</div>
          {assumptions
            .filter((a) => a.group === g.id)
            .map((a) => (
              <label key={a.id} className="slider" title={a.note}>
                <span className="slider__top">
                  <span>{a.label}</span>
                  <strong>{show(a, values[a.id])}</strong>
                </span>
                <input
                  type="range"
                  min={a.min}
                  max={a.max}
                  step={a.step}
                  value={values[a.id]}
                  onChange={(e) => onChange(a.id, Number(e.target.value))}
                />
                <span className="slider__meta">
                  <ConfidenceBadge level={a.confidence} />
                  <span>{a.owner}</span>
                </span>
              </label>
            ))}
        </div>
      ))}
    </div>
  );
}
