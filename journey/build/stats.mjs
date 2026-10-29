// Build facts for the journey, counted from the repo at build time instead of typed into captions.
import { execSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const sh = (cmd, cwd) => execSync(cmd, { cwd, encoding: "utf8" }).trim();
// CSV rows without the header; quoted fields may contain line breaks, so count records, not lines.
function csvRows(file) {
  const text = readFileSync(file, "utf8");
  let rows = 0;
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') quoted = !quoted;
    else if (ch === "\n" && !quoted) rows++;
  }
  if (!text.endsWith("\n")) rows++;
  return rows - 1;
}

/** Repo facts; commits and hours are counted up to the final hackathon commit, not today's head. */
export function stats(repo, finalCommit) {
  const seed = join(repo, "warehouse/seed");
  const rows = Object.fromEntries(readdirSync(seed).filter((f) => f.endsWith(".csv")).map((f) => [f.replace(".csv", ""), csvRows(join(seed, f))]));
  const schema = readFileSync(join(repo, "warehouse/schema.sql"), "utf8");
  const tables = new Set([...schema.matchAll(/create\s+table\s+(?:if\s+not\s+exists\s+)?([a-z0-9_]+)/gi)].map((m) => m[1])).size;
  // Versions of the tool's main libraries (major.minor), as installed for the build.
  const pkg = JSON.parse(readFileSync(join(repo, "dashboard/package.json"), "utf8"));
  const ver = (name) => (pkg.dependencies?.[name] ?? pkg.devDependencies?.[name] ?? "").replace(/^[^\d]*/, "").split(".").slice(0, 2).join(".");
  const views = new Set([...schema.matchAll(/create\s+(?:or\s+replace\s+)?view\s+([a-z0-9_]+)/gi)].map((m) => m[1])).size;
  // Assumption owners, from the owner column of the seed.
  const head = readFileSync(join(seed, "assumptions.csv"), "utf8").split("\n")[0].split(",");
  const ownerCol = head.indexOf("owner");
  const owners = {};
  for (const line of readFileSync(join(seed, "assumptions.csv"), "utf8").split("\n").slice(1)) {
    const cells = line.match(/("([^"]|"")*"|[^,]*)(,|$)/g)?.map((c) => c.replace(/,$/, "")) ?? [];
    const o = cells[ownerCol];
    if (o) owners[o] = (owners[o] ?? 0) + 1;
  }
  const log = sh(`git log --format=%aI ${finalCommit}`, repo).split("\n");
  const first = new Date(log[log.length - 1]);
  const last = new Date(log[0]);
  return {
    sources: rows.sources,
    facts: rows.facts,
    metrics: rows.metrics,
    assumptions: rows.assumptions,
    launchSites: rows.launch_sites,
    vehicles: rows.vehicles,
    launches: rows.launches,
    satellites: rows.satellites,
    expansionFields: rows.expansion_fields,
    scenarios: rows.scenarios,
    views,
    tables,
    vReact: ver("react"),
    vVite: ver("vite"),
    vRecharts: ver("recharts"),
    vTypeScript: ver("typescript"),
    vVitest: ver("vitest"),
    commits: Number(sh(`git rev-list --count ${finalCommit}`, repo)),
    hours: Math.round((last - first) / 36e5),
    chapters: 8,
    ownersNils: owners.Nils ?? 0,
    ownersBenedikt: owners.Benedikt ?? 0,
    ownersLuca: owners.Luca ?? 0,
  };
}
