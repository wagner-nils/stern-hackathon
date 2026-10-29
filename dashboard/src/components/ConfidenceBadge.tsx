import type { Confidence } from "../data/warehouse";

const labels: Record<Confidence, string> = {
  high: "High confidence",
  medium: "Medium confidence",
  low: "Low confidence",
};

export function ConfidenceBadge({ level }: { level: Confidence }) {
  return <span className={`badge badge--${level}`}>{labels[level]}</span>;
}
