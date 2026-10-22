# Fact-Warehouse

Jede Zahl des Tools liegt hier, mit Quelle. Quelle der Wahrheit ist die Supabase-Datenbank (Postgres). Die CSVs in `seed/` sind ihr Spiegel in git, damit jede Änderung im Diff sichtbar ist. Das Dashboard liest einen Snapshot (`dashboard/src/data/warehouse.json`) und läuft dadurch offline.

## Tabellen

| Tabelle | Inhalt | Regel |
| --- | --- | --- |
| `sources` | jede Quelle: Titel, Herausgeber, URL, Art, Verlässlichkeit, Kurzlabel (`short`) | jede Zahl verweist auf eine Quelle |
| `metrics` | Wörterbuch der Messgrößen mit Einheit und Definition | ein Fakt steht immer in der Einheit seiner Metrik |
| `facts` | gemessene Zahlen im Langformat (Metrik, Jahr, Bereich, Entität, Wert, Quelle) | mehrere Quellen pro Metrik erlaubt, genau eine ist `is_preferred` (✓ im Tool) |
| `assumptions` | Urteile des Teams: Wert, Spanne, Begründung, Quellen, Owner, Konfidenz; Hebel oder fest | getrennt von Fakten, damit klar ist, was gemessen und was angenommen ist |
| `launch_sites` | **globales Startplatz-Register**: Betreiber, Eigentum, Lage, erreichbares Inklinationsband, Status, Pads, größte Raketenklasse, Polar/SSO, Zugang für ausländische Anbieter, Startgrenze pro Jahr, Ausbaupläne, Bezug zu Isar, GCAT-Codes | jede Zeile mit Quellen (`source_ids`) und Konfidenz; die Q1-Standorte (Andøya, Nova Scotia, Kourou) behalten ihre kuratierten Bänder |
| `vehicles` | Raketen mit Betreiber, Land, Klasse, Nutzlast LEO/SSO/GTO (geschätzt markiert), Wiederverwendbarkeit, Status, Erstflug, Preis, GCAT-Namen | Klasse nach LEO-Nutzlast: klein < 2 t, mittel 2–20 t, schwer 20–50 t, superschwer > 50 t |
| `launch_site_vehicles` | wer startet was von wo: Standort × Rakete mit Status (aktiv, geplant, vertraglich, eingestellt), Orbits, Pad, seit wann | eine Quelle pro Zeile |
| `manifest` | Isars bekannte Verträge mit Zeitraum | |
| `satellites` | alle 7.361 Satelliten 2024/2025 aus GCAT mit Masse, Inklination, Kundengruppe, Mission, Rakete, Start-Tag | erzeugt von `build_satellites.py` |
| `launches` | jeder Orbital- und Deep-Space-Startversuch seit 2024 aus GCAT: Datum, Rakete, Standort-Code, Pad, Agentur, Erfolg, Zielorbit, Nutzlastmasse | erzeugt von `build_launches.py` |

Views:

- `v_q1_funnel`: der Q1-Funnel TAM → SAM → SOM in SQL, mit den Parametern aus `assumptions`. Ein Test (`dashboard/src/model/q1.test.ts`) prüft, dass Tool und View dieselben Zahlen liefern.
- `v_sam_launchers`: Mit welchen Raketen der SAM heute fliegt.
- `v_facts`: Fakten mit Metrik und Quelle aufgelöst, zum Lesen im Supabase-Editor.
- `v_launch_site_overview`: **eine Zeile pro Startplatz** zum Nachschlagen: Register, aktive und geplante Raketen mit Anbietern und deren Ländern, bediente Orbits, maximale Nutzlast LEO/SSO/GTO, Starts 2024/2025/2026, Nutzlast 2025, Auslastung der Startgrenze.
- `v_launch_site_activity`: Starts, Fehlstarts, Nutzlast und Zielorbits pro Startplatz und Jahr (GCAT).
- `v_vehicle_activity`: Starts, Erfolge und Nutzlast pro Rakete und Jahr.
- `v_launches`: jeder Start mit Startplatz, Rakete, Anbieter und Anbieterland aufgelöst (GCAT nennt Agenturen auf Unterebene, z. B. CALT statt CASC; Anbieter und Land kommen deshalb aus `vehicles`).
- `v_launches_by_provider`, `v_launches_by_country`: Starts, Erfolge und Nutzlast pro Anbieter bzw. Anbieterland und Jahr.
- `v_penetration_evidence`: Begründung der 7 % Penetration. Anteil, der einen eigenen Kleinträger-Start statt Rideshare kaufte, nach Jahr und zusammengefasst, nach Anzahl und Masse, im Andøya-Band und im westlichen Gesamtmarkt, dazu die Obergrenze „nicht mit Falcon 9“.
- `v_q2_launch_gap`: RQ2-Leitzahl, wie viele geplante Starts die sichtbare Nachfrage füllt.

## Arbeitsablauf

Zugang: `SUPABASE_DB_URL` in `.env` im Repo-Root (nie committen, nie ins Frontend).

Wert in Supabase geändert (Table Editor oder SQL):

```bash
uv run warehouse/export.py
```

schreibt die Datenbank zurück in `seed/*.csv` und den Dashboard-Snapshot. Danach committen.

Wert in einer CSV geändert:

```bash
uv run warehouse/load.py
uv run warehouse/export.py
```

`load.py` spielt Schema und alle Seeds neu ein und prüft, dass jeder Fakt und jede Annahme eine bekannte Quelle hat. Vorher exportieren, falls jemand in Supabase editiert hat, sonst geht das verloren.

Satelliten und Starts neu aus GCAT erzeugen (Rohdaten außerhalb des Repos, inkl. `tsv/tables/sites.tsv`):

```bash
python3 -I warehouse/build_satellites.py --raw <gcat-raw-dir>
python3 -I warehouse/build_launches.py --raw <gcat-raw-dir>
```

Beispielfragen an das Startplatz-Register (SQL-Editor in Supabase):

```sql
-- Welche Startplätze sind für ausländische Anbieter offen und erreichen SSO direkt?
select name, country, status, max_launches_per_year, providers from v_launch_site_overview
where access = 'international' and polar_sso;

-- Wer startet von Kourou was in welchen Orbit?
select v.name, v.operator, l.status, l.orbits, v.payload_leo_kg from launch_site_vehicles l
join vehicles v on v.id = l.vehicle_id where l.site_id = 'kourou';
```

## Regeln für neue Zahlen

- Erst die Quelle in `sources` anlegen (mit `short`, z. B. „SIA 2026“), dann den Fakt.
- Widersprechen sich Quellen, alle eintragen und eine als `is_preferred` markieren; die Notiz sagt, warum sie abweicht.
- Was niemand gemessen hat, ist eine Annahme, kein Fakt: mit Spanne, Begründung und Owner. Reine Teamschätzung: Quelle `team`, Konfidenz `low`.
- Hebel im Tool sind höchstens drei pro Stufe (TAM, SAM, SOM); alles andere ist fest und steht mit Begründung im Tool.
