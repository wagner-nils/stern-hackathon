#!/usr/bin/env python3
"""Who flies in Andøya's orbit band: open-market payloads by mission and by operator.

Reuses the population and customer rules of gcat_demand.py and adds GCAT's payload category
(psatcat column Category) to group missions. Run after gcat_demand.py has downloaded the raw files:

    python3 -I pipeline/gcat_customers.py --raw <dir> [--year 2025] [--top 25]
"""
import argparse
import collections
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import gcat_demand as g  # noqa: E402

PAYLOAD_CATALOGS = ("psatcat.tsv", "psatcat100k.tsv", "pauxcat.tsv", "ptmpcat.tsv")


def mission(category):
    c = category.upper()
    if c.startswith("IMG-R"):
        return "EO radar (SAR)"
    if c.startswith("IMG"):
        return "EO optical"
    if c.startswith("COM/MET") or c.startswith("MET"):
        return "Weather / radio occultation"
    if c.startswith("COM"):
        return "Comms / IoT"
    if c.startswith(("SIG", "EW")):
        return "Signals / RF intelligence"
    if c.startswith(("TECH", "CAL")):
        return "Tech demo"
    if c.startswith(("SCI", "EOSCI", "AST", "PLAN")):
        return "Science"
    if c.startswith("NAV"):
        return "Navigation"
    return "Other"


def main(argv=None):
    ap = argparse.ArgumentParser()
    ap.add_argument("--raw", required=True)
    ap.add_argument("--year", default="2025")
    ap.add_argument("--top", type=int, default=25)
    a = ap.parse_args(argv)

    pop = g.build(a.raw, [a.year])["pop"][a.year]
    category = {}
    for name in PAYLOAD_CATALOGS:
        path = os.path.join(a.raw, name)
        if os.path.exists(path):
            for r in g.read_tsv(path)[0]:
                category[r["JCAT"]] = r.get("Category", "").strip()

    band = [p for p in pop if p["andoya"] and p["customer"] != "captive"]
    mass = lambda ps: sum(p["mass"] or 0 for p in ps) / 1000  # noqa: E731
    print(f"{a.year}: {len(band)} open-market payloads in the Andøya band, {mass(band):.1f} t\n")

    by_mission = collections.defaultdict(list)
    for p in band:
        by_mission[mission(category.get(p["jcat"], ""))].append(p)
    print("| Mission | Satellites | Mass (t) |\n| --- | --- | --- |")
    for k, ps in sorted(by_mission.items(), key=lambda kv: -len(kv[1])):
        print(f"| {k} | {len(ps)} | {mass(ps):.1f} |")

    by_owner = collections.defaultdict(list)
    for p in band:
        by_owner[p["owner"].split("/")[0]].append(p)
    print(f"\n| Operator code | Group | Satellites | Mass (t) | Example | Main mission |\n| --- | --- | --- | --- | --- | --- |")
    for code, ps in sorted(by_owner.items(), key=lambda kv: -len(kv[1]))[: a.top]:
        main_mission = collections.Counter(mission(category.get(p["jcat"], "")) for p in ps).most_common(1)[0][0]
        print(f"| {code} | {ps[0]['group']} | {len(ps)} | {mass(ps):.2f} | {ps[0]['name']} | {main_mission} |")


if __name__ == "__main__":
    main()
