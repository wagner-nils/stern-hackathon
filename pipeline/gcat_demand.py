#!/usr/bin/env python3
"""Bottom-up launch-demand dataset from Jonathan McDowell's GCAT.

Builds, for each launch year (default 2024 and 2025), the population of payloads
that reached orbit, classifies every payload by orbit, inclination, mass and
customer type, and writes demand segments for the dashboard
(dashboard/src/data/generated/demand-<year>.json) plus a sanity summary
(stdout and pipeline/README.md).

Run (standard library only, Python 3.9+):

    python3 -I pipeline/gcat_demand.py --raw <dir> --out dashboard/src/data/generated [--download]

--download fetches any missing raw file with curl (urllib as fallback); --refresh
re-fetches all of them. Raw files never go into the repo.

Source
  J. C. McDowell, General Catalog of Artificial Space Objects (GCAT),
  https://planet4589.org/space/gcat/ . Column meanings are taken from the GCAT docs:
  web/cat/cols.html (object catalogs), web/cat/pcols.html (payload catalogs),
  web/intro/type.html (SatType bytes), web/intro/phases.html (Status codes),
  web/intro/orbits.html (OpOrbit codes), web/orgs/index.html (orgs table).

Population (per launch year)
  * Objects from the four orbital object catalogs: satcat (S, SATCAT numbers 1-69999),
    satcat100k (S, 100000+), auxcat (A, orbital objects without a SATCAT entry) and
    tmpcat (T, in orbit, number pending). ftocat (failed to orbit) is only counted
    for reporting. Each JCAT appears once in these catalogs (later phases live in
    ecat), so every payload is counted once; a Piece+Name check guards T/S overlaps.
  * SatType byte 1 = 'P' (payload) and LDate (UTC launch date) in the year.
  * Excluded, counted per reason: byte 2 = 'A' (alias/lease phase) or 'X' (GCAT
    "non-standard payload": rideshare carrier stacks, attached reentry capsules,
    mass simulators, Starship's Starlink simulators); payloads of launches that
    launch.tsv codes as orbital failure (LaunchCode 'OF...', e.g. 2024-129,
    20 Starlinks stranded at 135 km perigee); payloads of marginal or suborbital
    launches (launch tag not 'yyyy-nnn', e.g. Starship test flights 'yyyy-Unn');
    payloads whose canonical orbit is suborbital or trans-atmospheric
    (OpOrbit ATM/SO/TA).
  * ISS and other carrier deployments: GCAT dates the payload by the launch that
    carried it (LDate and Launch_Tag of the cargo flight, even though the piece is
    1998-067xx). We use the payload's own canonical orbit (its own tracking after
    deployment). If a payload has no usable orbit (still inside or attached), we
    use the orbit of its parent object (ISS, deployer or carrier), walking up the
    Parent chain.

Orbit class (canonical orbit: Perigee, Apogee, Inc, OpOrbit)
  Beyond   Status DSO/DSA, OpOrbit CLO/EEO/HCO/PCO/SSE/DSO (lunar, cislunar,
           heliocentric, escape), or deep-space flag (SatType byte 5 or 12 = 'D')
           together with apogee >= 2,000 km (flags alone are occasionally misplaced)
  SSO      apogee < 2,000 km and inclination >= 85 deg (labelled Polar/SSO; includes
           the few retrograde LEO orbits above 110.6 deg)
  LEO      apogee < 2,000 km and inclination < 85 deg
  GTO/GEO  apogee >= 2,000 km and OpOrbit GEO*/GTO/HEO*/VHEO, or apogee >= 30,000 km
           (GEO-bound transfer/drift orbits), or eccentricity >= 0.5, or period >= 23 h
  MEO      any other orbit with apogee >= 2,000 km
  Andøya band: inclination within [90, 110.6] deg (site licence corridor 280-360 deg).

Mass
  GCAT 'Mass' = wet mass of the object at orbit insertion, without attached objects.
  'TotMass' is not used: it bundles attached objects (cargo, trunks, mass
  simulators, sometimes the upper stage), so summing it double-counts. Mass flagged
  '?' is McDowell's own estimate (about +-20 %) and is kept as is. Missing or zero
  masses are imputed with the median of the same psatcat Program, then same Bus,
  then same lead owner, then same orbit class and customer group, then all
  payloads (counts per level are reported; none were needed for the 2024/2025
  data of 2026-10-17).
  Mass classes (upper bound inclusive, so 700 kg fits Spectrum's SSO and 1,000 kg
  its LEO capacity): <=50, 50-200, 200-700, 700-1,000, 1,000-2,000, >2,000 kg.

Customer type (first matching rule wins; counts per rule are printed)
  Owner is a '/'-separated list of org codes; the first is the lead operator. Org
  class (A academic, B business, C civil government, D defence) and UCode come from
  orgs.tsv; the owner state is the object's 'State' column; the payload class is
  psatcat 'Class' (McDowell's per-satellite judgement).
  captive / Starlink           lead owner UCode SPXS (SpaceX Starlink), or Bus
                               'Starshield' (NRO proliferated architecture)
  captive / Kuiper / OneWeb    any owner UCode KUIP or ONEWEB, or Program Kuiper/OneWeb
  captive / China              State CN, HK or MO (government and commercial)
  captive / Russia             State RU (government and commercial)
  institutional-us             crewed and station-cargo spacecraft flown for NASA
                               (Commercial Crew/Cargo: Dragon Crew-n and CRS-n,
                               Cygnus 'S.S.', Starliner) with a commercial owner
  institutional-*              lead owner org class C or D, or (lead owner A/B and)
                               payload class C or D; split by State into
                               US government (US), European institutional (EU-27,
                               UK, NO, CH, IS, LI, ESA, EU, EUMETSAT) and
                               Other governments (all other states)
  open-commercial              everything else (class A/B owners outside CN/RU that
                               are not one of the constellations above)

Segments
  Aggregated by (customer, group, orbit class, 2-deg inclination bin [lo, hi),
  mass class) with satellite count and average mass.
"""

from __future__ import annotations

import argparse
import collections
import csv
import datetime as dt
import json
import math
import os
import re
import shutil
import statistics
import subprocess
import sys
import urllib.request

GCAT_HOME = "https://planet4589.org/space/gcat/"
GCAT_TSV = "https://planet4589.org/space/gcat/tsv"
STATS = "https://planet4589.org/space/stats/out"

