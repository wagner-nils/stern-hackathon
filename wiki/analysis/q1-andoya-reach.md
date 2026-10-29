# Q1: Welcher Anteil der globalen Launch-Nachfrage ist von Andøya aus bedienbar?

Stand: 22.10.2026, Basis geflogene Nachfrage 2025. Alle Zahlen im [Fact-Warehouse](../../warehouse/README.md), im Dashboard (Kapitel Q1) live nachrechenbar und per Klick auf jede Stufe bis zur Quelle aufgeschlüsselt.

## Antwort

- Von Andøya aus kann Isar **422 von 4.521** im Jahr 2025 gestarteten Satelliten bedienen (**9,3 %**), aber nur **0,66 %** der Masse (17,9 t von 2.694 t). Bedienbar sind kleine Satelliten in polare und sonnensynchrone Bahnen; die Masse steckt in Starlink und anderen gebundenen Konstellationen.
- 7 % davon kaufen einen eigenen Start (30 Satelliten, 1,25 t). Isar gewinnt davon realistisch 45 %: **ca. 13 Satelliten pro Jahr (0,56 t, ca. 10 Mio. €)**, knapp eine volle Spectrum-Ladung.
- **Engpass ist heute die Nachfrage nach dedizierten Starts, nicht Isars Kapazität:** 4 Starts × 75 % Erfolg × 700 kg × 100 % Füllgrad = 2,1 t Kapazität; Isar gewinnt 0,56 t. Dafür braucht Isar 1,1 seiner 4 Starts. Auch die Produktion begrenzt nicht: Das Werk Parsdorf ist auf 40 Raketen pro Jahr ausgelegt. Isars voller Manifest kommt also aus Nachfrage, die in den Flugdaten 2025 noch nicht sichtbar ist (Verteidigung, ESA-Programme, Demo-Flüge).

## TAM, SAM, SOM

| Stufe | Definition | Satelliten | Masse | Umsatz |
| --- | --- | --- | --- | --- |
| TAM | alle Satelliten, die 2025 den Orbit erreicht haben | 4.521 | 2.694 t | 11,1 Mrd. € (12,4 Mrd. USD, SIA) |
| SAM | offen für Isar, passt auf Spectrum, Orbit von Andøya erreichbar | 422 | 17,9 t | 120–319 Mio. € |
| SOM | zahlt für einen dedizierten Start, wählt Isar, innerhalb von Isars Kapazität | 13 | 0,56 t | 10 Mio. € |

## Rechenweg: drei Eindämmungsfaktoren zum SAM, zwei zum SOM

Satellit für Satellit über die GCAT-Tabelle (`satellites`), identisch in SQL (`v_q1_funnel`) und im Tool.

| Schritt | Regel | bleibt (Satelliten / Masse) | Quelle |
| --- | --- | --- | --- |
| Start: TAM | alle 2025 gestarteten Satelliten | 4.521 / 2.694 t | GCAT; Gegenprobe McDowell 4.526, BryceTech 4.542, SIA 4.434 |
| 1 Zugang | ohne Starlink, China, Russland, Kuiper/OneWeb, US-Regierung (NSPM-17); andere Regierungen zu 20 % | 506 / 124 t | GCAT, NSPM-17, Team |
| 2 Nutzlast | Satellit höchstens 700 kg (SSO-Grenze von Spectrum) | 483 / 24 t | Isar, European Spaceflight |
| 3 Orbit (= SAM) | Inklination 90–110,6° (Andøya, Flugrichtungen 280–360°) | 422 / 17,9 t | CAA Norway, Andøya Space |
| 4 Penetration | 7 % des SAM zahlen für einen eigenen Start statt Rideshare | 29,5 / 1,25 t | GCAT, BryceTech 2026, Schingler |
| 5 Isars Anteil | 45 % dieser Nachfrage wählen Isar statt Rocket Labs Electron | 13,3 / 0,56 t | GCAT (`v_win_share_evidence`), Schingler |
| 6 Kapazität (= SOM) | 4 Starts × 75 % Erfolg × 700 kg × 100 % Füllgrad = 2,1 t; greift heute nicht | 13,3 / 0,56 t | Payload, Schingler, Team |

