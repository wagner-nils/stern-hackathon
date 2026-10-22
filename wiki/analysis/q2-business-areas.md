# Q2: Welche Geschäftsfelder soll Isar verfolgen, welche bewusst nicht?

Stand: 22.10.2026. Antwortseite fürs Team: Notion „Common Docs → RQ2 → Antwort: ASCENT – erst der Vertrag, dann die Rakete“. Alle Zahlen liegen im [Fact-Warehouse](../../warehouse/README.md): Annahmen mit `question = 'Q2'`, die Leitzahl als SQL-View `v_q2_launch_gap`.

## Antwort

- **Isar bleibt Startanbieter** und holt sein Wachstum aus **Verträgen**, nicht aus Raketen auf Vorrat.
- **Verfolgen:** eigene Starts in polare und sonnensynchrone Bahnen für kommerzielle Betreiber, europäische Institutionen und Verteidigung. Dazu bezahlte Startbereitschaft für Staaten und Zusatzleistungen bei jedem Start.
- **Bewusst nicht:**
  - eigene Satelliten oder Daten
  - eigene Transfer-Fahrzeuge
  - ein eigenes Bündelgeschäft
  - Startplätze als Vermieter
  - Triebwerke an Wettbewerber
  - Schwerlast, Mond und bemannte Raumfahrt
  - Preiskampf gegen Rideshare

  Diese Felder konkurrieren mit Isars Kunden oder binden Kapital, bevor Isar zuverlässig und oft fliegt.

## Die Zahl, die zählt

| | 2028 | 2030 |
| --- | --- | --- |
| Geplante Starts | 8 (Isar, laut Payload) | 12 (Team-Annahme) |
| Davon füllt die heute sichtbare Nachfrage | ca. 2,7 (34 %) | ca. 3 (25 %) |
| Lücke, die nur Verträge schließen | ca. 5,3 Starts | ca. 9 Starts |

- **Rechenweg:** bedienbarer Markt aus Q1 (17,9 t) × 9 % Wachstum pro Jahr × 7 % Anteil mit eigenem Start ÷ 700 kg pro voller Ladung ÷ Erfolgsquote (85 % 2028, 92 % 2030). Nachrechenbar in `v_q2_launch_gap`.
- **So what:** Zwei Drittel (2028) bis drei Viertel (2030) der geplanten Starts haben heute keinen sichtbaren Käufer. Isars „2028 ausgebucht“ ist der wichtigste Prüfpunkt fürs Management.
- **Leitplanke:** Die Startzahl folgt den Verträgen, nicht der Werkskapazität.

**Brücke aus Q1:** Der Engpass ist die Nachfrage nach eigenen Starts, nicht Isars Kapazität. Nur 7 % des bedienbaren Markts kaufen heute einen eigenen Start, 87 % fliegen Rideshare auf Falcon 9. Mehr Raketen allein bringen deshalb nichts.

## Strategie: ASCENT

ASCENT ist die Aufstiegsphase einer Rakete und steht für Wachstum. Die wirtschaftliche Logik dahinter ist Stern Stewarts **Economic Value Added (EVA)**: Gewinn nach Kapitalkosten. Isar wächst nur dort, wo der Gewinn die Kapitalkosten schlägt.

EVA = Betriebsgewinn nach Steuern − Kapitalkosten × eingesetztes Kapital. Isar steigert ihn auf drei Wegen:

- **Gewinn hoch:** Preisaufschlag, Zusatzleistungen, bezahlte Bereitschaft
- **Kapital runter:** pachten statt bauen, erst gegen Vertrag
- **Risiko runter:** Ankerkunden, Anzahlungen, Zuverlässigkeit

