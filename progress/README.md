# Fortschritt

| Phase | Branch | Zeitfenster | Status | Ergebnis |
| --- | --- | --- | --- | --- |
| Setup | `main` | 21.10. bis 13:45 | erledigt | Team, Rollen, Notion-Wissensbasis |
| Q1 – Reichweite Andøya | `phase/q1-andoya` | 21.10. 13:45–16:15 | erledigt | SAM 9,3 % der Satelliten / 0,7 % der Masse; [q1-andoya.md](q1-andoya.md) |
| Q2 | `phase/q2` | 21.10. 16:15–19:45 | erledigt | Strategie ASCENT: erst der Vertrag, dann die Rakete; [Q2](../wiki/analysis/q2-business-areas.md) |
| Q3 | `phase/q3` | 22.10. 09:30–12:00 | erledigt | Ein Werk, ein Kernstandort, eine souveräne Option; [Q3](../wiki/analysis/q3-site-portfolio.md) |
| Q4 | `phase/q4` | 22.10. 12:45–14:45 | läuft | – |
| Final | `phase/final` | 22.10. ab 15:00 | offen | Präsentation |

## Log

Neueste Einträge oben. Ein Eintrag pro Checkpoint (ca. alle 30 Minuten).

- **22.10. 14:15** (Branch `feature/present-mode`): „▶ Present“ ist jetzt eine Seite statt fünf Schritten (passt auf 1280×720). Sie zeigt drei Szenario-Karten (Umsatz 2030/2035, EBIT 2035, profitabel ab), das Chart, fünf Regler (Rahmenvertrags-Starts, Wachstum Bereitschaft, Erfolgsquote, Fixkosten, Q4: Monate Andøya gesperrt), wie ASCENT Geld verdient, Q2-Felder mit Umsatz 2030 und den Q4-Schock. Q4-Strategie „Second ocean“: Isar behält bei einem Jahr Sperre 25 % des Umsatzes 2030, mit Pad-Anteil in Kourou als Versicherung 47 %; Modell `q4.ts` mit Test, Wiki Q4 ergänzt. Notion: „Abschlusspräsentation: 5-Minuten-Story (Q1–Q4)“ mit Sprecheraufteilung. 31 Tests grün.

- **22.10. 13:50** (Branch `feature/present-mode`): Präsentationsmodus „▶ Present“ in der Topbar: fünf Beats (Recommendation → ASCENT → Geografie Welt → Isars Standorte → Zahlen → Gates & Risiken), je Beat Deep Dive ins Explore-Kapitel und „Back to story“. Drei P&L-Szenarien Bear / ASCENT / Bull 2027–2040 im Warehouse (`scenarios`, `v_scenarios`, Kostenanker mit Quellen: Rocket Lab 10-K 2021/2025, Firefly S-1, OHB) und neues Explore-Kapitel „Scenarios“. ASCENT: Umsatz 152 Mio. € 2030, EBIT dauerhaft positiv ab 2038, mit ca. 5 Rahmenvertrags-Starts pro Jahr schon 2035; Nova Scotia braucht ca. 5 Anker-Starts. Plan in drei Runden mit Codex geprüft (`progress/present-*.md`), Notion-Seite „Szenarien: Umsatz und Gewinn bis 2040 (einfach erklärt)“, Wiki `analysis/scenarios.md`. 28 Tests grün.

- **22.10. 13:43**: Vorschau-Konfiguration um einen Präsentations-Server ergänzt (`dashboard-present`, Port 5176, separater Checkout `stern-hackathon-present`). 22 Tests grün.

- **22.10. 13:03**: RQ4 aufgenommen (Schock: Andøya gesperrt, Nova Scotia nur für kanadische Nutzlasten): Wiki-Seite Q4 mit Szenario, Ausweichstandorten aus dem Register und erster Einordnung; Fragenübersicht; Notion Common Docs.

- **22.10. 11:57**: Annahmen-Prüfung: Starts pro Jahr nennt jetzt Werk (40/Jahr), Andøya-Lizenz (30/Jahr Standort) und Pad (ca. 12/Jahr, neue Obergrenze); Erfolgsquote auf 75 % (Versicherungsprämie 25 %, Bilanz 1 von 2 als Untergrenze). SOM unverändert (Nachfrage begrenzt). 22 Tests grün.

- **22.10. 11:47**: RQ3 beantwortet: „Ein Werk, ein Kernstandort, eine souveräne Option“. Notion-Antwortseite unter RQ3 (Ist-Zustand, Auslastung, Zielbild, Begründung, Finanzen, Managementfragen, Storyline für die Abschlusspräsentation), Wiki Q3 neu, Dashboard-Kapitel „Q3 · Sites“ mit Managementfragen. 15 neue belegte Fakten (u. a. Kanada–USA-Abkommen nicht unterschrieben, ITB 100 %, Verteidigungsanteil am zweiten Andøya-Pad). 22 Tests grün.

