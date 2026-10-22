# Plan Review Log: Presentation mode and P&L scenarios
Phases 0-1 (recon + interrogation) complete — plan locked with Nils on 22.10.2026, 12:30. MAX_ROUNDS=3 (time box: final presentation at 15:00).
Reviewer: Codex CLI 0.158.0, model from ~/.codex/config.toml (gpt-6-astra, reasoning effort low), read-only sandbox.

## Round 1 — Codex

The plan needs revision before implementation. The presentation structure is workable, but the proposed economics cannot yet support “Invest in Isar.” Several headline numbers would contradict the existing tool. No files were modified.

**P&L and investment logic**

1. **The break-even KPI solves a different model.** `n × (price − unitCost(n)) = fixedOpex` excludes failure costs, readiness contribution, extras, Nova Scotia fees and readiness fixed costs. It also leaves “n” ambiguous: paid missions or attempted launches.  
   **Fix:** Solve the actual annual EBIT function for paid missions, with year, success rate, service mix and site configuration held explicit; return “not reached within capacity” where appropriate.

2. **The written gross-profit formula drops service costs.** “Revenue − launch cost” gives readiness fees and extras 100% margins, despite specifying 70% and 60%.  
   **Fix:** Calculate launch contribution plus readiness-fee revenue × fee margin plus extras revenue × extras margin, then subtract explicitly separated fixed costs.

3. **Readiness is doing too much work to rescue profitability.** Its market proxy comes from funded missions; reinterpreting 70% as availability fees while retaining the entire revenue pool is an additional commercial assumption. Flat €5m standby cost also supports increasingly large revenue indefinitely.  
   **Fix:** Separate availability-contract value from flight purchases, prevent overlapping billing, and show a downside with no paid readiness contract and a staffing/capacity constraint.

4. **The cost curve is an extrapolation, not a measured Spectrum curve.** `q3_learning_rate` explicitly says it mixes learning and scale; applying it to annual attempts makes failure-driven extra production reduce unit costs and lets costs decline indefinitely. Payload and engine count do not establish a 1.5× cost multiplier.  
   **Fix:** Use a bounded cadence-cost sensitivity with a variable-cost floor and label the multiplier as judgment; do not present extrapolated profitability as established learning.

5. **Fixed costs and depreciation are not reconciled.** Headcount minus production personnel does not capture all R&D/SG&A, while comparator launch costs may already include allocated overhead and depreciation. Readiness’s €20m capital and Bull’s €10m hypersonic development also need treatment.  
   **Fix:** Define a cost bridge showing what launch COGS includes, what fixed opex adds, and where depreciation/development expense sits before calling the result EBIT.

6. **Automatic free reflight is an assumed contract, not an economic identity.** `sold/success` assumes successful-delivery obligations, unlimited replacement attempts and completion within the year; downtime and customer losses disappear.  
   **Fix:** Explicitly label this as a replacement-flight assumption, bound success above zero, and include a delay/capacity downside.

7. **Revenue streams are not demonstrably incremental.** `expansion_fields.csv` already acknowledges institutional/core overlap and ESA funding for upgrades. Adding frame contracts and Canadian anchors may count customers already inside market-share revenue. Bear also retains the speculative dedicated-launch shift.  
   **Fix:** Deduplicate contract demand against existing segments, separate development funding from launch purchases, and disable unproven demand triggers in Bear.

8. **The scenarios cannot reproduce Q3 as claimed.** [q3.ts](/Users/nilswagner/Entwicklung/stern-hackathon-present/dashboard/src/model/q3.ts) counts all readiness revenue as launches, includes conditional hypersonic/Kourou activity, and applies no success adjustment. Zero frame contracts cannot reconcile that with the new model. Even the proposed linear success ramp gives 84% in 2028 versus Q2’s 85%.  
   **Fix:** Create one explicit reconciliation of paid missions, attempts and service revenue across chapters; replace the impossible equality test.

9. **Nova Scotia’s three-launch gate uses incompatible economics.** The existing 2.7-launch threshold uses a constant 40.8% gross margin; the proposed model uses cadence-dependent costs and failures. The warehouse also mentions additional cost-plus launch fees. `ns_active=false` does not establish that an already contracted annual fee disappears.  
   **Fix:** Recalculate incremental site contribution using the scenario costs, and distinguish operational closure from contractual fee relief.

10. **Unconstrained contracts manufacture profitability.** Extra launches gain revenue and scale savings without site allocation, launch-slot limits, production ramp, standby reservations or incremental staffing.  
    **Fix:** Allocate attempts to sites and flag or constrain capacity breaches, including shared Andøya capacity and readiness reserves.

