# Nachfrage: geflogene Satelliten

## Kernaussagen

- 2025 erreichten 4.521 Nutzlasten den Orbit (2.694 t). 72 % davon waren Starlink.
- Im offenen Markt (ohne Starlink, China, Russland, Kuiper/OneWeb) liegen 2025 drei Viertel der Satelliten in Andøyas Band, aber sie sind leicht: 21,5 t, etwa 31 volle Spectrum-Ladungen.
- Der Anteil des Andøya-Bands schwankt stark zwischen den Jahren (56 % im offenen Markt 2024, 76 % 2025). Deshalb zeigt das Dashboard beide Jahre.

## Methode

- **Quelle:** Jonathan McDowells General Catalog of Artificial Space Objects (GCAT), Datenstand 17.10.2026.
- **Pipeline:** [`pipeline/gcat_demand.py`](../../pipeline/gcat_demand.py), nur Python-Standardbibliothek, reproduzierbar. Methode, Regeln und Zählungen: [`pipeline/README.md`](../../pipeline/README.md).
- **Grundgesamtheit:** Nutzlasten, die im jeweiligen Jahr gestartet sind und den Orbit erreicht haben. Fehlstarts und suborbitale Flüge sind ausgeschlossen.
- **Abgleich:** Mit Fehlstarts ergeben sich 2.864 (2024) und 4.526 (2025) Nutzlasten, genau McDowells veröffentlichte Summen. Die Masse (Spalte `Mass`) ist für alle Nutzlasten vorhanden; 11–15 % sind McDowells eigene Schätzungen (±20 %).
- **Kundengruppen:**
  - captive: Starlink inkl. Starshield, alle chinesischen und russischen Nutzlasten, Kuiper und OneWeb
  - US-Regierung, europäische Institutionen, andere Regierungen
  - kommerziell (offen): alles andere
- **Segmente:** 2°-Inklinationsbänder × Massenklasse (≤50, 50–200, 200–700, 700–1.000, 1.000–2.000, >2.000 kg) × Kundengruppe. Das Dashboard liest die Segmente aus `dashboard/src/data/generated/`.

## Nach Kundengruppe

| Gruppe | 2024 (Satelliten / t) | 2025 (Satelliten / t) |
| --- | --- | --- |
| **Gesamt** | **2.840 / 2.026** | **4.521 / 2.694** |
| Starlink (inkl. Starshield) | 2.068 / 1.596 | 3.258 / 2.044 |
| China | 266 / 144 | 371 / 288 |
| Russland | 98 / 58 | 87 / 41 |
| Kuiper / OneWeb | 20 / 3 | 180 / 88 |
| US-Regierung | 48 / 91 | 85 / 78 |
| Europäische Institutionen | 19 / 12 | 55 / 33 |
| Andere Regierungen | 41 / 34 | 43 / 39 |
| Kommerziell (offen) | 280 / 88 | 442 / 83 |

Hinweis: McDowell zählt 122 (2024) bzw. 150 (2025) US-Verteidigungsnutzlasten. Bei uns stecken 195 Starshield-Satelliten des NRO in der Starlink-Gruppe.

## Andøya-Band (90–110,6°)

Anteil nach Anzahl / nach Masse:

| Basis | 2024 | 2025 |
| --- | --- | --- |
| Alle Nutzlasten | 14,3 % / 3,8 % (406 Satelliten) | 20,7 % / 9,9 % (934 Satelliten) |
| Offener Markt (ohne captive) | 56,4 % / 11,6 % | 75,8 % / 21,9 % |
| Offener Markt, ≤ 700 kg | 64,4 % / 54,0 % (9,2 t) | 80,2 % / 48,7 % (21,5 t) |

- Gemessen an allen Nutzlasten ist das offene Band ≤ 700 kg 7,4 % (2024) bzw. 10,3 % (2025) der Satelliten, aber nur 0,5 % bzw. 0,8 % der Masse.
- Gefüllt ist es vor allem mit CubeSats unter 50 kg, die per Rideshare auf ca. 97,5° fliegen.

## Ergänzende Zahlen (BryceTech)

| Kennzahl | 2023 | 2024 | 2025 |
| --- | --- | --- | --- |
| Smallsats (≤ 1.200 kg) | 2.860 | 2.790 | 4.466 |
| davon ohne LEO-Breitband | 746 | 729 | 955 |
| Anteil auf Mikro-/Kleinträgern, ohne Breitband | 18 % | 23 % | 17 % |
| Anteil auf Mikro-/Kleinträgern, alle Smallsats | 5 % | 6 % | 4 % |
| Mikro-/Kleinträger-Starts mit Smallsats | 44 | 44 | 47 (CN 22, US 20, andere 5) |
| Ø Masse Smallsat ohne Breitband | – | 213 kg | 177 kg |

- Smallsats nach Betreiber 2025: kommerziell ohne Breitband 521, staatlich-zivil 249, nationale Sicherheit 196, Non-Profit 115, Breitband 3.385.
- Remote Sensing macht ca. 48–51 % der Smallsats ohne Breitband aus.

## Vorbehalte

- Das ist **geflogene** Nachfrage, keine Prognose. Wachstum steckt als Annahme im Modell, siehe [Marktgröße](size-and-pricing.md#prognosen).
- Einige GCAT-Flags sind fehlerhaft; die Pipeline klassifiziert deshalb über Orbitdaten, Status und Bezeichnungen.
- ISS-Aussetzungen zählen im Jahr des Versorgungsflugs, mit ihrem eigenen Orbit.

## Quellen

- [GCAT](https://planet4589.org/space/gcat/)
- [McDowell: Space Activities in 2025](https://planet4589.org/space/papers/space25.pdf)
- [BryceTech: Smallsats by the Numbers 2026](https://brycetech.com/reports/report-documents/smallsats-2026/)
