# Plan: Presentation mode (storyline) and three P&L scenarios
_Locked via claudex-loop by Claude and Nils, 22.10.2026, 12:30. Final presentation at 15:00; Q4 runs 12:45–14:45 in parallel._

## Goal

The tool becomes the presentation without turning into a slide show. A **"Present"** button in the top bar opens a full-screen **story mode** with five beats, ordered from claim to evidence and from macro to micro:

1. Recommendation
2. ASCENT
3. Geography
4. Numbers
5. Gates and risks

Each beat shows few words, a few large live numbers and at most one interaction. "Deep dive →" opens the matching Explore chapter, and "Back to story" returns to the same beat. Explore mode stays a full decision tool for the partners.

New analysis: **three named P&L scenarios** with revenue and EBIT for 2027–2040, all under our assumptions:

| Scenario | Role |
| --- | --- |
| **Bear** | Downside |
| **ASCENT** | Base: our strategy executed |
| **Bull** | Upside |

Isar's own plan (12 launches in 2030) is a dashed reference line, not a scenario. Scenario parameters and cost anchors live in the warehouse with sources. A pure TS model is mirrored by a SQL view, and a test keeps the two equal. A new Explore chapter "Scenarios" shows the full P&L and its assumptions.

Alongside the tool:
- a Notion page in very plain German that explains the three scenarios step by step
- a wiki page and synced assumption register

## Approach

1. **Sourced cost anchors** (research subagent running).
   - Rocket Lab cost per launch 2023–25 is already in the warehouse.
   - New: Isar headcount, Rocket Lab FY2021 and Firefly FY2024 opex as comparators for fixed cost, Electron vs Spectrum size, German aerospace personnel cost per head (OHB).
   - New facts go to `facts`/`sources`. Our judgements go to `assumptions` (question `Final`, owner, range, confidence).
2. **Warehouse**
   - **Table `scenarios`**, wide, one row per scenario:
     - `id`, `name`, `tagline`, `sort`
     - `readiness_growth`: 0.10 / 0.15 / 0.25
     - `ns_active`: false / true / true
     - `ns_anchor_launches`: 0 / 3 / 6
     - `contract_launches`: extra frame-contract launches per year from `contract_start_year` = 2029: 0 / 2 / 6
     - `institutional_after_end`: share of the ESA Launcher Challenge level that continues after 2030: 0 / 0.5 / 1.0
     - `success_2027` / `success_2030`: linear in between, flat afterwards. Bear 0.75 / 0.75, ASCENT 0.80 / 0.92 (same as `q2_success_rate_*`), Bull 0.85 / 0.95
     - `hypersonic`: false / false / true
     - `rationale`, `source_ids`, `confidence`
   - **New assumptions:**

     | Assumption | Value | Basis |
     | --- | --- | --- |
     | `scen_unit_cost_ref_eur` | Spectrum production and launch cost per launch at the reference cadence | Rocket Lab 2025 Electron 4.8 M USD × size factor ÷ USD/EUR |
     | `scen_size_factor` | 1.5 (range 1.2–2.0) | Spectrum about 3× Electron's payload with the same engine count; team, low confidence |
     | `scen_ref_cadence` | 21 | Rocket Lab 2025 |
     | `scen_fixed_opex_eur` | R&D + SG&A per year in real terms | from headcount × personnel cost minus the production share, cross-checked against Rocket Lab 2021 and Firefly 2024 |
     | `scen_readiness_launch_share` | 0.3 | share of readiness revenue that is actually flown; the rest is availability fee; team, low |
     | `scen_readiness_fee_margin` | 0.7 | team, low |

     `q3_learning_rate` (0.7), `fixed_price_per_launch_eur`, the Nova Scotia fee and the readiness fixed cost from `expansion_fields` are reused. All values are in **real 2026 euros**: no inflation on either price or cost, stated in the tool.
   - **View `v_scenarios`:** one row per scenario × year 2027–2040 with launches sold and flown, unit cost, revenue by stream, gross profit, fixed cost, EBIT, cumulative EBIT. Applied with **targeted SQL** (create table, insert, create view). No full `load.py` reload, because the Q4 work may edit Supabase in parallel. Then `export.py`.
