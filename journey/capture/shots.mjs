// The journey's screenshots: full-screen frames of the tool (Part 1, the click-through tour). Each frame: which build
// and chapter, steps to reach the state, where to scroll, and links: elements on screen that jump to another frame
// in the PDF, like clicking them in the tool. Element expressions run in the page with the helpers J.q(selector,
// text?), J.qa(selector), J.leaf(selector, text), J.range(labelText), J.set(input, value).
import { createHash } from "node:crypto";

// A shot's definition fingerprint; the build refuses screenshots whose definition changed after capture.
export const VIEWPORT = { width: 1440, height: 783 }; // fills 1280 × 696 on the page, above the 24 px caption strip
export const SCALE = 2;
export const defHash = (shot) => createHash("sha256").update(JSON.stringify({ shot, VIEWPORT, SCALE })).digest("hex").slice(0, 16);

const click = (expr, wait) => ({ js: `${expr}.click()`, wait });
const slide = (label, value, wait) => ({ js: `J.set(J.range(${JSON.stringify(label)}), ${value})`, wait });
const button = (sel, text) => `J.qa(${JSON.stringify(sel)}).find((b) => b.textContent.trim() === ${JSON.stringify(text)})`;

// The navigation bar is on every frame; each button jumps to its chapter's first frame.
const NAV = {
  "Q1 · Reach": "t-q1",
  "Q2 · Growth": "t-q2",
  "Q3 · Sites": "t-q3",
  Q4: "t-q4",
  Scenarios: "t-sc",
  Spaceports: "t-sp",
  Rockets: "t-rk",
  "Fact base": "t-fb",
  "▶ Present": "t-present",
  Exit: "t-q1",
};
const nav = Object.entries(NAV).map(([label, to]) => ({ el: button(".nav button", label), to, kind: "nav" }));
const link = (el, to) => ({ el, to, kind: "control" });

const tiers = (self) =>
  [
    ["Global launch demand", "t-q1-tiers"],
    ["Serviceable from Andøya", "t-q1-sam"],
    ["Obtainable by Isar", "t-q1-som"],
  ]
    .filter(([, to]) => to !== self)
    .map(([text, to]) => link(`J.q(".tiers button", ${JSON.stringify(text)})`, to));

const scenarioToggles = (self) =>
  [
    ["Bear", "t-sc-bear"],
    ["ASCENT (base)", "t-sc"],
    ["Bull", "t-sc-bull"],
  ]
    .filter(([, to]) => to !== self)
    .map(([text, to]) => link(button(".toolbar .toggle button", text), to));

export const shots = [
  {
    id: "t-present",
    chapter: "present",
    links: nav,
    explain: [
      { el: `J.q(".present__kpis")`, to: "b-economics" },
      { el: `J.q(".present__list > p.caption")`, to: "b-exec" },
    ],
  },
  { id: "t-q1", chapter: "Q1 · Reach", links: nav },
  { id: "t-q1-tiers", chapter: "Q1 · Reach", scroll: `J.q(".q1-main .toolbar")`, links: [...nav, ...tiers("t-q1-tiers")] },
  {
    id: "t-q1-sam",
    chapter: "Q1 · Reach",
    steps: [click(`J.q(".tiers button", "Serviceable from Andøya")`, 900)],
    scroll: `J.q(".drill")`,
    links: nav,
  },
  {
    id: "t-q1-som",
    chapter: "Q1 · Reach",
    steps: [click(`J.q(".tiers button", "Obtainable by Isar")`, 900)],
    scroll: `J.q(".drill")`,
    links: nav,
  },
  { id: "t-q2", chapter: "Q2 · Growth", scroll: `J.q("p.answer")`, links: nav },
  { id: "t-q2-fields", chapter: "Q2 · Growth", scroll: `J.q(".toolbar", "Expansion fields")`, links: nav },
  { id: "t-q2-fields-2", chapter: "Q2 · Growth", scroll: `J.q(".fields-table tbody tr", "Building satellites")`, links: nav },
  { id: "t-q3", chapter: "Q3 · Sites", links: nav, explain: [{ el: `J.q("p.answer")`, to: "b-exec" }] },
  { id: "t-q3-portfolio", chapter: "Q3 · Sites", scroll: `J.q(".card.canada")`, links: nav },
  { id: "t-q3-nodes", chapter: "Q3 · Sites", scroll: `J.q(".nodes")`, links: nav },
  { id: "t-q3-nodes-2", chapter: "Q3 · Sites", scroll: `J.q(".node", "Guiana Space Centre")`, links: nav },
  {
    // Q4 only exists in the build of 22 Oct, 14:04: its presentation page carried the shock lever. Everything on that
    // page except the lever card and the shock card is hidden, because its headline predates the final verdict.
    id: "t-q4",
    build: "v1404",
    chapter: "present",
    steps: [slide("Q4 shock", 12, 900)],
    isolate: [`J.qa(".present .card").find((c) => c.textContent.includes("Five assumptions to test"))`, `J.qa(".present .card").find((c) => c.textContent.includes("Andøya closed, Nova Scotia only Canadian"))`],
    links: nav,
    explain: [{ el: `J.qa(".present .card").find((c) => c.textContent.includes("Andøya closed, Nova Scotia only Canadian"))`, to: "b-economics" }],
  },
  {
    id: "t-sc",
    chapter: "Scenarios",
    scroll: `J.q("p.answer")`,
    links: [...nav, ...scenarioToggles("t-sc"), link(`J.q("label", "Frame-contract launches")`, "t-sc-six")],
    explain: [{ el: `J.qa(".scenario-chart__panel")[1]`, to: "b-economics" }],
  },
  {
    id: "t-sc-six",
    chapter: "Scenarios",
    steps: [slide("Frame-contract launches", 6, 900)],
    scroll: `J.q("p.answer")`,
    links: [...nav, link(button("button", "Back to base"), "t-sc")],
    explain: [{ el: `J.q("label", "Frame-contract launches")`, to: "b-economics" }],
  },
  { id: "t-sc-bear", chapter: "Scenarios", steps: [click(button(".toolbar .toggle button", "Bear"), 900)], scroll: `J.q("p.answer")`, links: [...nav, ...scenarioToggles("t-sc-bear")] },
  { id: "t-sc-bull", chapter: "Scenarios", steps: [click(button(".toolbar .toggle button", "Bull"), 900)], scroll: `J.q("p.answer")`, links: [...nav, ...scenarioToggles("t-sc-bull")] },
  { id: "t-sc-pnl", chapter: "Scenarios", scroll: `J.q(".card.pnl")`, links: nav },
  { id: "t-sp", chapter: "Spaceports", steps: [click(`J.q(".seg button", "Same rockets as")`, 900)], scroll: `J.q(".toolbar")`, links: nav },
  { id: "t-sp-detail", chapter: "Spaceports", scroll: `J.q(".site-detail")`, links: nav },
  { id: "t-rk", chapter: "Rockets", links: nav },
  { id: "t-fb", chapter: "Fact base", links: nav, explain: [{ el: `J.q("p.lead")`, to: "b-build" }] },
];
