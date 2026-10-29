# Startplätze

## Kernaussagen

- Ein Startplatz ist mehr als ein Pad: Er braucht freie Flugkorridore über See, eine Lizenz, Logistik, Treibstoff und Wetterfenster.
- Andøya ist für 30 Starts pro Jahr lizenziert, aber für den **ganzen** Standort. Exklusiv hat Isar nur ein Pad.
- Neue Standorte lohnen sich durch **neue Orbits** (Nova Scotia, Kourou, Azoren). Weitere nördliche Standorte (SaxaVord, Esrange, Sutherland, GOSA) bringen nur Kapazität oder Redundanz.
- US-Standorte sind für Isar praktisch keine Option.

## Globales Startplatz-Register

Seit 22.10.2026 im [Fact-Warehouse](../../warehouse/README.md): 56 Startplätze weltweit (31 operativ, 7 im Bau, 10 geplant, 8 inaktiv), 104 Raketen, 147 Zeilen „wer startet was von wo“, 201 Quellen. Im Tool: Kapitel „Spaceports“ (Weltkarte, Detailkarte pro Standort, Filter „offen für ausländische Anbieter“). In Supabase: `v_launch_site_overview` (eine Zeile pro Standort), `launch_site_vehicles`, `launches`.

- **Spalten:** Betreiber, Eigentum, Koordinaten, erreichbares Inklinationsband, Flugrichtungen, Status, erster Orbitalstart, Pads, größte Raketenklasse, Polar/SSO direkt, Zugang (nur staatlich, nationale Firmen, international offen), Startgrenze pro Jahr mit Grundlage, Ausbaupläne, Bezug zu Isar, Konfidenz, Quellen.
- **Aktivität aus GCAT, nicht aus Recherche:** Starts, Fehlstarts, Nutzlast und Zielorbit pro Standort und Jahr (838 Starts seit 2024). 2025: 330 Orbitalstarts, davon Cape Canaveral 82, Vandenberg 66, Jiuquan 34, Kennedy 27.
- **Offen für ausländische Anbieter** sind 15 Standorte, operativ davon nur Andøya, Kourou, SaxaVord (noch ohne Orbitalstart) und Alcântara; im Bau oder geplant u. a. Nova Scotia, Esrange, Hokkaido, Santa Maria, Etlaq (Oman).
- **Startgrenzen** sind selten veröffentlicht: Andøya 30 (ganzer Standort), SaxaVord 30, Nova Scotia 40 (Ziel 2029), Vandenberg 100 (nur SpaceX), Mahia 120, Hainan Commercial über 60, Starbase 25.
- **Inklinationsbänder** sind teils berechnet (Azimut und Breite) oder aus geflogenen Bahnen abgeleitet; die Notiz jeder Zeile sagt, wie. Die drei Q1-Standorte behalten ihre kuratierten Bänder.

Neu aus der Recherche (22.10.2026), relevant für spätere Fragen:

- **Andøya:** Spectrum-Flug 2 hat am 5.9.2026 den Orbit erreicht (Flug 1 scheiterte am 30.3.2025). Das einzige Orbital-Pad ist Isar-exklusiv; öffentlich hat kein weiterer Orbital-Anbieter unterschrieben (RFA-Vertrag von 2020 ruht, Astrobotic Xodiac ist nicht orbital). Die Team-Info „weitere Betreiber ab 2027/28“ ist damit öffentlich nicht belegt.
- **Kourou, Diamant:** CNES hat im Juni 2026 Sirius Space statt MaiaSpace ausgewählt; Preisträger sind jetzt Isar, Latitude, PLD, RFA und Sirius, ausgelegt auf 40 Starts pro Jahr gemeinsam. MaiaSpace zieht auf das frühere Soyuz-Pad (erster Start H2 2027). Für Isars Pad gibt es kein Baudatum.
- **Esrange:** noch kein Orbitalstart; Firefly Alpha ist Ankermieter (2 Starts ab frühestens 2028). SSO braucht eine Flugbahn Richtung Tromsø, also Norwegens Zustimmung. Isar hat dort seit Feb. 2026 einen zweiten Teststandort.
- **SaxaVord:** Lizenz für 30 Starts pro Jahr, RFA One für 10; RFA One ist nach einem Problem Ende Juli 2026 weiterhin nicht geflogen.
- **Sutherland:** Orbex hat im Feb. 2026 aufgegeben, die Agentur HIE hat die Anlagen übernommen.
- **USA:** Pro-Pad-Grenzen statt Standortgrenzen (Cape Canaveral SLC-40: 120 Falcon 9 pro Jahr; Kennedy LC-39A: 44 Starship pro Jahr).