Umsatz:

- **TAM:** SIA-Launch-Umsatz 2025, umgerechnet mit 1,12 USD/€.
- **SAM:** SAM-Masse × Preis pro kg, als Spanne von Rideshare (7.500 USD/kg, SpaceX-Liste) bis dediziert (20.000 USD/kg).
- **SOM:** volle Spectrum-Ladungen (SOM-Masse ÷ 700 kg) × 12 Mio. €. Seit 22.10. gilt Füllgrad 100 %: Mehrere Kunden teilen sich einen Start wie bei einem Rideshare auf Spectrum. Mit dem früheren Füllgrad von 60 % waren es 3 Ladungen und 36 Mio. €.

Wer im SAM steckt: Erdbeobachtung optisch 144, Tech-Demos 92, Kommunikation/IoT 80, Wissenschaft 28, Wetter 27, Radar 23. Größte Betreiber Planet 77, Spire 26, ASI 22, OroraTech und Kinéis je 10.

## Penetration in drei Punkten (warum 7 %)

So kommt man als Berater auf die 7 %: Man misst, wer heute tatsächlich für einen eigenen Start zahlt (revealed preference), glättet über mehrere Jahre und prüft das Ergebnis gegen Vergleichswerte. Nachrechenbar in Supabase in der View `v_penetration_evidence`.

| Blickwinkel | Satelliten | Masse | Quelle |
| --- | --- | --- | --- |
| Andøya-Band (Q1-SAM) 2025 | 6,7 % | 4,2 % | GCAT |
| Andøya-Band 2024 | 15,1 % | 12,8 % | GCAT |
| **Andøya-Band 2024 + 2025 zusammen** | 9,3 % | **7,0 %** | GCAT |
| Westlicher Gesamtmarkt, alle Bahnen, 2024 + 2025 | 9,1 % | 8,4 % | GCAT |
| Weltweit, Nicht-Breitband-Kleinsatelliten 2023–2025 | 17–23 % | – | BryceTech 2026 (inkl. chinesischer Kleinraketen) |
| Obergrenze: nicht mit Falcon 9 geflogen (Band 2024 + 2025) | 14,7 % | 17,3 % | GCAT |

1. **Gemessen:** 2025 flogen ca. 87 % des SAM auf Falcon 9 (Rideshare), 6,7 % der Satelliten mit einem Kleinträger, alle mit Electron. Ein einzelnes Jahr schwankt stark, deshalb gilt der Zweijahreswert: 7,0 % der Masse.
2. **Vergleich:** Der westliche Gesamtmarkt liegt bei 8,4 % der Masse, weltweit sind es 17–23 % (mit China). Die 7 % liegen am vorsichtigen Ende. Die Spanne 4–15 % reicht vom schwachen Jahr 2025 bis zum Jahr 2024 bzw. zur Obergrenze „nicht Falcon 9“.
3. **Aufwärts** wirken der Rideshare-Stopp nach 2028 (unbestätigt) und Verteidigung.

Hinweis: Firefly Alpha war im Datenaufbau bis 22.10. fälschlich nicht als Kleinträger eingestuft (8 Satelliten). Seit der Korrektur liegen die Werte für 2024 leicht höher.

## Isars Anteil an der Nachfrage nach eigenen Starts (warum 45 %)

Die 7 % sind die Nachfrage nach eigenen Starts, egal mit welcher Rakete. 2025 flog sie komplett mit Rocket Labs Electron. Wie viel davon Isar gewinnt, ist ein eigener Hebel. Nachrechenbar in Supabase, View `v_win_share_evidence`.

