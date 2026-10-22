#!/usr/bin/env python3
"""One row per orbital or deep-space launch attempt since 2024, for the warehouse table `launches`.

Source is McDowell's GCAT launch list (launch.tsv): launch site and pad, vehicle, launching agency, outcome,
target orbit and payload mass. Joined to `launch_sites` through their GCAT site codes, it shows who launches
how much to which orbit from every spaceport. Writes warehouse/seed/launches.csv.

    python3 -I warehouse/build_launches.py --raw <gcat raw dir>
"""
import argparse
import csv
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "pipeline"))
import gcat_demand as g  # noqa: E402

YEARS = ("2024", "2025", "2026")
MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

# Second word of GCAT's Category ("Sat SSO D") is the target orbit. LSS is a space-station flight (Tiangong),
# STO a supersynchronous transfer, MOL a Molniya orbit, EEO Earth escape (lunar and beyond).
ORBIT = {
    "LEO": "LEO", "ISS": "LEO", "LSS": "LEO", "SSO": "SSO",
    "GTO": "GTO", "STO": "GTO", "MTO": "MEO", "MEO": "MEO", "GEO": "GEO",
    "MOL": "HEO", "HEO": "HEO", "EEO": "escape",
}

COLUMNS = ["launch_tag", "launch_date", "launch_year", "vehicle", "variant", "mission", "site_code", "pad",
           "platform", "agency_code", "agency", "success", "launch_code", "orbit", "category", "inclination",
           "payload_t"]


def clean(value):
    value = (value or "").strip()
    return "" if value == "-" else value


def main(argv=None):
    ap = argparse.ArgumentParser()
    ap.add_argument("--raw", required=True)
    ap.add_argument("--out", default=os.path.join(ROOT, "warehouse", "seed", "launches.csv"))
    a = ap.parse_args(argv)

    orgs = {r["Code"]: r for r in g.read_tsv(os.path.join(a.raw, "orgs.tsv"))[0]}

    def org_name(code):
        o = orgs.get(code, {})
        for field in ("ShortEName", "ShortName", "EName", "Name"):
            value = clean(o.get(field))
            if value:
                return value
        return code

    rows = []
    for r in g.read_tsv(os.path.join(a.raw, "launch.tsv"))[0]:
        date = r["Launch_Date"].split()
        code = r["LaunchCode"].strip()
        # Orbital and deep-space attempts (GCAT launch codes O… and D…; second letter S = success, F = failure).
        if not date or date[0] not in YEARS or code[:1] not in ("O", "D"):
            continue
        category = r["Category"].split()
        agency = r["Agency"].strip().split("/")[0]
        rows.append({
            "launch_tag": r["Launch_Tag"].strip(),
            "launch_date": f"{date[0]}-{MONTHS.index(date[1]) + 1:02d}-{int(date[2].rstrip('?')):02d}",
            "launch_year": date[0],
            "vehicle": clean(r["LV_Type"]),
            "variant": clean(r["Variant"]),
            "mission": clean(r["Mission"]) or clean(r["Flight"]),
            "site_code": clean(r["Launch_Site"]),
            "pad": clean(r["Launch_Pad"]),
            "platform": clean(r["Platform"]),
            "agency_code": agency,
            "agency": org_name(agency),
            "success": str(code[1:2] == "S").lower(),
            "launch_code": code,
            "orbit": ORBIT.get(category[1], "other") if len(category) > 1 else "other",
            "category": " ".join(category),
            "inclination": clean(r["Inc"]),
            "payload_t": clean(r["OrbPay"]),
        })
    with open(a.out, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=COLUMNS)
        w.writeheader()
        w.writerows(rows)
    print(f"{len(rows)} orbital launches -> {a.out}")


if __name__ == "__main__":
    main()
