# SSCO AI Hackathon – Case Isar Aerospace

Team-Repo für den Stern Stewart & Co. AI Hackathon, 21.–22.10.2026 (Parsdorf). Team: Nils, Luca, Benedikt.

## Case in Kürze

- Stern Stewart Ventures (SSVE) prüft ein Investment in Isar Aerospace (Rakete **Spectrum**, Startplatz **Andøya**, Norwegen). Isar sucht zusätzliche Produktions- und Startplätze.
- Wir bereiten SSVEs Position für das Gespräch von Markus Pertl (Managing Partner) und Milan Manduch (AI Partner) mit Isars Management vor: **Content** (Analysen, Empfehlung, welche Expansionsstrategie SSVE mitträgt) und **Decision** (Tool, mit dem die beiden Standortoptionen testen und Management-Pläne challengen).
- Bewertung (Unternehmens-Valuation) ist explizit **nicht** Teil des Case.
- Output: **kein PowerPoint, kein Excel**, sondern ein interaktives Tool, das die Partner selbst bedienen und das zugleich die Präsentation ist. **Sprache des Tools: Englisch.**
- Bewertet werden Argumentation **und** technischer Build (Architektur, Datenbasis, Robustheit). Zielgruppe sind Betriebswirte: managementtauglich, klare KPIs, transparente Annahmen.

## Fragen und Zeitfenster

| Frage | Zeitfenster | Inhalt |
| --- | --- | --- |
| Q1 | 21.10. 13:45–15:45 | Welcher Anteil der globalen Launch-Nachfrage ist von Andøya aus bedienbar? |
| Q2 | 21.10. 16:15–19:45 | Welche Geschäftsfelder soll Isar verfolgen, welche bewusst nicht? (18:00 Expert Q&A Robbie Schingler, Planet) |
| Q3 | 22.10. 09:30–12:00 | wird vor Ort ausgegeben |
| Q4 | 22.10. 12:45–14:45 | wird vor Ort ausgegeben |
| Final | 22.10. 15:00 | Präsentation mit dem Tool |

## Rollen

- **Nils**: Techie (Raumfahrt, Standortanforderungen, Orbitphysik) und alleiniger Owner des Dashboards
- **Luca**: Isar-Aerospace-Insider (Unternehmen, Kapazität, Kunden)
- **Benedikt**: Investor/Markt (globale Nachfrage, Wettbewerb)

Wissensbasis: [wiki/](wiki/README.md) im Repo (konsolidiert, mit Quellen). Notion „Common Docs: Isar Aerospace“ ist der Entwurfsraum des Teams (Insider, Investor, Techie, Synthese Q1, Expert Q&A).

## Repo-Konventionen

- `warehouse/`: **Fact-Warehouse in Supabase, Quelle der Wahrheit für jede Zahl** ([README](warehouse/README.md)). Fakten mit Quelle (mehrere Quellen pro Metrik, eine bevorzugt), Annahmen getrennt davon mit Spanne, Begründung und Owner, dazu Startplätze, Raketen, Manifest und alle GCAT-Satelliten. `seed/*.csv` ist der git-Spiegel. Nach jeder Änderung `uv run warehouse/export.py` (Supabase → CSV + Dashboard-Snapshot). Keine Zahl im Frontend-Code hart codieren.
- `dashboard/`: das Tool (Vite + React + TypeScript, Build zu einer einzigen `index.html`, die offline läuft und als Claude-Artifact veröffentlicht werden kann).
  - `src/data/warehouse.json` + `warehouse.ts`: Snapshot des Warehouse und typisierter Zugriff (`assumption()`, `preferred()`, `factsFor()`). Nicht von Hand editieren.
  - `src/model/`: reine Funktionen (Orbit-Erreichbarkeit, Q1-Funnel) mit Vitest-Tests. Keine UI-Logik. `q1.ts` muss mit der SQL-View `v_q1_funnel` übereinstimmen (Test).
  - `src/state/levers.ts`: die Hebel, höchstens drei pro Stufe, jeder an eine Zeile in `assumptions` gebunden.
  - `src/sections/`: ein Kapitel pro Frage (Tool = Präsentation), dazu „Fact base“ zum Durchsuchen des Warehouse.
- Standorte, Rakete und Nachfrage sind Daten, nicht hart codiert: neue Standorte = Zeile in `launch_sites`. Für spätere Fragen merken: Andøyas Lizenz (30 Starts/Jahr) gilt für den ganzen Standort, weitere Betreiber wollen ab 2027/28 kommen; Kapazitätsgrenzen dort simulieren.
- `wiki/`: Wissens-Wiki in Markdown (Case, Unternehmen, Technik, Markt, Analyse je Frage, Experte, Referenz). Neue Erkenntnisse kommen auf die passende Themenseite, jede Zahl mit Quelle. Modellwerte stehen im Warehouse, das Wiki erklärt sie (`wiki/reference/assumptions.md` synchron halten).
- `pipeline/`: GCAT-Klassifikation (Kundengruppe, Mission, Orbit), genutzt von `warehouse/build_satellites.py`.
- `progress/`: Fortschrittsverzeichnis, bei jedem Checkpoint aktualisieren.
- Branches: eine pro Phase (`phase/q1-andoya`, `phase/q2`, `phase/q3`, `phase/q4`, `phase/final`). `scripts/checkpoint.sh` committet, wechselt bei Phasenwechsel automatisch auf den neuen Branch und pusht Phasen-Branch und `main` (fast-forward).
