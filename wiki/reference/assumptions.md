# Annahmen-Register

Spiegel der Tabelle `assumptions` im [Fact-Warehouse](../../warehouse/README.md) (`warehouse/seed/assumptions.csv`). Wer einen Wert ändert, ändert ihn in Supabase, exportiert (`uv run warehouse/export.py`) und zieht diese Seite nach. Gemessene Zahlen stehen nicht hier, sondern als Fakten mit Quelle im Warehouse (im Tool: Kapitel „Fact base“). Stand: 22.10.2026.

## Hebel im Dashboard (Q1)

Höchstens drei pro Stufe, konservativ gewählt.

| Stufe | Annahme | Basis | Spanne | Konfidenz | Owner | Quellen / Begründung |
| --- | --- | --- | --- | --- | --- | --- |
| TAM | Basisjahr der geflogenen Nachfrage | 2025 | 2024–2025 | hoch | Nils | GCAT; jüngstes vollständiges Jahr |
| SAM | Startplätze | Andøya | Andøya, + Nova Scotia, + Kourou | hoch | Nils | CAA Norway (90–110,6°), Isar/Maritime Launch, CNES |
| SAM | Schwerster Satellit, den Spectrum in SSO bringt | 700 kg | 700–1.000 kg | hoch | Nils | Isar (1.000 kg LEO / 700 kg SSO), European Spaceflight |
| SAM | Nachfrage anderer Regierungen offen für Isar | 20 % | 0–100 % | niedrig | Benedikt | Teamschätzung: Japan, Indien, Korea fliegen meist mit eigenen Raketen |
| SOM | Anteil des SAM, der einen dedizierten Start kauft | 7 % | 4–15 % | mittel | Benedikt | GCAT: 6,7 % des SAM flogen 2025 auf Kleinträgern; BryceTech 17 % weltweit, 10–14 % im Westen; Schingler: neue Raketen erst Demo |
| SOM | Spectrum-Starts pro Jahr | 4 | 1–8 | mittel | Luca | Payload: 4 Flüge 2027 |
| SOM | Erfolgsquote pro Start | 80 % | 75–92 % | mittel | Nils | Versicherung für Isars nächste Mission ca. 25 % (Schingler); Branchenschnitt 5–8 % Fehlstarts |

## Feste Parameter (kein Regler, im Tool mit Begründung)

| Annahme | Wert | Spanne | Konfidenz | Owner | Quelle |
| --- | --- | --- | --- | --- | --- |
| Füllgrad pro Start | 60 % | 40–80 % | niedrig | Benedikt | Teamschätzung; ein einzelner 200-kg-Kunde füllt nur ca. 30 % |
| Preis pro Spectrum-Start | 12 Mio. € | 10–15 Mio. € | niedrig | Luca | NewSpace Index (FT); Electron 8,5 Mio. USD (Rocket Lab 10-K) |
| Rideshare-Preis | 7.500 USD/kg | 7.000–10.000 | hoch | Benedikt | SpaceX-Preisliste 2027 |
| Dedizierter Preis | 20.000 USD/kg | 15.000–28.000 | mittel | Benedikt | abgeleitet aus Rocket Lab 10-K |
| Wechselkurs | 1,12 USD/€ | 1,08–1,17 | hoch | Nils | EZB |
| US-Regierungsnachfrage offen für Isar | 0 % | – | hoch | Nils | NSPM-17, Abschnitt 6(a) |

## Ausblick

| Annahme | Wert | Spanne | Konfidenz | Owner | Quelle |
| --- | --- | --- | --- | --- | --- |
| Marktwachstum p.a. | 9 % | 5–14 % | mittel | Benedikt | Novaspace 2025, BryceTech 2026 |

## Prüfung durch den Experten

Robbie Schingler (Planet), 21.10.2026:

- **Penetration:** Unerprobte Raketen bekommen nur Demo-Nutzlasten. Darum 7 % (gemessen) statt der 20–30 % aus dem ersten Entwurf.
- **Zuverlässigkeit:** Als Erfolgsquote pro Start (80 %) im Modell.
- **Preis:** Für Kunden erst Kriterium Nr. 3. Die 12 Mio. € bleiben plausibel.