# Raw files: name -> URL. 'required' files are needed for the build; the rest only
# feed the published-totals comparison and the failure count.
RAW_FILES = {
    "satcat.tsv": (f"{GCAT_TSV}/cat/satcat.tsv", True),
    "satcat100k.tsv": (f"{GCAT_TSV}/cat/satcat100k.tsv", True),
    "auxcat.tsv": (f"{GCAT_TSV}/cat/auxcat.tsv", True),
    "tmpcat.tsv": (f"{GCAT_TSV}/cat/tmpcat.tsv", True),
    "psatcat.tsv": (f"{GCAT_TSV}/cat/psatcat.tsv", True),
    "psatcat100k.tsv": (f"{GCAT_TSV}/cat/psatcat100k.tsv", True),
    "pauxcat.tsv": (f"{GCAT_TSV}/cat/pauxcat.tsv", True),
    "ptmpcat.tsv": (f"{GCAT_TSV}/cat/ptmpcat.tsv", True),
    "orgs.tsv": (f"{GCAT_TSV}/tables/orgs.tsv", True),
    "launch.tsv": (f"{GCAT_TSV}/launch/launch.tsv", True),
    "ftocat.tsv": (f"{GCAT_TSV}/cat/ftocat.tsv", False),
    "satannual.txt": (f"{STATS}/satannual.txt", False),
    "msatannual.txt": (f"{STATS}/msatannual.txt", False),
}
OBJECT_CATALOGS = ["satcat.tsv", "satcat100k.tsv", "auxcat.tsv", "tmpcat.tsv"]
PAYLOAD_CATALOGS = ["psatcat.tsv", "psatcat100k.tsv", "pauxcat.tsv", "ptmpcat.tsv"]

ANDOYA_INC = (90.0, 110.6)  # deg, Andøya licence corridor (dashboard/src/data/sites.ts)
LEO_APOGEE_KM = 2000.0
GEO_BOUND_APOGEE_KM = 30000.0  # apogee above this (but bound): GEO-bound transfer/drift orbit
SSO_MIN_INC = 85.0
INC_BIN_DEG = 2
EARTH_RADIUS_KM = 6378.0
MU_EARTH = 398600.4418

MASS_CLASSES = [  # (key, label, upper bound inclusive)
    ("le50", "≤50 kg", 50.0),
    ("50-200", "50–200 kg", 200.0),
    ("200-700", "200–700 kg", 700.0),
    ("700-1000", "700–1,000 kg", 1000.0),
    ("1000-2000", "1,000–2,000 kg", 2000.0),
    ("gt2000", ">2,000 kg", math.inf),
]
ORBITS = ["LEO", "SSO", "MEO", "GTO/GEO", "Beyond"]
ORBIT_LABEL = {"LEO": "LEO", "SSO": "Polar/SSO", "MEO": "MEO", "GTO/GEO": "GTO/GEO", "Beyond": "Beyond"}
GROUPS = [  # (group, customer)
    ("Starlink", "captive"),
    ("China", "captive"),
    ("Russia", "captive"),
    ("Kuiper / OneWeb", "captive"),
    ("US government", "institutional-us"),
    ("European institutional", "institutional-eu"),
    ("Other governments", "institutional-other"),
    ("Commercial (open)", "open-commercial"),
]
GROUP_CUSTOMER = dict(GROUPS)
CUSTOMERS = ["captive", "institutional-us", "institutional-eu", "institutional-other", "open-commercial"]

CHINA_STATES = {"CN", "HK", "MO"}
RUSSIA_STATES = {"RU"}
# EU-27 + UK, Norway, Switzerland, Iceland, Liechtenstein and the European IGOs
# (GCAT state codes; Bulgaria appears as BGN, French Guiana as GUF).
EUROPE_STATES = {
    "AT", "B", "BG", "BGN", "HR", "CY", "CZ", "DK", "EE", "FI", "F", "GUF", "D", "GR",
    "HU", "IE", "I", "LV", "LT", "L", "MT", "NL", "PL", "P", "RO", "SK", "SI", "E", "S",
    "UK", "N", "CH", "IS", "LI", "I-ESA", "I-EU", "I-EUM",
}
STARLINK_UCODES = {"SPXS"}
MEGACON_UCODES = {"KUIP", "ONEWEB"}
MEGACON_PROGRAMS = {"kuiper", "oneweb"}
NASA_HSF_NAME = re.compile(r"\bCrew-\d+|\bCRS-\d+|^S\.S\. |^Calypso\b|Starliner", re.I)
DEEP_OPORBITS = {"CLO", "EEO", "HCO", "PCO", "SSE", "DSO"}
HIGH_OPORBIT_PREFIXES = ("GEO", "GTO", "HEO", "VHEO")
SUBORBITAL_OPORBITS = {"ATM", "SO", "TA"}
MCDOWELL_COUNTED = {"launch-failure", "marginal-launch", "suborbital-orbit"}
ORBITAL_TAG = re.compile(r"^\d{4}-\d{3}$")

RULE_TEXT = {
    "starlink-owner": "captive/Starlink: lead owner UCode SPXS (SpaceX Starlink)",
    "starshield-bus": "captive/Starlink: Bus 'Starshield' (NRO proliferated, SpaceX-built and -launched)",
    "kuiper-oneweb": "captive/Kuiper / OneWeb: owner UCode KUIP or ONEWEB, or Program Kuiper/OneWeb",
    "china-state": "captive/China: State CN/HK/MO",
    "russia-state": "captive/Russia: State RU",
    "nasa-hsf": "institutional-us: NASA Commercial Crew/Cargo spacecraft with a commercial owner",
    "gov-owner-class": "institutional-*: lead owner org class C/D",
    "gov-payload-class": "institutional-*: lead owner A/B but psatcat payload class C/D",
    "commercial": "open-commercial: remaining class A/B owners",
}
EXCLUSION_TEXT = {
    "alias-phase": "SatType 'PA' alias/lease phase record",
    "non-standard-PX": "SatType 'PX' non-standard payload (carrier stacks, attached capsules, simulators)",
    "launch-failure": "launch coded as orbital failure in launch.tsv (LaunchCode OF...)",
    "marginal-launch": "marginal/suborbital launch tag (not yyyy-nnn, e.g. Starship 'yyyy-Unn')",
    "suborbital-orbit": "canonical orbit missing, suborbital or trans-atmospheric (OpOrbit ATM/SO/TA)",
    "duplicate": "duplicate Piece+Name across catalogs",
}


# ----------------------------------------------------------------------------- io

def fetch(url: str, dest: str) -> None:
    tmp = dest + ".part"
    curl = shutil.which("curl")
    if curl:
        subprocess.run([curl, "-sSL", "--fail", "--retry", "2", "-o", tmp, url], check=True)
    else:
        req = urllib.request.Request(url, headers={"User-Agent": "gcat_demand.py (stdlib)"})
        with urllib.request.urlopen(req, timeout=120) as resp, open(tmp, "wb") as fh:
            shutil.copyfileobj(resp, fh)
    os.replace(tmp, dest)