## Was ein Startplatz braucht

| Kriterium | Warum es zählt | Andøya |
| --- | --- | --- |
| Erreichbare Orbits (Breite, freie Flugkorridore über See) | bestimmt den adressierbaren Markt | nur 90–110,6° |
| Startkapazität (Lizenz, Pads, Turnaround) | Obergrenze für den Umsatz | 30/Jahr für den ganzen Standort, 1 Pad für Isar |
| Regulierung | ohne nationales Weltraumgesetz kein Startplatz | NO: Space Act Dez. 2025; DE: noch keins |
| Zugang zu US-Kunden | US-Satelliten brauchen ein TSA zwischen Startland und USA | TSA Norwegen–USA seit Jan. 2025 |
| Logistik und Treibstoff | Kampagnendauer und Kosten (LOX, Transport aus Bayern) | nicht veröffentlicht |
| Wetter und Seeverkehr | Verschiebungen, lange Kampagnen | Wind, Schiffe: 7,5 Monate für Flug 2 |
| Verfügbarkeit | ab wann der Standort Umsatz bringt | operativ |
| Kosten | Pacht, Infrastruktur | Vergleich Nova Scotia: 3,75 Mio. USD pro Quartal |

## Andøya im Detail

- **Lage:** Orbital-Pad in Børvågen, 69,1° N, 15,6° O. Nicht zu verwechseln mit der alten Höhenforschungsbasis bei Andenes.
- **Erreichbare Orbits:** Drei Angaben widersprechen sich:
  - Regulierer (CAA Norway): Flugrichtungen 280–360°
  - Betreiber Andøya Space: Azimut −60° bis +5°, Inklination 90–110,6°
  - Isar: Inklination 87,4–108°
  - Für die rechtliche Prüfung gilt der Sektor des Regulierers; das Dashboard rechnet damit.
- **Isars Pad:** exklusiv für bis zu 20 Jahre (seit April 2021). Nur dieses Pad, nicht der ganze Standort.
- **Lizenz:** 30 Starts pro Jahr für den ausgebauten Standort, höchstens 4 nachts (23–07 Uhr). Jeder Start braucht zusätzlich eine Einzelgenehmigung der CAA Norway (orientiert an FAA Part 450).
- **Hypothese, nicht verifiziert:** Starts in den Dämmerungs-SSO fallen auf ca. 04:30 Uhr und würden ins Nachtkontingent zählen.
- **Zweites Orbital-Pad:** im norwegischen Haushaltsentwurf 2027 (646 Mio. NOK, davon 323,3 Mio. in 2027), staatlich, Mieter unbekannt.
- **Betriebsrisiken:** Wind im Winter, Schiffe in der Sperrzone (Abbruch am 25.03.2026), Sperrgebiet von mindestens 2,3 km um den Startplatz.
- **Andere Mieter:** RFA hatte 2020 eine Vereinbarung, konzentriert sich aber auf SaxaVord.

## Standort-Shortlist