- **22.10. 11:32**: Hebel-URL robuster: ein neu hinzugekommener Hebel (z. B. Isars Anteil) fällt nach einem Hot-Reload auf seinen Basiswert zurück, ungültige Werte landen nicht mehr als `winShare=undefined` im Link (Hinweis aus der RQ3-Session). 20 Tests grün.

- **22.10. 11:30**: Dashboard-Kapitel „Q2 · Growth“: Antwort mit Live-Zahlen, Startlücke (2028: 1,2 / 2,7 / 8 Starts), ASCENT-Züge, Expansionsfelder mit Umsatz, Bruttogewinn und EVA-Näherung für 2030/2035/2040, Was-wäre-wenn-Regler und Rechenweg pro Feld. TS-Modell `q2.ts` = SQL-View (Test); 20 Tests grün.

- **22.10. 11:20**: Expansionsfelder-Ergebnis in Wiki Q2 und Notion-RQ2 („Expansionsfelder in Zahlen“): Tabelle mit Markt, Isar-Umsatz 2030/2035/2040 und EVA-Näherung, Branchenmargen, sieben Kernaussagen (u. a. Nova Scotia braucht ca. 2,7 Anker-Starts pro Jahr, ESA-Programm endet 2030 → Delle 2035).

- **22.10. 11:12**: RQ2-Expansionsfelder quantitativ im Warehouse: Tabelle `expansion_fields` (13 Felder mit Markt, Wachstum, Isar-Anteil, Marge, Kosten, Quellen) und View `v_q2_expansion_fields` (Umsatz, Bruttogewinn, EVA-Näherung 2030/2035/2040). Ergebnis: Verfolgen-Portfolio 2030 ca. 88 Mio. € Umsatz, Nova Scotia ohne Ankerkunden −12 Mio. € pro Jahr, Mittelklasse-Rakete bis 2032 −48 Mio. € pro Jahr. 17 Tests grün.

- **22.10. 10:43**: RQ3 aufgenommen (Wiki-Seite Q3 mit Betreuer-Hinweisen, Zahlen, Hypothesen, Recherche-Liste; Fragenübersicht; Notion Common Docs). RQ2 um das Commitment und die Brücke Geschäftsfeld → Bahn → Standort → Produktion ergänzt, inkl. Isars realistischem Anteil (2030 ca. 1,3 von 3 sichtbaren Starts).

- **22.10. 10:43**: RQ3 im Wiki gestartet (Session „Repo-Refinement mit Team“): neue Seite `q3-site-portfolio.md`, RQ3 in der Fragenübersicht, Brücke von RQ2 zu RQ3 mit Isars realistischem Anteil (2030 ca. 1,3 Starts). 17 Tests grün.

- **22.10. 10:38**: Penetration aufgeteilt in Nachfrage nach eigenen Starts (7 %) × Isars Anteil gegen Rocket Lab (45 %, neuer Hebel, belegt mit `v_win_share_evidence`: europäische Betreiber kauften 44 % dieser Nachfrage, alle per Electron). SOM jetzt 13 Satelliten / 0,56 t / 10 Mio. €; RQ2: realistisch für Isar 1,2 von 8 Starts 2028. Firefly Alpha als Kleinträger korrigiert. 17 Tests grün.

- **22.10. 10:31**: 7 % Penetration neu begründet und nachrechenbar: View `v_penetration_evidence` (2024 + 2025 kauften 6,9 % der Masse im Andøya-Band einen eigenen Start; westlicher Gesamtmarkt 8,5 %, BryceTech weltweit 17–23 % mit China), unbelegte „10–14 % im Westen“ entfernt; Tool, Notion und Wiki nachgezogen. Drei Team-Kommentare auf der RQ1-Notion-Seite beantwortet. 16 Tests grün.

- **22.10. 10:20**: Füllgrad auf 100 % (mehrere Kunden pro Start): SOM jetzt 30 Satelliten / 1,25 t / 21 Mio. € (vorher 36), RQ2-Leitzahl 2028: sichtbare Nachfrage füllt 2,7 von 8 Starts (34 %). Erfolgsquoten-Regler zeigt jetzt die nötigen Starts (2,2 von 4), weil er den SOM bei Nachfragegrenze nicht bewegt. Supabase-Verbindung fällt bei fehlendem IPv6 auf den Session-Pooler zurück. 16 Tests grün.

