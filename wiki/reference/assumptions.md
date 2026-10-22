# Annahmen-Register

Spiegel der Tabelle `assumptions` im [Fact-Warehouse](../../warehouse/README.md) (`warehouse/seed/assumptions.csv`). Wer einen Wert ändert, ändert ihn in Supabase, exportiert (`uv run warehouse/export.py`) und zieht diese Seite nach. Gemessene Zahlen stehen nicht hier, sondern als Fakten mit Quelle im Warehouse (im Tool: Kapitel „Fact base“). Stand: 22.10.2026.

## Hebel im Dashboard (Q1)

Höchstens drei pro Stufe, konservativ gewählt.

| Stufe | Annahme | Basis | Spanne | Konfidenz | Owner | Quellen / Begründung |
| --- | --- | --- | --- | --- | --- | --- |
| TAM | Basisjahr der geflogenen Nachfrage | 2025 | 2024–2025 | hoch | Nils | GCAT; jüngstes vollständiges Jahr |
| SAM | Startplätze | Andøya | Andøya, + Nova Scotia, + Kourou | hoch | Nils | CAA Norway (90–110,6°), Isar/Maritime Launch, CNES |
| SAM | Nachfrage anderer Regierungen offen für Isar | 20 % | 0–100 % | niedrig | Benedikt | Teamschätzung: Japan, Indien, Korea fliegen meist mit eigenen Raketen |
| SOM | Anteil des SAM, der einen dedizierten Start kauft | 7 % | 4–15 % | mittel | Benedikt | GCAT, View `v_penetration_evidence`: 2024 + 2025 kauften 6,9 % der Masse im Andøya-Band einen eigenen Start (2024: 12,5 %, 2025: 4,2 %); westlicher Gesamtmarkt 8,5 %; BryceTech weltweit 17–23 % (mit China); Schingler: neue Raketen erst Demo |
| SOM | Spectrum-Starts pro Jahr | 4 | 1–8 | mittel | Luca | Payload: 4 Flüge 2027 |
| SOM | Erfolgsquote pro Start | 80 % | 75–92 % | mittel | Nils | Versicherung für Isars nächste Mission ca. 25 % (Schingler); Branchenschnitt 5–8 % Fehlstarts |

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
- **Zuverlässigkeit:** Als Erfolgsquote pro Start (80 %) im Modell.
- **Preis:** Für Kunden erst Kriterium Nr. 3. Die 12 Mio. € bleiben plausibel.
