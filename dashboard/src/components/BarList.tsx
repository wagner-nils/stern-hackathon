import { fmtInt, fmtPct, fmtTonnes, share } from "../lib/format";

export interface BarItem {
  name: string;
  sats: number;
  massKg: number;
  tone?: "accent" | "muted" | "default";
  note?: string;
}

/** A light horizontal bar list: one row per group, bar length by satellites, mass alongside. */
export function BarList({ items, limit = 8 }: { items: BarItem[]; limit?: number }) {
  const total = items.reduce((n, i) => n + i.sats, 0);
  const max = Math.max(1, ...items.map((i) => i.sats));
  return (
    <ul className="barlist">
      {items.slice(0, limit).map((i) => (
        <li key={i.name} className={`barlist__row barlist__row--${i.tone ?? "default"}`} title={i.note}>
          <span className="barlist__name">{i.name}</span>
          <span className="barlist__track">
            <span className="barlist__bar" style={{ width: `${(i.sats / max) * 100}%` }} />
          </span>
          <span className="barlist__value">
            {fmtInt(i.sats)} <em>{fmtPct(share(i.sats, total))}</em>
          </span>
          <span className="barlist__mass">{fmtTonnes(i.massKg)}</span>
        </li>
      ))}
    </ul>
  );
}