- **22.10. 08:42**: RQ2 beantwortet mit der Strategie **ASCENT** (Anchor contracts first, Sovereign readiness, Core polar launches, Extras on every launch, No-go list, Triggers for expansion; EVA als wirtschaftliche Logik). Notion-Antwortseite unter RQ2, Wiki Q2 neu geschrieben, Q2-Annahmen und Auslöser plus vier neue belegte Fakten im Warehouse, Leitzahl als SQL-View `v_q2_launch_gap` (2028: sichtbare Nachfrage füllt 4,5 von 8 Starts). Veraltete Radar-Aussage (37–45°) im Wiki korrigiert. 15 Tests grün.

- **22.10. 07:49**: Nur Log-Korrektur: Zeitstempel des Rockets-Eintrags berichtigt (07:48 statt 08:05). 15 Tests grün.

- **22.10. 07:48**: Neues Tool-Kapitel „Rockets“: Starts nach Land und Unternehmen (2024/2025/2026, aus GCAT über `v_launches_by_provider` und `v_launches_by_country`) und Katalog aller 107 Raketen (neu: Ariane 5, New Shepard, Vega E; Anbieternamen vereinheitlicht). Spaceports-Karte hebt hervor, wo dieselben Raketen wie am gewählten Standort fliegen (Spectrum: Andøya, Nova Scotia, Kourou) oder dieselbe Klasse. 15 Tests grün.

- **22.10. 07:45**: Globales Startplatz-Register im Warehouse und als Tool-Kapitel „Spaceports“: 56 Standorte, 104 Raketen, 147 Zeilen „wer startet was von wo“, 201 Quellen, Aktivität aus 838 GCAT-Starts; Recherche in vier Regionen parallel. Neu belegt: Spectrum-Flug 2 im Orbit (5.9.2026), Kourou-Diamant mit Sirius statt MaiaSpace, in Andøya öffentlich kein weiterer Orbital-Anbieter. 15 Tests grün.

- **22.10. 07:32**: Payload-Regler entfernt: Spectrum-Nutzlast (700 kg SSO, 1.000 kg LEO) ist jetzt ein fester Fahrzeugfakt aus `vehicles`, Tool und SQL-View lesen ihn dort; Basiszahlen unverändert (SAM 422 / 17,9 t, SOM 30 / 1,25 t / 36 Mio. €), 15 Tests grün. Spaceports-Tab stürzt mit älterem Snapshot nicht mehr ab.

- **22.10. 07:25**: Warehouse auf `main` und `phase/q3` gemergt. In Arbeit: globales Startplatz-Register (Schema für `launch_sites`, `vehicles`, `launch_site_vehicles`, neue GCAT-Tabelle `launches` mit 838 Starts seit 2024, Views pro Standort und Rakete) und Dashboard-Tab „Spaceports“ mit Weltkarte; die Recherche-Daten folgen, bis dahin ist das Register leer und Supabase unverändert. 15 Tests grün.

- **22.10. 07:05** (Branch `feature/fact-warehouse`): RQ1 neu aufgebaut auf dem **Fact-Warehouse in Supabase** (Quellen, Metriken, 63 Fakten mit ✓-Vorzugsquelle, 14 Annahmen, Startplätze, Raketen, Manifest, 7.361 GCAT-Satelliten; SQL-View `v_q1_funnel` = Tool, per Test). Q1 heute (Basis 2025): SAM 422 Satelliten / 17,9 t / 120–319 Mio. €, SOM ca. 30 Satelliten / 1,25 t / 36 Mio. €; Penetration 7 % gemessen, **Engpass ist die Nachfrage, nicht die Kapazität**. Dashboard: klickbare TAM/SAM/SOM-Karten mit Drill-down (Eindämmungsfaktoren als Treppe, Quellenvergleich, Wettbewerber, drei Penetrationspunkte, Buchungshorizont gegen Andøyas 30 Slots), max. 3 Hebel pro Stufe, Fact-base-Tab. Stil: „Von 1.000“-Raster, Erreichbarkeitsband im Inklinationschart, Szenario-Hinweis mit Basiswerten, Quellen-Kurzlabels mit Verlässlichkeitslegende. Notion „Antwort“ → „Claude-Überarbeitung“ ergänzt; Wiki Q1 und Annahmen-Register nachgezogen.

