// Captures the journey's tour: full-screen frames of the built single-file tool, scrolled like a reader would, with
// the rectangles of every on-screen element that links to another frame, the text visible in the frame and the
// chapter's full text.
// Usage: node journey/capture/capture.mjs --final <index.html> --final-commit <sha> --v1404 <index.html> --v1404-commit <sha>
//        [--out journey/screens] [--only id,id] [--no-verify]
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { launch } from "./cdp.mjs";
import { modelFingerprintAt } from "../build/fingerprint.mjs";
import { SCALE, VIEWPORT, defHash, shots } from "./shots.mjs";

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? process.argv[i + 1] : fallback;
};
const builds = Object.fromEntries(
  ["final", "v1404"].map((b) => {
    const path = arg(b);
    return [b, path && { path: resolve(path), commit: arg(`${b}-commit`), sha256: createHash("sha256").update(readFileSync(path)).digest("hex") }];
  }),
);
const out = arg("out", "journey/screens");
const repo = resolve(new URL("../..", import.meta.url).pathname);

// Each supplied HTML must be the build of its stated commit: rebuild the commit in a temporary folder and compare
// hashes (the build is byte-reproducible). --no-verify skips this, e.g. for a quick look.
if (!process.argv.includes("--no-verify"))
  for (const [name, b] of Object.entries(builds)) {
    if (!b) continue;
    if (!b.commit) throw new Error(`--${name}-commit is required`);
    const dir = mkdtempSync(join(tmpdir(), `journey-${name}-`));
    execFileSync("sh", ["-c", `git -C "${repo}" archive "${b.commit}" dashboard | tar -x -C "${dir}"`]);
    symlinkSync(join(repo, "dashboard/node_modules"), join(dir, "dashboard/node_modules"));
    execFileSync("npx", ["vite", "build", "--outDir", join(dir, "out")], { cwd: join(dir, "dashboard"), stdio: "ignore" });
    const sha = createHash("sha256").update(readFileSync(join(dir, "out/index.html"))).digest("hex");
    rmSync(dir, { recursive: true, force: true });
    if (sha !== b.sha256) throw new Error(`--${name} is not the build of commit ${b.commit}`);
    console.log(`verified: --${name} is the build of ${b.commit}`);
  }
const only = arg("only")?.split(",");
mkdirSync(out, { recursive: true });

// Helpers injected into the page: find elements by selector and text, set React-controlled sliders (and check the
// value took), collect the text that is actually rendered inside a rectangle.
const HELPERS = `window.J = {
  q: (sel, text) => { const all = [...document.querySelectorAll(sel)]; const el = text === undefined ? all[0] : all.find((e) => e.textContent.replace(/\\s+/g, " ").includes(text)); if (!el) throw new Error("not found: " + sel + " / " + text); return el; },
  qa: (sel) => [...document.querySelectorAll(sel)],
  range: (labelText) => J.q("label", labelText).querySelector("input[type=range]"),
  set: (input, v) => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(input, String(v));
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    if (input.value !== String(v)) throw new Error("value did not take: " + v + " → " + input.value);
  },
  rect: (el) => { const r = el.getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height }; },
  text: (el) => el.textContent.replace(/\\s+/g, " ").trim(),
  // The smallest element matching selector and text (no matching child), e.g. one line instead of its card.
  leaf: (sel, text) => { const all = J.qa(sel).filter((e) => e.textContent.replace(/\\s+/g, " ").includes(text)); const el = all.find((e) => !all.some((o) => o !== e && e.contains(o))); if (!el) throw new Error("not found: " + sel + " / " + text); return el; },
  // Text that is rendered, not hidden, and lies fully inside the rectangle.
  visible: (box) => {
    const parts = [];
    const walk = document.createTreeWalker(document.querySelector("main"), NodeFilter.SHOW_TEXT);
    for (let n = walk.nextNode(); n; n = walk.nextNode()) {
      if (!n.textContent.trim() || !n.parentElement) continue;
      const cs = getComputedStyle(n.parentElement);
      if (cs.visibility !== "visible" || cs.display === "none" || Number(cs.opacity) === 0) continue;
      const range = document.createRange();
      range.selectNodeContents(n);
      const rects = [...range.getClientRects()].filter((r) => r.width > 0 && r.height > 0);
      const inside = rects.length && rects.every((r) => r.left + scrollX >= box.x - 1 && r.right + scrollX <= box.x + box.width + 1 && r.top + scrollY >= box.y - 1 && r.bottom + scrollY <= box.y + box.height + 1);
      if (inside) parts.push(n.textContent);
    }
    return parts.join(" ").replace(/\\s+/g, " ").trim();
  },
  ready: async () => { await document.fonts.ready; await Promise.all([...document.images].map((i) => i.complete || new Promise((r) => (i.onload = i.onerror = r)))); return true; },
};`;

