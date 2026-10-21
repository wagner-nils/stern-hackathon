# Q1: Welcher Anteil der globalen Launch-Nachfrage ist von Andøya aus bedienbar?

## Antwort

- Von Andøya aus kann Isar **9,3 %** der weltweit gestarteten Satelliten bedienen, aber nur **0,7 %** der Masse (Basis 2025, hochgerechnet auf 2027).
- 2027 plant Isar 4 Starts, bei 80 % Erfolgsquote gelingen im Schnitt 3,2. Damit fliegt Isar ca. 32 Satelliten (1,3 t, ca. 38 Mio. €), das sind 6 % des bedienbaren Markts. **Engpass ist Isars Kapazität.**
- 2030 mit 12 geplanten Starts (92 % Erfolgsquote, also 11 erfolgreiche): 109 Satelliten und 133 Mio. €. Das sind ca. 75 % der dedizierten Nachfrage, die Andøya erreicht (ca. 15 Ladungen pro Jahr). **Kurz nach 2030 wird Andøyas Orbit-Band selbst zum Engpass.** Wachstum braucht dann neue Orbits.

## TAM, SAM, SOM im Basisfall

| Stufe | Definition | 2027 | 2030 |
| --- | --- | --- | --- |
| TAM | alle weltweit gestarteten Satelliten | 5.371 Satelliten, 3.200 t, 13,2 Mrd. € | 6.956 Satelliten, 4.144 t, 17,0 Mrd. € |
| SAM | offen für einen europäischen Launcher, passt auf Spectrum, Orbit von Andøya erreichbar | 501 Satelliten, 21 t, 142–379 Mio. € | 649 Satelliten, 28 t, 184–491 Mio. € |
| SOM | zahlt für einen dedizierten Start, innerhalb von Isars erfolgreicher Kapazität | 32 Satelliten, 1,3 t, 38 Mio. € (3,2 von 4 Starts erfolgreich) | 109 Satelliten, 4,6 t, 133 Mio. € (11 von 12 Starts erfolgreich) |

Alle Werte sind im Dashboard (Kapitel Q1) live nachrechenbar.

## Rechenweg

Filter in dieser Reihenfolge, jeweils je Nachfragesegment (Kundengruppe × Orbit × Inklinationsband × Massenklasse):

1. **TAM:** alle Satelliten, die 2025 den Orbit erreicht haben ([Nachfrage](../market/demand.md)), gewachsen mit 9 % p.a. bis zum Planungsjahr.
2. **Offen für einen europäischen Launcher:** ohne Starlink, China, Russland, Kuiper/OneWeb und US-Regierung (NSPM-17); andere Regierungen zu 20 %.
3. **Passt auf Spectrum:** Durchschnittsmasse des Segments höchstens 700 kg (SSO/polar) bzw. 1.000 kg (LEO).
4. **Von Andøya erreichbar (= SAM):** Anteil des Inklinationsbands innerhalb von 90–110,6° ([Orbitphysik](../technology/orbital-mechanics.md)).
5. **Zahlt für einen dedizierten Start:** Anteil steigt von 12,5 % (2027) auf 22,5 % (2030), der Rest fliegt Rideshare. Neue Raketen bekommen erst Demo-Nutzlasten (Planet).
6. **Isar kann fliegen (= SOM):** begrenzt durch erfolgreiche Starts × 700 kg × 60 % Füllgrad. Erfolgreiche Starts = geplante Starts × Erfolgsquote (80 % 2027 bis 92 % 2030). Ein Fehlstart liefert nichts und bringt konservativ keinen Umsatz.

Umsatz:

- **TAM:** SIA-Launch-Umsatz (12,4 Mrd. USD 2025), gewachsen wie die Nachfrage.
- **SAM:** SAM-Masse × Preis pro kg, als Spanne von Rideshare (7.500 USD/kg) bis dediziert (20.000 USD/kg).
- **SOM:** erfolgreiche Starts × 12 Mio. €.

Code: `dashboard/src/model/funnel.ts` (mit Tests).

## Annahmen

Alle Annahmen mit Spanne und Quelle: [Annahmen-Register](../reference/assumptions.md). Die wichtigsten Änderungen gegenüber Benedikts erstem Entwurf:

