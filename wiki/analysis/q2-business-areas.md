# Q2: Welche Geschäftsfelder soll Isar verfolgen, welche bewusst nicht?

Status: erste Denkanstöße, 21.10. 16:50. Zeitfenster 16:15–19:45, Expert Q&A um 18:00.

## Wie wir die Frage lesen

- SSVE will wissen, worauf Isar Kapital und Aufmerksamkeit setzen soll. Das „deliberately not“ zählt genauso wie das „pursue“.
- Aus Investorensicht ist Fokus selbst ein Wert: Isar hat einen erfolgreichen Flug und ist durch die Kadenz begrenzt.

## Brücke aus Q1

- Bis ca. 2030 begrenzt die Kapazität, nicht die Nachfrage. Ein neues Feld lohnt sich nur, wenn es den **Umsatz pro Start** erhöht, den **Füllgrad** hebt oder **unabhängig vom Orbit** ist.
- Andøyas Markt ist leicht (21 t pro Jahr, viele CubeSats). „Mehr vom Gleichen“ stößt um 2030 an die Grenze.
- 60 % von Isars Nachfrage kommt aus Verteidigung, und SpaceX nimmt angeblich keine Rideshare-Buchungen nach 2028 an. Beides spricht für dedizierte und souveräne Starts.

## Hinweise der Betreuer (21.10., Q2-Session)

- **Kernlogik:** Der Startplatz bestimmt, welche Orbits erreichbar sind. Die Orbits bestimmen, welche Kunden und Segmente Isar bedienen kann. Q2 dreht das um: Welche Segmente wollen wir, und was braucht es dafür?
- **Zeithorizont 15–20 Jahre:** Startplatz-Verträge sind die am wenigsten umkehrbare Entscheidung. Andøya läuft bis zu 20 Jahre ab 2021, Nova Scotia 10 Jahre plus 2 × 5 Jahre. So lange ist Isar an diese Orbits gebunden.
- **Die Rakete legt die Klasse fest:** Spectrum trägt ca. 1 t, große Raketen 60 t. Spectrum hat rund 10 Jahre Entwicklung gebraucht. Für eine ganz andere Raketenklasse oder Mars-Ideen bleibt im Horizont wenig Spielraum.
- **Nur mit Business-Begründung:** kein Geschäftsfeld, „weil es cool ist“. Softwarelizenzierung und Ähnliches ist eher zu früh.
- **Bewusst entscheiden und verteidigen:** was ins Tool gehört und was nicht, welcher Markt der Fokus ist und welche Hebel es gibt.
- **Planet ist ein potenzieller Andøya-Kunde:** die Experten-Session gezielt dafür nutzen.

Ideen aus dem Team, noch unbewertet:

- Kilo-Kontingente versteigern statt Festpreis
- das Pad an Dritte untervermieten (aber: Isar mietet das Pad nur; Betreiber ist Andøya Space)
- Marktplatz für Startplätze
- Startsoftware lizenzieren

## Wer die Kunden sind

Geflogene Nachfrage 2025 im Andøya-Band (90–110,6°), nur offener Markt (ohne Starlink, China, Russland, Kuiper/OneWeb): **474 Satelliten, 51 t**. Auswertung: `pipeline/gcat_customers.py` (GCAT, Missionskategorie aus `psatcat`).

| Mission | Satelliten | Masse |
| --- | --- | --- |
| Erdbeobachtung optisch | 154 | 13,6 t |
| Technologie-Demos | 108 | 4,2 t |
| Kommunikation / IoT | 85 | 2,0 t |
| Wissenschaft | 43 | 7,3 t |
| Wetter / Radio-Okkultation | 28 | 4,3 t |
| Erdbeobachtung Radar (SAR) | 26 | 7,2 t |
| Funk-/Signalaufklärung | 21 | 0,9 t |

Größte Betreiber 2025:

| Betreiber | Satelliten | Mission | Isar-Bezug |
| --- | --- | --- | --- |
| Planet (Flock) | 77 | optische Erdbeobachtung | Kunde (Pelican) |
| Spire | 26 | Wetter, Schiffsverkehr | – |
| ASI / IRIDE (Italien) | 22 | nationale Erdbeobachtung | – |
| OroraTech | 10 | Waldbrand-Erkennung | Kunde (ältere Vereinbarung) |
| Kinéis | 10 | IoT | – |
| ICEYE | 13 | Radar-Erdbeobachtung | – |
| Plan-S, Tevel, ArkEdge | 7–9 | IoT, Funk | – |
| D-Orbit | 7 | Orbit-Transfer | Kunde (ältere Vereinbarung) |
| Pixxel | 6 | hyperspektrale Erdbeobachtung | – |
| Norwegian Space Agency | 4 | Schiffsüberwachung (NORSAT) | Kunde (AOS) |

- **Fast alles ist klein:** 74 % wiegen höchstens 50 kg und fliegen heute per Rideshare. Nur 112 Satelliten (17,5 t) liegen zwischen 50 und 700 kg. Dort lohnt sich ein eigener Start am ehesten.
- **Vier Kundensegmente**, die Andøya bedienen kann:
  1. **Kommerzielle Erdbeobachtung** (optisch, Radar, hyperspektral, Waldbrand): Planet, ICEYE, OroraTech, Pixxel.
  2. **Daten-Konstellationen, die globale Abdeckung brauchen** (IoT, Funkaufklärung, Wetter): Spire, Kinéis, Unseenlabs, HawkEye 360.
  3. **Staatlich und Verteidigung in Europa:** ASI, CNES, Norwegian Space Agency, ESA.
  4. **In-Orbit-Services und Technologie-Demos:** D-Orbit, Varda, Universitäten. Isar-Kunden in diesem Segment sind Astroscale, ELSA-M und ElevationSpace, dazu die Bündler SEOPS und Spaceflight.