// With --only, the other shots must come from the same builds; check before anything is overwritten.
const file = `${out}/shots.json`;
const previous = only && existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : { shots: [] };
for (const b of Object.keys(builds)) {
  const was = previous.meta?.builds?.[b]?.sha256;
  if (only && was && builds[b] && was !== builds[b].sha256) throw new Error(`build ${b} changed since the last capture: recapture all shots`);
}
// The capture code itself, so a change to how screenshots are taken invalidates the old ones; checked before anything
// is captured, like the builds above.
const captureCode = createHash("sha256").update(readFileSync(new URL(import.meta.url))).update(readFileSync(new URL("./cdp.mjs", import.meta.url))).digest("hex").slice(0, 16);
if (only && previous.meta?.captureCode && previous.meta.captureCode !== captureCode) throw new Error("the capture code changed since the last capture: recapture all shots");
// Images go to a staging folder and are published together with the manifest once every shot succeeded.
const staging = `${out}/.staging`;
rmSync(staging, { recursive: true, force: true });
mkdirSync(staging, { recursive: true });

const { session, close } = await launch({ port: 9336 });
const { send, evaluate, sleep } = session;
const meta = [];

async function goto(chapter) {
  // Leave the presentation first, then pick the chapter; "present" opens the presentation.
  await evaluate(`(() => { const exit = [...document.querySelectorAll('.nav button')].find(b => b.textContent.trim() === 'Exit'); if (exit) exit.click(); })()`);
  await sleep(300);
  const label = chapter === "present" ? "▶ Present" : chapter;
  await evaluate(`[...document.querySelectorAll('.nav button')].find(b => b.textContent.trim() === ${JSON.stringify(label)}).click()`);
  await sleep(1200);
}

