// Builds the screenshot journey: HTML pages → PDF (tagged, bookmarks from the visible headings, internal links) and
// one PNG per PDF page, then checks it. Errors (exit 1, PDF saved as *.FAILED.pdf): a stale or missing capture, a
// model that differs from the captured commit, failing tests, layout overflow or overlapping hotspots, a caption
// figure that the tool, the repo stats or the model re-run cannot back, PDF over 10 MB, wrong page count or size,
// fonts not embedded, a link in the HTML that is missing or points elsewhere in the PDF, too few bookmarks.
// The PDF gets its final name only after every check passed.
// Usage: node journey/build/build.mjs [--name file-stem]
import { execFileSync, execSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { launch } from "../capture/cdp.mjs";
import { defHash, shots as shotDefs } from "../capture/shots.mjs";
import { doc, pages, sections } from "../content/pages.mjs";
import { keys, tokens } from "./audit.mjs";
import { modelFingerprint } from "./fingerprint.mjs";
import { render } from "./render.mjs";
import { stats } from "./stats.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const repo = resolve(root, "..");
const out = join(root, "out");
const name = process.argv.includes("--name") ? process.argv[process.argv.indexOf("--name") + 1] : doc.file;
const MAX_MB = 10;
const errors = [];
const warnings = [];

// --- Inputs: captures, model, tests, re-run.
const captured = JSON.parse(readFileSync(join(root, "screens/shots.json"), "utf8"));
const shots = captured.shots;
if (captured.meta.missing?.length) errors.push(`capture: missing shots ${captured.meta.missing.join(", ")}`);
for (const d of shotDefs) {
  const s = shots.find((x) => x.id === d.id);
  if (!s) errors.push(`capture: shot ${d.id} not captured`);
  else if (s.def !== defHash(d)) errors.push(`capture: shot ${d.id} changed after it was captured; recapture it`);
  else if (s.sha256 !== createHash("sha256").update(readFileSync(join(root, "screens", s.file))).digest("hex")) errors.push(`capture: ${s.file} is not the image that was captured`);
}
const captureCode = createHash("sha256").update(readFileSync(join(root, "capture/capture.mjs"))).update(readFileSync(join(root, "capture/cdp.mjs"))).digest("hex").slice(0, 16);
if (captured.meta.captureCode !== captureCode) errors.push("capture: the capture code changed after the screenshots were taken; recapture");
if (captured.meta.model !== modelFingerprint(repo)) errors.push("capture: the working tree's model, state or data differ from the commit the screenshots were built from");

const st = stats(repo, captured.meta.builds.final.commit);
let tests;
try {
  tests = JSON.parse(execSync("npx vitest run --reporter=json --silent 2>/dev/null", { cwd: join(repo, "dashboard"), encoding: "utf8" }));
} catch (e) {
  // Any non-zero exit fails the build, whatever the JSON says.
  errors.push(`tests: vitest exited with code ${e.status}`);
  tests = JSON.parse(e.stdout || '{"numPassedTests":0,"numFailedTests":1}');
}
st.testsPassed = tests.numPassedTests;
if (!tests.success || tests.numFailedTests || tests.numFailedTestSuites || tests.numPassedTests !== tests.numTotalTests) errors.push(`tests: not all passing (${tests.numPassedTests} of ${tests.numTotalTests})`);
const rr = JSON.parse(execSync("npx vite-node ../journey/build/rerun.ts", { cwd: join(repo, "dashboard"), encoding: "utf8" }).trim().split("\n").pop());
const wh = JSON.parse(readFileSync(join(repo, "dashboard/src/data/warehouse.json"), "utf8"));

// --- Assets and HTML. Screenshots stay PNG: lossless, and for flat UI screens smaller in the PDF than JPEG.
rmSync(out, { recursive: true, force: true });
mkdirSync(join(out, "img"), { recursive: true });
cpSync(join(here, "journey.css"), join(out, "journey.css"));
cpSync(join(here, "fonts"), join(out, "fonts"), { recursive: true });
for (const s of shots) cpSync(join(root, "screens", s.file), join(out, "img", s.file));
// Logos (build/logos): app icons of the installed apps, the Codex icon from openai.com/codex; a missing one is drawn as a monogram tile.
cpSync(join(here, "logos"), join(out, "logos"), { recursive: true });
const logo = (id) => (existsSync(join(here, "logos", `${id}.png`)) ? `logos/${id}.png` : null);
writeFileSync(join(out, "rerun.json"), JSON.stringify(rr, null, 1));
const html = render({ doc, pages, shots, sections, logo, data: { wh, rr }, img: (id) => `img/${id}.png` });
writeFileSync(join(out, "journey.html"), html);

// --- Render, lint, print. The PDF keeps a provisional name until every check has passed.
const finalPath = join(out, `${name}.pdf`);
const pdfPath = join(out, `${name}.unchecked.pdf`);
let declared = [];
const { session, close } = await launch({ port: 9337 });
const { send, evaluate, sleep } = session;
try {
  await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });
  await send("Page.navigate", { url: pathToFileURL(join(out, "journey.html")).href });
  // The page may still be navigating on the first polls; an evaluation error then just means "not ready yet".
  const fitted = () => evaluate("document.body?.dataset.fitted").catch(() => null);
  for (let i = 0; i < 60 && (await fitted()) !== "yes"; i++) await sleep(100);
  if ((await evaluate("document.body.dataset.fitted")) !== "yes") errors.push("layout: fonts or images did not load");
  // Each family must have at least one face loaded (unused weights are never fetched).
  const fontsOk = await evaluate(`(() => { const loaded = [...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family.replace(/"/g, "")); return ["Manrope", "Inter", "DM Mono"].every((f) => loaded.includes(f)); })()`);
  if (!fontsOk) errors.push("fonts: Manrope, Inter or DM Mono did not load");

  // Layout lint. Every page: nothing outside the page box; on Part 2 pages nothing runs into the footer; text not
  // clipped in its box. Tour pages: hotspots do not overlap and lie inside the screenshot.
  const lint = await evaluate(`[...document.querySelectorAll('.page')].map((p) => {
    const box = p.getBoundingClientRect();
    const isTour = p.classList.contains('page--tour');
    const foot = p.querySelector('.b-foot');
    const limit = foot ? foot.getBoundingClientRect().top : box.bottom;
    const els = [...p.querySelectorAll('*')].filter((el) => el.getClientRects().length && !el.closest('.b-foot') && !el.closest('.strip') && !el.matches('.hot') && !el.closest('.cover__grid'));
    const outside = els.filter((el) => { const r = el.getBoundingClientRect(); return r.right > box.right + 0.5 || r.left < box.left - 0.5 || r.top < box.top - 0.5 || r.bottom > (isTour ? box.bottom : limit) + 0.5; }).map((el) => el.className.baseVal ?? el.className ?? el.tagName);
    const clipped = [...p.querySelectorAll('.b-title, .b-lead, ul.dash li, .scqa__cell p, .strip__caption, .b-table td, .gate strong, .tool span')].filter((el) => el.scrollHeight > el.clientHeight + 1 || (el.classList.contains('strip__caption') && el.scrollWidth > el.clientWidth + 1)).map((el) => el.className || el.tagName);
    const hots = [...p.querySelectorAll('.hot, .explain')].map((h) => h.getBoundingClientRect());
    // Blurred shadows and filters become soft-masked images that Preview draws as grey boxes.
    const blurred = [...p.querySelectorAll('*')].filter((el) => { const cs = getComputedStyle(el); return (cs.boxShadow !== 'none' && /\d+px \d+px [1-9]/.test(cs.boxShadow.replace(/rgba?\([^)]*\)\s*/g, ''))) || cs.filter !== 'none'; }).map((el) => el.className || el.tagName);
    const overlap = hots.some((a, i) => hots.some((b, j) => j > i && a.left < b.right - 1 && a.right > b.left + 1 && a.top < b.bottom - 1 && a.bottom > b.top + 1));
    const links = [...p.querySelectorAll('a[href]')].map((a) => a.getAttribute('href'));
    return { id: p.dataset.id, outside: [...new Set(outside)].slice(0, 6), clipped: [...new Set(clipped)].slice(0, 4), overlap, blurred: [...new Set(blurred)].slice(0, 4), links };
  })`);
  for (const l of lint) {
    if (l.outside.length) errors.push(`layout ${l.id}: outside the page or into the footer: ${l.outside.join(", ")}`);
    if (l.clipped.length) errors.push(`layout ${l.id}: text clipped: ${l.clipped.join(", ")}`);
    if (l.overlap) errors.push(`layout ${l.id}: hotspots overlap`);
    if (l.blurred.length) errors.push(`layout ${l.id}: blurred shadow or filter (Preview shows a grey box): ${l.blurred.join(", ")}`);
  }
  declared = lint.map((l) => l.links);

  const pdf = await send("Page.printToPDF", { printBackground: true, preferCSSPageSize: true, marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0, generateDocumentOutline: true, generateTaggedPDF: true });
  writeFileSync(pdfPath, Buffer.from(pdf.data, "base64"));
} finally {
  close();
}