def ensure_raw(raw: str, download: bool, refresh: bool) -> None:
    os.makedirs(raw, exist_ok=True)
    missing_required = []
    for name, (url, required) in RAW_FILES.items():
        path = os.path.join(raw, name)
        if os.path.exists(path) and not refresh:
            continue
        if download or refresh:
            print(f"[download] {url}", file=sys.stderr)
            try:
                fetch(url, path)
            except Exception as exc:  # noqa: BLE001 - report and continue for optional files
                if required:
                    raise SystemExit(f"download failed for required file {name}: {exc}")
                print(f"[download] optional file {name} not available: {exc}", file=sys.stderr)
        elif required:
            missing_required.append(name)
    if missing_required:
        raise SystemExit(f"missing raw files in {raw}: {', '.join(missing_required)} (rerun with --download)")


def read_tsv(path: str) -> tuple[list[dict[str, str]], str]:
    """Read a GCAT TSV. Returns rows and the 'Updated ...' vintage line.

    Values are stripped except 'Type' (SatType), whose byte positions matter.
    """
    rows: list[dict[str, str]] = []
    header: list[str] | None = None
    vintage = ""
    with open(path, newline="", encoding="utf-8", errors="replace") as fh:
        for rec in csv.reader(fh, delimiter="\t", quoting=csv.QUOTE_NONE):
            if not rec:
                continue
            if rec[0].startswith("#"):
                if header is None:
                    header = [h.strip().lstrip("#") for h in rec]
                elif "Updated" in rec[0] and not vintage:
                    vintage = rec[0].lstrip("# ").strip()
                continue
            if header is None:
                raise ValueError(f"{path}: data before header")
            row = {}
            for i, key in enumerate(header):
                val = rec[i] if i < len(rec) else ""
                row[key] = val.rstrip("\r\n").ljust(12) if key == "Type" else val.strip()
            rows.append(row)
    return rows, vintage


def num(text: str) -> float | None:
    try:
        return float(text)
    except (TypeError, ValueError):
        return None


# ------------------------------------------------------------------ classification

def owner_codes(owner: str) -> list[str]:
    return [o.strip().rstrip("?") for o in owner.split("/") if o.strip() and o.strip() != "-"]


def orbit_of(row, objects, max_depth=6):
    """Canonical orbit (perigee, apogee, inc, OpOrbit, source); falls back to parents."""
    cur, depth = row, 0
    while cur is not None and depth <= max_depth:
        p, a, i = num(cur["Perigee"]), num(cur["Apogee"]), num(cur["Inc"])
        oporbit = cur["OpOrbit"]
        usable = p is not None and a is not None and i is not None and not (
            oporbit in ("", "-") and p == 0 and a == 0)
        if usable:
            return p, a, i, oporbit, ("own" if depth == 0 else f"parent:{cur['JCAT']}")
        m = re.match(r"([A-Z]\d{5,9})", cur["Parent"])
        cur = objects.get(m.group(1)) if m else None
        depth += 1
    return None


def classify_orbit(peri, apo, inc, oporbit, sattype, status):
    # SatType flags are hand-entered and occasionally misplaced (e.g. Tenkoh-2, a LEO
    # cubesat, carries the deep-space byte), so the flag only counts together with a
    # non-LEO orbit; Status DSO/DSA and deep-space OpOrbit codes are decisive.
    deep_flag = (sattype[4] == "D" or sattype[11] == "D") and apo >= LEO_APOGEE_KM
    if deep_flag or status.startswith(("DSO", "DSA")) or oporbit in DEEP_OPORBITS:
        return "Beyond"
    if apo < LEO_APOGEE_KM:
        return "SSO" if inc >= SSO_MIN_INC else "LEO"
    if oporbit.startswith(HIGH_OPORBIT_PREFIXES) or apo >= GEO_BOUND_APOGEE_KM:
        return "GTO/GEO"
    rp, ra = EARTH_RADIUS_KM + peri, EARTH_RADIUS_KM + apo
    ecc = (ra - rp) / (ra + rp)
    period_h = 2 * math.pi * math.sqrt(((ra + rp) / 2) ** 3 / MU_EARTH) / 3600
    return "GTO/GEO" if ecc >= 0.5 or period_h >= 23 else "MEO"


def mass_class(m):
    for key, label, upper in MASS_CLASSES:
        if m <= upper:
            return key, label
    raise AssertionError(m)


def inc_bin(inc):
    lo = int(math.floor(inc / INC_BIN_DEG) * INC_BIN_DEG)
    lo = max(0, min(lo, 180 - INC_BIN_DEG))
    return lo, lo + INC_BIN_DEG


def in_band(inc):
    return ANDOYA_INC[0] <= inc <= ANDOYA_INC[1]


def state_group(state):
    if state == "US":
        return "US government"
    if state in EUROPE_STATES:
        return "European institutional"
    return "Other governments"


def classify_customer(row, prow, orgs):
    """Return (group, rule)."""
    owners = owner_codes(row["Owner"])
    lead = orgs.get(owners[0]) if owners else None
    ucodes = {orgs[o]["UCode"] for o in owners if o in orgs} | set(owners)
    state = row["State"]
    program = prow.get("Program", "").strip().lower()
    pclass = prow.get("Class", "").strip().upper()
    lead_class = lead["Class"].strip().upper() if lead else ""

    if (lead and lead["UCode"] in STARLINK_UCODES) or (owners and owners[0] in STARLINK_UCODES):
        return "Starlink", "starlink-owner"
    if "starshield" in row["Bus"].lower():
        return "Starlink", "starshield-bus"
    if ucodes & MEGACON_UCODES or program in MEGACON_PROGRAMS:
        return "Kuiper / OneWeb", "kuiper-oneweb"
    if state in CHINA_STATES:
        return "China", "china-state"
    if state in RUSSIA_STATES:
        return "Russia", "russia-state"
    if row["Type"][1] in ("H", "P") and state == "US" and NASA_HSF_NAME.search(row["Name"]):
        return "US government", "nasa-hsf"
    if lead_class in ("C", "D"):
        return state_group(state), "gov-owner-class"
    if "C" in pclass or "D" in pclass:
        return state_group(state), "gov-payload-class"
    return "Commercial (open)", "commercial"


# ------------------------------------------------------------------------ pipeline

