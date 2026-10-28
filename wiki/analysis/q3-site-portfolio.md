# Q3: Wie soll Isar sein Portfolio aus Produktions- und Startstandorten aufstellen?

> „How should Isar structure its portfolio of production and launch sites for the future?“ (Question 3, „Site portfolio · Day 2“)

Stand: 22.10.2026. Antwortseite fürs Team: Notion „Common Docs → RQ3 → Antwort: Ein Werk, ein Kernstandort, eine souveräne Option“. Im Tool: Kapitel „Q3 · Sites“. Zahlen im [Fact-Warehouse](../../warehouse/README.md): Tabelle `site_nodes`, View `v_q3_site_load`, Annahmen mit `question = 'Q3'`.

## Antwort

**Ein Werk in Bayern, ein Kernstartplatz mit zweitem Pad, ein souveräner Standort im Ausland.** Die Produktion bleibt zentral, die Startplätze folgen Kunden und Verträgen.

- **Produktion:** Parsdorf bleibt das einzige Serienwerk. 2030 braucht Isar ca. 11 Raketen; das Werk ist auf 40 ausgelegt (28 % Auslastung).
- **Andøya:** Kern für polare und sonnensynchrone Bahnen. Pad A trägt das Volumen bis ca. 2040. Das zweite Pad bezahlt Norwegen (69 % der Tranche 2027 aus dem Verteidigungsetat); es dient Bereitschaft und Redundanz.
- **Nova Scotia:** souveräner Standort für Kanada und die NATO, nur mit mindestens 3 Anker-Starts pro Jahr. Kein Werk in Kanada.
- **Kourou:** Option nur mit europäischem Ankerkunden.

## Hinweise der Betreuer (22.10.)

- Startplatz und Produktion zusammen denken: nicht nur wo starten, sondern auch wo bauen.
- Kanada: Produktion vor Ort, oder Raketen über den Atlantik schicken?
- Reicht das Werk Parsdorf? Hört der Ausbau dort auf oder geht er weiter?
- Ohne klares Geschäftsfeld keine Standortantwort; dafür steht das Commitment in [Q2](q2-business-areas.md).
- Präsentation als eine Geschichte (investieren ja oder nein, mit welcher Strategie), nicht Frage für Frage; Umsatz, Gewinn und Zuverlässigkeit als Kern-KPIs; Risiko und Diversifikation mitdenken.

## Ist-Zustand

| Standort | Art | Heute | Quelle |
| --- | --- | --- | --- |
| Ottobrunn | Zentrale, Entwicklung | über 400 Mitarbeitende | Isar |
| Parsdorf (Vaterstetten) | Serienwerk | über 40.000 m², im Feb. 2026 fast fertig, ausgelegt auf bis zu 40 Raketen pro Jahr; Plan 2027: 4 Starts | Isar, Payload |
| Esrange | Testgelände | seit 2020; zweiter Testplatz seit Feb. 2026: über 30 Triebwerkstests pro Monat, Abnahme ganzer Stufen | Isar |
| Andøya, Pad A | Startplatz, exklusiv bis 2041 | einziges Pad; Flug 2 im Sep. 2026 im Orbit; Lizenz 30 Starts pro Jahr für den ganzen Standort | Isar, CAA Norway |
| Nova Scotia | Startplatz, vertraglich | eigener Komplex: Übergabe 1.11.2026, erster Start 2028; 3,75 Mio. USD pro Quartal nach 30 Monaten Befreiung; Isar nennt bis zu 40 Starts pro Jahr ab 2029 | Isar, Maritime Launch |
| Kourou, ELM-Diamant | Startplatz, Option | einer von fünf Preisträgern, kein Baudatum | CNES |

## Was die Standorte tragen müssen

Starts pro Jahr aus den RQ2-Feldern (Isar-Umsatz ÷ 12 Mio. € pro Start) plus 3 Anker-Starts in Nova Scotia ab 2028:

| Standort | 2030 | 2035 | 2040 | Kapazität vorgeschlagen |
| --- | --- | --- | --- | --- |
| Andøya | 7,9 | 8,0 | 14,2 | 18 (Pad A 12 + halbes Pad 2) |
| Nova Scotia (inkl. Anker) | 3,3 | 3,5 | 3,8 | 12 |
| Kourou | 0,1 | 0,1 | 0,2 | 2,4 |
| Werk Parsdorf (alle Raketen) | 11,4 | 11,7 | 18,2 | 40 |

- **Kapazität:** Pads × 12 Starts pro Pad (Annahme `q3_pad_cadence`). Rocket Lab flog 2025 von zwei Pads in Neuseeland 17-mal (GCAT); die Lizenz erlaubt 120.
- **Isars Plan von 12 Starts 2030** geht nur auf, wenn Bereitschaftsverträge in Europa **und** ein Anker in Nova Scotia kommen.

## Zielbild 2030

