import { useState } from "react";
import { FactorSteps, type FactorRow } from "../components/FactorSteps";
import { LeverPanel } from "../components/LeverPanel";
import { OrbitHero } from "../components/OrbitHero";
import { ReliabilityLegend, SourceChip } from "../components/SourceChip";
import { SamEvidence, SomEvidence, TamEvidence } from "../components/TierEvidence";
import { type Metric, TierCards } from "../components/TierCards";
import { Waffle } from "../components/Waffle";
import { type Tier, assumption, launchSites, preferred, satellites } from "../data/warehouse";
import { fmtEur, fmtInt, fmtPct, fmtTonnes, fmtUnit, share } from "../lib/format";
import { type Flow, computeQ1, sitesInScope } from "../model/q1";
import { LEVERS, baseFixed, baseLevers, spectrum, tamRevenueUsd } from "../state/levers";
import type { LeverState } from "../state/useLevers";

const metrics: { id: Metric; label: string }[] = [
  { id: "sats", label: "Satellites" },
  { id: "massKg", label: "Mass" },
  { id: "revenue", label: "Revenue" },
];

const tierIntro: Record<Tier, string> = {
  TAM: "Global launch demand is measured, not estimated: every satellite that reached orbit in the base year.",
  SAM: "Three narrowing factors turn global demand into what Isar can serve from its launch sites.",
  SOM: "Two steps decide what Isar wins: who pays for a dedicated launch, and how much Spectrum can fly.",
};

const place: Record<string, string> = { andoya: "Andøya", "nova-scotia": "Nova Scotia", kourou: "Kourou" };