| Annahme | Entwurf | Jetzt | Grund |
| --- | --- | --- | --- |
| TAM-Umsatz | 7,5 Mrd. USD (2024, „ohne Starlink“) | 12,4 Mrd. USD (2025, Starlink enthalten) | SIA-Report 2026; 7,5 war veraltet und falsch abgegrenzt |
| Anteil polar/SSO | 70 % (geschätzt) | gemessen je Segment (offener Markt 56 % 2024, 76 % 2025) | GCAT-Auswertung |
| Premium-Anteil | 20–30 % | Hochlauf 12,5 % (2027) bis 22,5 % (2030) | heute 17–23 %, im Westen 10–14 %; laut Planet bekommen neue Raketen erst Demo-Nutzlasten |
| Erfolgsquote | – | 80 % (2027) bis 92 % (2030) | Versicherung für Isars nächste Mission ca. 25 %; Branchenschnitt 5–8 % Fehlstarts |
| Wachstum | 7 % | 9 % | Novaspace-implizit |
| Kadenz 2027–30 | 3 / 6 / 10 / 15 | 4 / 7 / 10 / 12 | Isar: 4 in 2027, ca. doppelt 2028 |
| Füllgrad | 70 % | 60 % | keine Daten; einzelne Kunden füllen weniger |
| Rideshare-Preis | 6.500 USD/kg | 7.500 USD/kg | SpaceX-Liste 2027 |
| Dedizierter Preis | 15.000 USD/kg | 20.000 USD/kg | passt zu 12 Mio. € für 700 kg |

## Sensitivitäten

- **Basisjahr:** Mit Nachfrage 2024 statt 2025 fällt der SAM deutlich (Andøya-Band im offenen Markt 56 % statt 76 %). Im Dashboard umschaltbar.
- **Kadenz und Erfolgsquote** bestimmen den SOM bis 2030, weil die dedizierte Nachfrage die erfolgreichen Starts übersteigt. Jeder Prozentpunkt Erfolgsquote ist 2027 ca. 0,5 Mio. € Umsatz wert.
- **Premium-Anteil** wirkt erst, wenn die Kapazität aufholt (nach 2030), oder bei mehr Starts.
- **Spectrum-Preis** skaliert den SOM-Umsatz linear (10–15 Mio. € ergeben 32–48 Mio. € 2027).

## Challenge-Punkte

- **„Nachfrage für ca. 200 Fahrzeuge 2028“ (Isars CCO)** passt nicht zu den Flugdaten. Im ganzen Andøya-SAM stecken ca. 50–66 Spectrum-Ladungen, davon ca. 10–13 dediziert. Wie definiert Isar Nachfrage?
- **60 % Verteidigung:** Welche Orbits braucht dieser Kunde? Radar-Satelliten fliegen oft auf 37–45°, das geht von Andøya nicht.
- **Rideshare-Stopp nach 2028** ist unbestätigt. Wenn er kommt, steigt der Premium-Anteil und die SOM-Grenze verschiebt sich.
- **Ab ca. 2030 reicht Andøya nicht mehr.** Neue Standorte müssen neue Orbits bringen, nicht nur mehr Pads.

## Validierung durch den Experten

Robbie Schingler (Planet), 21.10.2026, Details auf der [Expertenseite](../expert/robbie-schingler.md):

- **Bestätigt:** Kunden wählen nach Orbit, Vorlaufzeit, Preis und Zuverlässigkeit, in dieser Reihenfolge. Die Erreichbarkeit als harter Filter im SAM ist richtig. Erdbeobachtung bleibt im SSO.
- **Umgesetzt:** Unerprobte Raketen bekommen nur Demo-Nutzlasten. Der Premium-Anteil läuft deshalb von 12,5 % (2027) auf 22,5 % (2030) hoch.
- **Jetzt im Modell:** Zuverlässigkeit als Erfolgsquote pro Start (80 % 2027 bis 92 % 2030). Die Versicherung für Isars nächste Mission kostet ca. 25 %, der Branchenschnitt liegt bei 5–8 % Fehlstarts. Nicht modelliert ist, dass ein Fehlstart das Pad zusätzlich für mehr als ein Jahr blockiert.
- **Preis:** Er ist erst Kriterium Nr. 3, und der Markt ist wegen SpaceX' Fast-Monopol wieder teuer. Die 12 Mio. € pro Start bleiben plausibel.

## Offene Punkte

- Flug 2 unabhängig bestätigen ([Spectrum](../company/spectrum.md))
- Spectrum-Preis beim Management erfragen
- Premium-Anteil mit dem Experten validieren ([Fragen](../expert/robbie-schingler.md))