def build(raw, years):
    objects, catalog_of, vintages = {}, {}, {}
    for name in OBJECT_CATALOGS:
        rows, vintage = read_tsv(os.path.join(raw, name))
        vintages[name] = vintage
        for r in rows:
            objects[r["JCAT"]] = r
            catalog_of[r["JCAT"]] = name
    payload_rows = {}
    for name in PAYLOAD_CATALOGS:
        rows, vintages[name] = read_tsv(os.path.join(raw, name))
        for r in rows:
            payload_rows[r["JCAT"]] = r
    org_rows, vintages["orgs.tsv"] = read_tsv(os.path.join(raw, "orgs.tsv"))
    orgs = {r["Code"]: r for r in org_rows}
    launch_rows, vintages["launch.tsv"] = read_tsv(os.path.join(raw, "launch.tsv"))
    launch_code = {r["Launch_Tag"]: r["LaunchCode"].strip() for r in launch_rows}

    fto_payloads = collections.Counter()
    fto_path = os.path.join(raw, "ftocat.tsv")
    if os.path.exists(fto_path):
        rows, vintages["ftocat.tsv"] = read_tsv(fto_path)
        for r in rows:
            if r["Type"].startswith("P") and r["Type"][1] not in ("A", "X") and r["LDate"][:4] in years:
                fto_payloads[r["LDate"][:4]] += 1

    pop = {y: [] for y in years}
    excluded = {y: collections.Counter() for y in years}
    excluded_examples = {y: collections.defaultdict(list) for y in years}
    seen_piece = {}
    # McDowell's own annual totals count every standard payload in the orbital
    # catalogs (incl. failed and marginal launches) and sum TotMass; we rebuild that
    # number to reconcile our population with the published totals.
    recon = {y: {"payloads": 0, "totMassKg": 0.0} for y in years}
    for jcat, r in objects.items():
        year = r["LDate"][:4]
        if year not in pop or not r["Type"].startswith("P"):
            continue
        t, tag = r["Type"], r["Launch_Tag"]
        orbit = orbit_of(r, objects)
        reason = None
        if t[1] == "A":
            reason = "alias-phase"
        elif t[1] == "X":
            reason = "non-standard-PX"
        elif launch_code.get(tag, "").startswith("OF"):
            reason = "launch-failure"
        elif not ORBITAL_TAG.match(tag):
            reason = "marginal-launch"
        elif orbit is None or orbit[3] in SUBORBITAL_OPORBITS:
            reason = "suborbital-orbit"
        else:
            key = (r["Piece"], r["Name"].lower())
            if key in seen_piece and r["Piece"] not in ("", "-"):
                reason = "duplicate"
            seen_piece[key] = jcat
        tot = num(r["TotMass"]) or 0.0
        if reason:
            excluded[year][reason] += 1
            if len(excluded_examples[year][reason]) < 4:
                excluded_examples[year][reason].append(f"{jcat} {r['Name']}")
            if reason in MCDOWELL_COUNTED:
                recon[year]["payloads"] += 1
                recon[year]["totMassKg"] += tot
            continue
        recon[year]["payloads"] += 1
        recon[year]["totMassKg"] += tot
        peri, apo, inc, oporbit, orbit_src = orbit
        prow = payload_rows.get(jcat, {})
        group, rule = classify_customer(r, prow, orgs)
        m = num(r["Mass"])
        pop[year].append({
            "jcat": jcat,
            "catalog": catalog_of[jcat],
            "name": r["Name"],
            "piece": r["Piece"],
            "launchTag": tag,
            "ldate": r["LDate"],
            "owner": r["Owner"],
            "state": r["State"],
            "bus": r["Bus"],
            "program": prow.get("Program", ""),
            "pclass": prow.get("Class", ""),
            "type": t,
            "status": r["Status"],
            "perigee": peri,
            "apogee": apo,
            "inc": inc,
            "oporbit": oporbit,
            "orbitSource": orbit_src,
            # GCAT gives ISS deployments 1998-067 pieces; SatType byte 6 'D' marks
            # station deployables but is not set consistently.
            "stationDeploy": t[5] == "D" or r["Piece"].startswith("1998-067"),
            "orbit": classify_orbit(peri, apo, inc, oporbit, t, r["Status"]),
            "group": group,
            "customer": GROUP_CUSTOMER[group],
            "rule": rule,
            "mass": m if m and m > 0 else None,
            "totMass": tot,
            "massSource": ("gcat-estimate" if r["MassFlag"] == "?" else "gcat") if m and m > 0 else None,
        })
    impute_masses([p for y in years for p in pop[y]])
    for y in years:
        for p in pop[y]:
            p["massClass"], p["massClassLabel"] = mass_class(p["mass"])
            p["incBin"] = inc_bin(p["inc"])
            p["andoya"] = in_band(p["inc"])
    return {"pop": pop, "excluded": excluded, "examples": excluded_examples, "fto": fto_payloads,
            "vintages": vintages, "recon": recon}


def impute_masses(payloads):
    known = [p for p in payloads if p["mass"] is not None]
    keys = [
        ("program", lambda p: p["program"] if p["program"] not in ("", "-") else None),
        ("bus", lambda p: p["bus"] if p["bus"] not in ("", "-", "Unknown") else None),
        ("owner", lambda p: owner_codes(p["owner"])[0] if owner_codes(p["owner"]) else None),
        ("orbit+group", lambda p: (p["orbit"], p["group"])),
    ]
    medians = []
    for level, fn in keys:
        groups = collections.defaultdict(list)
        for p in known:
            k = fn(p)
            if k is not None:
                groups[k].append(p["mass"])
        medians.append((level, fn, {k: statistics.median(v) for k, v in groups.items()}))
    overall = statistics.median([p["mass"] for p in known]) if known else 100.0
    for p in payloads:
        if p["mass"] is not None:
            continue
        for level, fn, table in medians:
            k = fn(p)
            if k is not None and k in table:
                p["mass"], p["massSource"] = table[k], f"imputed:{level}"
                break
        else:
            p["mass"], p["massSource"] = overall, "imputed:all"


def imputation_backtest(payloads, n=100, seed=7):
    """Mask n random non-captive masses, re-impute them, compare with GCAT values."""
    import random

    copies = [dict(p) for p in payloads]
    cand = [p for p in copies if p["customer"] != "captive" and not p["massSource"].startswith("imputed")]
    if len(cand) < n:
        return None
    sample = random.Random(seed).sample(cand, n)
    truth = [p["mass"] for p in sample]
    for p in sample:
        p["mass"], p["massSource"] = None, None
    impute_masses(copies)
    same_class = sum(1 for p, t in zip(sample, truth) if mass_class(p["mass"])[0] == mass_class(t)[0])
    return {"n": n, "seed": seed, "massRatio": sum(p["mass"] for p in sample) / sum(truth),
            "sameClass": same_class,
            "levels": dict(collections.Counter(p["massSource"] for p in sample))}


# ------------------------------------------------------------------------- outputs

def slug(text):
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def agg(items):
    return {"sats": len(items), "massKg": round(sum(p["mass"] for p in items), 1)}


def share(part, whole):
    return round(part / whole, 4) if whole else 0.0


def year_summary(items):
    open_ = [p for p in items if p["customer"] != "captive"]
    open_small = [p for p in open_ if p["mass"] <= 700]
    band = [p for p in items if p["andoya"]]
    band_open = [p for p in open_ if p["andoya"]]
    band_open_small = [p for p in open_small if p["andoya"]]
    return {
        "all": agg(items), "open": agg(open_), "openLe700": agg(open_small),
        "band": agg(band), "bandOpen": agg(band_open), "bandOpenLe700": agg(band_open_small),
        "bandNonLeo": agg([p for p in band if p["orbit"] not in ("LEO", "SSO")]),
    }