3. **Model `src/model/scenarios.ts`** (pure, Vitest) for each scenario and year:
   - **Revenue from launches** = revenue of the launch fields (`core_polar`, `core_dedicated_shift`, `institutional_elc` + successor × level 2030 after `end_year`, `site_nova_scotia` if `ns_active`, `hypersonic_tests` if `hypersonic`) + Nova Scotia anchor × price (from the Nova Scotia start year, if active) + contract launches × price (from `contract_start_year`). The same field revenues as in Q2/Q3, so the scenarios stay consistent with site load.
   - **Readiness revenue** = `sovereign_readiness` with the scenario's growth. A share `scen_readiness_launch_share` counts as launches; the rest is fee at `scen_readiness_fee_margin`.
   - **Extras revenue** = `mission_extras` at its field margin.
   - **Launches** = launches sold ÷ success rate of the year (a failed launch costs a rocket).
   - **Unit cost** = ref × (launches flown ÷ 21)^log2(0.7), with a floor of 1 launch.
   - **Gross profit** = revenue − launch cost.
   - **EBIT** = gross profit − fixed opex − Nova Scotia fee (from 2030, if active) − readiness fixed cost (from its start year).
   - **KPIs:** revenue and EBIT for 2030/2035/2040, EBIT break-even year, cumulative operating loss until break-even (a funding-need proxy, not a valuation, labelled so), break-even launches per year (solve n × (price − unit cost(n)) = fixed opex).
   - **Tests:**
     - TS = `v_scenarios`
     - Bear < ASCENT < Bull revenue in every year from 2029
     - break-even launches lie between 10 and 40
     - zero contract launches reproduce the Q3 launch count for 2030
4. **Story mode** in `src/story/`:
   - `Story.tsx` holds the shell: progress dots, beat title, ←/→/Space/PageDown, Esc exits, "Deep dive →" buttons.
   - The beat registry is an array, so a **Q4 beat** can be inserted before "Gates" once Q4 is answered.
   - `App.tsx` gains `mode: explore | present`. In present mode the chapter arrow keys are off and the top bar is reduced to brand + progress + Exit. A deep dive sets `returnBeat`, and a floating "Back to story" pill appears in Explore.
   - **Beat 1, Recommendation:** "Invest in Isar — on the ASCENT path, gated by three milestones." Three big KPIs from the ASCENT scenario: revenue 2030, EBIT break-even year, launches needed to break even against launches 2030.
   - **Beat 2, ASCENT:** six letter tiles, each with one live number and one line:
     - A: 2.7 of 8 planned 2028 launches are filled by visible demand (`v_q2_launch_gap`)
     - S: readiness revenue 2030
     - C: 422 reachable satellites (`v_q1_funnel`)
     - E: extras margin
     - N: 4 fields not pursued
     - T: Nova Scotia break-even launches

     Clicking a tile shows its detail line. Deep dive → Q2.
   - **Beat 3, Geography** (three sub-steps on the same map, still the arrow keys):
     - (a) World: 56 spaceports, dot area = launches 2025 (reuse `SiteMap`)
     - (b) Andøya's reach: the polar/SSO band, 422 of 4,521 satellites (9.3 %)
     - (c) Isar's footprint zoomed to the North Atlantic: Parsdorf plant (load 2030), Esrange, Andøya (pad A + half of pad 2), Nova Scotia (option with anchor), Kourou (option), with decision pills from `site_nodes`

     Deep dive → Spaceports / Q1 / Q3.
   - **Beat 4, Numbers:**
     - scenario chart (Recharts): revenue as lines per scenario, EBIT as a second panel, zero line, Isar's plan as a dashed reference
     - scenario toggle (default ASCENT)
     - KPI cards (revenue 2030/2035, EBIT 2035, break-even year, cumulative loss until break-even)
     - one slider "frame-contract launches per year" (the A in ASCENT) that moves the break-even year live

     Deep dive → Scenarios.
   - **Beat 5, Gates and risks:**
     - three gates, each with metric, date and the scenario a miss leads to:
       - cadence and success (≥ 4 launches in 2027, success ≥ 80 %)
       - first paid readiness contract with a European state by 2028
       - Nova Scotia anchor signed by 2029, else do not open the site
     - four risks with the number that measures each: single pad, ESA programme ends 2030, Canada anchor open, reliability
5. **Explore chapter "Scenarios":** P&L table per scenario (2027–2040, every 1 year), assumptions with sources and confidence, sliders for the three most uncertain inputs (fixed opex, size factor, contract launches), "Back to base".
6. **Design:**
   - the current light Isar theme, large display numbers (56–72 px) and generous white space
   - no new animation beyond a short opacity fade between beats, respecting reduced motion
   - one accent blue; scenarios in three steps of one hue plus grey for the plan
   - works at 1280×720 on a beamer without scrolling
