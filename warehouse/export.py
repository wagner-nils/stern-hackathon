# /// script
# requires-python = ">=3.11"
# dependencies = ["psycopg[binary]>=3.2"]
# ///
"""Export the fact warehouse from Supabase.

    uv run warehouse/export.py

1. Writes the curated tables back into warehouse/seed/*.csv, so edits made in Supabase show up in git.
2. Writes dashboard/src/data/warehouse.json, the snapshot the dashboard is built from (it runs offline).
"""
import csv
import datetime
import decimal
import json
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))
import db  # noqa: E402

HERE = pathlib.Path(__file__).parent
SNAPSHOT = HERE.parent / "dashboard" / "src" / "data" / "warehouse.json"
CURATED = {
    "sources": "id",
    "metrics": "id",
    "facts": "metric_id, scope, entity, year desc, is_preferred desc, source_id",
    "assumptions": "question, tier, id",
    "launch_sites": "id",
    "vehicles": "id",
    "launch_site_vehicles": "site_id, vehicle_id",
    "manifest": "id",
    "expansion_fields": "category, id",
    "site_nodes": "kind, id",
    "scenarios": "sort",
}
# Satellites go to the dashboard column by column, with repeated strings stored once.
SATELLITE_TEXT = ["customer_type", "customer_group", "orbit_class", "launch_vehicle", "launcher_class", "operator", "mission"]


def plain(v):
    if isinstance(v, decimal.Decimal):
        return int(v) if v == v.to_integral_value() else float(v)
    if isinstance(v, (datetime.date, datetime.datetime)):
        return v.isoformat()
    return v


def csv_value(v):
    if v is None:
        return ""
    if isinstance(v, bool):
        return "true" if v else "false"
    if isinstance(v, list):
        return ";".join(v)
    return str(plain(v))


def fetch(conn, sql):
    cur = conn.execute(sql)
    cols = [c.name for c in cur.description]
    return cols, [dict(zip(cols, (plain(v) for v in row))) for row in cur.fetchall()]


def main():
    snapshot = {"generatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds")}
    with db.connect() as conn:
        for table, order in CURATED.items():
            header = (HERE / "seed" / f"{table}.csv").read_text(encoding="utf-8").splitlines()[0].split(",")
            _, rows = fetch(conn, f"select {', '.join(header)} from {table} order by {order}")
            with open(HERE / "seed" / f"{table}.csv", "w", newline="", encoding="utf-8") as f:
                w = csv.writer(f, lineterminator="\n")
                w.writerow(header)
                for r in rows:
                    w.writerow([csv_value(r[c]) for c in header])
            snapshot[table] = rows
            print(f"{table:13s} {len(rows):5d} rows -> seed + snapshot")

        _, sats = fetch(conn, "select launch_year, inclination, mass_kg, " + ", ".join(SATELLITE_TEXT) +
                        " from satellites order by launch_year, jcat")
        dictionaries = {c: sorted({s[c] or "" for s in sats}) for c in SATELLITE_TEXT}
        index = {c: {v: k for k, v in enumerate(dictionaries[c])} for c in SATELLITE_TEXT}
        snapshot["satellites"] = {
            "count": len(sats),
            "year": [s["launch_year"] for s in sats],
            "inclination": [s["inclination"] for s in sats],
            "massKg": [s["mass_kg"] for s in sats],
            "codes": {c: [index[c][s[c] or ""] for s in sats] for c in SATELLITE_TEXT},
            "dictionaries": dictionaries,
        }
        print(f"satellites    {len(sats):5d} rows -> snapshot")

        _, snapshot["q1Funnel"] = fetch(conn, "select * from v_q1_funnel")
        _, snapshot["samLaunchers"] = fetch(conn, "select * from v_sam_launchers")
        _, snapshot["siteOverview"] = fetch(conn, "select * from v_launch_site_overview")
        _, snapshot["siteActivity"] = fetch(conn, "select * from v_launch_site_activity order by site_id, year")
        _, snapshot["vehicleActivity"] = fetch(conn, "select * from v_vehicle_activity order by vehicle_id, year")
        _, snapshot["launchesByProvider"] = fetch(conn, "select * from v_launches_by_provider order by year, launches desc")
        _, snapshot["launchesByCountry"] = fetch(conn, "select * from v_launches_by_country order by year, launches desc")
        _, snapshot["q2LaunchGap"] = fetch(conn, "select * from v_q2_launch_gap")
        _, snapshot["q2Expansion"] = fetch(conn, "select * from v_q2_expansion_fields")
        _, snapshot["q3SiteLoad"] = fetch(conn, "select * from v_q3_site_load")
        _, snapshot["scenarioPnl"] = fetch(conn, "select * from v_scenarios")
        _, snapshot["penetrationEvidence"] = fetch(conn, "select * from v_penetration_evidence")
        _, snapshot["winShareEvidence"] = fetch(conn, "select * from v_win_share_evidence")
        print("views         Q1 funnel, SAM launchers, site overview and activity, vehicle activity, launches by provider and country -> snapshot")

    SNAPSHOT.write_text(json.dumps(snapshot, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"snapshot -> {SNAPSHOT.relative_to(HERE.parent)} ({SNAPSHOT.stat().st_size // 1024} kB)")


if __name__ == "__main__":
    main()
