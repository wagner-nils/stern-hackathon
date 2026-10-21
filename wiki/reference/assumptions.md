# Annahmen-Register

Spiegel der Modellwerte in `dashboard/src/data/` (`assumptions.ts`, `market.ts`, `sites.ts`, `vehicles.ts`). Wer einen Wert ändert, ändert ihn dort und hier. Stand: 21.10.2026.

## Regler im Dashboard

| Annahme | Basis | Spanne | Konfidenz | Owner | Quelle / Begründung |
| --- | --- | --- | --- | --- | --- |
| Planungsjahr | 2027 | 2026–2030 | – | Nils | setzt die Starts auf Isars Plan für das Jahr |
| Spectrum-Starts von Andøya | 4 (2027) | 0–30 | mittel | Luca | Isar: 4 in 2027, ca. doppelt 2028; Plan 1/4/7/10/12 für 2026–30; Lizenzgrenze 30/Jahr für den ganzen Standort |
| Füllgrad pro Start | 60 % | 40–80 % | niedrig | Benedikt | keine Daten; ein einzelner 200-kg-Kunde füllt nur ca. 30 % |
| Preis pro Spectrum-Start | 12 Mio. € | 10–15 Mio. € | niedrig | Luca | nicht veröffentlicht; Electron 8,5 Mio. USD, Firefly Alpha ca. 15 Mio. USD |
| Marktwachstum p.a. | 9 % | 5–14 % | mittel | Benedikt | Novaspace-implizit; BryceTech-Historie 13–17 % |
| Anteil, der für einen dedizierten Start zahlt | 20 % | 12–30 % | mittel | Benedikt | BryceTech: heute 17–23 %, im Westen 10–14 %; steigt mit Rideshare-Stopp und Verteidigung |
| US-Regierungsnachfrage offen für Isar | 0 % | 0–100 % | mittel | Nils | NSPM-17 |
| Nachfrage anderer Regierungen offen für Isar | 20 % | 0–100 % | niedrig | Benedikt | Japan, Indien, Korea fliegen meist mit eigenen Raketen |

## Feste Marktwerte

| Wert | Basis | Konfidenz | Quelle |
| --- | --- | --- | --- |
| Launch-Umsatz weltweit | 12,4 Mrd. USD (2025) | hoch | SIA 2026 |
| Rideshare-Preis SSO | 7.500 USD/kg (Liste 2027) | hoch | SpaceX |
| Dedizierter Preis | 20.000 USD/kg (15.000–28.000) | mittel | abgeleitet; Rocket Lab 10-K |
| Wechselkurs | 1,12 USD/EUR | hoch | EZB |

## Technische Werte

| Wert | Basis | Konfidenz | Quelle |
| --- | --- | --- | --- |
| Andøya Breite | 69,1° N | hoch | Wikipedia, Andøya Space |
| Andøya Flugrichtungen | 280–360° → 90–110,6° Inklination | hoch | CAA Norway |
| Spectrum Nutzlast | 1.000 kg LEO / 700 kg SSO | hoch (Bahnhöhe offen) | Isar |

## Nachfragedaten

| Wert | Basis | Konfidenz | Quelle |
| --- | --- | --- | --- |
| Geflogene Nachfrage | 4.521 Satelliten 2025 (2.840 in 2024), segmentiert | hoch | GCAT via `pipeline/gcat_demand.py` |
| Captive-Gruppen | Starlink inkl. Starshield, China, Russland, Kuiper/OneWeb | mittel (Abgrenzung) | Team-Entscheidung |
