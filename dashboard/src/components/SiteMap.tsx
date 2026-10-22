import { feature } from "topojson-client";
import land110 from "world-atlas/land-110m.json";
import type { LaunchSite, SiteOverview } from "../data/warehouse";
import { fmtInt } from "../lib/format";

const W = 1000;
const LAT_TOP = 75;
const LAT_BOTTOM = -50;
const H = (W * (LAT_TOP - LAT_BOTTOM)) / 360;

const x = (lon: number) => ((lon + 180) / 360) * W;
const y = (lat: number) => ((LAT_TOP - lat) / (LAT_TOP - LAT_BOTTOM)) * H;

// Land outline (Natural Earth 1:110m via world-atlas), drawn once in the same equirectangular frame.
type Ring = [number, number][];
const LAND = (() => {
  const topology = land110 as unknown as Parameters<typeof feature>[0];
  const land = feature(topology, topology.objects.land) as unknown as {
    features?: { geometry: { type: string; coordinates: Ring[] | Ring[][] } }[];
    geometry?: { type: string; coordinates: Ring[] | Ring[][] };
  };
  const geometries = land.features ? land.features.map((f) => f.geometry) : [land.geometry!];
  const polygons = geometries.flatMap((g) => (g.type === "Polygon" ? [g.coordinates as Ring[]] : (g.coordinates as Ring[][])));
  const ring = (r: Ring) => r.map(([lon, lat], k) => `${k ? "L" : "M"}${x(lon).toFixed(1)},${y(lat).toFixed(1)}`).join("") + "Z";
  return polygons.map((p) => p.map(ring).join("")).join("");
})();

export type MapSite = LaunchSite & { activity: SiteOverview | undefined };

/**
 * Spaceports on a latitude × longitude grid. Latitude is what matters for a launcher: it sets the lowest
 * inclination a site reaches directly. Dot area follows launches in 2025; hollow dots are not operational yet.
 */
export function SiteMap({
  sites,
  selected,
  onSelect,
  highlight = null,
}: {
  sites: MapSite[];
  selected: string;
  onSelect: (id: string) => void;
  /** Sites to emphasise; all others are dimmed. Null shows every site normally. */
  highlight?: Set<string> | null;
}) {
  const placed = sites.filter((s) => s.longitude != null && s.latitude != null);
  const radius = (s: MapSite) => 4 + Math.sqrt(s.activity?.launches_2025 ?? 0) * 1.7;
  const launches = (s: MapSite) => s.activity?.launches_2025 ?? 0;
  // Busy sites get a name, unless a busier one sits within a few degrees (Cape Canaveral and Kennedy share a coast).
  const near = (a: MapSite, b: MapSite) => Math.abs(a.latitude! - b.latitude!) < 4 && Math.abs(a.longitude! - b.longitude!) < 4;
  const busy = (s: MapSite) =>
    launches(s) >= 15 && !placed.some((o) => o !== s && near(o, s) && launches(o) > launches(s) && o.id !== selected);
  // With a highlight, name the highlighted sites (all of them while there are few); otherwise the busy ones.
  const labelled = (s: MapSite) => {
    if (s.id === selected) return true;
    if (highlight) return highlight.has(s.id) && (highlight.size <= 12 || busy(s));
    return busy(s);
  };
  // Draw the busiest first so small sites stay clickable on top.
  const order = [...placed].sort((a, b) => radius(b) - radius(a));

  return (
    <figure className="sitemap">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Spaceports by latitude and longitude">
        <path d={LAND} className="sitemap__land" />
        {[60, 45, 30, 15, 0, -15, -30, -45].map((lat) => (
          <g key={lat}>
            <line x1={0} x2={W} y1={y(lat)} y2={y(lat)} className={lat === 0 ? "sitemap__equator" : "sitemap__grid"} />
            <text x={4} y={y(lat) - 4} className="sitemap__axis">
              {lat === 0 ? "Equator" : `${Math.abs(lat)}°${lat > 0 ? "N" : "S"}`}
            </text>
          </g>
        ))}
        {[-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150].map((lon) => (
          <line key={lon} x1={x(lon)} x2={x(lon)} y1={0} y2={H} className="sitemap__grid sitemap__grid--lon" />
        ))}
        {order.map((s) => (
          <g
            key={s.id}
            className={`sitemap__site sitemap__site--${s.access ?? "unknown"}${s.status === "operational" ? "" : " is-coming"}${
              s.id === selected ? " is-selected" : ""
            }${highlight ? (highlight.has(s.id) ? " is-match" : " is-dim") : ""}`}
            transform={`translate(${x(s.longitude!)} ${y(s.latitude!)})`}
            onClick={() => onSelect(s.id)}
          >
            <title>{`${s.name}: ${fmtInt(s.activity?.launches_2025 ?? 0)} orbital launches in 2025 · ${s.status}`}</title>
            <circle r={radius(s)} />
          </g>
        ))}
        {placed.filter(labelled).map((s) => (
          // Labels near the right edge go to the left of their dot.
          <text
            key={s.id}
            x={x(s.longitude!) > W * 0.82 ? x(s.longitude!) - radius(s) - 4 : x(s.longitude!) + radius(s) + 4}
            y={y(s.latitude!) + 4}
            textAnchor={x(s.longitude!) > W * 0.82 ? "end" : "start"}
            className="sitemap__label"
          >
            {s.name.replace(/ \(.*\)$/, "").replace(/ (Space Force Station|Space Force Base|Space Center|Satellite Launch Center|Cosmodrome)$/, "")}
          </text>
        ))}
      </svg>
      <figcaption className="sitemap__legend">
        <span className="sitemap__key sitemap__key--international">open to foreign launchers</span>
        <span className="sitemap__key sitemap__key--national-commercial">national companies</span>
        <span className="sitemap__key sitemap__key--sovereign">state launchers only</span>
        <span className="sitemap__key sitemap__key--coming">not operational yet</span>
        <span>Dot area: orbital launches 2025 (GCAT)</span>
      </figcaption>
    </figure>
  );
}
