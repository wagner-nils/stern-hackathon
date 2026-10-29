// Renders the journey to one HTML document of 1280×720 CSS px pages (13.333 × 7.5 in, PowerPoint widescreen).
// Part 1 (layout "tour"): full-screen frames of the tool with clickable hotspots that jump to other frames, like
// using the tool. Part 2 (layouts "divider", "exec", "exhibit", "build"): the case behind the screens in consulting
// slide format. Layouts "cover" and "closing" frame the document.
import { exhibits } from "./exhibits.mjs";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
// Inline markup: **bold**, *italic*, [text](https://…) and [text](#page-id) links; everything else escaped.
// A number keeps its unit and its minus sign on the same line ("45 %", "−€4 M", "2.1 t", "p. 12").
const md = (s, ctx) =>
  esc(s)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a class="ext" href="$2">$1</a>')
    .replace(/\[([^\]]+)\]\(#([\w-]+)\)/g, (_, t, id) => `<a class="int" href="#p-${ctx.pageOf(id)}">${t}</a>`)
    .replace(/(\d) (%|M\b|t\b|kg\b|×|bn\b)/g, "$1 $2")
    .replace(/\b(p\.) (\d)/g, "$1 $2")
    .replace(/−(?=[€\d])/g, "−\u2060");

const TOUR = { w: 1280, h: 696 };

// The cover's depth texture: a perspective grid (floor and ceiling converging on one vanishing point) on the right,
// drawn as plain strokes with constant opacity per segment. No gradients, masks or blur: PDF viewers such as Preview
// render those as grey boxes.
function perspectiveGrid() {
  const W = 820, H = 720, vx = 470, vy = 360, out = [];
  const fadeX = (x) => Math.min(1, Math.max(0, (x - 40) / 360)); // fades toward the text on the left
  const seg = (x1, y1, x2, y2, o) => out.push(`<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#095edd" stroke-opacity="${o.toFixed(3)}" stroke-width="1"/>`);
  for (const dir of [1, -1]) {
    const edge = dir > 0 ? H : 0;
    // Lines converging on the vanishing point, cut into segments that fade toward the horizon.
    for (let i = -14; i <= 22; i++) {
      const bx = vx + i * 70;
      const steps = 6;
      for (let k = 0; k < steps; k++) {
        const t0 = k / steps, t1 = (k + 1) / steps;
        const p = (t) => [bx + (vx - bx) * t * 0.9, edge + (vy - edge) * t * 0.9];
        const [x1, y1] = p(t0), [x2, y2] = p(t1);
        seg(x1, y1, x2, y2, 0.16 * (1 - t0) * fadeX((x1 + x2) / 2) * (dir > 0 ? 1 : 0.6));
      }
    }
    // Cross lines, closer together toward the horizon.
    for (let k = 1; k <= 11; k++) {
      const f = Math.pow(k / 11, 2);
      const y = vy + (edge - vy) * (0.1 + 0.9 * f);
      const half = 40 + 1100 * f;
      for (let x = vx - half; x < vx + half; x += 80) seg(x, y, Math.min(x + 80, vx + half), y, 0.15 * f * fadeX(x + 40) * (dir > 0 ? 1 : 0.6));
    }
  }
  return `<svg class="cover__grid" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true">${out.join("")}</svg>`;
}

function partTracker(p, ctx) {
  return `<nav class="crumbs">${ctx.sections
    .map((s) => `<a href="#p-${s.page}" class="${s.id === p.section ? "is-on" : ""}">${esc(s.label)}</a>`)
    .join("<span>›</span>")}</nav>`;
}

function chrome(p, ctx, body) {
  const tool = p.tool ? `<a class="totool" href="#p-${ctx.pageOf(p.tool)}">See it in the tool → p. ${ctx.pageOf(p.tool)}</a>` : "";
  return `<header class="b-head">${partTracker(p, ctx)}${p.sticker ? `<span class="sticker">${esc(p.sticker)}</span>` : ""}</header>
    <h1 class="b-title">${md(p.title, ctx)}</h1>
    ${p.lead ? `<p class="b-lead">${md(p.lead, ctx)}</p>` : ""}
    ${body}
    <footer class="b-foot"><span class="b-source">${p.source ? md(p.source, ctx) : ""}</span>${tool}<span class="b-num">${ctx.index}</span></footer>`;
}

const bullets = (items, ctx) => `<ul class="dash">${items.map((i) => `<li>${md(i, ctx)}</li>`).join("")}</ul>`;
const takeaway = (p, ctx) =>
  p.takeaways
    ? `<aside class="takeaway"><div class="takeaway__label">${esc(p.takeawayLabel ?? "Key takeaways")}</div>${bullets(p.takeaways, ctx)}${p.implication ? `<div class="implication"><div class="takeaway__label">Implication for SSVE</div><p>${md(p.implication, ctx)}</p></div>` : ""}</aside>`
    : "";

const layouts = {
  cover(p, ctx) {
    const shot = ctx.shot(p.shot);
    const parts = p.parts
      .map((x) => `<a class="part" href="#p-${ctx.pageOf(x.goto)}"><span class="part__num">${esc(x.num)}</span><strong>${md(x.name, ctx)}</strong><span>${md(x.what, ctx)}</span><span class="part__pages">pp. ${ctx.pageOf(x.goto)}–${ctx.pageOf(x.last)} →</span></a>`)
      .join("");
    return `${perspectiveGrid()}<div class="cover">
      <div class="cover__text">
        <div class="overline">${esc(p.overline)}</div>
        <h1 class="cover__title">${md(p.title, ctx)}</h1>
        <p class="cover__sub">${md(p.lead, ctx)}</p>
        <div class="parts">${parts}</div>
        <p class="cover__hint">${md(p.hint, ctx)}</p>
        <p class="cover__team">${md(p.team, ctx)}</p>
      </div>
      <a class="cover__shot" href="#p-${ctx.pageOf(p.shotGoto)}"><img src="${ctx.img(p.shot)}" alt="Screenshot: ${esc(shot.chapter)}"></a>
    </div>
    <p class="cover__note">${md(p.note, ctx)}</p>`;
  },

  tour(p, ctx) {
    const shot = ctx.shot(p.frame);
    const hots = shot.links
      .map((l) => {
        const to = ctx.pageOf(l.to);
        const st = `left:${(l.x * TOUR.w).toFixed(1)}px;top:${(l.y * TOUR.h).toFixed(1)}px;width:${(l.w * TOUR.w).toFixed(1)}px;height:${(l.h * TOUR.h).toFixed(1)}px`;
        return `<a class="hot hot--${l.kind}" href="#p-${to}" style="${st}" title="Go to p. ${to}"></a>`;
      })
      .join("");
    // Explain pills sit just above the top-right corner of the element they explain and jump to its Part 2 page.
    const explains = (shot.explains ?? [])
      .map((e) => `<a class="explain" href="#p-${ctx.pageOf(e.to)}" style="left:${((e.x + e.w) * TOUR.w).toFixed(1)}px;top:${(e.y * TOUR.h - 3).toFixed(1)}px">Explained · p.&nbsp;${ctx.pageOf(e.to)}</a>`)
      .join("");
    const ctl = (page, label, cls = "") => (page ? `<a class="strip__btn ${cls}" href="#p-${page}">${label}</a>` : "");
    const id = (x) => (x ? ctx.pageOf(x) : null);
    const note = p.note ? `<div class="tour__note" style="${p.note.at}">${md(p.note.text, ctx)}</div>` : "";
    return `<div class="tour__frame"><img src="${ctx.img(p.frame)}" width="${TOUR.w}" height="${TOUR.h}" alt="Screenshot: ${esc(shot.chapter)}">${hots}${explains}${note}</div>
      <div class="strip">
        ${ctl(1, "⌂", "strip__btn--home")}${ctl(ctx.index - 1, "← Back")}
        <span class="strip__part">Screenshot ${ctx.tourIndex}&thinsp;/&thinsp;${ctx.tourTotal}</span>
        <h2 class="strip__caption">${md(p.caption, ctx)}</h2>
        ${ctl(id(p.up), "↑ Scroll up")}${ctl(id(p.down), "↓ Scroll down")}
        ${ctl(id(p.why), `Explained on p. ${id(p.why)}`, "strip__btn--why")}${ctl(ctx.index + 1, "Next →", "strip__btn--next")}
      </div>`;
  },

  divider(p, ctx) {
    // The agenda: the page's own list (label → page id) or Part 2's sections.
    const items = p.agenda ? p.agenda.map(([label, id]) => ({ label, page: ctx.pageOf(id) })) : ctx.sections;
    const agenda = items.map((s, i) => `<a href="#p-${s.page}"><span>${i + 1}</span>${esc(s.label)}<em>p. ${s.page}</em></a>`).join("");
    return `<div class="divider">
      <div class="divider__text"><div class="overline overline--light">${esc(p.overline)}</div><h1>${md(p.title, ctx)}</h1><p>${md(p.lead, ctx)}</p></div>
      <nav class="divider__agenda${items.length > 5 ? " divider__agenda--long" : ""}">${agenda}</nav>
    </div>`;
  },

  exec(p, ctx) {
    const scqa = p.scqa.map(([k, v]) => `<div class="scqa__cell${k === "Answer" ? " scqa__cell--answer" : ""}"><span>${esc(k)}</span><p>${md(v, ctx)}</p></div>`).join("");
    const lines = p.lines
      .map((l, i) => `<a class="exec__line" href="#p-${ctx.pageOf(l.goto)}"><span class="exec__num">${i + 1}</span><span class="exec__head">${md(l.head, ctx)}</span><span class="exec__support">${md(l.support, ctx)}</span><span class="exec__go">p. ${ctx.pageOf(l.goto)} →</span></a>`)
      .join("");
    return chrome(p, ctx, `<div class="scqa">${scqa}</div><div class="exec">${lines}</div>`);
  },

  exhibit(p, ctx) {
    const chart = exhibits[p.chart](ctx.data.wh, ctx.data.rr);
    const legend = p.legend ? `<div class="legend">${p.legend.map(([c, t]) => `<span><i style="background:${c}"></i>${esc(t)}</span>`).join("")}</div>` : "";
    return chrome(p, ctx, `<div class="b-body"><figure class="b-exhibit"><figcaption><b>Exhibit ${ctx.exhibitNo}</b> · ${md(p.exhibitTitle, ctx)}</figcaption>${chart}${legend}</figure>${takeaway(p, ctx)}</div>`);
  },

  build(p, ctx) {
    const flow = p.flow
      .map((b) => {
        const built = (b.built ?? []).map(([when, what]) => `<li><time>${esc(when)}</time>${md(what, ctx)}</li>`).join("");
        return `<div class="flow__box"><strong>${b.logo && ctx.logo(b.logo) ? `<img src="${ctx.logo(b.logo)}" alt="">` : ""}${md(b.name, ctx)}</strong><span>${md(b.what, ctx)}</span><em>${esc(b.stack)}</em>${built ? `<ol class="flow__built">${built}</ol>` : ""}</div>`;
      })
      .join('<span class="flow__arrow">→</span>');
    const cols = p.columns.map((c) => `<div class="col"><div class="col__label">${esc(c.label)}</div>${bullets(c.items, ctx)}</div>`).join("");
    const tools = p.tools
      .map((t) => `<div class="tool">${ctx.logo(t.logo) ? `<img src="${ctx.logo(t.logo)}" alt="${esc(t.name)} logo">` : ""}<span><strong>${esc(t.name)}</strong> ${md(t.role, ctx)}</span></div>`)
      .join("");
    const label = p.flowLabel ? `<div class="col__label flow__label">${esc(p.flowLabel)}</div>` : "";
    return chrome(p, ctx, `${label}<div class="flow">${flow}</div><div class="cols">${cols}</div><div class="tools">${tools}</div>`);
  },

  closing(p, ctx) {
    const team = p.team.map((t) => `<div class="person"><strong>${esc(t.name)}</strong><span>${md(t.role, ctx)}</span></div>`).join("");
    return `<div class="closing">
      <div class="overline overline--light">${esc(p.overline)}</div>
      <h1>${md(p.title, ctx)}</h1>
      ${p.verdict ? `<p class="closing__verdict">${md(p.verdict, ctx)}</p>` : ""}
      <div class="team">${team}</div>
      <a class="repo" href="${esc(p.repo.url)}"><span>${esc(p.repo.label)}</span><strong>${esc(p.repo.url.replace(/^https:\/\//, ""))}</strong><em>${md(p.repo.note, ctx)}</em></a>
      <p class="closing__note">${md(p.note, ctx)}</p>
    </div>`;
  },
};

export function render({ doc, pages: raw, shots, img, logo = () => null, sections, data }) {
  const byId = new Map(shots.map((s) => [s.id, s]));
  const pageOf = (id) => {
    const i = raw.findIndex((p) => p.id === id || p.frame === id);
    if (i < 0) throw new Error(`unknown page ${id}`);
    return i + 1;
  };
  // "{p:id}" in any text becomes that page's number.
  const pages = JSON.parse(JSON.stringify(raw).replace(/\{p:([\w-]+)\}/g, (_, id) => String(pageOf(id))));
  const tourPages = pages.filter((p) => p.layout === "tour");
  const sectionsWithPages = sections.map((s) => ({ ...s, page: pages.findIndex((p) => p.section === s.id) + 1 }));
  const body = pages
    .map((p, i) => {
      const ctx = {
        index: i + 1,
        total: pages.length,
        tourIndex: tourPages.indexOf(p) + 1,
        exhibitNo: pages.filter((x) => x.exhibitTitle).indexOf(p) + 1,
        tourTotal: tourPages.length,
        sections: sectionsWithPages,
        pageOf,
        img,
        logo,
        data,
        shot: (id) => {
          const s = byId.get(id);
          if (!s) throw new Error(`page ${p.id}: unknown shot ${id}`);
          return s;
        },
      };
      const layout = layouts[p.layout];
      if (!layout) throw new Error(`page ${p.id}: unknown layout ${p.layout}`);
      const part = p.layout === "tour" ? "a" : ["cover", "closing"].includes(p.layout) ? "x" : "b";
      return `<section class="page page--${p.layout} part-${part}" id="p-${i + 1}" data-id="${p.id}">${layout(p, ctx)}</section>`;
    })
    .join("\n");
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>${esc(doc.title)}</title>
<meta name="author" content="${esc(doc.author)}"><meta name="description" content="${esc(doc.subject)}">
<link rel="stylesheet" href="journey.css"></head>
<body>${body}
<script>document.fonts.ready.then(() => Promise.all([...document.images].map((i) => i.decode()))).then(() => { document.body.dataset.fitted = "yes"; })</script>
</body></html>`;
}
