# Annahmen-Register

Spiegel der Tabelle `assumptions` im [Fact-Warehouse](../../warehouse/README.md) (`warehouse/seed/assumptions.csv`). Wer einen Wert ändert, ändert ihn in Supabase, exportiert (`uv run warehouse/export.py`) und zieht diese Seite nach. Gemessene Zahlen stehen nicht hier, sondern als Fakten mit Quelle im Warehouse (im Tool: Kapitel „Fact base“). Stand: 22.10.2026.

## Hebel im Dashboard (Q1)

Drei pro Stufe, beim SOM vier (die Penetration ist in Nachfrage nach eigenen Starts und Isars Anteil daran aufgeteilt); konservativ gewählt.

| Stufe | Annahme | Basis | Spanne | Konfidenz | Owner | Quellen / Begründung |
| --- | --- | --- | --- | --- | --- | --- |
| TAM | Basisjahr der geflogenen Nachfrage | 2025 | 2024–2025 | hoch | Nils | GCAT; jüngstes vollständiges Jahr |
| SAM | Startplätze | Andøya | Andøya, + Nova Scotia, + Kourou | hoch | Nils | CAA Norway (90–110,6°), Isar/Maritime Launch, CNES |
| SAM | Nachfrage anderer Regierungen offen für Isar | 20 % | 0–100 % | niedrig | Benedikt | Teamschätzung: Japan, Indien, Korea fliegen meist mit eigenen Raketen |
| SOM | Anteil des SAM, der einen dedizierten Start kauft | 7 % | 4–15 % | mittel | Benedikt | GCAT, View `v_penetration_evidence`: 2024 + 2025 kauften 7,0 % der Masse im Andøya-Band einen eigenen Start (2024: 12,8 %, 2025: 4,2 %); westlicher Gesamtmarkt 8,4 %; BryceTech weltweit 17–23 % (mit China); Schingler: neue Raketen erst Demo |
| SOM | Isars Anteil an der Nachfrage nach eigenen Starts | 45 % | 20–100 % | niedrig | Benedikt | GCAT, View `v_win_share_evidence`: europäische Betreiber (Kinéis, OroraTech) kauften 2024 + 2025 44 % der Masse dieser Nachfrage im Band, alle per Electron; 20 % = Demo-Phase (Firefly bekam 2024 ein Sechstel der Satelliten), 100 % = Rocket Lab keine Option |
| SOM | Spectrum-Starts pro Jahr | 4 | 1–12 | mittel | Luca | Isars Plan: 4 Flüge 2027 (Payload), ca. 8 2028. Darüber liegen drei Grenzen: Werk Parsdorf 40 Raketen pro Jahr (ausgelegt, noch nicht erreicht), Andøya-Lizenz 30 Starts pro Jahr für den ganzen Standort, ein Pad ca. 12 pro Jahr (Obergrenze der Spanne). Heute bindet keine davon |
| SOM | Erfolgsquote pro Start | 75 % | 50–92 % | mittel | Nils | Versicherung für Isars nächste Mission ca. 25 % (Schingler), also 1 zu 4 Fehlstart-Risiko; bisherige Bilanz 1 von 2 Flügen (50 %); reife Kleinträger ca. 92 % |

## Feste Parameter (kein Regler, im Tool mit Begründung)

| Annahme | Wert | Spanne | Konfidenz | Owner | Quelle |
| --- | --- | --- | --- | --- | --- |
| Spectrum-Nutzlast | 700 kg SSO, 1.000 kg LEO | – | hoch | Nils | Fahrzeugfakt in `vehicles` (Isar); keine Bahnhöhe angegeben. Kein Regler mehr: 1.000 kg in SSO brächte nur +0,1 t SAM, und bei festem Preis pro Start sänke der SOM-Umsatz rechnerisch |
| Füllgrad pro Start | 100 % | 60–100 % | mittel | Benedikt | Team-Entscheidung 22.10.: mehrere Kunden teilen sich einen Start wie beim Rideshare (Bündler wie SEOPS füllen auf); vorher 60 % |
| Preis pro Spectrum-Start | 12 Mio. € | 10–15 Mio. € | niedrig | Luca | NewSpace Index (FT); Electron 8,5 Mio. USD (Rocket Lab 10-K) |
| Rideshare-Preis | 7.500 USD/kg | 7.000–10.000 | hoch | Benedikt | SpaceX-Preisliste 2027 |
| Dedizierter Preis | 20.000 USD/kg | 15.000–28.000 | mittel | Benedikt | abgeleitet aus Rocket Lab 10-K |
| Wechselkurs | 1,12 USD/€ | 1,08–1,17 | hoch | Nils | EZB |
| US-Regierungsnachfrage offen für Isar | 0 % | – | hoch | Nils | NSPM-17, Abschnitt 6(a) |

## Ausblick

