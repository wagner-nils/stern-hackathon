# /// script
# requires-python = ">=3.11"
# dependencies = ["psycopg[binary]>=3.2"]
# ///
"""Load the fact warehouse into Supabase: schema, curated seed tables and the GCAT satellite table.

    uv run warehouse/load.py

The seed CSVs replace the tables. If someone edited data in Supabase, run `uv run warehouse/export.py` first:
it writes the database back into the CSVs, so nothing gets lost and every change shows up in git.
"""
import csv
import json
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))
import db  # noqa: E402

HERE = pathlib.Path(__file__).parent
SEED = HERE / "seed"
# Parents before children, so foreign keys hold while inserting.
TABLES = ["sources", "metrics", "facts", "assumptions", "launch_sites", "vehicles", "launch_site_vehicles",
          "manifest", "satellites", "launches", "expansion_fields", "site_nodes"]
ARRAY_COLUMNS = {"source_ids", "gcat_codes", "gcat_names", "orbits"}
# Columns where an empty field means "none" rather than "unknown".
EMPTY_TEXT_COLUMNS = {"entity"}


def seed_rows(table):
    with open(SEED / f"{table}.csv", newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = []
        for r in reader:
            if None in r:
                raise SystemExit(f"{table}.csv line {reader.line_num}: more fields than columns")
            rows.append({
                k: (v.split(";") if v else []) if k in ARRAY_COLUMNS
                else v if v != "" or k in EMPTY_TEXT_COLUMNS else None
                for k, v in r.items()
            })
        return reader.fieldnames, rows


def main():
    with db.connect() as conn:
        conn.execute((HERE / "schema.sql").read_text())
        for table in TABLES:
            columns, rows = seed_rows(table)
            cols = ", ".join(columns)
            # Postgres casts every value to the column type defined in schema.sql.
            conn.execute(
                f"insert into {table} ({cols}) select {cols} from jsonb_populate_recordset(null::{table}, %s::jsonb)",
                (json.dumps(rows),),
            )
            print(f"{table:13s} {len(rows):5d} rows")
        # Checks run before the commit, so a failed check leaves the database as it was.
        for label, sql, blocking in [
            ("facts without source", "select count(*) from facts f left join sources s on s.id = f.source_id where s.id is null", True),
            ("assumptions with unknown source",
             "select count(*) from assumptions a, unnest(a.source_ids) sid where sid not in (select id from sources)", True),
            ("expansion fields with unknown source",
             "select count(*) from expansion_fields e, unnest(e.source_ids) sid where sid not in (select id from sources)", True),
            ("site nodes with unknown source",
             "select count(*) from site_nodes n, unnest(n.source_ids) sid where sid not in (select id from sources)", True),
            ("launch sites with unknown source",
             "select count(*) from launch_sites l, unnest(l.source_ids) sid where sid not in (select id from sources)", True),
            # The RQ2 load size is derived; it must stay equal to Spectrum's SSO payload times the fill rate.
            ("Q2 load size out of step with payload × fill rate",
             "select count(*) from assumptions a, assumptions f, vehicles v where a.id = 'q2_load_kg' and f.id = 'fixed_fill_rate'"
             " and v.id = 'spectrum' and abs(a.value - v.payload_sso_kg * f.value) > 0.5", True),
            # A code without launches is fine for a quiet site; it is listed to catch typos.
            ("GCAT site codes without launches since 2024",
             "select count(*) from launch_sites l, unnest(l.gcat_codes) c where not exists (select 1 from launches where site_code = c)", False),
            ("GCAT vehicle names without launches since 2024",
             "select count(*) from vehicles v, unnest(v.gcat_names) n where not exists (select 1 from launches where vehicle = n)", False),
        ]:
            n = conn.execute(sql).fetchone()[0]
            print(f"check: {label}: {n}")
            if n and blocking:
                raise SystemExit("integrity check failed, nothing loaded")
        conn.commit()


if __name__ == "__main__":
    main()
