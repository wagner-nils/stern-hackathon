# Q1: Welcher Anteil der globalen Launch-Nachfrage ist von Andøya aus bedienbar?

Stand: 22.10.2026, Basis geflogene Nachfrage 2025. Alle Zahlen im [Fact-Warehouse](../../warehouse/README.md), im Dashboard (Kapitel Q1) live nachrechenbar und per Klick auf jede Stufe bis zur Quelle aufgeschlüsselt.

## Antwort

- Von Andøya aus kann Isar **422 von 4.521** im Jahr 2025 gestarteten Satelliten bedienen (**9,3 %**), aber nur **0,66 %** der Masse (17,9 t von 2.694 t). Bedienbar sind kleine Satelliten in polare und sonnensynchrone Bahnen; die Masse steckt in Starlink und anderen gebundenen Konstellationen.
- Davon gewinnt Isar heute ca. **30 Satelliten pro Jahr (1,25 t, ca. 36 Mio. €)**, das sind ca. 3 Spectrum-Ladungen.
- **Engpass ist heute die Nachfrage nach dedizierten Starts, nicht Isars Kapazität:** 4 Starts × 80 % Erfolg × 700 kg × 60 % Füllgrad = 1,34 t Kapazität, gewollt sind 1,25 t. Isars voller Manifest kommt also aus Nachfrage, die in den Flugdaten 2025 noch nicht sichtbar ist (Verteidigung, ESA-Programme, Demo-Flüge).

## TAM, SAM, SOM

| Stufe | Definition | Satelliten | Masse | Umsatz |
| --- | --- | --- | --- | --- |
| TAM | alle Satelliten, die 2025 den Orbit erreicht haben | 4.521 | 2.694 t | 11,1 Mrd. € (12,4 Mrd. USD, SIA) |
| SAM | offen für Isar, passt auf Spectrum, Orbit von Andøya erreichbar | 422 | 17,9 t | 120–319 Mio. € |
| SOM | zahlt für einen dedizierten Start, innerhalb von Isars Kapazität | 30 | 1,25 t | 36 Mio. € |

## Rechenweg: drei Eindämmungsfaktoren zum SAM, zwei zum SOM

Satellit für Satellit über die GCAT-Tabelle (`satellites`), identisch in SQL (`v_q1_funnel`) und im Tool.

| Schritt | Regel | bleibt (Satelliten / Masse) | Quelle |
| --- | --- | --- | --- |
| Start: TAM | alle 2025 gestarteten Satelliten | 4.521 / 2.694 t | GCAT; Gegenprobe McDowell 4.526, BryceTech 4.542, SIA 4.434 |
| 1 Zugang | ohne Starlink, China, Russland, Kuiper/OneWeb, US-Regierung (NSPM-17); andere Regierungen zu 20 % | 506 / 124 t | GCAT, NSPM-17, Team |
| 2 Nutzlast | Satellit höchstens 700 kg (SSO-Grenze von Spectrum) | 483 / 24 t | Isar, European Spaceflight |
| 3 Orbit (= SAM) | Inklination 90–110,6° (Andøya, Flugrichtungen 280–360°) | 422 / 17,9 t | CAA Norway, Andøya Space |
| 4 Penetration | 7 % des SAM zahlen für einen eigenen Start statt Rideshare | 29,5 / 1,25 t | GCAT, BryceTech 2026, Schingler |
| 5 Kapazität (= SOM) | 4 Starts × 80 % Erfolg × 700 kg × 60 % Füllgrad = 1,34 t; greift heute nicht | 29,5 / 1,25 t | Payload, Schingler, Team |

Umsatz:

- **TAM:** SIA-Launch-Umsatz 2025, umgerechnet mit 1,12 USD/€.
- **SAM:** SAM-Masse × Preis pro kg, als Spanne von Rideshare (7.500 USD/kg, SpaceX-Liste) bis dediziert (20.000 USD/kg).
- **SOM:** Spectrum-Ladungen (SOM-Masse ÷ 700 kg × 60 %) × 12 Mio. €.

Wer im SAM steckt: Erdbeobachtung optisch 144, Tech-Demos 92, Kommunikation/IoT 80, Wissenschaft 28, Wetter 27, Radar 23. Größte Betreiber Planet 77, Spire 26, ASI 22, OroraTech und Kinéis je 10.

## Penetration in drei Punkten (warum 7 %)

1. **Gemessen:** Heute fliegen ca. 87 % des SAM auf Falcon 9 (Rideshare). Nur 6,7 % der Satelliten (4,2 % der Masse) nehmen einen Kleinträger, fast alle Electron (GCAT).
2. **Vergleich:** Weltweit flogen 2025 17 % der Nicht-Breitband-Kleinsatelliten mit Kleinträgern, im Westen ca. 10–14 % (BryceTech 2026).
3. **Neue Raketen bekommen erst Demo-Nutzlasten:** Versicherung für Isars nächste Mission ca. 25 % (Schingler). Aufwärts wirken der Rideshare-Stopp nach 2028 (unbestätigt) und Verteidigung.

## Hebel und feste Parameter

Höchstens drei Hebel pro Stufe, konservativ und mit Spanne; Details im [Annahmen-Register](../reference/assumptions.md).

