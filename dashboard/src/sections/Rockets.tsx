import { useState } from "react";
import { ReliabilityLegend, SourceChip } from "../components/SourceChip";
import { launchSites, launchesByCountry, launchesByProvider, siteVehicles, vehicleActivity, vehicles } from "../data/warehouse";
import { fmtInt, fmtPct, fmtTonnes, share } from "../lib/format";

const YEARS = [2024, 2025, 2026] as const;
type Year = (typeof YEARS)[number];
const yearLabel = (y: number) => (y === 2026 ? "2026 to Oct" : String(y));

const CLASSES = ["all", "small", "medium", "heavy", "super-heavy"] as const;
const STATUSES = ["all", "operational", "development", "retired"] as const;

// European launch providers, summed for a "Europe" line next to the countries.
const EUROPE = new Set(["FR", "IT", "DE", "ES", "GB", "SE", "NO", "PT"]);

const regionName = (() => {
  try {
    const names = new Intl.DisplayNames(["en"], { type: "region" });
    return (code: string | null) => (code ? (names.of(code) ?? code) : "unknown");
  } catch {
    return (code: string | null) => code ?? "unknown";
  }
})();

const kg = (v: number | null) => (v === null ? "–" : fmtTonnes(v));
const tonnes = (t: number | null) => (!t ? "–" : fmtTonnes(t * 1000));
const siteName = Object.fromEntries(launchSites.map((s) => [s.id, s.name.replace(/ \(.*\)$/, "")]));

/** Launches of one vehicle by year, with its success rate over all years since 2024. */
function activity(vehicleId: string) {
  const rows = vehicleActivity.filter((a) => a.vehicle_id === vehicleId);
  const by = (y: number) => rows.find((a) => a.year === y)?.launches ?? 0;
  const launches = rows.reduce((n, a) => n + a.launches, 0);
  const successes = rows.reduce((n, a) => n + a.successes, 0);
  return { by, launches, rate: launches ? successes / launches : null };
}

function Bars({ items }: { items: { key: string; label: string; launches: number; successes: number; payload: number | null; note?: string; tone?: string }[] }) {
  const max = Math.max(1, ...items.map((i) => i.launches));
  return (
    <ul className="barlist barlist--wide">
      {items.map((i) => (
        <li key={i.key} className={`barlist__row barlist__row--${i.tone ?? "accent"}`} title={i.note}>
          <span className="barlist__name">{i.label}</span>
          <span className="barlist__track">
            <span className="barlist__bar" style={{ width: `${(i.launches / max) * 100}%` }} />
          </span>
          <span className="barlist__value">
            {fmtInt(i.launches)} <em>{i.launches ? fmtPct(share(i.successes, i.launches)) : "–"} ok</em>
          </span>
          <span className="barlist__mass">{tonnes(i.payload)}</span>
        </li>
      ))}
    </ul>
  );
}