11. **“Funding need” remains misleading despite the qualifier.** Cumulative EBIT losses exclude capex, working capital, deposits and existing cash; first positive EBIT may precede another loss after ESA revenue ends.  
    **Fix:** Call it “cumulative modelled operating losses,” show peak cumulative deficit through 2040, and distinguish first positive EBIT from sustained profitability.

12. **The tests encode the desired answer.** “Break-even between 10 and 40” is not a correctness condition; TS/SQL equality can reproduce identical mistakes.  
    **Fix:** Test accounting identities, zero-demand costs, fee activation, programme expiry, no break-even, capacity breaches and a manually calculated example.

**Storyline and partner credibility**

13. **The management-plan reference is misattributed and dimensionally undefined.** The wiki and SQL explicitly call 12 launches in 2030 a **team assumption**; a launch count cannot directly become a reference line on revenue and EBIT charts.  
    **Fix:** Label 12 correctly and show it only on a cadence comparison, unless a separately disclosed financial translation is provided.

14. **The opening demand claim overstates Isar’s position.** The 2.7 launches represent the addressable dedicated market before Isar’s 45% win share; the wiki’s Isar figure is approximately 1.2. Neither is signed backlog.  
    **Fix:** Say “modelled market supports 2.7 launches; Isar’s assumed share is 1.2 against eight planned,” and separate signed demand from estimates.

15. **ASCENT risks becoming six unexplained tiles before the problem is understood.** The 56-spaceport world tour adds breadth but little investment evidence; 422 reachable satellites is not a customer pipeline.  
    **Fix:** Retain the five beats, but lead immediately with the demand gap, explain ASCENT in plain English, and restrict geography to the footprint decision.

16. **The recommendation is stronger than its conditions.** Late-2030s EBIT under uncontracted readiness and anchors supports a conditional strategy thesis, not an unconditional investment conclusion. Contract launches become decisive in the narrative but never become an explicit gate. Four launches also cannot substantiate an 80% underlying success probability.  
    **Fix:** Recommend backing the strategy subject to funded runway and dated commercial milestones; define reliability using flight outcomes and technical acceptance, with a specific action for each missed gate.

**Build and concurrency risks**

17. **The new warehouse objects will not reach the dashboard automatically.** [export.py](/Users/nilswagner/Entwicklung/stern-hackathon-present/warehouse/export.py) enumerates tables and views and requires existing CSV headers; the loader and TypeScript snapshot contract also enumerate supported objects. `question='Final'` is valid—the missing pipeline integration is the actual problem.  
    **Fix:** Include schema persistence, seed header, export registration, view export, loader support and typed access in the implementation checklist.

18. **A worktree does not isolate Supabase.** Targeted SQL avoids a destructive reload but not concurrent edits; exports can capture different database states, and merging generated JSON/CSVs is not a reliable reconciliation strategy.  
    **Fix:** Assign one database/export owner, serialize mutations, then regenerate one consistent snapshot after integrating both branches.

19. **Story and Explore will disagree after interaction.** `useLevers` only owns Q1 state; Q3 owns local state, and `App.tsx` remounts chapters. Scenario settings and map substeps have no shared persistence contract.  
    **Fix:** Lift scenario settings and return position into one shared state owner, and visibly mark edited scenarios.

20. **The map and interaction scope is underestimated.** `SiteMap` has no zoom, orbital overlay or production-node API; `site_nodes` lacks coordinates. Its radius formula also does not make area strictly proportional to launches. Space/arrows can conflict with controls.  
    **Fix:** Ship one static footprint map with sourced coordinates, keep world exploration as a deep dive, and suppress navigation shortcuts inside interactive controls.

21. **The deadline leaves no integration margin.** New accounting logic, SQL parity, scenario exploration, maps, documentation, Notion and parallel Q4 integration are too much to finish safely at 14:45 for a 15:00 presentation.  
    **Fix:** Freeze the model first; ship recommendation → demand/ASCENT → footprint → economics → gates, defer map substeps and Notion, and reserve the final 30 minutes for merged build/tests and an offline 1280×720 rehearsal.

The smallest defensible implementation is one shared scenario calculation, explicit uncertain assumptions, reconciled site loads, and five restrained presentation views. The current plan prioritizes additional surface area before establishing that its headline economics are internally consistent.

VERDICT: REVISE

### Claude's response (round 1)
Accepted 18 findings (see "Revision 1" in present-plan.md). Rejected with reasons: unit cost from launches sold instead of flown (failed rockets are built too and teach the line); geography restricted to the footprint (Nils explicitly wants macro → micro starting from the world map; kept as two steps, no orbital overlay); deferring the Notion page (Nils asked for it; delegated to a subagent instead so it costs no build time).

