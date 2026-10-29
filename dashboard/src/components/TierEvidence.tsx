import { factsFor, metrics, penetrationEvidence, preferred, satellites, winShareEvidence } from "../data/warehouse";
import { fmtPct, fmtTonnes, fmtUnit, share } from "../lib/format";
import { type Q1Fixed, type Q1Levers, type Q1Result, groupBy, samWeight } from "../model/q1";
import { BarList, type BarItem } from "./BarList";
import { BookingHorizon } from "./BookingHorizon";
import { InclinationChart } from "./InclinationChart";
import { SourceChip } from "./SourceChip";

interface Props {
  levers: Q1Levers;
  fixed: Q1Fixed;
  result: Q1Result;
}

const CAPTIVE = new Set(["captive", "institutional-us"]);

/** One fact from the warehouse with its source: the building block of every evidence list. */
function FactLine({ label, metric, year, scope = "company", entity = "" }: { label: string; metric: string; year: number; scope?: string; entity?: string }) {
  const f = preferred(metric, { year, scope, entity });
  return (
    <li className="factline">
      <span>{label}</span>
      <strong>{fmtUnit(f.value, metrics[metric].unit)}</strong>
      <SourceChip id={f.source_id} />
    </li>
  );
}

/** Same metric, several sources: the preferred value is ticked, the others are plausibility checks. */
function SourceComparison({ year }: { year: number }) {
  const rows = ["satellites_launched", "payload_mass_launched", "launch_revenue"];
  return (
    <table className="compare">
      <thead>
        <tr>
          <th>{year}</th>
          <th>Value</th>
          <th>Source</th>
          <th>Why it differs</th>
        </tr>
      </thead>
      <tbody>
        {rows.flatMap((m) =>
          factsFor(m, { year }).map((f, k) => (
            <tr key={`${m}-${f.source_id}`} className={f.is_preferred ? "is-preferred" : "is-alternative"}>
              <td>{k === 0 ? metrics[m].name : ""}</td>
              <td>
                <span className="mark" aria-label={f.is_preferred ? "used" : "check only"}>
                  {f.is_preferred ? "✓" : "○"}
                </span>
                {fmtUnit(f.value, metrics[m].unit)}
              </td>
              <td>
                <SourceChip id={f.source_id} />
              </td>
              <td>{f.note}</td>
            </tr>
          )),
        )}
      </tbody>
    </table>
  );
}

export function TamEvidence({ levers }: Props) {
  const year = levers.baseYear;
  const inYear = satellites.filter((s) => s.year === year);
  const captive = new Set(inYear.filter((s) => CAPTIVE.has(s.customerType)).map((s) => s.customerGroup));
  const groups: BarItem[] = groupBy(inYear, "customerGroup").map((g) => ({ ...g, tone: captive.has(g.name) ? "muted" : "accent" }));
  return (
    <div className="evidence">
      <div className="evidence__block">
        <h4>Four counts, one choice</h4>
        <SourceComparison year={year} />
        <p className="caption">
          GCAT is used because it lists every satellite with orbit, mass and operator: only that lets us filter the SAM. The
          other counts check plausibility.
        </p>
      </div>
      <div className="evidence__block">
        <h4>Who launched in {year}</h4>
        <BarList items={groups} />
        <p className="caption">Grey groups fly on their own or pre-contracted rockets, or must fly American (US government).</p>
      </div>
    </div>
  );
}

export function SamEvidence({ levers, fixed, result }: Props) {
  const weight = samWeight(levers, fixed, result.reach);
  const missions: BarItem[] = groupBy(satellites, "mission", weight).map((g) => ({ ...g, tone: "accent" }));
  const operators: BarItem[] = groupBy(satellites, "operator", weight).map((g) => ({ ...g, tone: "accent" }));
  const inYear = satellites.filter((s) => s.year === levers.baseYear);
  return (
    <div className="evidence">
      <div className="evidence__block evidence__block--wide">
        <h4>All satellites of {levers.baseYear} by inclination: blue is reachable</h4>
        <InclinationChart sats={inYear} reach={result.reach} />
        <p className="caption">
          Before the access and payload filters. The grey towers at 43° and 53° are almost all Starlink, plus Kuiper at 52°.
          The blue peak near 97° is sun-synchronous orbit: commercial Earth observation, but also Starlink's polar shell,
          which the access filter removes.
        </p>
      </div>
      <div className="evidence__block">
        <h4>What the SAM is made of</h4>
        <BarList items={missions} />
      </div>
      <div className="evidence__block">
        <h4>Largest operators in the SAM</h4>
        <BarList items={operators} />
      </div>
    </div>
  );
}