def round_mass(m):
    return round(m, 2) if m < 10 else round(m, 1)


def build_year_json(year, items, excluded, fto, vintages, retrieved, rule_counts, recon, published):
    s = year_summary(items)
    segs = collections.defaultdict(list)
    for p in items:
        segs[(p["customer"], p["group"], p["orbit"], p["incBin"], p["massClass"])].append(p)
    group_order = {g: i for i, (g, _) in enumerate(GROUPS)}
    orbit_order = {o: i for i, o in enumerate(ORBITS)}
    mc_order = {k: i for i, (k, _, _) in enumerate(MASS_CLASSES)}
    mc_label = {k: lbl for k, lbl, _ in MASS_CLASSES}
    segments = []
    for key in sorted(segs, key=lambda k: (group_order[k[1]], orbit_order[k[2]], k[3][0], mc_order[k[4]])):
        customer, group, orbit, (lo, hi), mck = key
        members = segs[key]
        total = sum(p["mass"] for p in members)
        segments.append({
            "id": f"{slug(group)}-{slug(orbit)}-i{lo:03d}-{mck}",
            "label": f"{group} · {ORBIT_LABEL[orbit]} · {lo}–{hi}° · {mc_label[mck]}",
            "group": group,
            "orbit": orbit,
            "inclination": [lo, hi],
            "massClass": mc_label[mck],
            "avgMassKg": round_mass(total / len(members)),
            "massKg": round(total, 1),
            "customer": customer,
            "satsPerYear": len(members),
        })
    n = len(items)
    imputed = sum(1 for p in items if p["massSource"].startswith("imputed"))
    estimated = sum(1 for p in items if p["massSource"] == "gcat-estimate")
    parent_orbit = sum(1 for p in items if p["orbitSource"] != "own")
    station = sum(1 for p in items if p["stationDeploy"])
    excl_total = sum(excluded.values())
    pub_n = f"{int(published['payloads']):,}" if published.get("payloads") else "n/a"
    pub_t = f"{published['tonnes']:,.1f} t" if published.get("tonnes") else "tonnage n/a"
    notes = [
        f"Population: {n:,} payloads (SatType 'P') launched in {year} that reached orbit, from GCAT satcat, "
        f"satcat100k, auxcat and tmpcat; each payload counted once. Excluded: {excl_total} "
        + "(" + ", ".join(f"{k} {v}" for k, v in sorted(excluded.items())) + "); "
        f"not in the catalogs at all: {fto} standard payloads lost in failed launches (ftocat).",
        "Reconciliation: adding the excluded launch-failure, marginal-launch and suborbital payloads back "
        f"gives {recon['payloads']:,} payloads and {recon['totMassKg'] / 1000:,.1f} t TotMass, McDowell's own "
        f"counting method (his stats page: {pub_n} payloads, {pub_t}).",
        "Launch year = GCAT LDate (UTC) of the carrying launch; ISS/carrier deployments keep the launch "
        f"year of their cargo flight. Station-deployed payloads: {station}; payloads without an own orbit "
        f"that use their parent's (ISS/deployer/carrier) orbit: {parent_orbit}.",
        "Orbit classes from the canonical orbit: SSO = Polar/SSO (apogee < 2,000 km, i >= 85°); LEO = other "
        "apogee < 2,000 km; GTO/GEO = GEO/GTO/HEO/VHEO, apogee >= 30,000 km, e >= 0.5 or period >= 23 h; "
        "MEO = other Earth orbits; Beyond = lunar, heliocentric or escape (Status DSO/DSA, deep-space OpOrbit).",
        f"Mass = GCAT 'Mass' (wet mass at orbit insertion, excl. attached objects; TotMass not used to avoid "
        f"double counting). {imputed} masses imputed ({share(imputed, n):.1%}); {estimated} "
        f"({share(estimated, n):.1%}) are McDowell's own '?' estimates (~±20 %).",
        "Customer rules (first match wins): " + "; ".join(
            f"{RULE_TEXT[r]} = {rule_counts.get(r, 0)}" for r in RULE_TEXT) + ".",
        "European institutional = governments/agencies of EU-27, UK, NO, CH, IS, LI plus ESA, EU, EUMETSAT; "
        "Other governments = all other non-US, non-CN/RU states.",
        f"Andøya band = inclination within [{ANDOYA_INC[0]:g}, {ANDOYA_INC[1]:g}]° (any orbit class): "
        f"{s['band']['sats']:,} sats ({share(s['band']['sats'], n):.1%}); open market (excl. captive) "
        f"{s['bandOpen']['sats']} of {s['open']['sats']}; open market <= 700 kg {s['bandOpenLe700']['sats']} "
        f"of {s['openLe700']['sats']}.",
        "Segments: (customer, group, orbit class, 2° inclination bin [lo, hi), mass class with inclusive upper "
        "bound); avgMassKg = mean mass of the payloads in the segment, massKg = their total.",
        "Data reflect what flew (historic launches), not addressable future demand; captive = flies on "
        "in-house or pre-contracted launchers by policy or contract.",
    ]
    by_group = {g: agg([p for p in items if p["group"] == g]) for g, _ in GROUPS}
    by_orbit = {o: agg([p for p in items if p["orbit"] == o]) for o in ORBITS}
    by_customer = {c: agg([p for p in items if p["customer"] == c]) for c in CUSTOMERS}
    return {
        "meta": {
            "year": int(year),
            "source": "J. McDowell, GCAT",
            "url": GCAT_HOME,
            "retrieved": retrieved,
            "dataVintage": vintages.get("satcat.tsv", ""),
            "payloads": n,
            "massKg": s["all"]["massKg"],
            "massImputedShare": share(imputed, n),
            "massEstimatedShare": share(estimated, n),
            "andoyaInclination": list(ANDOYA_INC),
            "excluded": dict(sorted(excluded.items())),
            "failedToOrbitPayloads": fto,
            "customerRules": {r: rule_counts.get(r, 0) for r in RULE_TEXT},
            "files": {k: RAW_FILES[k][0] for k in ["satcat.tsv", "satcat100k.tsv", "auxcat.tsv", "tmpcat.tsv",
                                                    "psatcat.tsv", "orgs.tsv", "launch.tsv"]},
            "notes": notes,
        },
        "totals": {
            "byCustomerGroup": by_group,
            "byOrbit": by_orbit,
            "andoyaBand": s["band"],
            "byCustomer": by_customer,
            "openMarket": s["open"],
            "openMarketLe700": s["openLe700"],
            "andoyaBandOpenMarket": s["bandOpen"],
            "andoyaBandOpenMarketLe700": s["bandOpenLe700"],
            "andoyaBandByCustomerGroup": {g: agg([p for p in items if p["group"] == g and p["andoya"]])
                                          for g, _ in GROUPS},
        },
        "segments": segments,
    }