| Annahme | Wert | Spanne | Konfidenz | Owner | Quelle |
| --- | --- | --- | --- | --- | --- |
| Marktwachstum p.a. | 9 % | 5–14 % | mittel | Benedikt | Novaspace 2025, BryceTech 2026 |
| Spectrum-Starts 2030 (Q2) | 12 | 8–15 | niedrig | Luca | Team; Isar veröffentlicht nur 4 (2027) und ca. 8 (2028) |
| Erfolgsquote 2028 / 2030 (Q2) | 85 % / 92 % | 80–92 % / 85–95 % | mittel | Nils | Schingler, Team |
| Nutzlast pro Ladung (Q2) | 700 kg | 420–700 kg | niedrig | Nils | 700 kg SSO × 100 % Füllgrad, von `load.py` geprüft |

## Auslöser (Q2, Strategie ASCENT)

Schwellen, ab denen ein „später“-Feld in Frage kommt. Details: [Q2](../analysis/q2-business-areas.md).

| Auslöser | Wert | Konfidenz | Owner | Quelle |
| --- | --- | --- | --- | --- |
| Starts pro Jahr vor einer Mittelklasse-Rakete | 10 | niedrig | Nils | Team |
| Erfolgsquote vor einer Mittelklasse-Rakete | 90 % | niedrig | Nils | Team, Schingler |
| Jährliche Gebühr Nova Scotia, die Ankerkunden decken müssen | 13,4 Mio. € | mittel | Luca | Isar (3,75 Mio. USD pro Quartal), EZB |
| Entscheidungsjahr Nova Scotia | 2030 | mittel | Luca | Isar (30 Monate Gebührenbefreiung ab Ende des ersten Vertragsjahres) |
| Mindest-Blockkauf Hyperschall-Tests | 20 Flüge | niedrig | Benedikt | Rocket Lab HASTE (März 2026), Team |

## Prüfung durch den Experten

Robbie Schingler (Planet), 21.10.2026:

- **Penetration:** Unerprobte Raketen bekommen nur Demo-Nutzlasten. Darum 7 % (gemessen) statt der 20–30 % aus dem ersten Entwurf.
- **Zuverlässigkeit:** Als Erfolgsquote pro Start (75 %) im Modell.
- **Preis:** Für Kunden erst Kriterium Nr. 3. Die 12 Mio. € bleiben plausibel.

## Szenarien (Final, P&L 2027–2040)

Kostenbasis der drei Szenarien Bear, ASCENT und Bull, alle in realen Euro von 2026. Die Szenario-Parameter selbst (Rahmenverträge, Anker, Bereitschaft, Erfolgsquote) stehen in der Tabelle `scenarios`. Details: [Szenarien](../analysis/scenarios.md).

| Annahme | Wert | Spanne | Konfidenz | Owner | Quelle |
| --- | --- | --- | --- | --- | --- |
| Fixkosten pro Jahr (Entwicklung und Verwaltung) | 60 Mio. € | 40–90 Mio. € | niedrig | Nils | über 400 Mitarbeitende (Isar, Flug 2) × ca. 85 Tsd. € pro Kopf (OHB 2025, voll belastet) ≈ 35–45 Mio. €, davon ca. 40 % in der Produktion (stecken in den Kosten pro Flug); dazu Tests, Upgrades, Verwaltung. Vergleich: Rocket Lab 2020 43 Mio. USD bei 7 Starts (10-K 2021), Firefly 2024 196 Mio. USD inkl. Mondlander (S-1) |
| Beginn der Nova-Scotia-Gebühr (Jahr mit Bruchteil) | 2029,33 (1. Mai 2029) | 2029,33–2030 | hoch | Luca | Isar: Übergabe 1.11.2026, 30 Monate keine Gebühr, also 3,75 Mio. USD pro Quartal ab Mai 2029; 2029 anteilig, ab 2030 voll |
| Marge auf die Bereitschaftsgebühr | 70 % | 50–80 % | niedrig | Benedikt | Team: Die Gebühr bezahlt reservierte Slots sowie Rakete und Team in Bereitschaft, keine Flugkosten |
| Geflogener Anteil des Bereitschaftsumsatzes | 30 % | 20–50 % | niedrig | Benedikt | Team: Bereitschaft ist vor allem Verfügbarkeitsgebühr; nur abgerufene Starts fliegen |
| Starts hinter Rocket Labs Kosten pro Start 2025 | 21 | 18–21 | hoch | Nils | Rocket Lab 10-K 2025: 4,8 Mio. USD pro Electron-Start bei 21 Missionen (18 orbital, 3 suborbital HASTE); McDowell 2025. Ab dieser Kadenz bleiben die Kosten pro Flug flach |
| Kosten pro Spectrum-Start relativ zu Electron | 1,5× | 1,2–2,0× | niedrig | Nils | Team, Rocket Lab 10-K 2025: Spectrum trägt ca. 3× Electrons Nutzlast mit gleich vielen Triebwerken (9 + 1); Kosten wachsen langsamer als Nutzlast |

Wiederverwendet: Preis pro Start (12 Mio. €), Wechselkurs (1,12 USD/€), Kosten pro Verdopplung der Kadenz (`q3_learning_rate`, 70 %), Gebühr Nova Scotia und Bereitschaftskosten aus `expansion_fields`, Rocket Labs 4,8 Mio. USD pro Start als Fakt (`cost_per_launch`).
