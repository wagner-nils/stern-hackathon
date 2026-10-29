// Part 2 exhibits as inline SVG, drawn from the warehouse snapshot's SQL-view exports (warehouse.json) and the model
// re-run (rerun.json). No figure is typed in here; labels are words, values come from the data.

const C = { navy: "#000b27", blue: "#095edd", light: "#c9d9f5", grey: "#9aa3b5", line: "#e5e7eb", muted: "#4a546c", red: "#b3261e", tint: "#eef4fd" };
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const num = (v, d = 0) => v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const eur = (v, d = 0) => `${v < 0 ? "−" : ""}€${num(Math.abs(v), d)} M`;
const text = (x, y, s, o = {}) =>
  `<text x="${x}" y="${y}" font-size="${o.size ?? 12}" fill="${o.fill ?? C.navy}" font-weight="${o.weight ?? 400}" text-anchor="${o.anchor ?? "start"}"${o.mono ? ' font-family="DM Mono, monospace"' : ""}>${esc(s)}</text>`;
const svg = (w, h, body) => `<svg class="exhibit" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">${body}</svg>`;

/** Sensitivity: the break-even year with each lever at the ends of its range ("never" = no break-even by 2040). */
export function tornado(wh, rr) {
  const rows = [...rr.tornado, { lever: "Kourou pad fee from 2028 (€ M a year)", base: 0, low: rr.kourouFeeM, high: 0, lowYear: rr.withKourouFee[0].profitableFrom, highYear: rr.baseBreakEven }];
  const NEVER = 2041;
  const yr = (v) => v ?? NEVER;
  rows.sort((a, b) => Math.abs(yr(b.lowYear) - yr(b.highYear)) - Math.abs(yr(a.lowYear) - yr(a.highYear)));
  const W = 800, L = 270, R = 96, top = 34, rowH = 50, H = top + rows.length * rowH + 30;
  const x0 = 2032, x1 = NEVER;
  const x = (v) => L + ((yr(v) - x0) / (x1 - x0)) * (W - L - R);
  let out = "";
  for (let g = x0; g <= 2040; g += 2) out += `<line x1="${x(g)}" x2="${x(g)}" y1="${top - 6}" y2="${H - 24}" stroke="${C.line}"/>` + text(x(g), H - 8, String(g), { size: 10, fill: C.muted, anchor: "middle" });
  out += `<rect x="${x(2040) + 6}" y="${top - 6}" width="${x(NEVER) - x(2040) - 6}" height="${H - 24 - top + 6}" fill="${C.tint}"/>` + text(x(NEVER) + 4, H - 8, "none by 2040", { size: 10, fill: C.red });
  out += `<line x1="${x(rr.baseBreakEven)}" x2="${x(rr.baseBreakEven)}" y1="${top - 14}" y2="${H - 24}" stroke="${C.navy}" stroke-width="1.5"/>` + text(x(rr.baseBreakEven), top - 16, `Base ${rr.baseBreakEven}`, { size: 10.5, weight: 600, anchor: "middle" });
  rows.forEach((r, i) => {
    const y = top + i * rowH;
    out += text(0, y + 18, r.lever, { size: 12.5 });
    out += text(0, y + 34, `worse ${r.low} · better ${r.high} · base ${r.base}`, { size: 10.5, fill: C.muted });
    const a = x(r.lowYear), b = x(r.highYear);
    out += `<rect x="${Math.min(a, x(rr.baseBreakEven))}" y="${y + 9}" width="${Math.abs(a - x(rr.baseBreakEven))}" height="22" rx="2" fill="${C.red}" opacity="0.75"/>`;
    out += `<rect x="${Math.min(b, x(rr.baseBreakEven))}" y="${y + 9}" width="${Math.abs(b - x(rr.baseBreakEven))}" height="22" rx="2" fill="${C.blue}"/>`;
    const lab = (v) => (v === null ? "none" : String(v));
    out += text(Math.max(a, b) + 6, y + 24, `${lab(r.highYear)} / ${lab(r.lowYear)}`, { size: 11, weight: 600 });
  });
  return svg(W, H, out);
}

export const exhibits = { tornado };