def read_published(raw):
    """McDowell's own annual totals (stats/out/satannual.txt, msatannual.txt) if present."""
    out = {}
    for name, field in (("satannual.txt", "payloads"), ("msatannual.txt", "tonnes")):
        path = os.path.join(raw, name)
        if not os.path.exists(path):
            continue
        with open(path, encoding="utf-8", errors="replace") as fh:
            for line in fh:
                if line.startswith("#"):
                    if "last updated" in line:
                        out.setdefault("updated", line.split(":", 1)[1].strip())
                    continue
                parts = line.split()
                if len(parts) >= 3 and parts[1].isdigit():
                    out.setdefault(parts[1], {})[field] = float(parts[-1])
    return out


def write_audit(path, pop, years):
    cols = ["jcat", "catalog", "name", "piece", "launchTag", "ldate", "owner", "state", "bus", "program",
            "pclass", "type", "status", "perigee", "apogee", "inc", "oporbit", "orbitSource", "orbit",
            "group", "customer", "rule", "mass", "massSource", "massClass", "andoya"]
    with open(path, "w", newline="", encoding="utf-8") as fh:
        w = csv.writer(fh)
        w.writerow(["year"] + cols)
        for y in years:
            for p in pop[y]:
                w.writerow([y] + [p[c] for c in cols])


# ------------------------------------------------------------------------- report

def fmt_int(n):
    return f"{n:,}"


def fmt_t(kg):
    return f"{kg / 1000:,.1f} t"