## Round 2 — Codex

Revision 1 addresses several earlier findings **on paper**, but the checked SQL and seed still implement the old model. Prioritize these fixes:

1. **P0 — Revision and implementation disagree.** Bear still includes `core_dedicated_shift`; SQL unconditionally includes readiness for every scenario; ASCENT still starts at 0.80; unit cost still falls below the reference above 21 flights.  
   **Fix:** Apply those four changes before exporting or trusting any headline numbers; when renaming `launch_fields` to `fields`, explicitly exclude services from `is_launch` to avoid double-counting readiness.

2. **P0 — Nova Scotia fees start in the wrong year.** `field_fixed_cost_eur` charges every active field from its `start_year`, so Nova Scotia pays €13.4m from **2028**, contrary to the planned waiver through approximately 2030.  
   **Fix:** Separate fee commencement from launch commencement and test both boundary years.

3. **P0 — The capacity-limited break-even solver remains underspecified.** Thirty is total attempted-flight capacity, **not** the upper bound for additional contract launches; existing demand and replacements consume it. Aggregate capacity also allows impossible transfers between Andøya and Canada.  
   **Fix:** Allocate incremental contracts to a site, constrain total attempts by that site’s available capacity, and return “not reached” if no feasible solution exists.

4. **P0 — The investment gates still overclaim the economics.** €60m fixed opex remains explicitly marked “Placeholder”; three Canadian anchor launches still derive from the old constant-margin calculation. Missing contracts supposedly cause a “cost base cut,” but Bear uses the same fixed opex.  
   **Fix:** Freeze and disclose the opex range, replace the three-launch profitability claim with scenario-calculated fee coverage, and remove the unmodelled cost-cut claim.

5. **P1 — Warehouse rebuild is broken.** `scenarios` was added to the loader but not the schema’s drop-table list; a subsequent reload preserves its existing rows and attempts to insert the same primary keys.  
   **Fix:** Add the new table/view to the rebuild lifecycle; keep production reloads prohibited during Q4 and regenerate the snapshot once after integration.

6. **P1 — Removing the Q3 equality test does not reconcile the presentation.** Explore still treats readiness fees as flights and uses different reliability/site assumptions. Partners can follow a deep dive and see contradictory factory loads.  
   **Fix:** Use scenario-derived loads in the story and visibly label Q3 as the earlier revenue-equivalent estimate, with a brief reconciliation.

**Accepted improvements:** service-margin arithmetic is correct in SQL; sustained break-even, peak operating loss, corrected demand wording, removal of the financial management-plan line, shared state and reduced map scope are sensible.

With 75 minutes left, fix the four P0 items first. The five-beat storyline is sufficient; defer further visual refinement until the frozen snapshot, model parity and offline rehearsal pass. No files modified.

VERDICT: REVISE

### Claude's response (round 2)
- P0-1 (revision not yet in SQL): Codex reviewed while the SQL was being changed; now applied: `fields` lists every field incl. readiness, services excluded from `is_launch`, Bear without `core_dedicated_shift` and readiness, ASCENT success 0.81, unit cost flat at and above 21 flights.
- P0-2 (Nova Scotia fee from 2028): accepted. New assumption `scen_ns_fee_start_year` = 2030 (30-month waiver from 1 Nov 2026); fee only from then, tested at both boundary years.
- P0-3 (capacity solver): accepted. Frame contracts fly from Andøya; `contractsToBreakEven` returns null when the contracts that would be needed do not fit Andøya's proposed capacity after its other flights. Explore flags years where Andøya flights exceed capacity.
- P0-4 (gates overclaim): accepted. Fixed opex now sourced (Isar >400 staff × OHB 85 k EUR, Rocket Lab 10-K 2021, Firefly S-1) with range 40–90 M EUR, slider in Explore. The Nova Scotia gate now uses the scenario's own fee coverage (≈ 5 anchor launches at ASCENT cost, vs 3 assumed) and the "cost base cut" claim is gone (missed gate 2 → "we are in Bear").
- P1-5 (rebuild lifecycle): accepted; `scenarios` and `v_scenarios` added to the drop lists of schema.sql; no full reload during Q4.
- P1-6 (Q3 vs scenarios): accepted as a visible reconciliation note in the Scenarios chapter (Q3 converts all field revenue into launches; scenarios split readiness into fee and flights and add re-flights). The story's footprint caption uses the scenario-derived Andøya flights.
