import type { Confidence } from "../data/types";

const labels: Record<Confidence, string> = {
  high: "High confidence",
  medium: "Medium confidence",
  low: "Low confidence",
  placeholder: "Placeholder",
};

export function ConfidenceBadge({ level }: { level: Confidence }) {
  return <span className={`badge badge--${level}`}>{labels[level]}</span>;
}