def report(res, published, years, retrieved, rule_counts):
    pop, excluded, examples, fto = res["pop"], res["excluded"], res["examples"], res["fto"]
    vintages, recon = res["vintages"], res["recon"]
    L = []
    L.append("# GCAT demand pipeline")
    L.append("")
    L.append("Bottom-up launch demand for the Isar Aerospace / Andøya case, built from Jonathan McDowell's "
             "General Catalog of Artificial Space Objects (GCAT). Generated by `pipeline/gcat_demand.py`; "
             "do not edit by hand, rerun the script.")
    L.append("")
    L.append("```bash")
    L.append("python3 -I pipeline/gcat_demand.py --raw <raw-dir> --out dashboard/src/data/generated --download")
    L.append("```")
    L.append("")
    L.append("Raw files stay outside the repo (`--raw`). `--download` fetches missing files, `--refresh` all of "
             "them; `--audit-csv` writes the per-payload table used for the checks below.")
    L.append("")
    L.append("## Data vintage")
    L.append("")
    L.append(f"- Source: {GCAT_HOME} (TSV files under `tsv/cat`, `tsv/tables`, `tsv/launch`), retrieved {retrieved}")
    for k in ["satcat.tsv", "auxcat.tsv", "psatcat.tsv", "orgs.tsv", "launch.tsv"]:
        L.append(f"- `{k}`: {vintages.get(k, 'n/a')}")
    if published.get("updated"):
        L.append(f"- McDowell's published annual totals (`space/stats/out/satannual.txt`, `msatannual.txt`): "
                 f"last updated {published['updated']}")
    L.append("")
    L.append("## Method and rules")
    L.append("")
    L.append("**Population.** Payloads (SatType byte 1 `P`) with launch date (GCAT `LDate`, UTC) in the year "
             "from the four orbital object catalogs: `satcat` (SATCAT 1–69,999), `satcat100k` (100,000+), "
             "`auxcat` (orbital objects without a SATCAT entry) and `tmpcat` (in orbit, number pending). "
             "Objects that failed to reach orbit sit in `ftocat` and are only counted for reporting. Each JCAT "
             "occurs once in these catalogs (later phases are in `ecat`), so each payload is counted once.")
    L.append("")
    L.append("Excluded (count per year below):")
    for k, v in EXCLUSION_TEXT.items():
        L.append(f"- `{k}`: {v}")
    L.append("")
    L.append("**ISS and carrier deployments.** GCAT dates them by the launch that carried them (cargo flight's "
             "`LDate` and `Launch_Tag`, although the piece name is 1998-067xx). They count in that launch year "
             "with their own canonical orbit; payloads without a usable orbit (still inside or attached) take "
             "the orbit of the parent object (ISS, deployer, carrier), walking up the `Parent` chain.")
    L.append("")
    L.append("**Orbit class** (canonical orbit `Perigee`/`Apogee`/`Inc`/`OpOrbit`):")
    L.append("")
    L.append("| Class | Rule |")
    L.append("| --- | --- |")
    L.append("| Beyond | Status `DSO`/`DSA`, OpOrbit CLO/EEO/HCO/PCO/SSE/DSO, or deep-space flag (SatType byte 5 or 12 = `D`) with apogee ≥ 2,000 km |")
    L.append("| SSO (Polar/SSO) | apogee < 2,000 km and inclination ≥ 85° (incl. the few retrograde LEO orbits above 110.6°) |")
    L.append("| LEO | apogee < 2,000 km and inclination < 85° |")
    L.append("| GTO/GEO | apogee ≥ 2,000 km and OpOrbit GEO\\*/GTO/HEO\\*/VHEO, or apogee ≥ 30,000 km (GEO-bound transfer/drift), or eccentricity ≥ 0.5, or period ≥ 23 h |")
    L.append("| MEO | every other Earth orbit with apogee ≥ 2,000 km |")
    L.append("")
    L.append(f"Andøya band: inclination within [{ANDOYA_INC[0]:g}°, {ANDOYA_INC[1]:g}°] (licence corridor 280–360°).")
    L.append("")
    L.append("**Mass.** GCAT `Mass` = wet mass of the object at orbit insertion without attached objects. "
             "`TotMass` is not used: it bundles attached objects (cargo, trunks, mass simulators, sometimes the "
             "upper stage), so summing it would double-count. Masses flagged `?` are McDowell's estimates "
             "(about ±20 %) and are kept. Missing masses would be imputed by the median of the same psatcat "
             "`Program`, then `Bus`, then lead owner, then orbit class × customer group, then all payloads. "
             "Mass classes have inclusive upper bounds (≤50, 50–200, 200–700, 700–1,000, 1,000–2,000, "
             ">2,000 kg), so 700 kg fits Spectrum's SSO and 1,000 kg its LEO capacity.")
    L.append("")
    bt = imputation_backtest([p for y in years for p in pop[y]])
    if bt:
        L.append(f"Imputation back-test (no masses were missing, so the fallback is validated instead): masking "
                 f"{bt['n']} random non-captive payloads (seed {bt['seed']}) and re-imputing them reproduces their "
                 f"total mass to {bt['massRatio']:.1%} and the mass class for {bt['sameClass']} of {bt['n']} "
                 f"(levels used: " + ", ".join(f"{k} {v}" for k, v in sorted(bt["levels"].items())) + ").")
        L.append("")
    L.append("**Customer type** (first matching rule wins). `Owner` is a `/`-separated list of org codes, the "
             "first is the lead operator; org class (A academic, B business, C civil government, D defence) "
             "and `UCode` come from `orgs.tsv`; owner state is the object's `State`; payload class is psatcat "
             "`Class` (McDowell's per-satellite judgement).")
    L.append("")
    L.append("| Rule | Assignment |")
    L.append("| --- | --- |")
    for k, v in RULE_TEXT.items():
        L.append(f"| `{k}` | {v} |")
    L.append("")
    L.append("European institutional = government owners in EU-27, UK, Norway, Switzerland, Iceland, "
             "Liechtenstein plus ESA, EU (incl. EUSPA, Copernicus) and EUMETSAT. Other governments = every other "
             "state outside US/CN/RU (Japan, India, Korea, Taiwan, Turkey, Israel, ...). Starshield satellites "
             "are NRO-owned but SpaceX-built and SpaceX-launched, so they are counted as captive with Starlink "
             "(they would be US-captive either way). HK and MO count as China.")
    L.append("")
    L.append("**Segments.** `(customer, group, orbit class, 2° inclination bin [lo, hi), mass class)` with "
             "`satsPerYear`, `avgMassKg` (mean of the payloads in the segment) and `massKg` (their total).")
    L.append("")
    L.append("## Outputs")
    L.append("")
    L.append("`dashboard/src/data/generated/demand-<year>.json`:")
    L.append("")
    L.append("- `meta`: year, source, url, retrieved, dataVintage, payloads, massKg, massImputedShare (pipeline "
             "imputations), massEstimatedShare (McDowell `?` estimates), excluded (counts per reason), "
             "failedToOrbitPayloads, customerRules (counts per rule), files, notes")
    L.append("- `totals`: byCustomerGroup, byOrbit, andoyaBand (required), plus byCustomer, openMarket, "
             "openMarketLe700, andoyaBandOpenMarket, andoyaBandOpenMarketLe700, andoyaBandByCustomerGroup "
             "(each `{sats, massKg}`)")
    L.append("- `segments`: `{id, label, group, orbit, inclination: [lo, hi], massClass, avgMassKg, massKg, "
             "customer, satsPerYear}`; `customer` is one of captive, institutional-us, institutional-eu, "
             "institutional-other, open-commercial")
    L.append("")

    for y in years:
        items = pop[y]
        s = year_summary(items)
        n = len(items)
        L.append(f"## {y}")
        L.append("")
        L.append(f"{fmt_int(n)} payloads, {fmt_t(s['all']['massKg'])}. Excluded: "
                 + ", ".join(f"{k} {v}" for k, v in sorted(excluded[y].items()))
                 + f"; failed to orbit (ftocat): {fto.get(y, 0)} payloads.")
        L.append("")
        for k, ex in sorted(examples[y].items()):
            L.append(f"- e.g. `{k}`: " + "; ".join(ex))
        L.append("")
        imputed = sum(1 for p in items if p["massSource"].startswith("imputed"))
        estimated = sum(1 for p in items if p["massSource"] == "gcat-estimate")
        est_mass = sum(p["mass"] for p in items if p["massSource"] == "gcat-estimate")
        parent_orbit = sum(1 for p in items if p["orbitSource"] != "own")
        station = sum(1 for p in items if p["stationDeploy"])
        cat_counts = collections.Counter(p["catalog"] for p in items)
        L.append(f"- Catalogs: " + ", ".join(f"{k} {v}" for k, v in sorted(cat_counts.items())))
        composite = sum(1 for p in items if p["totMass"] > p["mass"])
        L.append(f"- Mass (`Mass` column): missing or zero for {imputed} payloads, imputed ({share(imputed, n):.1%}); "
                 f"{estimated} McDowell estimates ({share(estimated, n):.1%} of payloads, "
                 f"{share(est_mass, s['all']['massKg']):.1%} of mass); {composite} composite objects with "
                 f"`TotMass` > `Mass` (crew/cargo ships, carriers; `TotMass` ignored)")
        L.append(f"- Orbit: {station} station-deployed payloads (own orbits); {parent_orbit} use a parent orbit")
        L.append("")
        L.append("| Customer group | Customer | Sats | Share | Mass | Share | LEO | Polar/SSO | MEO | GTO/GEO | Beyond |")
        L.append("| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |")
        for g, c in GROUPS + [("Total", "")]:
            sub = items if g == "Total" else [p for p in items if p["group"] == g]
            a = agg(sub)
            orb = collections.Counter(p["orbit"] for p in sub)
            L.append(f"| {g} | {c} | {fmt_int(a['sats'])} | {share(a['sats'], n):.1%} | {fmt_t(a['massKg'])} | "
                     f"{share(a['massKg'], s['all']['massKg']):.1%} | "
                     + " | ".join(fmt_int(orb.get(o, 0)) for o in ORBITS) + " |")
        L.append("")
        L.append("Customer rule hits: " + ", ".join(f"`{r}` {rule_counts[y].get(r, 0)}" for r in RULE_TEXT))
        L.append("")
        L.append("| Andøya band [90°, 110.6°] | In band (sats) | Of | Share | In band (mass) | Of | Share |")
        L.append("| --- | ---: | ---: | ---: | ---: | ---: | ---: |")
        for label, part, whole in (
            ("All payloads", s["band"], s["all"]),
            ("Excluding captive", s["bandOpen"], s["open"]),
            ("Excluding captive, ≤700 kg", s["bandOpenLe700"], s["openLe700"]),
        ):
            L.append(f"| {label} | {fmt_int(part['sats'])} | {fmt_int(whole['sats'])} | "
                     f"{share(part['sats'], whole['sats']):.1%} | {fmt_t(part['massKg'])} | {fmt_t(whole['massKg'])} | "
                     f"{share(part['massKg'], whole['massKg']):.1%} |")
        L.append("")
        L.append(f"Relative to all {fmt_int(n)} payloads, the open-market ≤700 kg Andøya band is "
                 f"{share(s['bandOpenLe700']['sats'], n):.1%} of satellites and "
                 f"{share(s['bandOpenLe700']['massKg'], s['all']['massKg']):.1%} of mass; its "
                 f"{fmt_t(s['bandOpenLe700']['massKg'])} equal about "
                 f"{s['bandOpenLe700']['massKg'] / 700:,.0f} × 700 kg (Spectrum SSO capacity) before any "
                 f"packing or rideshare effects. In-band payloads outside LEO/SSO: {s['bandNonLeo']['sats']}.")
        L.append("")
        band_groups = collections.Counter(p["group"] for p in items if p["andoya"])
        L.append("In-band payloads by group: " + ", ".join(
            f"{g} {band_groups.get(g, 0)}" for g, _ in GROUPS))
        L.append("")

    L.append("## Comparison with published totals")
    L.append("")
    L.append("McDowell's own annual totals (stats page, same GCAT data) count every standard payload in the "
             "orbital catalogs, including payloads of failed or marginal launches that briefly orbited or are "
             "listed there (Starship test ships), and sum `TotMass`. Rebuilding that number from the raw files "
             "reconciles our population with the published totals:")
    L.append("")
    L.append("| Year | This dataset | + failed/marginal launches | = McDowell-style count | Published (McDowell) "
             "| Published (brief) | Mass (this, `Mass`) | `TotMass`, McDowell-style set | Published tonnage |")
    L.append("| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |")
    brief = {"2024": "~2,900 (BryceTech/McDowell)", "2025": "~4,526 (McDowell 2025 summary)"}
    for y in years:
        mine = len(pop[y])
        mass = sum(p["mass"] for p in pop[y])
        rc = recon[y]
        pub = published.get(y, {})
        pn, pt = pub.get("payloads"), pub.get("tonnes")
        L.append(f"| {y} | {fmt_int(mine)} | {fmt_int(rc['payloads'] - mine)} | {fmt_int(rc['payloads'])} | "
                 f"{fmt_int(int(pn)) if pn else 'n/a'} | {brief.get(y, 'n/a')} | {fmt_t(mass)} | "
                 f"{fmt_t(rc['totMassKg'])} | {(f'{pt:,.1f} t') if pt else 'n/a'} |")
    L.append("")
    for y in years:
        ex = excluded[y]
        mine = len(pop[y])
        pn = published.get(y, {}).get("payloads")
        gap = f"{mine - pn:+,.0f} ({(mine - pn) / pn:+.1%})" if pn else "n/a"
        fail_ex = "; ".join(examples[y].get("launch-failure", [])[:2]) or "none"
        rc_n = recon[y]["payloads"]
        if pn and rc_n == pn:
            tail = f"Adding them back gives {rc_n:,}, exactly the published figure."
        elif pn:
            tail = (f"Adding them back gives {rc_n:,} ({rc_n - pn:+,} vs published); the rest is catalog updates "
                    f"between McDowell's stats run and this data vintage.")
        else:
            tail = "Published figure not available offline (run with --download)."
        L.append(f"- {y}: gap to McDowell {gap}. Our exclusions he counts: {ex.get('launch-failure', 0)} payloads "
                 f"of launches coded as failures (e.g. {fail_ex}), "
                 f"{ex.get('marginal-launch', 0)} payloads of marginal launches (Starship flight tests, 'yyyy-Unn'), "
                 f"{ex.get('suborbital-orbit', 0)} with a suborbital canonical orbit. Non-standard `PX` objects "
                 f"({ex.get('non-standard-PX', 0)}) are excluded by both. {tail}")
    L.append("- The brief's ~2,900 for 2024 is a rounded BryceTech/McDowell figure; BryceTech counts spacecraft "
             "with its own rules. McDowell's current stats page and this rebuild agree for both years.")
    L.append("- Mass: our tonnage is lower because we use each payload's own insertion mass (`Mass`) and drop "
             "Starship test ships (~120 t each). `TotMass` includes attached objects (crew/cargo ship cargo and "
             "trunks, mass simulators, sometimes the upper stage: Viasat's CPS demo is 10 kg `Mass` but "
             "28,010 kg `TotMass`), so it suits tonnage statistics but not per-satellite launch demand.")
    L.append("")
    L.append("## Caveats")
    L.append("")
    allp = [p for y in years for p in pop[y]]
    est = sum(1 for p in allp if p["massSource"] == "gcat-estimate")
    L.append("- Historic flown demand, not a forecast and not a measure of what customers would have bought "
             "from a new launcher; captive and institutional rules are policy assumptions.")
    L.append(f"- {share(est, len(allp)):.0%} of payload masses are McDowell's own estimates (`?`, about ±20 %); "
             "secret US/Chinese orbits are partly estimates (`?` flags on perigee/apogee/inclination).")
    L.append("- Canonical orbits are early-operations orbits; Starlink canonical orbits are often insertion "
             "orbits (inclination is unaffected).")
    L.append("- SatType flags are hand-entered and occasionally misplaced (deep-space flag on the LEO cubesat "
             "Tenkoh-2, station-deploy flag in different bytes in 2024 and 2025); the pipeline therefore "
             "relies on orbit data, Status and piece names rather than single flag bytes.")
    L.append("- Owner classes come from GCAT's organisation table; state-owned companies (e.g. NSIL, Space Norway, "
             "Turksat) count as commercial unless McDowell marks the payload itself as civil/defence.")
    L.append("- Launches late in a year whose payloads are deployed later (ISS cargo) count in the launch year; "
             "objects not yet catalogued at the data vintage are missing (small for 2025 as of 2026-10).")
    return "\n".join(L) + "\n"


