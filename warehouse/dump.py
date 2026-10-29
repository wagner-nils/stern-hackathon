# /// script
# requires-python = ">=3.11"
# dependencies = ["psycopg[binary]>=3.2"]
# ///
"""Dump the whole fact warehouse from Supabase into database/, independent of Supabase.

    uv run warehouse/dump.py

Writes every table to database/tables/<name>.csv and every view to database/views/<name>.csv,
copies the schema to database/schema.sql and regenerates database/README.md (columns, row counts).
Unlike export.py it keeps generated tables (satellites, launches) and the computed views, so the
data can be read without a database. Lists are joined with ';', booleans are 'true'/'false', NULL is empty.
"""
import csv
import datetime
import decimal
import pathlib
import shutil
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))
import db  # noqa: E402

HERE = pathlib.Path(__file__).parent
OUT = HERE.parent / "database"
SKIP = {"kit_migrations"}  # empty bookkeeping table of the hackathon starter kit

# One line per relation for the README; relations without an entry are listed without description.
ABOUT = {
    "sources": "Every source: title, publisher, URL, kind, reliability, short label",
    "metrics": "Dictionary of measured quantities with unit and definition",
    "facts": "Measured numbers in long format (metric, year, scope, entity, value, source); one preferred source per metric",
    "assumptions": "Team judgements: value, range, reasoning, sources, owner, confidence; lever or fixed",
    "launch_sites": "Global spaceport register: operator, location, reachable inclination band, status, pads, limits, Isar relation",
    "vehicles": "Launch vehicles with operator, class, payload to LEO/SSO/GTO, status, price",
    "launch_site_vehicles": "Who launches what from where: site x vehicle with status, orbits, pad",
    "manifest": "Isar Aerospace's known contracts",
    "satellites": "All 7,361 satellites launched 2024/2025 (GCAT) with mass, inclination, customer group, mission, launcher",
    "launches": "Every orbital and deep-space launch attempt since 2024 (GCAT)",
    "expansion_fields": "Q2: 13 growth fields with market, growth, Isar share, margin, cost, capital, sources",
    "site_nodes": "Q3: production and launch sites with capacity, cost and role",
    "scenarios": "P&L scenarios Bear / ASCENT / Bull with their parameters",
    "v_q1_funnel": "Q1 funnel TAM -> SAM -> SOM by satellites, mass and revenue",
    "v_sam_launchers": "Which launchers carry the Andoya-reachable market today",
    "v_facts": "Facts with metric and source resolved",
    "v_launch_site_overview": "One row per spaceport: register, active and planned vehicles, orbits, launches per year",
    "v_launch_site_activity": "Launches, failures, payload and target orbits per spaceport and year",
    "v_vehicle_activity": "Launches, successes and payload per vehicle and year",
    "v_launches": "Every launch with site, vehicle, provider and provider country resolved",
    "v_launches_by_provider": "Launches, successes and payload per provider and year",
    "v_launches_by_country": "Launches, successes and payload per provider country and year",
    "v_penetration_evidence": "Evidence for the 7 % share that buys a dedicated small launch",
    "v_win_share_evidence": "Evidence for Isar's 45 % win share against Rocket Lab",
    "v_q2_launch_gap": "Q2: how many planned Isar launches today's flown demand fills",
    "v_q2_expansion_fields": "Q2: revenue, gross profit and EVA proxy per field for 2030/2035/2040",
    "v_q3_site_load": "Q3: launches and plant load per site and year",
    "v_scenarios": "P&L per scenario and year 2027-2040: revenue, cost, EBIT proxy, cumulative result",
}


def cell(v):
    if v is None:
        return ""
    if isinstance(v, bool):
        return "true" if v else "false"
    if isinstance(v, list):
        return ";".join(cell(x) for x in v)
    if isinstance(v, decimal.Decimal):
        return str(int(v)) if v == v.to_integral_value() else str(v)
    if isinstance(v, (datetime.date, datetime.datetime)):
        return v.isoformat()
    return str(v)


def main():
    for sub in ("tables", "views"):
        shutil.rmtree(OUT / sub, ignore_errors=True)
        (OUT / sub).mkdir(parents=True)
    inventory = []
    with db.connect() as conn:
        rels = conn.execute("""select table_name, table_type from information_schema.tables
            where table_schema = 'public' order by table_type, table_name""").fetchall()
        for name, kind in rels:
            if name in SKIP:
                continue
            sub = "views" if kind == "VIEW" else "tables"
            cols = [r[0] for r in conn.execute("""select column_name from information_schema.columns
                where table_schema = 'public' and table_name = %s order by ordinal_position""", (name,))]
            # Stable order: by the first column (the id for tables), so diffs stay small.
            order = ", ".join(f'"{c}"' for c in cols[: 3 if sub == "views" else 1])
            rows = conn.execute(f'select * from "{name}" order by {order}').fetchall()
            with open(OUT / sub / f"{name}.csv", "w", newline="", encoding="utf-8") as f:
                w = csv.writer(f, lineterminator="\n")
                w.writerow(cols)
                w.writerows([cell(v) for v in r] for r in rows)
            inventory.append((sub, name, len(rows), cols))
            print(f"{sub:6s} {name:28s} {len(rows):6d} rows")

    shutil.copyfile(HERE / "schema.sql", OUT / "schema.sql")
    stamp = datetime.date.today().isoformat()
    lines = [
        "# Database dump: Isar Aerospace fact warehouse",
        "",
        f"Full CSV dump of the team's Supabase database (Postgres), taken on {stamp} with `uv run warehouse/dump.py`. "
        "It contains every table and every view, so the data can be read, filtered or loaded without access to Supabase. "
        "The schema with all view definitions is in [schema.sql](schema.sql).",
        "",
        "- **Tables** (`tables/`) hold sourced facts, team assumptions and the raw catalogues. **Views** (`views/`) are computed from them in SQL; the dashboard model is tested against them.",
        "- **Format:** UTF-8, comma-separated, header row. Lists are joined with `;`, booleans are `true`/`false`, NULL is an empty cell. Money in real 2026 euros unless the column says otherwise.",
        "- **Sources:** every fact and assumption points to a row in `sources` (`source_id` / `source_ids`). Satellites and launches come from Jonathan McDowell's [GCAT](https://planet4589.org/space/gcat/) catalogue.",
        "- **Not Isar data, not investment advice:** figures are team estimates from public sources and an expert interview during a two-day case exercise.",
        "",
        "To load it into a fresh Postgres: run `schema.sql`, then `\\copy <table> from 'tables/<table>.csv' csv header` per table, parents first (`sources`, `metrics`, then the rest).",
        "",
        "| Kind | Name | Rows | Content |",
        "| --- | --- | ---: | --- |",
    ]
    for sub, name, n, _ in inventory:
        kind = "view" if sub == "views" else "table"
        lines.append(f"| {kind} | [`{name}`]({sub}/{name}.csv) | {n:,} | {ABOUT.get(name, '')} |")
    lines += ["", "## Columns", ""]
    for sub, name, _, cols in inventory:
        lines.append(f"- **`{name}`**: " + ", ".join(f"`{c}`" for c in cols))
    (OUT / "README.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"README -> {(OUT / 'README.md').relative_to(HERE.parent)}")


if __name__ == "__main__":
    main()
