// The journey's content, rendered to the PDF by build/build.mjs. Part 1 is the tool tour (one page per captured
// frame, see capture/shots.mjs); Part 2 explains the case in consulting format, with exhibits drawn from the
// warehouse (build/exhibits.mjs). Every figure in the text is audited against the tool's captured text, the repo
// stats and the model re-run (build/rerun.ts); `allow` is only for dates, times and one log count.
// Markup: **bold**, *italic*, [text](https://…), [text](#page-id), {p:page-id} for a page number.

export const doc = {
  title: "Expansion Navigator · Screenshot journey",
  author: "Benedikt Supper, Luca Marie Repa, Nils Wagner",
  subject: "Isar Aerospace expansion case, SSCO AI Hackathon, Stern Stewart & Co., 21–22 Oct 2026",
  file: "SSCO-AI-Hackathon_Isar-Aerospace_Screenshot-Journey_Team-Benedikt-Luca-Nils",
};

// Part 2's tracker.
export const sections = [
  { id: "answer", label: "Answer" },
  { id: "economics", label: "Economics" },
  { id: "build", label: "How we worked" },
  { id: "team", label: "Team" },
];

const DATES = ["21–22", "2026", "22", "15:03", "14:04", "2024", "2025"];
const REPO = "https://github.com/wagner-nils/stern-hackathon";

// Part 1: the tour, in reading order. `why` points to the Part 2 page behind the screen.
const tour = [
  {
    frame: "t-present",
    caption: "**▶ Present** · the tool's answer page. Click the navigation above to move through the tool.",
    why: "b-exec",
    note: {
      at: "left:56px;top:588px;width:1168px;padding:10px 16px",
      text: "**Re-checked after the final:** the 80 % include the signed ESA programme (54 % without it); “1.2 of 8” is modelled from flown demand, not a count of bookings; “about 21 launches” uses the 2030 cost per flight (15 to 17 on the cost curve); the €270 M Series D is past funding, not available cash; with the Kourou fee break-even moves to 2039.",
    },
  },
  { frame: "t-q1", caption: "**Q1 · Reach** · what share of global launch demand Isar can serve from Andøya", down: "t-q1-tiers", why: "b-exec" },
  { frame: "t-q1-tiers", caption: "**Q1** · click a tier (TAM, SAM, SOM) to see what narrows it; every assumption has a slider, an owner and sources", up: "t-q1", why: "b-exec" },
  { frame: "t-q1-sam", caption: "**Q1 · SAM in detail** · open to Isar, fits on Spectrum, orbit reachable from Andøya: 422 satellites", up: "t-q1-tiers", why: "b-exec" },
  { frame: "t-q1-som", caption: "**Q1 · SOM in detail** · buys a dedicated launch, chooses Isar, Spectrum can fly it: 13 satellites", up: "t-q1-tiers", why: "b-exec" },
  { frame: "t-q2", caption: "**Q2 · Growth** · the launch gap and the strategy ASCENT", down: "t-q2-fields", why: "b-exec" },
  { frame: "t-q2-fields", caption: "**Q2** · 13 growth fields with revenue, gross profit and an EVA proxy, ranked (rows 1–8)", up: "t-q2", down: "t-q2-fields-2", why: "b-exec" },
  { frame: "t-q2-fields-2", caption: "**Q2** · the rest of the 13 fields and the portfolio totals; click a row in the tool for its calculation", up: "t-q2-fields", why: "b-exec" },
  { frame: "t-q3", caption: "**Q3 · Sites** · the launches each site and the plant have to carry", down: "t-q3-portfolio", why: "b-exec" },
  { frame: "t-q3-portfolio", caption: "**Q3** · build in Canada or ship? Questions for management", up: "t-q3", down: "t-q3-nodes", why: "b-exec" },
  { frame: "t-q3-nodes", caption: "**Q3** · every site with today's role, our proposal and its trigger: plant, test site, Andøya", up: "t-q3-portfolio", down: "t-q3-nodes-2", why: "b-exec" },
  { frame: "t-q3-nodes-2", caption: "**Q3** · Kourou and Nova Scotia only with a trigger; no plant in Canada for now", up: "t-q3-nodes", why: "b-exec" },
  {
    frame: "t-q4",
    caption: "**Q4 · Shock** · Andøya closed for a year (view from the build of 22 Oct, 14:04)",
    why: "b-economics",
    note: {
      at: "left:56px;top:250px",
      text: "**Q4 · The shock.** Norway closes the sea and air space around Andøya; Canada reserves Nova Scotia for Canadian payloads. Shown: the shock lever set to a full year and its result. From the build of 22 Oct, 14:04; the rest of that page is omitted.",
    },
  },
  { frame: "t-sc", caption: "**Scenarios** · click Bear or Bull, or the frame-contract lever; revenue and operating profit 2027–2040", down: "t-sc-pnl", why: "b-economics" },
  { frame: "t-sc-six", caption: "**Scenarios** · 6 frame-contract launches a year instead of 2: profitable from 2034. *Back to base* returns.", why: "b-economics" },
  { frame: "t-sc-bear", caption: "**Scenarios · Bear** · today's flown demand only, no readiness contract; assumes Nova Scotia is not taken up and costs no fee", why: "b-economics" },
  { frame: "t-sc-bull", caption: "**Scenarios · Bull** · security budgets turn into contracts; from 2036 it needs more Andøya pads than proposed, not costed", why: "b-economics" },
  { frame: "t-sc-pnl", caption: "**Scenarios** · the full P&L 2027–2040 of the base case ASCENT", up: "t-sc", why: "b-economics" },
  { frame: "t-sp", caption: "**Spaceports** · 56 spaceports; highlighted: where Spectrum flies or is planned", down: "t-sp-detail", why: "b-exec" },
  { frame: "t-sp-detail", caption: "**Spaceports** · Andøya in detail: reach, launch cap, fleet, launches by year", up: "t-sp", why: "b-exec" },
  { frame: "t-rk", caption: "**Rockets** · who launches, and with what: 330 orbital launch attempts in 2025", why: "b-exec" },
  { frame: "t-fb", caption: "**Fact base** · every number with its source: 83 facts, 33 assumptions, 242 sources", why: "b-build" },
].map((t) => ({ id: t.frame, layout: "tour", allow: DATES, ...t }));