| Standort | Entscheidung | Rolle | Auslöser | Wer zahlt |
| --- | --- | --- | --- | --- |
| Werk Parsdorf | ausbauen | einziges Serienwerk; Stufen verschiffen, Endmontage am Pad | zweites Werk erst ab ca. 30 Starts pro Jahr unter Vertrag | Isar (gebaut) |
| Esrange | behalten | Abnahmetests | – | Isar, SSC |
| Andøya, Pad A | behalten | Kern polar/SSO | – | Pacht bis 2041 |
| Andøya, Pad 2 | ausbauen | Bereitschaft und Redundanz | Bereitschaftsvertrag oder mehr als 10 Starts pro Jahr | Norwegen (646 Mio. NOK) |
| Nova Scotia | Option nutzen | souverän für Kanada und NATO, 45–98° | mindestens 3 Anker-Starts pro Jahr bis ca. 2030 | Isar (13,4 Mio. € pro Jahr) |
| Kourou | Option | niedrige Bahnen, GTO | EU- oder ESA-Anker und Baudatum | CNES baut |
| Werk in Kanada | nicht jetzt | – | nur bei nicht anders erfüllbarer lokaler Wertschöpfung und über 10 Raketen pro Jahr | – |

## Warum so

1. **Produktion zentral:** Rocket Labs Kosten pro Start sanken von 7,0 auf 4,8 Mio. USD bei 10 → 21 Starts (2023–2025), also auf ca. 70 % pro Verdopplung (Annahme `q3_learning_rate`). Eine kanadische Linie mit 3 von 11 Raketen kostet ca. 2× pro Rakete. MaiaSpace macht es genauso (Werk Vernon, Endmontage Kourou).
2. **Andøya bleibt Kern:** 87 % der passenden Satelliten; Norwegen investiert selbst in das zweite Pad.
3. **Zweites Pad wegen Risiko, nicht Volumen:** Ein Fehlstart sperrt ein Pad über ein Jahr; Bereitschaft braucht freie Slots.
4. **Nova Scotia nur mit Anker:**
   - Gebühr 13,4 Mio. € pro Jahr, Break-even ca. 2,7 Starts, sichtbar 0,3.
   - Kanadas DND least dort selbst ein Pad (200 Mio. CAD über 10 Jahre); Budget 2025 hält 182,6 Mio. CAD für souveränen Start.
   - Das Technologieschutzabkommen mit den USA ist nicht unterschrieben (Okt. 2026), US-gebaute Satelliten dürfen also noch nicht aus Kanada starten.
   - Isars Ziel von bis zu 40 Starts pro Jahr liegt rund zehnmal über dem, was die Zahlen tragen.
5. **Lokale Wertschöpfung ohne Werk:** Kanadische Verteidigungsaufträge über 100 Mio. CAD verlangen 100 % Gegenwert in Kanada (ITB). Endmontage, Startbetrieb und Zulieferer zählen dazu.
6. **Kourou nur als Option:** geteilt mit vier Anbietern, ca. 0,1 Starts pro Jahr.

## Finanzen und Risiko

- **Umsatzpotenzial 2030:** ca. 11,4 Starts × 12 Mio. € ≈ 137 Mio. €, davon 36 Mio. € aus den Anker-Starts in Nova Scotia.
- **Standortkosten:** Nova Scotia 13,4 Mio. € pro Jahr (ab ca. 2030), Kourou ca. 5 Mio. € (Team-Schätzung), Andøya-Pacht nicht öffentlich.
- **Kapital:** Neue Pads bauen Norwegen, Maritime Launch und CNES; Isar bindet kaum eigenes Kapital für Standorte.
- **Risiken:**
  - ein einziges Pad als Klumpenrisiko
  - das ESA-Programm endet 2030
  - der Anker in Kanada ist offen
  - die Andøya-Lizenz wird geteilt
- **KPIs fürs Monitoring:** Starts pro Pad, Erfolgsquote (heute ca. 25 % Versicherungsprämie), Werksauslastung, Anteil der Starts mit Vertrag und Anzahlung, Gebührendeckung in Nova Scotia.

## Fragen ans Management

1. Wer ist der Ankerkunde in Nova Scotia, und wann unterschreibt er?
2. Woher kommen bis zu 40 Starts pro Jahr in Nova Scotia, solange US-Satelliten dort nicht starten dürfen?
3. Wer nutzt das zweite Andøya-Pad, und bekommt Isar reservierte Slots für Bereitschaft?
4. Produktion oder nur Endmontage in Kanada, und was verlangt der Kunde an lokaler Wertschöpfung?
5. Ab welcher gesicherten Kadenz würde Isar ein zweites Werk bauen?

## Storyline für die Abschlusspräsentation

**Kernsatz:** Isar kann Europas souveräner Startanbieter werden, wenn es Verträge vor Raketen setzt und Standorte nach Kunden wählt. SSVE trägt diese Strategie (ASCENT) mit, gekoppelt an drei Meilensteine.

1. **Situation (Q1 · Reach):** Der Standort bestimmt den Markt. Von Andøya aus sind 422 Satelliten erreichbar, gewinnbar sind heute ca. 13 pro Jahr.
2. **Komplikation (Q2 · Growth):** Die sichtbare Nachfrage füllt nur 2,7 von 8 geplanten Starts 2028. Standortverträge binden 15–20 Jahre.
3. **Lösung (Q2, Q3):** ASCENT; ein Werk, Andøya mit zweitem Pad, Nova Scotia mit Anker. Live im Tool: Anker-Starts auf 0, dann kippt Nova Scotia ins Minus.
4. **Entscheidung:** Investieren ja, mit Meilensteinen:
   - Kadenz und Erfolgsquote (mindestens 4 Starts 2027)
   - Ankervertrag Nova Scotia bis 2029
   - erster Bereitschaftsvertrag mit einem europäischen Staat
5. **Rückfragen:** „Spaceports“, „Rockets“ und „Fact base“ als Expertenbasis.
