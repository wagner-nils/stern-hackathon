import type { SiteNode } from "../data/warehouse";
import { LAND, x, y } from "./SiteMap";

const kindMark: Record<SiteNode["kind"], string> = { hq: "HQ", production: "Plant", test: "Test", launch: "Pad" };

/** Short place name: the spaceport for pads, the town (or the part in brackets) otherwise. */
const place = (n: SiteNode) => (n.kind === "launch" ? n.name.split(",")[0] : (n.location.match(/\((.*)\)/)?.[1] ?? n.location.split(",")[0]));

// The North Atlantic crop of the world map: same projection, so the footprint reads as a zoom into it.
const WEST = -72;
const EAST = 30;
const NORTH = 74;
const SOUTH = 0;

/** Isar's production, test and launch sites with the RQ3 decision for each; nodes at one place share a label. */
export function FootprintMap({ nodes }: { nodes: SiteNode[] }) {
  const placed = nodes.filter((n) => n.latitude !== null && n.longitude !== null);
  const places = new Map<string, SiteNode[]>();
  for (const n of placed) {
    const key = `${n.latitude},${n.longitude}`;
    places.set(key, [...(places.get(key) ?? []), n]);
  }
  const vb = [x(WEST), y(NORTH), x(EAST) - x(WEST), y(SOUTH) - y(NORTH)];
  // Map units per screen pixel at the usual rendered width, so text and dots keep a readable size.
  const scale = vb[2] / 560;
  return (
    <figure className="footprint">
      <svg viewBox={vb.join(" ")} role="img" aria-label="Isar's site footprint around the North Atlantic">
        <path d={LAND} className="footprint__land" />
        {[...places.values()].map((group) => {
          const n = group[0];
          const cx = x(n.longitude!);
          const cy = y(n.latitude!);
          // Labels left of the dot in the east (Europe is crowded), right of it in the west; Esrange sits next to Andøya, so it goes right.
          const east = n.longitude! > 0 && n.kind !== "test";
          // Bavaria holds two nodes a few km apart; the HQ label goes below the plant's.
          const dy = n.kind === "hq" ? 16 * scale : n.kind === "production" && n.longitude! > 5 ? -10 * scale : 0;
          return (
            <g key={n.id}>
              <circle cx={cx} cy={cy} r={5 * scale} className={`footprint__dot decision--${group.some((g) => g.decision === "expand") ? "expand" : n.decision}`} />
              <text x={east ? cx - 9 * scale : cx + 9 * scale} y={cy + 4 * scale + dy} textAnchor={east ? "end" : "start"} className="footprint__label" style={{ fontSize: 13 * scale }}>
                {place(n)} · {group.map((g) => kindMark[g.kind]).join(" + ")}
              </text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}
