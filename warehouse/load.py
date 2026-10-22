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
TABLES = ["sources", "metrics", "facts", "assumptions", "launch_sites", "vehicles", "manifest", "satellites"]
ARRAY_COLUMNS = {"source_ids"}
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
        conn.execute(f"truncate {', '.join(TABLES)} restart identity")
        for table in TABLES:
            columns, rows = seed_rows(table)
            cols = ", ".join(columns)
            # Postgres casts every value to the column type defined in schema.sql.
            conn.execute(
                f"insert into {table} ({cols}) select {cols} from jsonb_populate_recordset(null::{table}, %s::jsonb)",
                (json.dumps(rows),),
            )
            print(f"{table:13s} {len(rows):5d} rows")
        conn.commit()
        for label, sql in [
            ("facts without source", "select count(*) from facts f left join sources s on s.id = f.source_id where s.id is null"),
            ("assumptions with unknown source", "select count(*) from assumptions a, unnest(a.source_ids) sid where sid not in (select id from sources)"),
        ]:
            n = conn.execute(sql).fetchone()[0]
            print(f"check: {label}: {n}")
            if n:
                raise SystemExit("integrity check failed")


if __name__ == "__main__":
    main()
