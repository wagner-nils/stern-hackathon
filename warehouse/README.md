# Fact-Warehouse

Jede Zahl des Tools liegt hier, mit Quelle. Quelle der Wahrheit ist die Supabase-Datenbank (Postgres). Die CSVs in `seed/` sind ihr Spiegel in git, damit jede Änderung im Diff sichtbar ist. Das Dashboard liest einen Snapshot (`dashboard/src/data/warehouse.json`) und läuft dadurch offline.

## Tabellen

| Tabelle | Inhalt | Regel |
| --- | --- | --- |
| `sources` | jede Quelle: Titel, Herausgeber, URL, Art, Verlässlichkeit, Kurzlabel (`short`) | jede Zahl verweist auf eine Quelle |
| `metrics` | Wörterbuch der Messgrößen mit Einheit und Definition | ein Fakt steht immer in der Einheit seiner Metrik |
| `facts` | gemessene Zahlen im Langformat (Metrik, Jahr, Bereich, Entität, Wert, Quelle) | mehrere Quellen pro Metrik erlaubt, genau eine ist `is_preferred` (✓ im Tool) |
| `assumptions` | Urteile des Teams: Wert, Spanne, Begründung, Quellen, Owner, Konfidenz; Hebel oder fest | getrennt von Fakten, damit klar ist, was gemessen und was angenommen ist |
| `launch_sites` | Startplätze mit erreichbarem Inklinationsband und Lizenzgrenze | Q2+ = Zeile ergänzen |
| `vehicles` | Raketen mit Nutzlast und Preis | |
| `manifest` | Isars bekannte Verträge mit Zeitraum | |
| `satellites` | alle 7.361 Satelliten 2024/2025 aus GCAT mit Masse, Inklination, Kundengruppe, Mission, Rakete | erzeugt von `build_satellites.py` |

Views:

- `v_q1_funnel`: der Q1-Funnel TAM → SAM → SOM in SQL, mit den Parametern aus `assumptions`. Ein Test (`dashboard/src/model/q1.test.ts`) prüft, dass Tool und View dieselben Zahlen liefern.
- `v_sam_launchers`: Mit welchen Raketen der SAM heute fliegt.
- `v_facts`: Fakten mit Metrik und Quelle aufgelöst, zum Lesen im Supabase-Editor.

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

Satelliten neu aus GCAT erzeugen (Rohdaten außerhalb des Repos):

```bash
python3 -I warehouse/build_satellites.py --raw <gcat-raw-dir>
```

## Regeln für neue Zahlen

- Erst die Quelle in `sources` anlegen (mit `short`, z. B. „SIA 2026“), dann den Fakt.
- Widersprechen sich Quellen, alle eintragen und eine als `is_preferred` markieren; die Notiz sagt, warum sie abweicht.
- Was niemand gemessen hat, ist eine Annahme, kein Fakt: mit Spanne, Begründung und Owner. Reine Teamschätzung: Quelle `team`, Konfidenz `low`.
- Hebel im Tool sind höchstens drei pro Stufe (TAM, SAM, SOM); alles andere ist fest und steht mit Begründung im Tool.