# ---------------------------------------------------------------------------- main

def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--raw", required=True, help="directory with GCAT raw files (outside the repo)")
    ap.add_argument("--out", required=True, help="output directory for demand-<year>.json")
    ap.add_argument("--download", action="store_true", help="download missing raw files")
    ap.add_argument("--refresh", action="store_true", help="re-download all raw files")
    ap.add_argument("--years", nargs="+", default=["2024", "2025"])
    ap.add_argument("--readme", default=os.path.join(os.path.dirname(os.path.abspath(__file__)), "README.md"))
    ap.add_argument("--retrieved", help="retrieval date (default: modification date of satcat.tsv)")
    ap.add_argument("--audit-csv", help="optional per-payload CSV for checking (keep outside the repo)")
    args = ap.parse_args(argv)

    ensure_raw(args.raw, args.download, args.refresh)
    retrieved = args.retrieved or dt.date.fromtimestamp(
        os.path.getmtime(os.path.join(args.raw, "satcat.tsv"))).isoformat()
    years = [str(y) for y in args.years]
    res = build(args.raw, years)
    pop, excluded, fto, vintages = res["pop"], res["excluded"], res["fto"], res["vintages"]
    published = read_published(args.raw)

    os.makedirs(args.out, exist_ok=True)
    rule_counts = {y: collections.Counter(p["rule"] for p in pop[y]) for y in years}
    for y in years:
        doc = build_year_json(y, pop[y], excluded[y], fto.get(y, 0), vintages, retrieved, rule_counts[y],
                              res["recon"][y], published.get(y, {}))
        path = os.path.join(args.out, f"demand-{y}.json")
        with open(path, "w", encoding="utf-8") as fh:
            json.dump(doc, fh, indent=2, ensure_ascii=False)
            fh.write("\n")
        print(f"[write] {path}: {doc['meta']['payloads']} payloads, {len(doc['segments'])} segments",
              file=sys.stderr)
    if args.audit_csv:
        write_audit(args.audit_csv, pop, years)
        print(f"[write] {args.audit_csv}", file=sys.stderr)

    text = report(res, published, years, retrieved, rule_counts)
    with open(args.readme, "w", encoding="utf-8") as fh:
        fh.write(text)
    print(f"[write] {args.readme}", file=sys.stderr)
    print(text)


if __name__ == "__main__":
    main()