| | Zug | Was konkret | Muster (Business Model Navigator) | EVA-Hebel |
| --- | --- | --- | --- | --- |
| **A** | Anchor contracts first | Rahmenverträge über mehrere Starts mit Anzahlung; die Startzahl folgt den Verträgen | Subscription, Lock-in | Risiko ↓, Kapital ↓ |
| **S** | Sovereign readiness | Staaten zahlen für Bereitschaft: reservierte Slots, Rakete auf Lager, Ersatz verlorener Satelliten binnen Tagen mit Planet | Guaranteed Availability, Solution Provider | Gewinn ↑, Risiko ↓ |
| **C** | Core polar launches | eigene Starts in polare und sonnensynchrone Bahnen von Andøya | Aikido (Gegenteil von Rideshare: eigener Termin, eigene Bahn, europäisch) | Gewinn ↑ |
| **E** | Extras on every launch | Integration, Versicherung vermitteln, mehrere Absetzbahnen, Restplätze verkaufen | Add-on | Gewinn ↑ |
| **N** | No-go list | kein Satellitenbau, keine eigene Konstellation, kein Preiskampf | bewusst nicht: Integrator, License, Two-sided Market, No Frills, Long Tail | Kapital ↓ |
| **T** | Triggers for expansion | Nova Scotia, Kourou, Hyperschall-Tests, stärkere Spectrum, Mittelklasse nur mit Auslöser | EVA-Disziplin | Kapital ↓ |

Merksatz: „ASCENT: Erst der Vertrag, dann die Rakete.“

Verworfene Namen: Mission EVA mit TETHER (Doppelsinn Weltraumspaziergang und Economic Value Added), ORBIT. „Max-Q“ eignet sich als Kapitelname für die aktuelle Phase höchster Belastung.

## Portfolio

### Verfolgen jetzt (bis 2030)

| Feld | Kunden | Bedingung |
| --- | --- | --- |
| Kommerzielle Konstellationen | Planet, ICEYE, Kinéis, OroraTech | Rahmenverträge über mehrere Starts; Satellitenbauer mit Verteidigungsauftrag gezielt ansprechen |
| Einzelmissionen | Astroscale, ElevationSpace, D-Orbit | schon im Manifest; jede Mission ist ein ganzer Start |
| Europäische Institutionen | ESA, EU, ASI, Norwegens Raumfahrtagentur | Grundauslastung über ESA-Programme |
| Verteidigung: Aufklärung | Bundeswehr, europäische Ministerien | direkt und über Betreiber wie ICEYE; Kommunikationsschicht erst nach Klärung der Bahnen |
| Bezahlte Bereitschaft | Bundeswehr, NATO-Staaten | Vertrag jetzt, Leistung in Stufen: zuerst Reservierung und Übung |
| Zusatzleistungen | alle Startkunden | Versicherung nur vermitteln, nicht selbst garantieren |

### Später, nur mit Auslöser

Die Auslöser stehen als Annahmen mit Stufe `trigger` im Warehouse.

| Feld | Auslöser |
| --- | --- |
| Nova Scotia | bis ca. 2030 (Ende der 30-monatigen Gebührenbefreiung) decken Ankerkunden ca. 13,4 Mio. € pro Jahr plus Betrieb |
| Kourou | EU- oder ESA-Ankerkunde und Baudatum |
| Hyperschall-Testflüge | Blockkauf wie Rocket Labs 20 HASTE-Flüge für 190 Mio. USD (März 2026) und freie Slots |
| Souveräne Startfähigkeit für einen Staat | der Staat zahlt die Anlage, Isar betreibt |
| Stärkere Spectrum | nur ESA-finanziert; laut Flugdaten kaum Markteffekt (+0,1 t) |
| Mittelklasse-Rakete | frühestens 2030, nach ≥ 10 Starts pro Jahr bei ≥ 90 % Erfolg (Team-Setzung) |

### Bewusst nicht

| Feld | Grund |
| --- | --- |
| Satelliten bauen, eigene Konstellation oder Daten | Konflikt mit Kunden wie Planet. Bei Rocket Lab ist die Bruttomarge im Startgeschäft sogar höher (ca. 41 % gegen 31 %, eigene Rechnung aus dem Geschäftsbericht 2025) |
| Eigenes Bündelgeschäft, eigenes Transfer-Fahrzeug | Konkurrenz zu Kunden (SEOPS, D-Orbit, Exolaunch). Restplätze verkaufen und die Oberstufe nutzen: ja |
| Startplätze vermieten, Triebwerke an Dritte | stärkt Wettbewerber; Isar pachtet selbst nur |
| Software, Marktplatz, kg-Auktionen | kein eigener Markt |
| Schwerlast, bemannt, Mond | keine Business-Begründung für eine 1-t-Rakete |
| Preiskampf gegen Rideshare | ca. 17.100 €/kg mit einer vollen Spectrum gegen ca. 6.700 €/kg Rideshare |