const listOf = (names: string[]) => (names.length < 2 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`);

export function Q1Reach({ state }: { state: LeverState }) {
  const [metric, setMetric] = useState<Metric>("sats");
  const [tier, setTier] = useState<Tier>("TAM");
  const l = state.levers;
  const f = baseFixed;
  const r = computeQ1(satellites, launchSites, l, f, tamRevenueUsd(l.baseYear));
  const [tamStep, access, payload, orbit, penetration, capacity] = r.steps;
  const { TAM, SAM, SOM } = r.tiers;
  const sites = sitesInScope(l.siteScope, launchSites);
  const reachText = r.reach.map(([lo, hi]) => `${lo}–${hi}°`).join(" and ");
  const from = listOf(sites.map((s) => place[s.id] ?? s.name));
  const revenueFact = preferred("launch_revenue", { year: l.baseYear });
  const changed = LEVERS.filter((d) => l[d.key] !== baseLevers[d.key]).map((d) => assumption(d.assumptionId).name.toLowerCase());

  const factors: Record<Tier, FactorRow[]> = {
    TAM: [],
    SAM: [
      {
        id: "access",
        factor: "Access: who may book Isar",
        rule: `Excludes Starlink, China, Russia, Kuiper/OneWeb and the US government; other governments count ${fmtPct(l.otherGovOpen)}`,
        from: tamStep,
        to: access,
        sources: ["gcat", ...assumption("sam_us_gov_open").source_ids, ...assumption("sam_other_gov_open").source_ids],
      },
      {
        id: "payload",
        factor: "Payload: fits on Spectrum",
        rule: `Satellite weighs at most ${fmtInt(f.payloadSsoKg)} kg in SSO or ${fmtInt(f.payloadLeoKg)} kg in other low orbits (Spectrum's published payload)`,
        from: access,
        to: payload,
        sources: [spectrum.source_id],
      },
      {
        id: "orbit",
        factor: "Orbit: the launch site reaches it",
        rule: `Inclination ${reachText} (${sites.map((s) => s.name).join(", ")})`,
        from: payload,
        to: orbit,
        sources: [...sites.map((s) => s.source_id), "andoya-space"],
      },
    ],
    SOM: [
      {
        id: "penetration",
        factor: "Penetration: buys a dedicated launch",
        rule: `${fmtPct(l.penetration)} of the SAM pays for its own launch instead of rideshare`,
        from: orbit,
        to: penetration,
        sources: assumption("som_penetration").source_ids,
      },
      {
        id: "capacity",
        factor: "Capacity: Isar can fly it",
        rule: `${l.launchesPerYear} launches × ${fmtPct(l.successRate)} success × ${fmtInt(f.payloadSsoKg)} kg × ${fmtPct(f.fillRate)} fill = ${fmtTonnes(r.capacityKg)}`,
        from: penetration,
        to: capacity,
        sources: [
          ...assumption("som_launches_per_year").source_ids,
          ...assumption("som_success_rate").source_ids,
          ...assumption("fixed_fill_rate").source_ids,
        ],
      },
    ],
  };

  const start: Record<Tier, { label: string; flow: Flow }> = {
    TAM: { label: `${l.baseYear}: all satellites that reached orbit`, flow: tamStep },
    SAM: { label: `Start: TAM ${l.baseYear}`, flow: tamStep },
    SOM: { label: "Start: SAM", flow: orbit },
  };

  return (
    <section className="chapter">
      <div className="hero">
        <header className="chapter__head">
          <div className="overline">Question 1 · Today</div>
          <h2>What share of global launch demand can Isar serve from Andøya?</h2>
        </header>
        <div className="card orbit-card">
          <div className="overline">Orbits customers buy</div>
          <OrbitHero reach={r.reach} siteLabel={`${sites.map((s) => s.name).join(" + ")} · reaches ${reachText}`} />
        </div>
      </div>

      <div className="answer-row">
        <div className="answer-block">
          {!state.isBase && (
            <div className="scenario">
              <span>
                Scenario: {changed.length} {changed.length === 1 ? "assumption differs" : "assumptions differ"} from the warehouse
                base ({changed.join(", ")})
              </span>
              <button className="text-button" onClick={state.reset}>
                Back to base
              </button>
            </div>
          )}
          <p className="answer">
            From {from}, Isar can serve{" "}
            <strong>{fmtInt(SAM.sats)}</strong> of the {fmtInt(TAM.sats)} satellites launched in {l.baseYear} (
            <strong>{fmtPct(share(SAM.sats, TAM.sats))}</strong>), but only {fmtPct(share(SAM.massKg, TAM.massKg))} of their mass. It
            wins about <strong>{fmtInt(SOM.sats)} satellites</strong> ({fmtTonnes(SOM.massKg)}, {fmtEur(SOM.revenueEur[0])}) a year:{" "}
            {r.bottleneck === "demand"
              ? "demand for dedicated launches, not capacity, sets the limit today."
              : "capacity, not demand, sets the limit."}
          </p>
        </div>
        <Waffle result={r} metric={metric} year={l.baseYear} />
      </div>

      <div className="q1-layout">
        <div className="q1-main">
          <div className="toolbar">
            <div className="overline">Click a tier to see what narrows it</div>
            <div className="toggle" role="group" aria-label="Metric">
              {metrics.map((m) => (
                <button key={m.id} className={metric === m.id ? "is-active" : ""} onClick={() => setMetric(m.id)}>
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <TierCards result={r} metric={metric} selected={tier} onSelect={setTier} from={from} />

          <div className={`card drill drill--${tier.toLowerCase()}`}>
            <div className="drill__head">
              <div className="drill__top">
                <div className="overline">{tier} · in detail</div>
                <ReliabilityLegend />
              </div>
              <p className="drill__intro">{tierIntro[tier]}</p>
            </div>

            {tier === "TAM" ? (
              <ul className="factlines factlines--row">
                <li className="factline">
                  <span>Satellites</span>
                  <strong>{fmtInt(TAM.sats)}</strong>
                  <SourceChip id="gcat" />
                </li>
                <li className="factline">
                  <span>Mass</span>
                  <strong>{fmtTonnes(TAM.massKg)}</strong>
                  <SourceChip id="gcat" />
                </li>
                <li className="factline">
                  <span>Launch revenue</span>
                  <strong>{fmtEur(TAM.revenueEur[0])}</strong>
                  <SourceChip id={revenueFact.source_id} />
                </li>
              </ul>
            ) : (
              <FactorSteps start={start[tier]} rows={factors[tier]} />
            )}

            {tier === "TAM" && (
              <p className="caption">
                Revenue: {fmtUnit(revenueFact.value, "USD")} global launch revenue, converted at {f.usdPerEur} $/€. Launched satellites are
                realised demand, capped by SpaceX's capacity: a lower bound rather than a ceiling.
              </p>
            )}
            {tier === "SAM" && (
              <p className="caption">
                SAM revenue: {fmtTonnes(SAM.massKg)} × rideshare to dedicated price per kg ({f.rideshareUsdPerKg.toLocaleString("en-GB")}–
                {f.dedicatedUsdPerKg.toLocaleString("en-GB")} $/kg) = {fmtEur(SAM.revenueEur[0])}–{fmtEur(SAM.revenueEur[1]).replace("€", "")}.
              </p>
            )}
            {tier === "SOM" && (
              <p className="caption">
                SOM revenue: {r.somLaunches.toFixed(1)} Spectrum loads × {fmtEur(f.pricePerLaunchEur)} = {fmtEur(SOM.revenueEur[0])}.
              </p>
            )}

            {tier === "TAM" && <TamEvidence levers={l} fixed={f} result={r} />}
            {tier === "SAM" && <SamEvidence levers={l} fixed={f} result={r} />}
            {tier === "SOM" && <SomEvidence levers={l} fixed={f} result={r} />}
          </div>
        </div>

        <aside className="q1-side">
          <LeverPanel state={state} selected={tier} />
        </aside>
      </div>
    </section>
  );
}
