import { useState } from "react";
import { ConfidenceBadge } from "../components/ConfidenceBadge";
import { ReliabilityLegend, SourceChip, SourceChips } from "../components/SourceChip";
import { assumptions, facts, generatedAt, metrics, satellites, sources } from "../data/warehouse";
import { fmtInt, fmtUnit } from "../lib/format";

/** Browse the fact warehouse: every fact with its source, every assumption with its reason, every source. */
export function FactBase() {
  const [query, setQuery] = useState("");
  const [onlyPreferred, setOnlyPreferred] = useState(false);
  const q = query.trim().toLowerCase();
  const hit = (...texts: (string | null | number)[]) => !q || texts.some((t) => String(t ?? "").toLowerCase().includes(q));

  const shownFacts = facts.filter(
    (f) =>
      (!onlyPreferred || f.is_preferred) &&
      hit(metrics[f.metric_id].name, f.entity, f.scope, f.year, f.note, sources[f.source_id]?.short, sources[f.source_id]?.publisher, sources[f.source_id]?.title),
  );
  const shownAssumptions = assumptions.filter((a) => hit(a.name, a.tier, a.question, a.rationale, a.owner));
  const shownSources = Object.values(sources).filter((s) => hit(s.short, s.title, s.publisher, s.kind, s.note));

  return (
    <section className="chapter">
      <header className="chapter__head">
        <div className="overline">Fact base</div>
        <h2>Every number, with its source</h2>
        <p className="lead">
          Snapshot of the Supabase fact warehouse from {generatedAt.slice(0, 16).replace("T", " ")} UTC: {facts.length} facts,{" "}
          {assumptions.length} assumptions, {Object.keys(sources).length} sources and {fmtInt(satellites.length)} satellites. Where
          sources disagree, all values are kept; <span className="mark">✓</span> marks the one the tool uses.
        </p>
      </header>

      <div className="toolbar">
        <input className="search" type="search" placeholder="Search facts, assumptions, sources…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <label className="check">
          <input type="checkbox" checked={onlyPreferred} onChange={(e) => setOnlyPreferred(e.target.checked)} /> Only values in use
        </label>
        <ReliabilityLegend />
      </div>

      <div className="card table-wrap">
        <h3>Facts ({shownFacts.length})</h3>
        <table>
          <thead>
            <tr>
              <th />
              <th>Metric</th>
              <th>Year</th>
              <th>About</th>
              <th>Value</th>
              <th>Confidence</th>
              <th>Source</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {shownFacts.map((f, k) => (
              <tr key={k} className={f.is_preferred ? "is-preferred" : "is-alternative"}>
                <td className="mark">{f.is_preferred ? "✓" : "○"}</td>
                <td>{metrics[f.metric_id].name}</td>
                <td>{f.year}</td>
                <td>{f.entity || f.scope}</td>
                <td className="num">{fmtUnit(f.value, metrics[f.metric_id].unit)}</td>
                <td>
                  <ConfidenceBadge level={f.confidence} />
                </td>
                <td>
                  <SourceChip id={f.source_id} />
                </td>
                <td>{f.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card table-wrap">
        <h3>Assumptions ({shownAssumptions.length})</h3>
        <table>
          <thead>
            <tr>
              <th>Assumption</th>
              <th>Tier</th>
              <th>Base</th>
              <th>Range</th>
              <th>Slider</th>
              <th>Confidence</th>
              <th>Owner</th>
              <th>Sources</th>
              <th>Why</th>
            </tr>
          </thead>
          <tbody>
            {shownAssumptions.map((a) => (
              <tr key={a.id}>
                <td>{a.name}</td>
                <td>{a.tier}</td>
                <td className="num">{fmtUnit(a.value, a.unit)}</td>
                <td className="num">{a.low === null ? "–" : `${fmtUnit(a.low, a.unit)} – ${fmtUnit(a.high!, a.unit)}`}</td>
                <td>{a.is_lever ? "yes" : "fixed"}</td>
                <td>
                  <ConfidenceBadge level={a.confidence} />
                </td>
                <td>{a.owner}</td>
                <td>
                  <SourceChips ids={a.source_ids} />
                </td>
                <td>{a.rationale}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card table-wrap">
        <h3>Sources ({shownSources.length})</h3>
        <table>
          <thead>
            <tr>
              <th>Cited as</th>
              <th>Publisher and title</th>
              <th>Kind</th>
              <th>Reliability</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {shownSources.map((s) => (
              <tr key={s.id}>
                <td>
                  <SourceChip id={s.id} />
                </td>
                <td>
                  {s.publisher}: {s.url ? <a href={s.url} target="_blank" rel="noreferrer">{s.title}</a> : s.title}
                </td>
                <td>{s.kind}</td>
                <td>
                  <ConfidenceBadge level={s.reliability} />
                </td>
                <td>{s.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
