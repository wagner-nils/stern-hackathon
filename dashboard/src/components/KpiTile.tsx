import type { ReactNode } from "react";

interface Props {
  label: string;
  value: string;
  sub?: ReactNode;
  emphasis?: boolean;
}

export function KpiTile({ label, value, sub, emphasis }: Props) {
  return (
    <div className={`kpi${emphasis ? " kpi--emphasis" : ""}`}>
      <div className="kpi__label">{label}</div>
      <div className="kpi__value">{value}</div>
      {sub && <div className="kpi__sub">{sub}</div>}
    </div>
  );
}
