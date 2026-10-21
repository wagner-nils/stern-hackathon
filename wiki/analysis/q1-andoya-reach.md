# Q1: Welcher Anteil der globalen Launch-Nachfrage ist von Andøya aus bedienbar?

## Antwort

- Von Andøya aus kann Isar **9,3 %** der weltweit gestarteten Satelliten bedienen, aber nur **0,7 %** der Masse (Basis 2025, hochgerechnet auf 2027).
- 2027 fliegt Isar mit 4 Starts ca. 40 Satelliten (1,7 t, ca. 48 Mio. €). Das sind 8 % des bedienbaren Markts. **Engpass ist Isars Kapazität.**
- 2030 mit 12 Starts: 119 Satelliten und 144 Mio. €, das sind 92 % der dedizierten Nachfrage, die Andøya erreicht. **Danach wird Andøyas Orbit-Band selbst zum Engpass.** Wachstum braucht neue Orbits.

## TAM, SAM, SOM im Basisfall

| Stufe | Definition | 2027 | 2030 |
| --- | --- | --- | --- |
| TAM | alle weltweit gestarteten Satelliten | 5.371 Satelliten, 3.200 t, 13,2 Mrd. € | 6.956 Satelliten, 4.144 t, 17,0 Mrd. € |
| SAM | offen für einen europäischen Launcher, passt auf Spectrum, Orbit von Andøya erreichbar | 501 Satelliten, 21 t, 142–379 Mio. € | 649 Satelliten, 28 t, 184–491 Mio. € |
| SOM | zahlt für einen dedizierten Start, innerhalb von Isars Kapazität | 40 Satelliten, 1,7 t, 48 Mio. € (4 Starts) | 119 Satelliten, 5 t, 144 Mio. € (12 Starts) |

Alle Werte sind im Dashboard (Kapitel Q1) live nachrechenbar.

## Rechenweg

Filter in dieser Reihenfolge, jeweils je Nachfragesegment (Kundengruppe × Orbit × Inklinationsband × Massenklasse):

1. **TAM:** alle Satelliten, die 2025 den Orbit erreicht haben ([Nachfrage](../market/demand.md)), gewachsen mit 9 % p.a. bis zum Planungsjahr.
2. **Offen für einen europäischen Launcher:** ohne Starlink, China, Russland, Kuiper/OneWeb und US-Regierung (NSPM-17); andere Regierungen zu 20 %.
3. **Passt auf Spectrum:** Durchschnittsmasse des Segments höchstens 700 kg (SSO/polar) bzw. 1.000 kg (LEO).
4. **Von Andøya erreichbar (= SAM):** Anteil des Inklinationsbands innerhalb von 90–110,6° ([Orbitphysik](../technology/orbital-mechanics.md)).
5. **Zahlt für einen dedizierten Start:** 20 % des SAM, der Rest fliegt Rideshare.
6. **Isar kann fliegen (= SOM):** begrenzt durch Starts × 700 kg × 60 % Füllgrad.

Umsatz:

- **TAM:** SIA-Launch-Umsatz (12,4 Mrd. USD 2025), gewachsen wie die Nachfrage.
- **SAM:** SAM-Masse × Preis pro kg, als Spanne von Rideshare (7.500 USD/kg) bis dediziert (20.000 USD/kg).
- **SOM:** Starts × 12 Mio. €.

Code: `dashboard/src/model/funnel.ts` (mit Tests).

## Annahmen

Alle Annahmen mit Spanne und Quelle: [Annahmen-Register](../reference/assumptions.md). Die wichtigsten Änderungen gegenüber Benedikts erstem Entwurf:

| Annahme | Entwurf | Jetzt | Grund |
| --- | --- | --- | --- |
| TAM-Umsatz | 7,5 Mrd. USD (2024, „ohne Starlink“) | 12,4 Mrd. USD (2025, Starlink enthalten) | SIA-Report 2026; 7,5 war veraltet und falsch abgegrenzt |
| Anteil polar/SSO | 70 % (geschätzt) | gemessen je Segment (offener Markt 56 % 2024, 76 % 2025) | GCAT-Auswertung |
| Premium-Anteil | 20–30 % | 20 % | heute 17–23 %, im Westen 10–14 % |
| Wachstum | 7 % | 9 % | Novaspace-implizit |
| Kadenz 2027–30 | 3 / 6 / 10 / 15 | 4 / 7 / 10 / 12 | Isar: 4 in 2027, ca. doppelt 2028 |
| Füllgrad | 70 % | 60 % | keine Daten; einzelne Kunden füllen weniger |
| Rideshare-Preis | 6.500 USD/kg | 7.500 USD/kg | SpaceX-Liste 2027 |
| Dedizierter Preis | 15.000 USD/kg | 20.000 USD/kg | passt zu 12 Mio. € für 700 kg |

## Sensitivitäten

- **Basisjahr:** Mit Nachfrage 2024 statt 2025 fällt der SAM deutlich (Andøya-Band im offenen Markt 56 % statt 76 %). Im Dashboard umschaltbar.
- **Premium-Anteil und Kadenz** bestimmen den SOM. Bis 2029 wirkt nur die Kadenz, weil die Nachfrage die Kapazität übersteigt.
- **Spectrum-Preis** skaliert den SOM-Umsatz linear (10–15 Mio. € ergeben 40–60 Mio. € 2027).

## Challenge-Punkte

- **„Nachfrage für ca. 200 Fahrzeuge 2028“ (Isars CCO)** passt nicht zu den Flugdaten. Im ganzen Andøya-SAM stecken ca. 50–66 Spectrum-Ladungen, davon ca. 10–13 dediziert. Wie definiert Isar Nachfrage?
- **60 % Verteidigung:** Welche Orbits braucht dieser Kunde? Radar-Satelliten fliegen oft auf 37–45°, das geht von Andøya nicht.
- **Rideshare-Stopp nach 2028** ist unbestätigt. Wenn er kommt, steigt der Premium-Anteil und die SOM-Grenze verschiebt sich.
- **Ab ca. 2030 reicht Andøya nicht mehr.** Neue Standorte müssen neue Orbits bringen, nicht nur mehr Pads.

## Offene Punkte

- Flug 2 unabhängig bestätigen ([Spectrum](../company/spectrum.md))
- Spectrum-Preis beim Management erfragen
- Premium-Anteil mit dem Experten validieren ([Fragen](../expert/robbie-schingler.md))