1. **Natürlicher Anteil:** 2024 und 2025 kauften europäische Betreiber (Kinéis, OroraTech) 44 % der Masse dieser Nachfrage im Band (58 % der Satelliten), alle per Electron, weil noch kein europäischer Kleinträger flog. Das ist der Basiswert von 45 %.
2. **Über Europa hinaus:** Isar gewinnt auch nichteuropäische Kunden (Planet, Astroscale, ElevationSpace, SEOPS), aber Rocket Lab ist erprobt und hat Kapazität (18 Electron-Starts 2025).
3. **Spanne 20–100 %:** 20 % in der Demo-Phase (der zweite Anbieter Firefly Alpha bekam 2024 etwa ein Sechstel der Satelliten mit eigenem Start); 100 %, wenn Rocket Lab für einen Kunden keine Option ist (die frühere stillschweigende Annahme).

Wer heute einen eigenen Start kauft: Konstellationsbetreiber, die eigene Bahnebenen brauchen (2025 Kinéis, OroraTech, E-Space, HawkEye 360; 2024 Kinéis, Spire, Synspective). Das sind meist 10–50 kg schwere Satelliten im Paket, nicht einzelne schwere Satelliten.

## Hebel und feste Parameter

Höchstens drei Hebel pro Stufe, konservativ und mit Spanne; Details im [Annahmen-Register](../reference/assumptions.md).

- **TAM:** Basisjahr (2024 / 2025)
- **SAM:** Startplätze (Andøya, + Nova Scotia, + Kourou), Anteil anderer Regierungen (0–100 %)
- **SOM:** Penetration (4–15 %), Isars Anteil (20–100 %), Starts pro Jahr (1–12), Erfolgsquote (50–92 %)
- **Fest:** Spectrum-Nutzlast 700 kg SSO / 1.000 kg LEO (Fahrzeugfakt von Isar), Füllgrad 100 %, Preis 12 Mio. € pro Start, Rideshare 7.500 USD/kg, dediziert 20.000 USD/kg, 1,12 USD/€, US-Regierung 0 %

## Sensitivitäten

| Szenario | SAM | SOM | Engpass |
| --- | --- | --- | --- |
| Basis | 422 Sat. / 17,9 t | 13 Sat. / 0,56 t / 10 Mio. € | Nachfrage (1,1 von 4 Starts nötig) |
| Isars Anteil 20 % | 422 / 17,9 t | 6 / 0,25 t / 4 Mio. € | Nachfrage |
| Isars Anteil 100 % | 422 / 17,9 t | 30 / 1,25 t / 21 Mio. € | Nachfrage (2,2 von 4 Starts) |
| Basisjahr 2024 | 187 / 8,7 t | 6 / 0,27 t / 5 Mio. € | Nachfrage |
| + Nova Scotia | 468 / 21,6 t | 15 / 0,68 t / 12 Mio. € | Nachfrage |
| + Nova Scotia + Kourou | 483 / 24,2 t | 15 / 0,76 t / 13 Mio. € | Nachfrage |
| Penetration 4 % | 422 / 17,9 t | 8 / 0,32 t / 6 Mio. € | Nachfrage |
| Penetration 15 % | 422 / 17,9 t | 29 / 1,21 t / 21 Mio. € | Nachfrage |
| Penetration 15 %, Anteil 100 % | 422 / 17,9 t | 50 / 2,1 t / 36 Mio. € | Kapazität (4 von 4 Starts) |
| 15 %, Anteil 100 %, 8 Starts, 92 % Erfolg | 422 / 17,9 t | 63 / 2,68 t / 46 Mio. € | Nachfrage |

- Das Basisjahr wirkt am stärksten: 2024 war der offene Markt im Andøya-Band nur halb so groß. Die Nachfrage schwankt stark von Jahr zu Jahr.
- **Erfolgsquote und Startzahl bewegen den SOM heute nicht,** weil die Nachfrage begrenzt und nicht die Kapazität. Sie ändern, wie viele Starts Isar für die Nachfrage braucht (bei 75 %: 1,1 von 4, bei 92 %: 0,9). Das Tool zeigt das unter den SOM-Hebeln. Wirksam werden beide erst, wenn Penetration × Isars Anteil über ca. 12 % steigt (2,1 t Kapazität ÷ 17,9 t SAM). Kapazität heißt dabei der Startplan, nicht das Werk: Parsdorf ist auf 40 Raketen pro Jahr ausgelegt, Andøya erlaubt 30 Starts für den ganzen Standort, ein Pad schafft ca. 12.
- Mehr Starts allein bringen nichts, solange die Penetration bei 7 % liegt. Wachstum kommt über Penetration (Zuverlässigkeit, Rideshare-Stopp, Verteidigung) und neue Orbits.
- Die Nutzlast ist bewusst kein Regler: 1.000 statt 700 kg in SSO vergrößerte den SAM kaum (+0,1 t), und weil Preis (12 Mio. €) und Kilopreis auf 700 kg kalibriert sind, sänke der SOM-Umsatz rechnerisch. Eine stärkere Spectrum-Version gehört in ein späteres Szenario mit eigenem Preis.