## Warum die Logik trägt

- **Orbit zuerst:** Kunden wählen nach Bahn, Vorlaufzeit, Preis und Zuverlässigkeit, in dieser Reihenfolge (Schingler, Planet).
- **Andøya ist der richtige Kern:** Es erreicht 87 % der passenden Satelliten (74 % der Masse). Nova Scotia und Kourou bringen zusammen nur 61 Satelliten bzw. 6,3 t dazu.
- **Zeithorizont 15–20 Jahre:** Das Pad in Andøya läuft bis 2041, Nova Scotia 10 + 2 × 5 Jahre. Eine neue Raketenklasse braucht ca. 10 Jahre.
- **Wachstum kommt aus Verträgen:** Staaten zahlen für Souveränität und Bereitschaft, Konstellationen für planbares Nachfüllen.

## Verteidigung: was belegt ist und was nicht

- **Belegt:** Deutschland will bis 2030 insgesamt 35 Mrd. € in Weltraumprojekte und Sicherheit im All stecken (Pistorius, Sep. 2025). Den Anteil für Starts nennt niemand.
- **Belegt:** SPOCK 1 (Rheinmetall ICEYE, ca. 1,7 Mrd. € brutto, Ende 2025 bis Ende 2030) ist ein **Datendienst**. Die Satelliten gehören dem Joint Venture, die Rakete wählt also der Betreiber.
- **Belegt:** Alle europäischen Verteidigungssatelliten bis 700 kg flogen 2025 in Andøyas Bahnband, aber alle per Rideshare.
- **Nicht belegt:** „60 % Verteidigung“ heißt laut Isar (Juli 2026) „more than half of all inbound requests“. Das sind Anfragen, kein Umsatz.
- **Offen:** Welche Bahnen braucht die Kommunikationsschicht (SATCOMBw Stufe 4, IRIS²)? Bei 45–55° bräuchte es Nova Scotia oder Kourou.

## Fünf Fragen ans Management

1. Welche Verträge stehen hinter „2028 ausgebucht“: Kunde, Mission, Anzahlung?
2. Wie viel Umsatz, nicht Anfragen, kommt heute aus Verteidigung?
3. Würden Sie Startbereitschaft als Produkt verkaufen, und zu welchem Preis?
4. Wer ist der Ankerkunde, der Nova Scotia bis 2030 trägt?
5. Was baut Isar bewusst nicht, auch wenn Investoren es fordern?

## Annahmen im Warehouse

| Annahme | Wert | Spanne | Stufe | Quelle |
| --- | --- | --- | --- | --- |
| Spectrum-Starts 2030 | 12 | 8–15 | outlook | Team (früherer Kadenzplan 4/7/10/12); Isar veröffentlicht nur 4 (2027) und ca. 8 (2028) |
| Erfolgsquote 2028 | 85 % | 80–92 % | outlook | Schingler, Team |
| Erfolgsquote 2030 | 92 % | 85–95 % | outlook | Schingler |
| Nutzlast pro Ladung | 700 kg | 420–700 kg | fixed | 700 kg SSO × 100 % Füllgrad; `load.py` prüft die Übereinstimmung |
| Starts pro Jahr vor einer Mittelklasse-Rakete | 10 | 8–12 | trigger | Team |
| Erfolgsquote vor einer Mittelklasse-Rakete | 90 % | 85–95 % | trigger | Team, Schingler |
| Jährliche Gebühr Nova Scotia, die Ankerkunden decken müssen | 13,4 Mio. € | 12,8–13,9 Mio. € | trigger | Isar (3,75 Mio. USD pro Quartal), EZB |
| Entscheidungsjahr Nova Scotia | 2030 | 2029–2030 | trigger | Isar (30 Monate Gebührenbefreiung ab Ende des ersten Vertragsjahres) |
| Mindest-Blockkauf Hyperschall-Tests | 20 Flüge | 10–20 | trigger | Rocket Lab (20 HASTE-Flüge, März 2026), Team |

