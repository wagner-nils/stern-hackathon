import { useState } from "react";
import { type MapSite, SiteMap } from "../components/SiteMap";
import { ReliabilityLegend, SourceChip, SourceChips } from "../components/SourceChip";
import { ConfidenceBadge } from "../components/ConfidenceBadge";
import { generatedAt, launchSites, siteActivity, siteOverview, siteVehicles, vehicles } from "../data/warehouse";
import { fmtInt, fmtTonnes } from "../lib/format";

type StatusFilter = "all" | "operational" | "coming";

const accessLabel: Record<string, string> = {
  international: "Open to foreign launchers",
  "national-commercial": "National companies",
  sovereign: "State launchers only",
};

const band = (s: MapSite) => (s.inclination_min === null || s.inclination_max === null ? "–" : `${s.inclination_min}–${s.inclination_max}°`);
const kg = (v: number | null) => (v === null ? "–" : fmtTonnes(v));
const tonnes = (t: number | null | undefined) => (t === null || t === undefined ? "–" : fmtTonnes(t * 1000));

const rows: MapSite[] = launchSites.map((s) => ({ ...s, activity: siteOverview.find((o) => o.id === s.id) }));
const byId = Object.fromEntries(vehicles.map((v) => [v.id, v]));

function SiteDetail({ site }: { site: MapSite }) {
  const a = site.activity;
  const fleet = siteVehicles
    .filter((l) => l.site_id === site.id)
    .sort((p, q) => ["active", "contracted", "planned", "retired"].indexOf(p.status) - ["active", "contracted", "planned", "retired"].indexOf(q.status));
  const years = siteActivity.filter((y) => y.site_id === site.id);
  return (
    <div className="card site-detail">
      <div className="site-detail__head">
        <div>
          <div className="overline">
            {site.country} · {site.operator ?? "operator unknown"}
          </div>
          <h3>{site.name}</h3>
        </div>
        <div className="site-detail__tags">
          <span className={`pill pill--${site.status.replace(" ", "-")}`}>{site.status}</span>
          {site.access && <span className={`pill pill--${site.access}`}>{accessLabel[site.access]}</span>}
          <ConfidenceBadge level={site.confidence} />
        </div>
      </div>

      <ul className="factlines factlines--row factlines--small">
        <li className="factline">
          <span>Latitude · reach</span>
          <strong>
            {site.latitude}° · {band(site)}
          </strong>
          <span className="caption">{site.polar_sso ? "Polar and SSO directly" : site.polar_sso === false ? "No direct polar/SSO" : "Polar access unknown"}</span>
        </li>
        <li className="factline">
          <span>Orbital launches 2025</span>
          <strong>{fmtInt(a?.launches_2025 ?? 0)}</strong>
          <span className="caption">
            2024: {fmtInt(a?.launches_2024 ?? 0)} · 2026 so far: {fmtInt(a?.launches_2026_ytd ?? 0)}
          </span>
        </li>
        <li className="factline">
          <span>Payload to orbit 2025</span>
          <strong>{tonnes(a?.payload_t_2025)}</strong>
          <span className="caption">{a?.satellites_2025 ? `${fmtInt(a.satellites_2025)} satellites` : "no satellites in 2025"}</span>
        </li>
        <li className="factline">
          <span>Launch cap per year</span>
          <strong>{site.max_launches_per_year ?? "none published"}</strong>
          <span className="caption">
            {site.cap_basis ?? ""}
            {a?.cap_used_2025 ? ` · ${Math.round(a.cap_used_2025 * 100)}% used in 2025` : ""}
          </span>
        </li>
        <li className="factline">
          <span>Heaviest vehicle, LEO</span>
          <strong>{kg(a?.max_payload_leo_kg ?? null)}</strong>
          <span className="caption">
            SSO {kg(a?.max_payload_sso_kg ?? null)} · GTO {kg(a?.max_payload_gto_kg ?? null)}
          </span>
        </li>
      </ul>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Provider</th>
              <th>Status here</th>
              <th>Orbits</th>
              <th className="num">LEO</th>
              <th className="num">SSO</th>
              <th className="num">GTO</th>
              <th>Since</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {fleet.map((l) => {
              const v = byId[l.vehicle_id];
              return (
                <tr key={l.vehicle_id} className={l.status === "retired" ? "is-alternative" : ""} title={[v.note, l.note].filter(Boolean).join(" · ")}>
                  <td>
                    {v.name}
                    <small className="site-detail__class"> {v.class}</small>
                  </td>
                  <td>
                    {v.operator} {v.country_code && <small>({v.country_code})</small>}
                  </td>
                  <td>{l.status}</td>
                  <td>{l.orbits.join(", ")}</td>
                  <td className="num">
                    {kg(v.payload_leo_kg)}
                    {v.payload_estimated && "*"}
                  </td>
                  <td className="num">{kg(v.payload_sso_kg)}</td>
                  <td className="num">{kg(v.payload_gto_kg)}</td>
                  <td>{l.since ?? "–"}</td>
                  <td>
                    <SourceChip id={l.source_id} />
                  </td>
                </tr>
              );
            })}
            {fleet.length === 0 && (
              <tr>
                <td colSpan={9}>No vehicle recorded for this site.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {fleet.some((l) => byId[l.vehicle_id].payload_estimated) && <p className="caption">* payload estimated, not published</p>}

      {years.length > 0 && (
        <div className="table-wrap">
          <table className="site-detail__years">
            <thead>
              <tr>
                <th>Year (GCAT)</th>
                <th className="num">Launches</th>
                <th className="num">Failures</th>
                <th className="num">Payload</th>
                <th className="num">to LEO</th>
                <th className="num">to SSO</th>
                <th className="num">to GTO/GEO</th>
                <th className="num">other</th>
                <th>Launched by</th>
              </tr>
            </thead>
            <tbody>
              {years.map((y) => (
                <tr key={y.year}>
                  <td>{y.year === 2026 ? "2026 (to Oct)" : y.year}</td>
                  <td className="num">{y.launches}</td>
                  <td className="num">{y.failures}</td>
                  <td className="num">{tonnes(y.payload_t)}</td>
                  <td className="num">{y.to_leo}</td>
                  <td className="num">{y.to_sso}</td>
                  <td className="num">{y.to_geo}</td>
                  <td className="num">{y.to_other}</td>
                  <td>{y.agencies}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <dl className="site-detail__notes">
        {site.expansion && (
          <>
            <dt>Expansion</dt>
            <dd>{site.expansion}</dd>
          </>
        )}
        {site.isar_access && (
          <>
            <dt>Isar Aerospace</dt>
            <dd>{site.isar_access}</dd>
          </>
        )}
        {site.note && (
          <>
            <dt>Note</dt>
            <dd>{site.note}</dd>
          </>
        )}
        <dt>Sources</dt>
        <dd>
          <SourceChips ids={[...(site.source_ids ?? [site.source_id]), ...(years.length ? ["gcat"] : [])]} />
        </dd>
      </dl>
    </div>
  );
}

/** The global spaceport register: where the world launches from, who flies there, and what each site can do. */
export function Spaceports() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [openOnly, setOpenOnly] = useState(false);
  const [selected, setSelected] = useState("andoya");

  const q = query.trim().toLowerCase();
  const shown = rows.filter(
    (s) =>
      (status === "all" || (status === "operational" ? s.status === "operational" : s.status === "planned" || s.status === "under construction")) &&
      (!openOnly || s.access === "international") &&
      (!q || [s.name, s.country, s.operator, s.activity?.providers, s.expansion].some((t) => (t ?? "").toLowerCase().includes(q))),
  );
  const site = rows.find((s) => s.id === selected) ?? rows[0];
  const total2025 = rows.reduce((n, s) => n + (s.activity?.launches_2025 ?? 0), 0);
  const operational = rows.filter((s) => s.status === "operational").length;

  const select = (id: string) => {
    setSelected(id);
    document.querySelector(".site-detail")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="chapter">
      <header className="chapter__head">
        <div className="overline">Expert base · Spaceports</div>
        <h2>Where the world launches from</h2>
        <p className="lead">
          {rows.length} spaceports, {operational} of them operational, with {fmtInt(total2025)} orbital launches in 2025. Activity is counted
          from GCAT launch by launch; who may launch where, caps and plans come from regulators, operators and trade press. Snapshot{" "}
          {generatedAt.slice(0, 10)}.
        </p>
      </header>

      <SiteMap sites={shown} selected={site.id} onSelect={select} />

      <SiteDetail site={site} />

      <div className="toolbar">
        <input className="search" type="search" placeholder="Search site, country, provider…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <div className="seg" role="group" aria-label="Status">
          {(["all", "operational", "coming"] as StatusFilter[]).map((f) => (
            <button key={f} className={status === f ? "is-active" : ""} onClick={() => setStatus(f)}>
              {f === "all" ? "All" : f === "operational" ? "Operational" : "Planned / building"}
            </button>
          ))}
        </div>
        <label className="check">
          <input type="checkbox" checked={openOnly} onChange={(e) => setOpenOnly(e.target.checked)} /> Open to foreign launchers
        </label>
        <ReliabilityLegend />
      </div>

      <div className="card table-wrap">
        <table className="sites-table">
          <thead>
            <tr>
              <th>Spaceport</th>
              <th>Status</th>
              <th>Access</th>
              <th className="num">Lat.</th>
              <th>Reach</th>
              <th className="num">Launches 24 / 25 / 26</th>
              <th className="num">Payload 2025</th>
              <th className="num">Cap / yr</th>
              <th className="num">Heaviest LEO</th>
              <th>Providers</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((s) => (
              <tr key={s.id} className={s.id === site.id ? "is-selected" : ""} onClick={() => select(s.id)}>
                <td>
                  <strong>{s.name}</strong>
                  <small>{s.country}</small>
                </td>
                <td>
                  <span className={`pill pill--${s.status.replace(" ", "-")}`}>{s.status}</span>
                </td>
                <td>{s.access ? accessLabel[s.access] : "–"}</td>
                <td className="num">{s.latitude}°</td>
                <td className="num">{band(s)}</td>
                <td className="num">
                  {fmtInt(s.activity?.launches_2024 ?? 0)} / <strong>{fmtInt(s.activity?.launches_2025 ?? 0)}</strong> /{" "}
                  {fmtInt(s.activity?.launches_2026_ytd ?? 0)}
                </td>
                <td className="num">{tonnes(s.activity?.payload_t_2025)}</td>
                <td className="num">{s.max_launches_per_year ?? "–"}</td>
                <td className="num">{kg(s.activity?.max_payload_leo_kg ?? null)}</td>
                <td>{s.activity?.providers ?? "–"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