7. **Docs:**
   - `wiki/analysis/scenarios.md` (German, with sources)
   - `wiki/reference/assumptions.md` synced
   - progress log
   - Notion child page under "Common Docs: Isar Aerospace": "Szenarien: Umsatz und Gewinn bis 2040 (einfach erklärt)", in very plain German, one section per scenario with assumptions, result and break-even
8. **Branching:** build on `feature/present-mode` in a separate worktree, so the Q4 work in the main checkout is not disturbed. Merge into the phase branch before 14:45.

## Key decisions & tradeoffs

- **Honest EBIT instead of gross profit.** The first prototype (readiness counted as launches, nominal fixed cost +4 %/yr) never broke even. The locked model makes three corrections:
  - readiness is mostly a fee
  - everything is in real terms
  - unit cost comes from Rocket Lab's measured curve scaled to Spectrum

  With these, ASCENT is expected to turn EBIT-positive in the late 2030s. With about 4 extra frame-contract launches a year it does so in the mid-2030s, Bear never does and Bull in the mid-2030s. We do **not** tune assumptions to force an earlier break-even. Nils asked whether ASCENT can be shown EBIT-positive; the answer is yes within the 2040 horizon, and earlier only via the contract lever, which becomes a gate.
- **Scenarios under our assumptions;** the management plan is only a reference line (Nils: "Bear/Base/Bull, base = ASCENT").
- **The storyline stops at gates and risks.** No "questions for management" beat (Nils); the tool stays the decision tool behind it.
- **Revenue basis reused from `expansion_fields`,** not a new top-down forecast. This keeps Q2, Q3 and the scenarios one consistent model; the price is that the scenarios inherit Q2's demand conservatism.
- **The success rate drives cost, not revenue:** failed launches must be re-flown at Isar's cost. Simple and visible; ignores insurance recoveries.
- **No mid-class rocket in any scenario:** a €400 M capex trigger outside this horizon's base. It is mentioned as a trigger only.
- **Profit = EBIT, plus a cumulative-loss proxy;** no EVA or valuation (valuation is out of scope for the case).

## Toolchain

- No installed Claude/Codex skill pack matches (skill scan: only AWS packs, `claudex-loop`, `codex-build`, `codex-review`).
- The `dataviz` built-in skill guides the scenario chart (palette, single-hue steps, direct labels).

## Assumptions

1. The core claim and three gates come from the Q3 storyline (`wiki/analysis/q3-site-portfolio.md`).
2. "Ascend" = ASCENT (Q2).
3. Supervisor hint: tell it as one story; revenue, profit and reliability are the core KPIs (wiki Q3).
4. Explore chapters remain unchanged as deep-dive targets (`App.tsx`).
5. The map reuses `SiteMap` / Natural Earth.
6. Scenario parameters are data in the warehouse; the SQL mirror carries a test.
7. The revenue basis is `expansion_fields` (`q3.ts`).
8. Research depth is `web`, for cost anchors only.
9. The Notion page lives under Common Docs.
10. The Q4 slot sits in the beat array.

## Risks / open questions

- **Fixed opex is the least certain input.** It moves the break-even year by years: it is a slider in the Scenarios chapter and must be shown with its range.
- **The size factor 1.5** is a team estimate (low confidence).
- **Time:** about 2 h build while Q4 runs. Order the build so a usable story exists early (beats 1, 2, 4 first; the geography zoom last).
- **Concurrent Supabase edits by the Q4 work:** targeted SQL only; export, then merge the CSVs carefully.
- **The hash is already used by the lever URL state** (`useLevers`): story mode keeps its beat in memory, no URL.

## Out of scope

- valuation, ticket size, EVA
- management-question beat
- mid-class rocket economics
- new demand research
- PowerPoint export

## Revision 1 (after Codex round 1, 13:45)