- **21.10. 18:58**: Modell um Erfolgsquote pro Start (80 % 2027 bis 92 % 2030) und Premium-Hochlauf (12,5 % 2027 bis 22,5 % 2030) erweitert, beide an das Planungsjahr gekoppelt (nach Expertengespräch). Neuer Basisfall 2027: SOM 32 Satelliten, 1,3 t, 38 Mio. € (3,2 von 4 Starts erfolgreich); 2030: 109 Satelliten, 133 Mio. €. 23 Tests grün; Wiki nachgezogen.
- **21.10. 18:36**: Expertengespräch Robbie Schingler (Planet) ins Wiki übernommen: Rohnotizen, Kernaussagen, Konsequenzen-Tabelle; Querverweise in Q1 (Validierung, Zuverlässigkeit fehlt im Modell), Q2 (Resilienz-Paket mit Planet, Arktis-Netze, Rechenzentren im All), Markt, Isar, Kadenz, Annahmen, Quellen.
- **21.10. 17:46**: Q2: Betreuer-Hinweise (Startplatz → Orbits → Kunden, Zeithorizont 15–20 Jahre durch Pad-Verträge, 1-t-Klasse) und Kundenanalyse im Andøya-Band (GCAT 2025: 474 offene Satelliten, 51 t; Planet, Spire, ASI, OroraTech, ICEYE …) ins Wiki; Skript pipeline/gcat_customers.py.
- **21.10. 17:23**: UI heller und ruhiger: helles Isar-Theme (Weiß/Hellgrau, Navy-Text, ein Blau-Akzent), keine Sterne, kein Leuchten, kein Einblenden, statische Orbit-Skizze in einer Karte, Charts ohne Animation. Behoben: Absturz beim Laden und Kapitelwechsel aus dem vorigen Commit bf049d4 (scrollTo gibt in neuem Chromium ein Promise zurück, das React als Cleanup aufrief).
- **21.10. 17:19**: Dashboard auf Isar-Aerospace-CI umgestellt (Navy/Schwarz, Isar-Blau, dünne Display-Schrift, Mono-Labels mit Kreis-Bullet; Manrope/Inter/DM Mono statt der lizenzierten Isar-Schriften). Neu: Orbit-Grafik im Q1-Kopf, Sternenhimmel, hochzählende Zahlen, gestaffeltes Einblenden, leuchtende SOM-Kachel; respektiert „Bewegung reduzieren“. Notion: „TAM / SAM / SOM: Synthese aller Recherchen“ oben unter Market Research (inkl. Benedikts neuer Tiefenrecherche).
- **21.10. 17:12**: RQ1-Annahmen einfach erklärt in Notion (Investor: Market Research → Dashboard Prototyp → RQ1: Annahmen und Quellen). Alle 16 Kernquellen live geprüft und bestätigt; Präzisierungen (SpaceX-Preis-API, BryceTech-PDF S. 29, Novaspace „bis 2035“, NSPM-17 im Federal Register, SatNews als Primärquelle zum Rideshare-Stopp) in Dashboard und Wiki übernommen.
- **21.10. 16:59**: Wissens-Wiki unter wiki/ angelegt (17 Seiten: Case, Unternehmen, Technik, Markt, Analyse Q1/Q2, Experte, Annahmen, Quellen, Glossar; alle internen Links geprüft). Q2-Frage in CLAUDE.md eingetragen.
- **21.10. 16:17**: Notion-Synthese „Synthese Q1: Datenbasis und Antwort“ angelegt (alle Seiten, GCAT, Marktrecherche, Challenge-Punkte fürs Management). Phase auf Q2 gewechselt.
- **21.10. 16:15**: Nachfrage jetzt bottom-up aus McDowells GCAT (pipeline/gcat_demand.py, 2024 und 2025, deckt sich mit seinen veröffentlichten Summen). Marktwerte aus der Recherche übernommen: SIA-Umsatz 12,4 Mrd. USD (2025), Rideshare 7.500 USD/kg, dediziert 20.000 USD/kg, Wachstum 9 %, Kadenz 4/7/10/12, Füllgrad 60 %, Premium-Anteil 20 %. Ergebnis 2027: SAM 9,3 % der Satelliten, 0,7 % der Masse; Isar fliegt mit 4 Starts knapp 8 % davon.
- **21.10. 15:59**: Dashboard im Stern-Stewart-Look (Farben und Typo aus dem Handout, Barlow als freie Schrift). TAM/SAM/SOM als zentrale Kachelreihe mit Assumptions daneben, Planungsjahr 2026–2030, Umsatzsicht. Handy-Seite mit Top-3-Expertenfragen in Notion. Nachfrage noch Team-Entwurf, GCAT-Auswertung und Marktrecherche laufen.
- **21.10. 15:21**: Techie-Recherche in Notion (Orbitphysik, Andøya, Spectrum, Standort-Kriterien, Shortlist, Fragen an Schingler). Verifizierte Andøya-Werte (69,1° N, Azimut 280–360°, 90–110,6°) und Isars Startplan 2027 ins Dashboard übernommen.
- **21.10. 15:10**: Repo aufgesetzt: Dashboard-Gerüst (Vite + React + TS, Single-File-Build), Orbit- und Funnel-Modell mit Tests, Platzhalter-Daten, Fortschrittsverzeichnis, Checkpoint-Skript, Phasen-Branches.