export function SomEvidence({ levers, fixed, result }: Props) {
  const weight = samWeight(levers, fixed, result.reach);
  const smallLaunchers = new Set(satellites.filter((s) => s.launcherClass === "small").map((s) => s.launchVehicle));
  const launchers = groupBy(satellites, "launchVehicle", weight);
  const items: BarItem[] = launchers.map((g) => ({ ...g, tone: smallLaunchers.has(g.name) ? "accent" : "muted" }));
  const sam = result.tiers.SAM;
  const small = launchers.filter((g) => smallLaunchers.has(g.name)).reduce((n, g) => ({ sats: n.sats + g.sats, massKg: n.massKg + g.massKg }), { sats: 0, massKg: 0 });
  const top = launchers[0];
  const bryce = preferred("smallsat_small_launcher_share", { year: 2025, scope: "non-broadband smallsats" });
  const insurance = preferred("launch_insurance_rate", { year: 2026, scope: "company", entity: "Isar Aerospace" });
  // Revealed preference from GCAT (view v_penetration_evidence): the base for the 7 % penetration lever.
  const evidence = (segment: string, period: string) => penetrationEvidence.find((e) => e.segment.startsWith(segment) && e.period === period);
  const band = { pooled: evidence("Andøya band", "2024–2025"), y2024: evidence("Andøya band", "2024"), y2025: evidence("Andøya band", "2025") };
  const west = evidence("Western open market", "2024–2025");
  const europe = winShareEvidence.find((e) => e.buyer.startsWith("European"));
  const electron = preferred("orbital_launches_company", { year: 2025, scope: "company", entity: "Rocket Lab" });
  const maxBar = Math.max(result.dedicatedKg, result.capacityKg, 1);

  return (
    <div className="evidence">
      <div className="evidence__block">
        <h4>Demand meets capacity</h4>
        <div className="balance">
          <div className="balance__row">
            <span>Buys a dedicated launch</span>
            <span className="balance__track">
              <span className="balance__bar balance__bar--market" style={{ width: `${(result.dedicatedKg / maxBar) * 100}%` }} />
            </span>
            <strong>{fmtTonnes(result.dedicatedKg)}</strong>
          </div>
          <div className="balance__row">
            <span>… of which chooses Isar</span>
            <span className="balance__track">
              <span className="balance__bar balance__bar--want" style={{ width: `${(result.wantKg / maxBar) * 100}%` }} />
            </span>
            <strong>{fmtTonnes(result.wantKg)}</strong>
          </div>
          <div className="balance__row">
            <span>Isar can fly</span>
            <span className="balance__track">
              <span className="balance__bar balance__bar--can" style={{ width: `${(result.capacityKg / maxBar) * 100}%` }} />
            </span>
            <strong>{fmtTonnes(result.capacityKg)}</strong>
          </div>
        </div>
        <p className="caption">
          The SOM is the smaller of what chooses Isar and what Isar can fly: {fmtTonnes(Math.min(result.wantKg, result.capacityKg))}, about{" "}
          {result.somLaunches.toFixed(1)} Spectrum loads. Today {result.bottleneck === "demand" ? "demand" : "capacity"} sets the limit. With{" "}
          {fmtPct(levers.successRate)} success Isar needs {result.launchesNeeded.toFixed(1)} of its {levers.launchesPerYear} launches for
          that ({fmtPct(share(result.launchesNeeded, levers.launchesPerYear))}).
        </p>

        <h4>Why 7 %: penetration in three points</h4>
        <ol className="points">
          <li>
            <b>Measured:</b> in {levers.baseYear} {fmtPct(share(top?.sats ?? 0, sam.sats))} of the SAM flew on {top?.name ?? "rideshare"} and{" "}
            {fmtPct(share(small.sats, sam.sats))} of satellites ({fmtPct(share(small.massKg, sam.massKg))} of mass) on a small launcher.
            {band.pooled && band.y2024 && band.y2025 && (
              <>
                {" "}
                The year swings, so we take 2024 and 2025 together: {fmtPct(band.pooled.dedicated_share_mass)} of the band's mass (
                {fmtPct(band.y2024.dedicated_share_mass)} in 2024, {fmtPct(band.y2025.dedicated_share_mass)} in 2025) bought a dedicated launch.
              </>
            )}{" "}
            <SourceChip id="gcat" />
          </li>
          <li>
            <b>Benchmarks:</b> {west ? `${fmtPct(west.dedicated_share_sats)} in the Western open market across all orbits; ` : ""}
            {fmtPct(bryce.value)} of non-broadband smallsats worldwide in 2025, but that includes Chinese small launchers{" "}
            <SourceChip id={bryce.source_id} />
          </li>
          <li>
            <b>Upside:</b> SpaceX rideshare stop after 2028, defence demand.
          </li>
        </ol>

        <h4>Why {fmtPct(levers.winShare)}: Isar's share of it</h4>
        <ol className="points">
          {europe && (
            <li>
              <b>Natural share:</b> in 2024 and 2025, European operators ({europe.operators}) bought {fmtPct(europe.share_mass)} of the band's
              dedicated mass ({fmtPct(europe.share_sats)} of satellites), all on {europe.launchers} because no European small launcher flew yet.{" "}
              <SourceChip id="gcat" />
            </li>
          )}
          <li>
            <b>Beyond Europe:</b> Isar also signs non-European customers (Planet, Astroscale, ElevationSpace, SEOPS), but Rocket Lab is
            proven and has capacity: {fmtUnit(electron.value, metrics[electron.metric_id].unit)} in 2025 <SourceChip id={electron.source_id} />.
          </li>
          <li>
            <b>Caution:</b> new rockets get demo payloads first: insurance on Isar's next mission is about {fmtPct(insurance.value)}{" "}
            <SourceChip id={insurance.source_id} />. Range 20–100 %: from demo phase to Rocket Lab not being an option.
          </li>
        </ol>
      </div>

      <div className="evidence__block">
        <h4>Who flies Isar's market today</h4>
        <BarList items={items} limit={6} />
        <p className="caption">Blue: small launchers that compete with Spectrum head-on. Grey: rideshare and large rockets.</p>
        <h4>Competitors in numbers</h4>
        <ul className="factlines">
          <FactLine label="Rocket Lab Electron orbital launches" metric="orbital_launches_company" year={2025} entity="Rocket Lab" />
          <FactLine label="… of which to SSO" metric="sso_launches_company" year={2025} entity="Rocket Lab" />
          <FactLine label="Electron revenue per launch" metric="revenue_per_launch" year={2025} entity="Rocket Lab" />
          <FactLine label="SpaceX rideshare list price 2027" metric="rideshare_price" year={2027} entity="SpaceX" />
        </ul>
      </div>

      <div className="evidence__block evidence__block--wide">
        <h4>Outlook for later questions: how long Spectrum is booked</h4>
        <BookingHorizon />
        <ul className="factlines factlines--row factlines--small">
          <FactLine label="Manifest booked through" metric="manifest_booked_through" year={2026} entity="Isar Aerospace" />
          <FactLine label="Isar's exclusive pad at Andøya" metric="pad_lease_years" year={2021} scope="site" entity="Andøya" />
          <FactLine label="Second Andøya pad (budget 2027)" metric="pad_budget" year={2027} scope="site" entity="Andøya" />
          <FactLine label="Factory target 2030" metric="factory_capacity" year={2030} entity="Isar Aerospace" />
        </ul>
      </div>
    </div>
  );
}
