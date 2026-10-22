#!/usr/bin/env python3
"""One row per payload that reached orbit in 2024 and 2025, for the warehouse table `satellites`.

Reuses the population and customer rules of pipeline/gcat_demand.py and adds the launch vehicle (GCAT launch.tsv)
and the mission (GCAT psatcat Category). Writes warehouse/seed/satellites.csv.

    python3 -I warehouse/build_satellites.py --raw <gcat raw dir>
"""
import argparse
import csv
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "pipeline"))
import gcat_customers as gc  # noqa: E402
import gcat_demand as g  # noqa: E402

# Dedicated small launchers by GCAT LV_Type prefix; everything else carries small satellites as rideshare or is a
# large single launch. GCAT writes "Firefly Alpha" and "HANBIT-NANO", so those need their full prefixes.
SMALL_LAUNCHERS = ("Electron", "Firefly Alpha", "Alpha", "Kairos", "Spectrum", "SSLV", "LauncherOne", "Eris", "RFA One",
                   "Miura", "HANBIT", "Vikram")

MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

COLUMNS = ["jcat", "name", "launch_year", "launch_date", "launch_tag", "launch_vehicle", "launcher_class", "operator_code",
           "operator", "country", "customer_group", "customer_type", "mission", "orbit_class", "inclination",
           "mass_kg", "mass_estimated"]


def main(argv=None):
    ap = argparse.ArgumentParser()
    ap.add_argument("--raw", required=True)
    ap.add_argument("--out", default=os.path.join(ROOT, "warehouse", "seed", "satellites.csv"))
    a = ap.parse_args(argv)

    pop = g.build(a.raw, ["2024", "2025"])["pop"]
    category = {}
    for name in gc.PAYLOAD_CATALOGS:
        path = os.path.join(a.raw, name)
        if os.path.exists(path):
            for r in g.read_tsv(path)[0]:
                category[r["JCAT"]] = r.get("Category", "").strip()
    vehicle = {r["Launch_Tag"]: r["LV_Type"].strip() for r in g.read_tsv(os.path.join(a.raw, "launch.tsv"))[0]}
    orgs = {r["Code"]: r for r in g.read_tsv(os.path.join(a.raw, "orgs.tsv"))[0]}

    def operator_name(code):
        # GCAT writes "-" for empty fields; prefer the short English name, then the short name.
        o = orgs.get(code, {})
        for field in ("ShortEName", "ShortName", "EName", "Name"):
            value = o.get(field, "").strip()
            if value and value != "-":
                return value
        return code

    def iso_date(ldate):
        # GCAT dates look like "2025 Jan  4" or "2025 Jan  4 1427".
        parts = ldate.split()
        if len(parts) < 3 or parts[1] not in MONTHS:
            return ""
        return f"{parts[0]}-{MONTHS.index(parts[1]) + 1:02d}-{int(parts[2].rstrip('?')):02d}"

    rows = []
    for year in ("2024", "2025"):
        for p in pop[year]:
            lv = vehicle.get(p["launchTag"], "")
            code = p["owner"].split("/")[0]
            rows.append({
                "jcat": p["jcat"],
                "name": p["name"],
                "launch_year": year,
                "launch_date": iso_date(p["ldate"]),
                "launch_tag": p["launchTag"],
                "launch_vehicle": lv,
                "launcher_class": "small" if lv.startswith(SMALL_LAUNCHERS) else "rideshare or large",
                "operator_code": code,
                "operator": operator_name(code),
                "country": p["state"],
                "customer_group": p["group"],
                "customer_type": p["customer"],
                "mission": gc.mission(category.get(p["jcat"], "")),
                "orbit_class": p["orbit"],
                "inclination": "" if p["inc"] is None else round(p["inc"], 2),
                "mass_kg": "" if p["mass"] is None else round(p["mass"], 1),
                "mass_estimated": str(p["massSource"] != "gcat").lower(),
            })
    os.makedirs(os.path.dirname(a.out), exist_ok=True)
    with open(a.out, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=COLUMNS)
        w.writeheader()
        w.writerows(rows)
    print(f"{len(rows)} satellites -> {a.out}")


if __name__ == "__main__":
    main()