Accepted (numbers refer to Codex's findings in the review log):

- **(1) Break-even:** no closed formula any more. The KPI is the **sustained break-even year**: EBIT ≥ 0 from that year through 2040, found by the actual EBIT function. The lever KPI is **"contract launches a year ASCENT needs to earn money by 2035"**, solved by bisection on the real model. If even the capacity cap (30 launches a year: Andøya 18 + Nova Scotia 12 proposed) is not enough, it reads "not reached".
- **(2) Gross profit:** the plan text was wrong, the SQL is right.
  - gross profit = launch revenue (incl. the flown readiness share) − flights × unit cost + readiness fee × fee margin + extras × extras margin
  - fixed costs are a separate line
- **(3) Readiness:** scenarios list every field they use (`launch_fields` → `fields`, incl. `sovereign_readiness`). Bear has **no** paid readiness contract.
- **(4) Unit cost:** no learning beyond Rocket Lab's measured volume. The unit cost is floored at the reference cost (cadence ≥ 21 → flat). The size factor is labelled a judgement.
- **(5) Cost bridge**, stated in the tool:
  - launch cost = Rocket Lab's cost of revenue per launch (incl. allocated production overhead)
  - fixed opex = R&D + SG&A
  - **depreciation of plant and pads is not modelled**

  The label reads "operating profit (EBIT proxy, before depreciation of plant and pads)".
- **(6) Failures:** labelled "failed launches are re-flown at Isar's cost".
- **(7) Bear** also drops `core_dedicated_shift`. Contract launches are labelled "beyond today's visible demand".
- **(8) Reconciliation:** the claimed equality with Q3 and its test are dropped. ASCENT's `success_2027` becomes 0.81, so 2028 ≈ 0.85 as in Q2.
- **(9) Nova Scotia:** labelled "Bear assumes Isar does not take up the Nova Scotia complex; if the fee is binding, Bear loses another €13.4 M a year".
- **(10) Capacity:** a flag where flights exceed 30 launches a year (proposed site capacity, `v_q3_site_load`).
- **(11) KPIs:** "peak cumulative operating loss" (not "funding need") plus "sustained break-even year".
- **(12) Tests:**
  - TS = SQL per scenario and year
  - the accounting identity (revenue = streams; EBIT = gross profit − fixed)
  - a hand-computed example year
  - zero demand gives a loss equal to the fixed cost
  - the ESA field expires in Bear
- **(13) Isar's plan:** only 4 (2027) and 8 (2028) are Isar's (Payload); 12 in 2030 is our reading. No reference line on the revenue chart; launches 2030 are shown against "12 (our reading of the plan)".
- **(14) Wording:** "today's flown demand supports 2.7 dedicated launches in 2028; at a 45 % win share about 1.2 are Isar's, against 8 planned".
- **(16) Recommendation:** "Invest in stages: back ASCENT, release each tranche at a dated gate". The three gates, each with an action if missed:
  1. **Reliability:** at least 3 of 4 flights in 2027 reach orbit. Missed → hold the next tranche.
  2. **Contracts:** by 2029 frame contracts for ≥ 2 launches a year beyond today's demand, incl. one paid readiness contract with a European state. Missed → we are in Bear: no Nova Scotia, cost base cut.
  3. **Nova Scotia:** a signed anchor (≥ 3 launches a year) before the fee starts. Missed → do not open the site.
- **(17) Pipeline:** done (seed header, `load.py` arrays, `export.py` table + view, typed access next).
- **(18) Supabase:** this session owns the `scenarios` objects. After merging with the Q4 branch, run **one** export to regenerate the snapshot.
- **(19) Shared state:** scenario settings live in one App-level state shared by story and Explore; an edited scenario shows "edited · back to base".
- **(20) Map:** one static footprint step (North Atlantic crop of the same projection) after the world view. `site_nodes` gains sourced `latitude`/`longitude`; no zoom animation and no orbital overlay. Shortcuts are ignored while focus is in an input, select or text area; Space is also ignored on a focused button (it would press it).
- **(21) Order:** model → story beats 1, 2, 4, 5 → Scenarios chapter → map → docs. The Notion page is written by a subagent from the frozen numbers in parallel. The last 20 minutes are reserved for merge, export, tests and a 1280×720 rehearsal.

Rejected:

- **(4, part) Unit cost from launches sold instead of flown:** rejected. Failed rockets are built too and teach the line; production volume is the right driver.
- **(15, part) Footprint only:** rejected. Nils explicitly wants to start from the geographic overview and go macro → micro. We keep world → footprint, but as two steps only and without the orbital band.
- **(21, part) Deferring the Notion page:** rejected, because Nils asked for it explicitly. It is delegated instead, so it costs no build time.

## Revision 2 (Nils, 14:00): one presentation page instead of five beats

Nils stopped the five-beat story. "▶ Present" now opens **one page** (`dashboard/src/present/Present.tsx`, fits 1280×720):
- the recommendation
- three scenario cards with revenue 2030/2035, EBIT 2035 and the profitable-from year; the selected card drives the chart
- revenue and EBIT chart
- **five sliders at most**: frame-contract launches, paid-readiness growth, success rate from 2030, fixed cost base, Q4 months Andøya closed
- "How ASCENT makes money"
- Q2 growth fields as bullets with Isar revenue 2030
- the Q4 shock

Q4 model: `dashboard/src/model/q4.ts` (test). The story components (`story/Story.tsx`, `FootprintMap`) are removed; the Scenarios chapter stays as the deep dive.