| Standort | Land | Breite | Orbits | Status | Relevanz für Isar |
| --- | --- | --- | --- | --- | --- |
| Andøya | NO | 69,1° N | 90–110,6° (SSO/polar) | operativ | Heimatbasis |
| Nova Scotia (Canso) | CA | 45,3° N | 45–98° (Angabe des Betreibers) | Pad-Übergabe 01.11.2026, erster Start 2028 | zweiter Standort, unterschrieben |
| Kourou, Diamant-Site | FR | 5,2° N | niedrige Inklinationen, polar/SSO, GTO | Term Sheet 2022, kein operatives Pad, kein Datum | stärkste Ergänzung bei den Orbits |
| Azoren (Santa Maria) | PT | 37,0° N | Orbitalkorridor unverifiziert | Standortlizenz 2025, zunächst suborbital | einziger EU-Kandidat für 37–45° |
| SaxaVord | UK | 60,8° N | SSO/polar | lizenziert, RFA hat ein exklusives Pad | nur Kapazität |
| Esrange | SE | 67,9° N | SSO/polar | Orbitalfähigkeit im Aufbau | nur Kapazität; Isar testet dort Triebwerke |
| Sutherland | UK | 58,5° N | SSO/polar | Bau gestoppt, Orbex insolvent | nur Kapazität |
| GOSA (Nordsee-Schiff) | DE | 54–56° N | SSO/polar | Konzept, Gesellschaft wohl aufgelöst; kein deutsches Weltraumgesetz | kurzfristig unrealistisch |
| Cape Canaveral, Vandenberg, Wallops | US | 28–38° N | alle | operativ | Pad-Zugang und ITAR offen; NSPM-17 verlangt US-Raketen für US-Regierungsnutzlasten |
| Mahia | NZ | 39,3° S | SSO bis ca. 30° | 17 Orbitalstarts 2025 | Benchmark; privat bei Rocket Lab |

## Regulierung und US-Zugang

- **Norwegen:** Standortlizenz des Wirtschaftsministeriums (Aug. 2024); neuer Space Act im Dezember 2025 beschlossen.
- **Deutschland:** kein nationales Weltraumgesetz, ein Entwurf wird zwischen den Ministerien abgestimmt. Das blockiert einen deutschen Offshore-Startplatz. Die Bundeswehr prüft einen eigenen Startplatz.
- **USA:** Die FAA lizenziert auch ausländische Raketen. Pad-Zugang, Sicherheit und ITAR sind aber separat zu lösen. NSPM-17 (2026) verlangt, dass US-Regierungsnutzlasten mit US-Raketen fliegen.
- **TSA:** Für US-gebaute Satelliten braucht das Startland ein Technologieschutzabkommen mit den USA. Norwegen hat eines seit Januar 2025; ob Kanada eines hat, ist offen.

## Quellen

- [CAA Norway: Andøya Spaceport](https://luftfartstilsynet.no/en/space/andoya-spaceport/)
- [European Spaceflight: Andøya-Lizenz](https://europeanspaceflight.com/norways-andoya-spaceport-receives-launch-site-operator-license/)
- [Andøya Space](https://andoyaspace.no/spaceport/efficient-way-to-space/)
- [Isar: exklusives Pad in Norwegen](https://isaraerospace.com/press/launch-site-secured-isar-aerospace-signs-exclusive-launch-pad-in-norway-for-up-to-20-years)
- [Space Launch Schedule: zweites Andøya-Pad](https://www.spacelaunchschedule.com/space-news/norwegian-government-proposes-paying-for-second-andoya-launch-pad/)
- [Isar: Nova Scotia](https://isaraerospace.com/press/sovereign-space-access-for-germany-and-canada-isar-aerospace-and-maritime-launch-services-sign-contract-to-advance-orbital-launch-capability-from-spaceport-nova-scotia)
- [CNES: ELM-Diamant](https://cnes.fr/en/news/elm-diamant-launch-complex-space-history-making)
- [Portugal Space: Lizenz Santa Maria](https://ptspace.pt/portugal-awards-first-licence-to-operate-spaceport/)
- [UK CAA: SaxaVord-Lizenz](https://www.caa.co.uk/newsroom/news/saxavord-granted-spaceport-licence-by-uk-civil-aviation-authority/)
- [European Spaceflight: Startplatz für die Bundeswehr](https://europeanspaceflight.com/germany-considers-dedicated-launch-facility-for-its-armed-forces/)
- [FAA: International Affairs](https://www.faa.gov/space/additional_information/international_affairs)