- **Nicht von Andøya erreichbar:** Radar-Konstellationen auf 37–45° (iQPS, Synspective), ISS-nahe Missionen, Breitband-Konstellationen, GEO-Kommunikation und Navigation. Nova Scotia (45–98°) öffnet mittlere Inklinationen ab 45°, Kourou die niedrigen und GTO.
- **Isars Verteidigungsnachfrage ist neu, nicht historisch:** Isar nennt 60 % Verteidigung. In den geflogenen Daten des offenen Markts ist Verteidigung kaum sichtbar (21 Funkaufklärungs-Satelliten, meist kommerziell). Die Nachfrage nach souveränem, schnell abrufbarem Zugang kommt also erst, sie lässt sich nicht aus den Startzahlen ableiten.

## Long List mit erster Hypothese

| Geschäftsfeld | Hypothese | Warum |
| --- | --- | --- |
| Verteidigung und schnell abrufbare Starts | verfolgen | größter Nachfragezug, hohe Zahlungsbereitschaft, Souveränität als Schutzgraben; Deutschland plant 35 Mrd. € für Weltraumsicherheit bis 2030 |
| Missionsservices: Rideshare-Bündelung, Kick-Stage bzw. Orbit-Transfer, Integration | verfolgen | hebt Füllgrad und Umsatz pro Start bei wenig Kapital; große Inklinationsunterschiede überbrückt es aber nicht (ca. 130 m/s pro Grad) |
| Suborbitale Hyperschall-Tests für Verteidigung (wie Rocket Labs HASTE) | prüfen | gleiche Rakete, orbitunabhängig, füllt die Kadenz; europäische Nachfrage offen |
| Größere bzw. verbesserte Rakete (ELC-Komponente B bis 2028) | später, an Bedingungen geknüpft | öffnet schwerere Nutzlasten und Konstellationen; hoher Kapitalbedarf, Wettbewerb mit MaiaSpace und Ariane 6 |
| Triebwerke verkaufen (Aquila) | eher nein | nutzt die Fertigung, stärkt aber Wettbewerber; kleiner Markt |
| Satellitenbusse und Raumfahrzeuge (Rocket-Lab-Modell) | nicht jetzt | großer Umsatzpool, aber Konkurrenz zu Kunden (Planet, OHB) und Fokusrisiko |
| Eigene Konstellation bzw. Datendienste | bewusst nicht | sehr kapitalintensiv, konkurriert mit Kunden, außerhalb der Kompetenz |
| Eigene Startplätze bauen und betreiben | bewusst nicht | Pachten (Andøya, Nova Scotia) schont Kapital |
| Bemannte Raumfahrt, Mond, Tourismus, schwere wiederverwendbare Rakete | bewusst nicht | passt nicht zur Nutzlastklasse, kein Recht zu gewinnen |

## Bewertungsrahmen

- **Attraktivität:** Marktgröße und Wachstum, Marge und Zahlungsbereitschaft, Schutz durch Souveränität.
- **Recht zu gewinnen:** Passt es zu den vorhandenen Assets? Gemeint sind Spectrum, Aquila, die Pads, der Zugang zu Verteidigungskunden und die vertikale Integration.
- **Kosten und Risiko:** Kapitalbedarf, Zeit bis zum Umsatz, Ablenkung vom Kern (Zuverlässigkeit und Kadenz).
- **Ausschlussfilter:** Konkurriert das Feld mit den eigenen Kunden?
- **Entscheidungsregel:** Verfolgen, wenn es den Kern stärkt (Preis, Füllgrad, Kadenz) oder orbitunabhängig ist. Streichen, wenn es mit Kunden konkurriert oder viel Kapital vor dem Zuverlässigkeitsnachweis braucht.

## Idee fürs Tool

- **Portfolio-Matrix:** Attraktivität gegen Recht zu gewinnen, Blasengröße = Marktgröße, Farbe = Kapitalbedarf.
- **Gewichte als Regler:** z. B. „Souveränität zählt doppelt“; die Rangfolge ändert sich live.
- **Kopplung an Q1:** Missionsservices heben den Füllgrad, Verteidigung den Preis und den Premium-Anteil. So sieht man direkt, was ein Feld beim SOM-Umsatz bringt.

## Offene Recherche

| Thema | Owner |
| --- | --- |
| Was sagt Isars Management selbst zu neuen Feldern? Verteidigungsverträge, Kick-Stage, größere Rakete | Luca |
| Marktgrößen: Budgets für schnell abrufbare Starts in Europa, Hyperschall-Tests, Orbit-Transfer (D-Orbit, Exotrail), Rocket Labs Segmentzahlen | Benedikt |
| Technische Machbarkeit und Zeitbedarf je Feld, Q2-Kapitel im Dashboard | Nils |

## Frage an den Experten

„If you were Isar's CEO, which business next to launch would you build, and which would make Planet trust them less as a supplier?“ Siehe [Expertenseite](../expert/robbie-schingler.md).
