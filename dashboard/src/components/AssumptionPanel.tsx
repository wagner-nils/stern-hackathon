import { type AssumptionId, type AssumptionValues, assumptions } from "../data/assumptions";
import { fmtInt, fmtPct } from "../lib/format";
import { ConfidenceBadge } from "./ConfidenceBadge";

interface Props {
  values: AssumptionValues;
  onChange: (id: AssumptionId, value: number) => void;
  onReset: () => void;
  isDefault: boolean;
}

export function AssumptionPanel({ values, onChange, onReset, isDefault }: Props) {
  return (
    <div className="card">
      <div className="card__head">
        <h3>Assumptions</h3>
        <button className="link-button" onClick={onReset} disabled={isDefault}>
          Reset to base case
        </button>
      </div>
      {assumptions.map((a) => (
        <label key={a.id} className="slider">
          <span className="slider__top">
            <span>{a.label}</span>
            <strong>{a.unit === "%" ? fmtPct(values[a.id]) : `${fmtInt(values[a.id])} ${a.unit}`}</strong>
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
            <ConfidenceBadge level={a.confidence} /> Owner: {a.owner}
          </span>
        </label>
      ))}
    </div>
  );
}