## Ausblick für spätere Fragen

- Isar plant 4 Starts 2027 und ca. 8 2028 (Payload); der Manifest gilt bis 2028 als ausgebucht (Munich Startup). Bekannte Verträge: Planet, ElevationSpace, Astroscale (2), Norwegian Space Agency, SEOPS (6), ESA/EU (3), R-Space.
- **Andøyas Lizenz von 30 Starts pro Jahr gilt für den ganzen Standort.** Ein zweites Pad steht in Norwegens Budget 2027, weitere Betreiber wollen ab 2027/28 kommen. Bei 8 Starts nutzt Isar schon ein Viertel der Slots: in Q3/Q4 die Kapazitätsgrenze mit Wettbewerbern am Standort simulieren.
- Marktwachstum 9 % p.a. ist nur als Ausblick hinterlegt, nicht im heutigen SOM.

## Challenge-Punkte fürs Management

- **„Nachfrage für ca. 200 Fahrzeuge 2028“ (Isars CCO)** passt nicht zu den Flugdaten: Der ganze Andøya-SAM 2025 füllt ca. 26 volle Spectrum-Ladungen, davon ca. 1,8 dediziert. Wie definiert Isar Nachfrage?
- **60 % Verteidigung:** Laut Isar (Juli 2026) sind das Anfragen, kein Umsatz. Welche Orbits braucht dieser Kunde? Europäische Verteidigungs-Radarsatelliten flogen 2025 in Andøyas Band (alle per Rideshare); 37–45° nutzen vor allem asiatische Betreiber. Offen ist die Kommunikationsschicht (SATCOMBw 4, IRIS²).
- **Woher kommt der volle Manifest,** wenn die geflogene dedizierte Nachfrage im Band nur ca. 1,8 Ladungen pro Jahr trägt, von denen Isar realistisch knapp eine gewinnt? Welcher Anteil ist Demo, ESA-Förderung, Verteidigung?
- **Rideshare-Stopp nach 2028** ist unbestätigt. Wenn er kommt, steigt die Penetration und Kapazität wird zum Engpass.

## Validierung durch den Experten

Robbie Schingler (Planet), 21.10.2026, Details auf der [Expertenseite](../expert/robbie-schingler.md):

- **Bestätigt:** Kunden wählen nach Orbit, Vorlaufzeit, Preis und Zuverlässigkeit, in dieser Reihenfolge. Die Erreichbarkeit als harter Filter im SAM ist richtig. Erdbeobachtung bleibt im SSO.
- **Umgesetzt:** Unerprobte Raketen bekommen nur Demo-Nutzlasten (Penetration konservativ 7 %); Zuverlässigkeit als Erfolgsquote pro Start (75 %, aus der Versicherungsprämie von 25 %).
- **Preis:** erst Kriterium Nr. 3, Markt wegen SpaceX' Fast-Monopol wieder teuer. 12 Mio. € pro Start bleiben plausibel.

## Offene Punkte

- ~~Flug 2 unabhängig bestätigen~~: erledigt, Spectrum-Flug 2 erreichte am 5.9.2026 den Orbit (GCAT, Recherche 22.10.)
- Spectrum-Preis beim Management erfragen
- „Weitere Betreiber ab 2027/28 in Andøya“: öffentlich kein weiterer Orbital-Anbieter unterschrieben (Recherche 22.10.); Quelle der Team-Info klären