export const pages = [
  {
    id: "cover",
    layout: "cover",
    overline: "SSCO AI Hackathon · Stern Stewart & Co. · 21–22 Oct 2026",
    title: "Expansion Navigator: **a screenshot journey**",
    lead: "Our decision tool for the Isar Aerospace case, screen by screen.",
    parts: [
      { num: "1", name: "The tool, screen by screen", what: "22 screenshots of the final build, clickable like the tool", goto: "p1-divider", last: "t-fb" },
      { num: "2", name: "The case behind the screens", what: "Our recommendation to SSVE, in consulting format", goto: "b-divider", last: "closing" },
    ],
    hint: "Read straight through, or click like in the tool.",
    team: "Benedikt Supper · Luca Marie Repa · Nils Wagner",
    shot: "t-present",
    shotGoto: "t-present",
    note: "Case exercise for Stern Stewart & Co. Team estimates, not Isar data or investment advice. Contains participant-only material.",
    allow: DATES,
  },
  {
    id: "p1-divider",
    layout: "divider",
    overline: "Part 1",
    title: "The tool, **screen by screen**",
    lead: "22 screenshots of the final build, in the order we clicked through it. Turn the pages, or click the navigation, tiers and toggles as in the tool.",
    agenda: [
      ["▶ Present: the answer", "t-present"],
      ["Q1 · Reach", "t-q1"],
      ["Q2 · Growth", "t-q2"],
      ["Q3 · Sites", "t-q3"],
      ["Q4 · Shock", "t-q4"],
      ["Scenarios", "t-sc"],
      ["Spaceports", "t-sp"],
      ["Rockets", "t-rk"],
      ["Fact base", "t-fb"],
    ],
  },
  ...tour,
  {
    id: "b-divider",
    layout: "divider",
    overline: "Part 2",
    title: "The case **behind the screens**",
    lead: "Three pages on what a screenshot cannot show: the argument in one page, the economics, and how we worked.",
  },
  {
    id: "b-exec",
    layout: "exec",
    section: "answer",
    sticker: "Executive summary",
    title: "Do not commit on today's evidence: **reopen diligence at three dated gates**",
    scqa: [
      ["Situation", "Isar flies Spectrum from Andøya, its only spaceport, and looks for more production and launch sites."],
      ["Complication", "From Andøya it reaches 9.3 % of the satellites launched but only 0.66 % of their mass; demand, not capacity, sets the limit."],
      ["Question", "Should SSVE back Isar's expansion now, and on which strategy?"],
      ["Answer", "**Not on today's evidence.** The strategy is right (ASCENT), the entry point is not yet: even if it works, operating break-even comes only in 2038. Reopen diligence at three dated gates."],
    ],
    lines: [
      { head: "From Andøya, Isar serves a polar niche: demand, not capacity, is the limit", support: "422 of 4,521 satellites reachable; Isar wins about 13 (€10 M) a year", goto: "t-q1-som" },
      { head: "Pursue five of 13 growth fields, chosen on EVA proxy and strategic fit: grow through contracts", support: "€88.1 M revenue and +€28.8 M EVA proxy in 2030 from the fields we recommend, before the €60 M shared R&D and overhead; four on the no-go list", goto: "t-q2-fields" },
      { head: "One plant, one core spaceport, one sovereign option, and a fallback outside the Arctic", support: "The plant stays under a third full; Nova Scotia only with an anchor, Kourou if Andøya closes", goto: "t-q3" },
      { head: "The economics do not carry the fixed cost before the late 2030s", support: "2030: €43 M gross profit − €78.4 M fixed cost and site fees = −€35 M; €392 M cumulative operating loss before break-even in 2038 (€445 M and 2039 with the Kourou fee)", goto: "b-economics" },
      { head: "Three dated gates turn the no into a plan", support: "2027: 3 of 4 flights reach orbit · by 2029: a European state pays for launch readiness · by 2029: frame contracts for at least 2 launches a year beyond today's demand. The gates prove the base case; the contract book decides the yes (6 a year: break-even 2034)", goto: "t-present" },
    ],
    source: "Base case ASCENT, real 2026 euros, operating result as EBIT proxy before depreciation. Source: fact warehouse (SQL views v_q1_funnel, v_q2_expansion_fields, v_scenarios), team analysis.",
    tool: "t-present",
  },
  {
    id: "b-economics",
    layout: "exhibit",
    section: "economics",
    sticker: "Economics",
    title: "Even if ASCENT works, break-even comes only in 2038: **signed contracts and paid readiness move it most**",
    exhibitTitle: "Operating break-even year with one lever at each end of its range, everything else at base *(labels: better end / worse end)*",
    chart: "tornado",
    legend: [["#095edd", "earlier break-even (better end)"], ["#b3261e", "later or none (worse end)"]],
    takeaways: [
      "**Base case 2030:** €152 M revenue (€88.1 M recommended fields + €24 M frame contracts + €36 M Nova Scotia anchors + €4.1 M commercial), −€35 M operating result; ESA ends in 2030, −€44 M in 2031",
      "**€392 M** cumulative operating loss before break-even in 2038; €445 M and 2039 with the Kourou fee",
      "**Contracts:** 6 frame-contract launches a year instead of 2 bring break-even to 2034",
      "**Costs:** €90 M fixed cost, or Spectrum at 2.0× Electron's cost, mean no break-even by 2040",
    ],
    implication: "Ask for signed frame contracts and a paid readiness deal, not for a second pad: they move the verdict most.",
    source: "Operating result: EBIT proxy before depreciation; €392 M is before capex and financing, not a funding need. Source: SQL view v_scenarios; levers re-run on the tool's model, ranges from the assumption register.",
    tool: "t-sc",
  },
  {
    id: "b-build",
    layout: "build",
    section: "build",
    sticker: "How we worked",
    title: "Agent-first, but no AI slop: **agents built and checked, the team decided, the tool runs no AI**",
    lead: "The same inputs always give the same figures, and every figure traces back to SQL and a source.",
    // Each part of the pipeline with the commits that built it (git log of phase/final, local time).
    flowLabel: "The pipeline, and when we built each part: 48 commits in 24 hours",
    flow: [
      { name: "Sources", what: "242 sources; GCAT: 7,361 satellites, 838 launches", stack: "Python pipeline", built: [["21 Oct 16:15", "demand bottom-up from GCAT"], ["18:36", "expert Q&A notes"], ["22 Oct 07:36", "register of 56 spaceports"]] },
      { name: "Fact warehouse", logo: "supabase", what: "83 facts, 33 assumptions, 13 tables, 15 SQL views", stack: "Supabase · Postgres", built: [["22 Oct 06:42", "schema and sourced seeds"], ["08:42", "Q2 strategy ASCENT"], ["11:12", "Q2 growth fields"], ["11:40", "Q3 site portfolio"]] },
      { name: "Snapshot", what: "CSV mirror in git, typed JSON for the tool", stack: "uv · psycopg", built: [["22 Oct 06:42", "export to CSV and JSON"]] },
      { name: "Model", what: "pure functions for Q1–Q4 and the P&L; 31 tests", stack: "TypeScript 5.6 · Vitest 2.1", built: [["21 Oct 15:08", "orbit and funnel model, first tests"], ["22 Oct 13:43", "P&L scenarios"], ["14:04", "Q4 shock"]] },
      { name: "Tool", what: "8 chapters and the Present page in one offline file", stack: "React 18.3 · Vite 5.4", built: [["21 Oct 15:08", "scaffold"], ["22 Oct 07:03", "Q1 on the warehouse"], ["11:41", "Q2 and Q3 chapters"], ["15:03", "final build"]] },
    ],
    columns: [
      {
        label: "Facts before features",
        items: ["Every model number comes from the warehouse, with its source", "Each of the 33 assumptions has a named owner (Nils 15, Benedikt 11, Luca 7), a range and a reason", "The GCAT pipeline reproduces McDowell's published satellite totals"],
      },
      {
        label: "Business logic before UI",
        items: ["Funnel, capital charge and break-even live in tested model code and SQL views, not in the screens", "The TypeScript model is checked against the SQL views", "We did not tune assumptions to force an earlier break-even"],
      },
      {
        label: "Two models, one verdict",
        items: ["**claudex-loop:** Claude drafts a plan, Codex attacks it read-only, Claude revises until it holds", "30 Codex findings on the P&L plan in three rounds, then a review of the finished code", "Storyline and verdict are the team's"],
      },
    ],
    tools: [
      { logo: "granola", name: "Granola", role: "short summaries of our working sessions, for the project overview" },
      { logo: "wispr-flow", name: "Wispr Flow", role: "prompts dictated, not typed" },
      { logo: "claude", name: "Claude Code", role: "builder, research agents in parallel" },
      { logo: "codex", name: "Codex", role: "red team via claudex-loop" },
    ],
    source: "Source: repository (warehouse/seed, schema.sql, dashboard/package.json, git log of phase/final, progress/present-review-log.md). Logos are trademarks of their owners.",
    tool: "t-fb",
    allow: [...DATES, "30", "21 Oct 15:08", "21 Oct 16:15", "18:36", "22 Oct 07:36", "22 Oct 06:42", "08:42", "11:12", "11:40", "22 Oct 13:43", "14:04", "22 Oct 07:03", "11:41", "15:03"],
  },
  {
    id: "closing",
    layout: "closing",
    section: "team",
    overline: "The team",
    title: "Thank you for the case. **We are happy to walk you through the live tool.**",
    verdict: "Our recommendation to SSVE: do not commit on today's evidence; reopen diligence at three dated gates.",
    team: [
      { name: "Benedikt Supper", role: "Investor view: global launch demand, competition, business case" },
      { name: "Luca Marie Repa", role: "Company view: Isar Aerospace's capacity, customers and plans, from public sources" },
      { name: "Nils Wagner", role: "Technology view: spaceflight, launch sites, orbital physics; built the tool and the fact warehouse" },
    ],
    repo: { label: "Code and data", url: REPO, note: "Public repository: the tool, the fact warehouse with its sources, the model with tests and the wiki behind the case. The README explains how to run the tool locally." },
    note: "Case exercise prepared for Stern Stewart & Co. at the SSCO AI Hackathon, 21–22 Oct 2026. Figures are team estimates from public sources and the expert Q&A, not Isar Aerospace data and not investment advice. Contains participant-only material: please ask before sharing outside Stern Stewart.",
    allow: DATES,
  },
];
