import { sources } from "../data/warehouse";

/** A source as a small pill: citation label, reliability dot, publisher and title on hover, link when there is one. */
export function SourceChip({ id }: { id: string }) {
  const s = sources[id];
  if (!s) return <span className="chip chip--missing">{id}</span>;
  const name = s.short ?? s.publisher;
  const label = name.length <= 26 ? name : `${name.slice(0, 24)}…`;
  const title = `${s.publisher}: ${s.title}${s.note ? ` – ${s.note}` : ""} (reliability ${s.reliability})`;
  return s.url ? (
    <a className={`chip chip--${s.reliability}`} href={s.url} target="_blank" rel="noreferrer" title={title}>
      {label}
    </a>
  ) : (
    <span className={`chip chip--${s.reliability}`} title={title}>
      {label}
    </span>
  );
}

export function SourceChips({ ids }: { ids: string[] }) {
  return (
    <span className="chips">
      {[...new Set(ids)].map((id) => (
        <SourceChip key={id} id={id} />
      ))}
    </span>
  );
}

/** Explains the dot colour on every source chip. */
export function ReliabilityLegend() {
  return (
    <span className="legend" aria-label="Source reliability">
      <span>Source reliability</span>
      <span className="legend__item legend__item--high">high</span>
      <span className="legend__item legend__item--medium">medium</span>
      <span className="legend__item legend__item--low">low</span>
    </span>
  );
}