Neue Fakten mit Quelle:
- deutsches Budget für Weltraumsicherheit
- Wert von SPOCK 1
- Rocket Labs HASTE-Vertrag (Wert und Flüge)
- Isars Verteidigungsanteil an Anfragen (Juli 2026)

## Hintergrund

### Hinweise der Betreuer (21.10., Q2-Session)

- **Kernlogik:** Startplatz → Orbits → Kunden. Q2 dreht das um: Welche Segmente wollen wir, und was braucht es dafür?
- **Zeithorizont 15–20 Jahre:** Startplatz-Verträge sind die am wenigsten umkehrbare Entscheidung.
- **Die Rakete legt die Klasse fest:** Spectrum trägt ca. 1 t. Für eine andere Klasse bleibt im Horizont wenig Spielraum.
- **Nur mit Business-Begründung,** nichts „weil es cool ist“; Softwarelizenzierung ist eher zu früh.
- **Bewusst entscheiden und verteidigen,** was ins Tool gehört und was nicht.

### Wer die Kunden sind

Geflogene Nachfrage 2025 im Andøya-Band (90–110,6°), offener Markt ohne Massengrenze (ohne Starlink, China, Russland, Kuiper/OneWeb): 474 Satelliten, 51 t. Auswertung: `pipeline/gcat_customers.py`. Der SAM aus Q1 (422 Satelliten, 17,9 t) ist davon der Teil bis 700 kg.

| Mission | Satelliten | Masse |
| --- | --- | --- |
| Erdbeobachtung optisch | 154 | 13,6 t |
| Technologie-Demos | 108 | 4,2 t |
| Kommunikation / IoT | 85 | 2,0 t |
| Wissenschaft | 43 | 7,3 t |
| Wetter / Radio-Okkultation | 28 | 4,3 t |
| Erdbeobachtung Radar (SAR) | 26 | 7,2 t |
| Funk-/Signalaufklärung | 21 | 0,9 t |

- **Größte Betreiber:** Planet 77, Spire 26, ASI/IRIDE 22, ICEYE 13, OroraTech 10, Kinéis 10.
- **Fast alles ist klein:** 74 % wiegen höchstens 50 kg und fliegen heute per Rideshare.
- **Radar auf 37–45° betrifft vor allem asiatische und arabische Betreiber** (iQPS, Synspective, DAPA, Space42). Europäische Verteidigungs-Radarsatelliten (von ICEYE gebaut, Niederlande, Griechenland, Polen) flogen 2025 in Andøyas Band.
- **Nicht von Andøya erreichbar:** ISS-nahe Missionen, Breitband, GEO-Kommunikation, Navigation.

### Aus dem Expertengespräch (Schingler, Planet)

- **Resilienz-Paket:** Planet und Isar schlagen der Bundesregierung gemeinsam vor, Satelliten an einem Tag zu bauen und am nächsten zu starten. Das ist der Kern von „Sovereign readiness“.
- **Souveräne Netze über der Arktis:** Polare Bahnen sind Andøyas Stärke.
- **Kommunikation wandert auf ±55°:** Das braucht Nova Scotia oder Kourou.
- **Rechenzentren im All:** Dämmerungs-SSO auf ca. 1.500 km, von Andøya erreichbar. Wirtschaftlich in ca. 5 Jahren, deshalb nur beobachten. Offen ist, ob solche Starts unter Andøyas Nachtkontingent fallen.

## Framework: Business Model Navigator

Die 55 Geschäftsmodell-Muster der Universität St. Gallen (Gassmann, Frankenberger, Csik; businessmodelnavigator.com) dienen als Checkliste, nicht als Gerüst. Das Gerüst ist die EVA-Logik.

