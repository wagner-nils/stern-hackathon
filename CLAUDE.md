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
| Q2 | 21.10. 16:15–19:45 | wird vor Ort ausgegeben (18:00 Expert Q&A Robbie Schingler, Planet) |
| Q3 | 22.10. 09:30–12:00 | wird vor Ort ausgegeben |
| Q4 | 22.10. 12:45–14:45 | wird vor Ort ausgegeben |
| Final | 22.10. 15:00 | Präsentation mit dem Tool |

## Rollen

- **Nils**: Techie (Raumfahrt, Standortanforderungen, Orbitphysik) und alleiniger Owner des Dashboards
- **Luca**: Isar-Aerospace-Insider (Unternehmen, Kapazität, Kunden)
- **Benedikt**: Investor/Markt (globale Nachfrage, Wettbewerb)

Wissensbasis: Notion „Common Docs: Isar Aerospace“ (Unterseiten Insider, Investor, Techie).

## Repo-Konventionen

- `dashboard/`: das Tool (Vite + React + TypeScript, Build zu einer einzigen `index.html`, die offline läuft und als Claude-Artifact veröffentlicht werden kann).
  - `src/data/`: **jede Zahl** liegt hier mit Quelle (`sources.ts`), Konfidenz und Owner. Platzhalter sind `confidence: "placeholder"` und werden im UI markiert.
  - `src/model/`: reine Funktionen (Orbit-Erreichbarkeit, Funnel) mit Vitest-Tests. Keine UI-Logik.
  - `src/sections/`: ein Kapitel pro Frage (Tool = Präsentation).
- Standorte, Rakete und Nachfrage sind Daten, nicht hart codiert: Q2 (neue Standorte) = Standort in `sites.ts` ergänzen.
- `progress/`: Fortschrittsverzeichnis, bei jedem Checkpoint aktualisieren.
- Branches: eine pro Phase (`phase/q1-andoya`, `phase/q2`, `phase/q3`, `phase/q4`, `phase/final`). `scripts/checkpoint.sh` committet, wechselt bei Phasenwechsel automatisch auf den neuen Branch und pusht Phasen-Branch und `main` (fast-forward).