/** Who launches with what: launches by country and company, and the catalogue of rockets in the warehouse. */
export function Rockets() {
  const [year, setYear] = useState<Year>(2025);
  const [cls, setCls] = useState<(typeof CLASSES)[number]>("all");
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("operational");
  const [query, setQuery] = useState("");

  const countries = launchesByCountry.filter((c) => c.year === year).sort((a, b) => b.launches - a.launches);
  const providers = launchesByProvider.filter((p) => p.year === year).sort((a, b) => b.launches - a.launches);
  const total = countries.reduce((n, c) => n + c.launches, 0);
  const europe = countries.filter((c) => c.country_code && EUROPE.has(c.country_code));
  const europeSum = {
    launches: europe.reduce((n, c) => n + c.launches, 0),
    successes: europe.reduce((n, c) => n + c.successes, 0),
    payload: europe.reduce((n, c) => n + (c.payload_t ?? 0), 0),
  };

  const q = query.trim().toLowerCase();
  const catalogue = vehicles
    .map((v) => ({ v, a: activity(v.id), sites: siteVehicles.filter((l) => l.vehicle_id === v.id && l.status !== "retired") }))
    .filter(
      ({ v }) =>
        (cls === "all" || v.class === cls) &&
        (status === "all" || v.status === status) &&
        (!q || [v.name, v.operator, regionName(v.country_code)].some((t) => t.toLowerCase().includes(q))),
    )
    .sort((x, y) => y.a.by(year) - x.a.by(year) || y.a.launches - x.a.launches || x.v.name.localeCompare(y.v.name));

  return (
    <section className="chapter">
      <header className="chapter__head">
        <div className="overline">Expert base · Rockets</div>
        <h2>Who launches, and with what</h2>
        <p className="lead">
          {fmtInt(total)} orbital launch attempts in {yearLabel(year)} by {countries.length} countries and {providers.length} launch providers,
          counted launch by launch from GCAT. The catalogue below holds {vehicles.length} rockets with payload, status and the spaceports they
          fly from.
        </p>
      </header>

      <div className="toolbar">
        <div className="overline">Launches by country and company</div>
        <div className="toggle" role="group" aria-label="Year">
          {YEARS.map((y) => (
            <button key={y} className={year === y ? "is-active" : ""} onClick={() => setYear(y)}>
              {yearLabel(y)}
            </button>
          ))}
        </div>
      </div>

      <div className="evidence">
        <div className="card evidence__block">
          <h4>By country of the launch provider</h4>
          <Bars
            items={countries.map((c) => ({
              key: c.country_code ?? "?",
              label: regionName(c.country_code),
              launches: c.launches,
              successes: c.successes,
              payload: c.payload_t,
              note: c.provider_names ?? undefined,
            }))}
          />
          {europeSum.launches > 0 && (
            <p className="caption">
              Europe together: {fmtInt(europeSum.launches)} launches ({fmtPct(share(europeSum.successes, europeSum.launches))} successful),{" "}
              {tonnes(europeSum.payload)} to orbit. Bars: launches; percentage: successful; right: payload placed in orbit.
            </p>
          )}
        </div>
        <div className="card evidence__block">
          <h4>By company or agency</h4>
          <Bars
            items={providers.slice(0, 15).map((p) => ({
              key: p.provider,
              label: `${p.provider} (${p.provider_country ?? "?"})`,
              launches: p.launches,
              successes: p.successes,
              payload: p.payload_t,
              note: p.vehicles ?? undefined,
              tone: p.provider_country && EUROPE.has(p.provider_country) ? "accent" : "muted",
            }))}
          />
          <p className="caption">Top 15; European providers in blue. Hover a row for its rockets.</p>
        </div>
      </div>

      <div className="toolbar">
        <input className="search" type="search" placeholder="Search rocket, company, country…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <div className="seg" role="group" aria-label="Class">
          {CLASSES.map((c) => (
            <button key={c} className={cls === c ? "is-active" : ""} onClick={() => setCls(c)}>
              {c === "all" ? "All classes" : c}
            </button>
          ))}
        </div>
        <div className="seg" role="group" aria-label="Status">
          {STATUSES.map((s) => (
            <button key={s} className={status === s ? "is-active" : ""} onClick={() => setStatus(s)}>
              {s === "all" ? "Any status" : s}
            </button>
          ))}
        </div>
        <ReliabilityLegend />
      </div>

      <div className="card table-wrap">
        <h3>Rocket catalogue ({catalogue.length})</h3>
        <table className="sites-table rockets-table">
          <thead>
            <tr>
              <th>Rocket</th>
              <th>Provider</th>
              <th>Class</th>
              <th>Status</th>
              <th className="num">LEO</th>
              <th className="num">SSO</th>
              <th className="num">GTO</th>
              <th className="num">Launches 24 / 25 / 26</th>
              <th className="num">Success</th>
              <th>Spaceports</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {catalogue.map(({ v, a, sites }) => (
              <tr key={v.id} title={v.note ?? ""}>
                <td>
                  <strong>{v.name}</strong>
                  <small>
                    {v.first_flight ? `since ${v.first_flight}` : "not flown"}
                    {v.reusable ? " · reusable" : ""}
                  </small>
                </td>
                <td>
                  {v.operator}
                  <small>{regionName(v.country_code)}</small>
                </td>
                <td>{v.class}</td>
                <td>
                  <span className={`pill pill--${v.status === "operational" ? "operational" : v.status === "development" ? "planned" : "inactive"}`}>
                    {v.status ?? "–"}
                  </span>
                </td>
                <td className="num">
                  {kg(v.payload_leo_kg)}
                  {v.payload_estimated && "*"}
                </td>
                <td className="num">{kg(v.payload_sso_kg)}</td>
                <td className="num">{kg(v.payload_gto_kg)}</td>
                <td className="num">
                  {a.by(2024)} / <strong>{a.by(2025)}</strong> / {a.by(2026)}
                </td>
                <td className="num">{a.rate === null ? "–" : fmtPct(a.rate)}</td>
                <td>
                  {sites.length
                    ? sites.map((l) => `${siteName[l.site_id] ?? l.site_id}${l.status === "active" ? "" : ` (${l.status})`}`).join(", ")
                    : "–"}
                </td>
                <td>
                  <SourceChip id={v.source_id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="caption">* payload estimated, not published. Success rate over all launches since 2024. Hover a row for notes.</p>
      </div>
    </section>
  );
}