- **Verfolgen:** Aikido, Guaranteed Availability, Solution Provider, Subscription, Lock-in, Add-on.
- **Nur mit Blockkauf:** Make More of It (Hyperschall-Tests).
- **Bewusst nicht:** Integrator (Satellitenbau), License (Triebwerke, Software), Two-sided Market (Marktplatz), Long Tail (eigenes Bündeln), No Frills (Billigstarts), Rent Instead of Buy als Vermieter (Pad an Dritte).

## Wie die Antwort entstanden ist

- Claude hat den Entwurf geschrieben und Codex ihn in drei Runden geprüft (freigegeben). Danach wurde er gegen das Warehouse nachgerechnet und auf eine Seite gekürzt.
- Die Leitzahl steht auf 2028, weil die 8 Starts belegt sind; die 12 Starts für 2030 sind eine Team-Annahme.
- Seit 22.10. rechnet das Modell mit 100 % Füllgrad (mehrere Kunden pro Start). Damit sinkt die sichtbare Auslastung 2028 von 57 % (bei 60 % Füllgrad) auf 34 %. Die Empfehlung wird dadurch noch klarer.
- **Strittig 1:** Codex hält den Kundenkonflikt beim Satellitenbau nicht für einen dauerhaften Ausschlussgrund. Wir schließen ihn deshalb „mindestens bis 2030“ aus.
- **Strittig 2:** Wie viel des Potenzials aus Staatsprogrammen schon in den 9 % Marktwachstum steckt, lässt sich ohne Missionsliste nicht trennen.

## Offene Punkte

| Thema | Owner |
| --- | --- |
| Vertragsliste 2027/28, Verteidigungsanteil am Umsatz, Aufteilung der ESA-Förderung (197,8 Mio. €) in Starts und Upgrades | Luca |
| Budgets für Bereitschaft und Hyperschall-Tests in Europa; Aufpreis eigener Start gegenüber Rideshare | Benedikt |
| Bahnen von SATCOMBw 4 und IRIS²; Nachtkontingent Andøya für Dämmerungsstarts | Nils |
| Dashboard: „Who fills the rockets?“ und Portfolio-Ansicht | Nils |

## Quellen

- Isar, Verteidigungsanfragen (23.7.2026): https://isaraerospace.com/press/german-minister-of-defence-boris-pistorius-visits-isar-aerospace-underscoring-strategic-priority-of-sovereign-access-to-space-for-defence-and-deterrence
- Isar, Nova Scotia (Gebühren, Befreiung, Laufzeit): https://isaraerospace.com/press/sovereign-space-access-for-germany-and-canada-isar-aerospace-and-maritime-launch-services-sign-contract-to-advance-orbital-launch-capability-from-spaceport-nova-scotia
- 35 Mrd. € Weltraumsicherheit (ESUT, 25.9.2025): https://esut.de/en/2025/09/meldungen/63743/space-security-pistorius-weltraum/
- SPOCK 1 (ICEYE, 18.12.2025): https://www.iceye.com/newsroom/press-releases/iceye-and-rheinmetall-win-major-contract-worth-billions-for-space-reconnaissance
- Rocket Lab HASTE, 20 Flüge für 190 Mio. USD (18.3.2026): https://investors.rocketlabcorp.com/news-releases/news-release-details/rocket-lab-secures-190m-contract-20x-haste-launches-cements
- ESA European Launcher Challenge: https://europeanspaceflight.com/esa-awards-e544-million-in-european-launcher-challenge-contracts/
- Rocket Lab, Geschäftsbericht 2025: https://www.sec.gov/Archives/edgar/data/1819994/000181999426000013/rklb-20251231.htm
- SATCOMBw Stufe 4: https://heise.de/-11155898
- IRIS²: https://defence-industry-space.ec.europa.eu/european-union-accelerating-and-reinforcing-iris2-2026-08-07_en
- SpaceX-Rideshare-Preise: https://api-rideshare.spacex.com/api/v2/price
- Expertengespräch: [Robbie Schingler](../expert/robbie-schingler.md)