let report;
try {
  // --- PDF acceptance: size, pages, page size, fonts; every declared link present with the right target; bookmarks.
  const info = execFileSync("pdfinfo", [pdfPath], { encoding: "utf8" });
  const mb = statSync(pdfPath).size / 1e6;
  const pageCount = Number(/Pages:\s+(\d+)/.exec(info)?.[1]);
  const pageSize = /Page size:\s+([\d.]+) x ([\d.]+)/.exec(info);
  if (mb > MAX_MB) errors.push(`pdf: ${mb.toFixed(1)} MB, limit ${MAX_MB} MB`);
  if (pageCount !== pages.length) errors.push(`pdf: ${pageCount} pages, expected ${pages.length}`);
  if (!pageSize || Math.abs(Number(pageSize[1]) - 960) > 1 || Math.abs(Number(pageSize[2]) - 540) > 1) errors.push(`pdf: page size ${pageSize?.[0]}, expected 960 x 540 pts (13.333 × 7.5 in)`);
  const fonts = execFileSync("pdffonts", [pdfPath], { encoding: "utf8" }).split("\n").slice(2).filter(Boolean);
  const notEmbedded = fonts.filter((l) => l.split(/\s+/).slice(-5, -4)[0] !== "yes");
  if (!fonts.length) errors.push("pdf: no fonts found");
  if (notEmbedded.length) errors.push(`pdf: fonts not embedded: ${notEmbedded.map((l) => l.split(/\s+/)[0]).join(", ")}`);

  const back = JSON.parse(execFileSync("uv", ["run", "--quiet", "--with", "pypdf", "python", join(here, "pdfcheck.py"), pdfPath], { encoding: "utf8" }));
  const sort = (a) => [...a].sort((x, y) => String(x).localeCompare(String(y)));
  let internal = 0;
  declared.forEach((links, i) => {
    const wantIn = sort(links.filter((h) => h.startsWith("#p-")).map((h) => Number(h.slice(3))));
    const wantOut = sort(links.filter((h) => /^https?:/.test(h)));
    const got = back.pages[i] ?? { internal: [], external: [] };
    internal += got.internal.length;
    if (JSON.stringify(sort(got.internal)) !== JSON.stringify(wantIn)) errors.push(`links page ${i + 1}: PDF has ${got.internal.length} internal links ${JSON.stringify(sort(got.internal))}, HTML declares ${JSON.stringify(wantIn)}`);
    if (JSON.stringify(sort(got.external)) !== JSON.stringify(wantOut)) errors.push(`links page ${i + 1}: external links differ`);
  });
  if (back.bookmarks < pages.length - 2) errors.push(`pdf: only ${back.bookmarks} bookmarks for ${pages.length} pages`);
  mkdirSync(join(out, "pages"), { recursive: true });
  execFileSync("pdftoppm", ["-png", "-r", "144", pdfPath, join(out, "pages", "page")]);

  // --- Number audit: every figure in the text is backed by the tool as captured, the repo stats or the re-run.
  const merge = (...sets) => new Set(sets.flatMap((x) => [...x]));
  const flat = [];
  JSON.stringify(rr, (k, v) => (typeof v === "number" && flat.push({ k, v }), v));
  const derived = new Set(
    flat.flatMap(({ k, v }) => {
      const n = `${v < 0 ? "-" : ""}${Math.abs(v)}`;
      return /Pct$/.test(k) ? [`${n}%`] : /M$/.test(k) ? [`${n}€M`] : [n];
    }),
  );
  const statBare = new Set(Object.values(st).map(String));
  const toolAll = merge(...shots.map((x) => keys(Object.values(x.read).join(" "))));
  const SKIP = ["id", "frame", "goto", "last", "up", "down", "why", "tool", "layout", "section", "allow", "file", "chart", "shot", "shotGoto", "kind", "at", "url", "legend"];
  for (const p of pages) {
    const visible = p.frame ? keys(shots.find((x) => x.id === p.frame)?.read.visible ?? "") : new Set();
    const allow = new Set((p.allow ?? []).flatMap((a) => [...keys(a)]));
    const text = JSON.stringify(p, (k, v) => (SKIP.includes(k) ? undefined : v)).replace(/\]\((https?:|#)[^)]+\)/g, "]");
    for (const t of tokens(text)) {
      if (!t.unit && t.bare && /^\d$/.test(t.bare)) continue; // single digits without a unit: counts in prose
      const fromStats = t.bare !== null && statBare.has(t.bare);
      const backed = toolAll.has(t.key) || derived.has(t.key) || fromStats || allow.has(t.key);
      if (!backed) errors.push(`numbers ${p.id}: "${t.raw}" is backed by neither the tool, the stats nor the model re-run`);
      else if (p.frame && !visible.has(t.key) && !derived.has(t.key) && !allow.has(t.key) && !fromStats) warnings.push(`numbers ${p.id}: "${t.raw}" is not visible on this frame`);
    }
  }
  report = { name, pages: pages.length, pdfMB: +mb.toFixed(2), links: { internal, external: [...new Set(back.pages.flatMap((p) => p.external))] }, bookmarks: back.bookmarks, stats: st, builds: captured.meta.builds };
} catch (e) {
  errors.push(`build: ${e.message.split("\n")[0]}`);
}

report = { ...(report ?? { name }), errors, warnings: [...new Set(warnings)] };
writeFileSync(join(out, "build-report.json"), JSON.stringify(report, null, 1));
if (report.stats) console.log(`${name}.pdf: ${report.pages} pages, ${report.pdfMB} MB, ${report.links.internal} internal and ${report.links.external.length} external links, ${report.bookmarks} bookmarks, ${report.stats.testsPassed} tests passing`);
for (const w of report.warnings) console.log(`  ~ ${w}`);
for (const e of errors) console.log(`  ! ${e}`);
if (errors.length) {
  if (existsSync(pdfPath)) renameSync(pdfPath, finalPath.replace(/\.pdf$/, ".FAILED.pdf"));
  process.exit(1);
}
renameSync(pdfPath, finalPath);

// Overview: all pages on one sheet, from the PNGs rasterised from the PDF.
const thumbs = readdirSync(join(out, "pages")).filter((f) => f.endsWith(".png")).sort();
writeFileSync(join(out, "overview.html"), `<html><body style="margin:0;padding:24px;background:#e9ecf1;font:12px system-ui"><div style="display:grid;grid-template-columns:repeat(6,1fr);gap:14px">${thumbs.map((f, i) => `<figure style="margin:0"><img src="pages/${f}" style="width:100%;display:block;border-radius:5px;box-shadow:0 2px 8px rgba(0,0,0,.15)"><figcaption style="margin-top:5px;color:#4a546c">${i + 1}</figcaption></figure>`).join("")}</div></body></html>`);
const sheet = await launch({ port: 9338 });
try {
  await sheet.session.send("Page.enable");
  await sheet.session.send("Emulation.setDeviceMetricsOverride", { width: 2400, height: 1000, deviceScaleFactor: 1, mobile: false });
  await sheet.session.send("Page.navigate", { url: pathToFileURL(join(out, "overview.html")).href });
  await sheet.session.sleep(2500);
  const { cssContentSize } = await sheet.session.send("Page.getLayoutMetrics");
  const png = await sheet.session.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: 0, y: 0, width: 2400, height: Math.ceil(cssContentSize.height), scale: 1 } });
  writeFileSync(join(out, "overview.png"), Buffer.from(png.data, "base64"));
} finally {
  sheet.close();
  rmSync(join(out, "overview.html"), { force: true });
}
console.log("  all checks passed");