- **TAM:** Basisjahr (2024 / 2025)
- **SAM:** Startplätze (Andøya, + Nova Scotia, + Kourou), Anteil anderer Regierungen (0–100 %)
- **SOM:** Penetration (4–15 %), Starts pro Jahr (1–8), Erfolgsquote (75–92 %)
- **Fest:** Spectrum-Nutzlast 700 kg SSO / 1.000 kg LEO (Fahrzeugfakt von Isar), Füllgrad 60 %, Preis 12 Mio. € pro Start, Rideshare 7.500 USD/kg, dediziert 20.000 USD/kg, 1,12 USD/€, US-Regierung 0 %

## Sensitivitäten

| Szenario | SAM | SOM | Engpass |
| --- | --- | --- | --- |
| Basis | 422 Sat. / 17,9 t | 30 Sat. / 1,25 t / 36 Mio. € | Nachfrage |
| Basisjahr 2024 | 187 / 8,7 t | 13 / 0,61 t / 17 Mio. € | Nachfrage |
| + Nova Scotia | 468 / 21,6 t | 29 / 1,34 t / 38 Mio. € | Kapazität |
| + Nova Scotia + Kourou | 483 / 24,2 t | 27 / 1,34 t / 38 Mio. € | Kapazität |
| Penetration 4 % | 422 / 17,9 t | 17 / 0,72 t / 20 Mio. € | Nachfrage |
| Penetration 15 % | 422 / 17,9 t | 32 / 1,34 t / 38 Mio. € | Kapazität |
| 15 % Penetration, 8 Starts, 92 % Erfolg | 422 / 17,9 t | 63 / 2,68 t / 77 Mio. € | Nachfrage |

- Das Basisjahr wirkt am stärksten: 2024 war der offene Markt im Andøya-Band nur halb so groß. Die Nachfrage schwankt stark von Jahr zu Jahr.
- Mehr Starts allein bringen nichts, solange die Penetration bei 7 % liegt. Wachstum kommt über Penetration (Zuverlässigkeit, Rideshare-Stopp, Verteidigung) und neue Orbits.
- Die Nutzlast ist bewusst kein Regler: 1.000 statt 700 kg in SSO vergrößerte den SAM kaum (+0,1 t), und weil Preis (12 Mio. €) und Kilopreis auf 700 kg kalibriert sind, sänke der SOM-Umsatz rechnerisch. Eine stärkere Spectrum-Version gehört in ein späteres Szenario mit eigenem Preis.

## Ausblick für spätere Fragen

- Isar plant 4 Starts 2027 und ca. 8 2028 (Payload); der Manifest gilt bis 2028 als ausgebucht (Munich Startup). Bekannte Verträge: Planet, ElevationSpace, Astroscale (2), Norwegian Space Agency, SEOPS (6), ESA/EU (3), R-Space.
- **Andøyas Lizenz von 30 Starts pro Jahr gilt für den ganzen Standort.** Ein zweites Pad steht in Norwegens Budget 2027, weitere Betreiber wollen ab 2027/28 kommen. Bei 8 Starts nutzt Isar schon ein Viertel der Slots: in Q3/Q4 die Kapazitätsgrenze mit Wettbewerbern am Standort simulieren.
- Marktwachstum 9 % p.a. ist nur als Ausblick hinterlegt, nicht im heutigen SOM.

## Challenge-Punkte fürs Management

- **„Nachfrage für ca. 200 Fahrzeuge 2028“ (Isars CCO)** passt nicht zu den Flugdaten: Der ganze Andøya-SAM 2025 füllt ca. 43 Spectrum-Ladungen, davon ca. 3 dediziert. Wie definiert Isar Nachfrage?
- **60 % Verteidigung:** Welche Orbits braucht dieser Kunde? Radar-Satelliten fliegen oft auf 37–45°, das geht von Andøya nicht.
- **Woher kommt der volle Manifest,** wenn die geflogene dedizierte Nachfrage im Band nur ca. 3 Ladungen pro Jahr trägt? Welcher Anteil ist Demo, ESA-Förderung, Verteidigung?
- **Rideshare-Stopp nach 2028** ist unbestätigt. Wenn er kommt, steigt die Penetration und Kapazität wird zum Engpass.

## Validierung durch den Experten

Robbie Schingler (Planet), 21.10.2026, Details auf der [Expertenseite](../expert/robbie-schingler.md):

- **Bestätigt:** Kunden wählen nach Orbit, Vorlaufzeit, Preis und Zuverlässigkeit, in dieser Reihenfolge. Die Erreichbarkeit als harter Filter im SAM ist richtig. Erdbeobachtung bleibt im SSO.
- **Umgesetzt:** Unerprobte Raketen bekommen nur Demo-Nutzlasten (Penetration konservativ 7 %); Zuverlässigkeit als Erfolgsquote pro Start (80 %).
- **Preis:** erst Kriterium Nr. 3, Markt wegen SpaceX' Fast-Monopol wieder teuer. 12 Mio. € pro Start bleiben plausibel.

## Offene Punkte

- Flug 2 unabhängig bestätigen ([Spectrum](../company/spectrum.md))
- Spectrum-Preis beim Management erfragen
- Quelle für „weitere Betreiber ab 2027/28 in Andøya“ nachtragen (bisher Teamrecherche)