try {
  await send("Page.enable");
  for (const shot of shots) {
    if (only && !only.includes(shot.id)) continue;
    const build = shot.build ?? "final";
    if (!builds[build]) throw new Error(`missing --${build}`);
    const vp = shot.viewport ?? VIEWPORT;
    await send("Emulation.setDeviceMetricsOverride", { width: vp.width, height: vp.height, deviceScaleFactor: SCALE, mobile: false });
    // A fresh page for every shot, so sliders and selections start from the base case.
    await send("Page.navigate", { url: pathToFileURL(builds[build].path).href });
    await sleep(1800);
    await evaluate(HELPERS);
    await evaluate("J.ready()");
    await goto(shot.chapter);
    for (const step of shot.steps ?? []) {
      if (step.js) await evaluate(step.js);
      await sleep(step.wait ?? 700);
    }
    // Scroll like a reader: the element just below the sticky navigation bar.
    if (shot.scroll)
      await evaluate(`(() => { const bar = document.querySelector(".topbar").getBoundingClientRect().height; const r = (${shot.scroll}).getBoundingClientRect(); window.scrollTo(0, Math.max(0, r.top + scrollY - bar - 16)); })()`);
    await sleep(500);
    // Isolate (opt-in): hide everything in the chapter except the listed elements, their ancestors and descendants.
    if (shot.isolate)
      await evaluate(`(() => {
        const keep = [${shot.isolate.join(",")}];
        for (const el of document.querySelectorAll("main *")) if (!keep.some((k) => k === el || k.contains(el) || el.contains(k))) el.style.visibility = "hidden";
      })()`);
    await evaluate("J.ready()");
    const scrollY = await evaluate("scrollY");
    const frame = { x: 0, y: scrollY, width: vp.width, height: vp.height };
    // Links: every listed element that is on screen, as a rectangle normalised to the frame.
    const links = [];
    for (const l of shot.links ?? []) {
      const r = await evaluate(`(() => { const el = ${l.el}; if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; })()`);
      if (!r || r.w < 2 || r.h < 2 || r.y + r.h <= 0 || r.y >= vp.height) continue;
      const y0 = Math.max(r.y, 0), y1 = Math.min(r.y + r.h, vp.height);
      links.push({ to: l.to, kind: l.kind, x: r.x / vp.width, y: y0 / vp.height, w: r.w / vp.width, h: (y1 - y0) / vp.height });
    }
    for (const l of shot.links ?? []) if (l.kind === "control" && !links.some((x) => x.to === l.to)) throw new Error(`${shot.id}: control link to ${l.to} is not on screen`);
    // Explain targets: the element a pill marks; it must be on screen.
    const explains = [];
    for (const e of shot.explain ?? []) {
      const r = await evaluate(`(() => { const r = (${e.el}).getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; })()`);
      if (r.y < 110 || r.y >= vp.height - 20) throw new Error(`${shot.id}: explained element for ${e.to} is not on screen`);
      // The pill (about 170 × 26 viewport px) goes above the element's top-right corner; no text may sit there.
      const covered = await evaluate(`(() => {
        const box = { l: ${r.x + r.w} - 170, r: ${r.x + r.w}, t: ${r.y} - 26, b: ${r.y} };
        const walk = document.createTreeWalker(document.querySelector("main"), NodeFilter.SHOW_TEXT);
        for (let n = walk.nextNode(); n; n = walk.nextNode()) {
          if (!n.textContent.trim() || getComputedStyle(n.parentElement).visibility !== "visible") continue;
          const range = document.createRange(); range.selectNodeContents(n);
          for (const q of range.getClientRects()) if (q.width && q.left < box.r && q.right > box.l && q.top < box.b && q.bottom > box.t) return n.textContent.trim().slice(0, 40);
        }
        return null;
      })()`);
      if (covered) throw new Error(`${shot.id}: the explain pill for ${e.to} would cover "${covered}"`);
      explains.push({ to: e.to, x: r.x / vp.width, y: r.y / vp.height, w: r.w / vp.width, h: r.h / vp.height });
    }
    const read = {};
    // What a reader can see in the frame, and the whole chapter for supporting figures.
    read.visible = await evaluate(`J.visible(${JSON.stringify(frame)})`);
    read.page = await evaluate(`J.text(document.querySelector("main"))`);
    const png = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false, clip: { ...frame, scale: 1 } });
    const file = `${shot.id}.png`;
    const bytes = Buffer.from(png.data, "base64");
    writeFileSync(`${staging}/${file}`, bytes);
    meta.push({ id: shot.id, file, sha256: createHash("sha256").update(bytes).digest("hex"), build, def: defHash(shot), chapter: shot.chapter, css: { width: vp.width, height: vp.height }, px: { width: vp.width * SCALE, height: vp.height * SCALE }, scrollY, links, explains, read });
    console.log(`${file}  scroll ${Math.round(scrollY)}  links ${links.length}`);
  }
} finally {
  close();
}

// Publish: move the staged images into place, keep the other shots' entries with --only, write the manifest.
for (const m of meta) renameSync(`${staging}/${m.file}`, `${out}/${m.file}`);
rmSync(staging, { recursive: true, force: true });
const merged = [...previous.shots.filter((p) => !meta.some((m) => m.id === p.id)), ...meta]
  .filter((s) => shots.some((d) => d.id === s.id))
  .sort((a, b) => shots.findIndex((s) => s.id === a.id) - shots.findIndex((s) => s.id === b.id));
const missing = shots.filter((d) => !merged.some((s) => s.id === d.id)).map((d) => d.id);
// Build records: the ones given now, plus the retained ones from earlier captures; every shot needs its build.
const allBuilds = { ...(previous.meta?.builds ?? {}), ...Object.fromEntries(Object.entries(builds).filter(([, v]) => v)) };
for (const s of merged) if (!allBuilds[s.build]) throw new Error(`shot ${s.id}: no record of build ${s.build}`);
// The model fingerprint of the final build's commit: the screenshots' numbers come from that code.
if (!allBuilds.final?.commit) throw new Error("--final-commit is required");
const model = modelFingerprintAt(repo, allBuilds.final.commit);
if (only && previous.meta?.model && previous.meta.model !== model) throw new Error("the model changed since the last capture: recapture all shots");
writeFileSync(file, JSON.stringify({ meta: { capturedAt: new Date().toISOString(), scale: SCALE, viewport: VIEWPORT, builds: allBuilds, model, captureCode, missing }, shots: merged }, null, 1));
if (missing.length) console.log(`missing shots: ${missing.join(", ")}`);
