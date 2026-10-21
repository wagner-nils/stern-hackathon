# Fortschritt

| Phase | Branch | Zeitfenster | Status | Ergebnis |
| --- | --- | --- | --- | --- |
| Setup | `main` | 21.10. bis 13:45 | erledigt | Team, Rollen, Notion-Wissensbasis |
| Q1 – Reichweite Andøya | `phase/q1-andoya` | 21.10. 13:45–16:15 | erledigt | SAM 9,3 % der Satelliten / 0,7 % der Masse; [q1-andoya.md](q1-andoya.md) |
| Q2 | `phase/q2` | 21.10. 16:15–19:45 | läuft | – |
| Q3 | `phase/q3` | 22.10. 09:30–12:00 | offen | – |
| Q4 | `phase/q4` | 22.10. 12:45–14:45 | offen | – |
| Final | `phase/final` | 22.10. ab 15:00 | offen | Präsentation |

## Log

Neueste Einträge oben. Ein Eintrag pro Checkpoint (ca. alle 30 Minuten).

- **21.10. 17:23**: UI heller und ruhiger: helles Isar-Theme (Weiß/Hellgrau, Navy-Text, ein Blau-Akzent), keine Sterne, kein Leuchten, kein Einblenden, statische Orbit-Skizze in einer Karte, Charts ohne Animation. Behoben: Absturz beim Laden und Kapitelwechsel aus dem vorigen Commit bf049d4 (scrollTo gibt in neuem Chromium ein Promise zurück, das React als Cleanup aufrief).
- **21.10. 17:19**: Dashboard auf Isar-Aerospace-CI umgestellt (Navy/Schwarz, Isar-Blau, dünne Display-Schrift, Mono-Labels mit Kreis-Bullet; Manrope/Inter/DM Mono statt der lizenzierten Isar-Schriften). Neu: Orbit-Grafik im Q1-Kopf, Sternenhimmel, hochzählende Zahlen, gestaffeltes Einblenden, leuchtende SOM-Kachel; respektiert „Bewegung reduzieren“. Notion: „TAM / SAM / SOM: Synthese aller Recherchen“ oben unter Market Research (inkl. Benedikts neuer Tiefenrecherche).
- **21.10. 17:12**: RQ1-Annahmen einfach erklärt in Notion (Investor: Market Research → Dashboard Prototyp → RQ1: Annahmen und Quellen). Alle 16 Kernquellen live geprüft und bestätigt; Präzisierungen (SpaceX-Preis-API, BryceTech-PDF S. 29, Novaspace „bis 2035“, NSPM-17 im Federal Register, SatNews als Primärquelle zum Rideshare-Stopp) in Dashboard und Wiki übernommen.
- **21.10. 16:59**: Wissens-Wiki unter wiki/ angelegt (17 Seiten: Case, Unternehmen, Technik, Markt, Analyse Q1/Q2, Experte, Annahmen, Quellen, Glossar; alle internen Links geprüft). Q2-Frage in CLAUDE.md eingetragen.
- **21.10. 16:17**: Notion-Synthese „Synthese Q1: Datenbasis und Antwort“ angelegt (alle Seiten, GCAT, Marktrecherche, Challenge-Punkte fürs Management). Phase auf Q2 gewechselt.
- **21.10. 16:15**: Nachfrage jetzt bottom-up aus McDowells GCAT (pipeline/gcat_demand.py, 2024 und 2025, deckt sich mit seinen veröffentlichten Summen). Marktwerte aus der Recherche übernommen: SIA-Umsatz 12,4 Mrd. USD (2025), Rideshare 7.500 USD/kg, dediziert 20.000 USD/kg, Wachstum 9 %, Kadenz 4/7/10/12, Füllgrad 60 %, Premium-Anteil 20 %. Ergebnis 2027: SAM 9,3 % der Satelliten, 0,7 % der Masse; Isar fliegt mit 4 Starts knapp 8 % davon.
- **21.10. 15:59**: Dashboard im Stern-Stewart-Look (Farben und Typo aus dem Handout, Barlow als freie Schrift). TAM/SAM/SOM als zentrale Kachelreihe mit Assumptions daneben, Planungsjahr 2026–2030, Umsatzsicht. Handy-Seite mit Top-3-Expertenfragen in Notion. Nachfrage noch Team-Entwurf, GCAT-Auswertung und Marktrecherche laufen.
- **21.10. 15:21**: Techie-Recherche in Notion (Orbitphysik, Andøya, Spectrum, Standort-Kriterien, Shortlist, Fragen an Schingler). Verifizierte Andøya-Werte (69,1° N, Azimut 280–360°, 90–110,6°) und Isars Startplan 2027 ins Dashboard übernommen.
- **21.10. 15:10**: Repo aufgesetzt: Dashboard-Gerüst (Vite + React + TS, Single-File-Build), Orbit- und Funnel-Modell mit Tests, Platzhalter-Daten, Fortschrittsverzeichnis, Checkpoint-Skript, Phasen-Branches.
