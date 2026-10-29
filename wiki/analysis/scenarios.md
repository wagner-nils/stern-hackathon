# Szenarien: Umsatz und EBIT 2027–2040 (Bear, ASCENT, Bull)

Stand: 22.10.2026. Erklärseite fürs Team in einfacher Sprache: Notion „Common Docs → Szenarien: Umsatz und Gewinn bis 2040 (einfach erklärt)“. Im Tool: Kapitel „Scenarios“ und Story-Schritt „Numbers“. Zahlen im [Fact-Warehouse](../../warehouse/README.md): Tabelle `scenarios`, View `v_scenarios`, Annahmen `scen_*` (Spiegel in [Annahmen-Register](../reference/assumptions.md)); `dashboard/src/model/scenarios.ts` rechnet die View nach (Test).

## Antwort

**Unsere Strategie ASCENT trägt, aber spät: dauerhaft positives EBIT ab 2038, vorher bis zu 392 Mio. € kumulierter operativer Verlust.** Der Hebel sind Rahmenverträge, nicht Raketen. Deshalb investiert SSVE in Stufen und gibt jede Tranche nur an einem datierten Meilenstein frei.

- **ASCENT (Basis):** Umsatz 152 Mio. € (2030), 171 Mio. € (2035), 241 Mio. € (2040). EBIT −35 / −22 / +24 Mio. €. Dauerhafter Break-even 2038, tiefster kumulierter Verlust −392 Mio. € (2037).
- **Vertragshebel:** Mit ca. 5 statt 2 Rahmenvertrags-Starts pro Jahr (genau 4,9) erreicht ASCENT den Break-even schon 2035.
- **Nova Scotia:** Die Gebühr von 13,4 Mio. € pro Jahr verdient sich erst ab ca. 4,8 Anker-Starts pro Jahr (Kostenniveau ASCENT 2030). RQ3 hatte mit fester Bruttomarge von 41 % ca. 2,7 geschätzt. Drei Anker, wie in ASCENT angenommen, bringen nur ca. 8 Mio. € Deckungsbeitrag. Meilenstein 3 verlangt deshalb ca. 5 Anker-Starts.
- **Bear:** Umsatz 56 Mio. € (2030), 25 Mio. € (2035). Kein Break-even bis 2040; kumulierter Verlust −1,15 Mrd. €. Bei ca. 6 Flügen pro Jahr kostet ein Flug mehr als der Preis eines Starts.
- **Bull:** Umsatz 256 / 345 / 584 Mio. €. EBIT positiv ab 2029 (2035: +91 Mio. €). 2040 bräuchte Bull ca. 32 Flüge, mehr als die vorgeschlagene Kapazität von ca. 30 (Andøya 18 + Nova Scotia 12); Andøya allein liegt schon ab 2036 über 18.

## Rechenweg

Ein Modell für alle drei Szenarien, Jahr für Jahr 2027–2040, in **realen Euro von 2026** (keine Inflation auf Preis oder Kosten).

1. **Umsatz aus Starts** = Umsatz der RQ2-Felder, die das Szenario nutzt (Markt 2025 × (1 + Wachstum)^(Jahr − 2025) × Isar-Anteil, Tabelle `expansion_fields`) + Anker-Starts in Nova Scotia × 12 Mio. € (ab 2028) + Rahmenvertrags-Starts × 12 Mio. € (ab 2029). Rahmenverträge zählen **zusätzlich** zur heute sichtbaren Nachfrage. Endet ein Programm (ESA Launcher Challenge 2030), läuft ein Nachfolger mit dem Anteil `institutional_after_end` des letzten Niveaus weiter.
2. **Bezahlte Bereitschaft** (`sovereign_readiness`, Wachstum je Szenario): 30 % des Umsatzes sind geflogene Starts zu Startkosten, 70 % sind Verfügbarkeitsgebühr mit 70 % Marge. Rakete auf Lager und Bereitschaftsteam kosten 5 Mio. € pro Jahr (ab 2028).
3. **Kosten pro Flug:** Rocket Labs gemessene 4,8 Mio. USD pro Electron-Start (2025, 21 Starts) × Größenfaktor 1,5 ÷ 1,12 USD/€ = **6,43 Mio. €** bei 21 oder mehr Flügen pro Jahr. Darunter steigen die Kosten um den Faktor 1/0,7 je Halbierung der Kadenz (`q3_learning_rate`); darüber bleiben sie flach, weil niemand eine Lernkurve jenseits dieser Menge gemessen hat. Beispiele 2030: Bull (20 Flüge) 6,5 Mio. €, ASCENT (12) 8,5 Mio. €, Bear (6) 12,2 Mio. €.
4. **Fehlstarts:** Geflogene Starts = verkaufte Starts ÷ Erfolgsquote. Ein Fehlstart wird auf Isars Kosten im selben Jahr nachgeflogen. Die Erfolgsquote steigt linear von 2027 bis 2030 und bleibt dann flach.
5. **Bruttogewinn** = Startumsatz (inkl. geflogener Bereitschaft) − geflogene Starts × Kosten pro Flug + Bereitschaftsgebühr × 70 % + Zusatzleistungen × 60 %.
6. **EBIT** = Bruttogewinn − 60 Mio. € Fixkosten − 5 Mio. € Bereitschaft (wenn genutzt, ab 2028) − 13,4 Mio. € Nova-Scotia-Gebühr (wenn genutzt, ab Mai 2029; 2029 anteilig zwei Drittel).

**Kostenbrücke:** Die Kosten pro Flug entsprechen Rocket Labs Herstellungskosten pro Start (inkl. zugeordneter Produktionsgemeinkosten). Die Fixkosten sind Entwicklung und Verwaltung (R&D, SG&A). **Abschreibungen auf Werk und Pads sind nicht gerechnet**; das EBIT ist ein Proxy davor. Keine Bewertung, kein Finanzierungsbedarf.

**Fixkosten 60 Mio. € (Spanne 40–90):**
- über 400 Mitarbeitende (Isar, Sep. 2026) × ca. 85 Tsd. € Personalkosten pro Kopf (OHB 2025, voll belastet) ≈ 35–45 Mio. €
- davon bauen und fliegen ca. 40 % Raketen und stecken damit schon in den Kosten pro Flug
- dazu Testkampagnen, Upgrades und Verwaltung
- Vergleich: Rocket Lab 2020 43 Mio. USD für R&D und SG&A bei 7 Starts, 2021 100 Mio. USD (inkl. Aktienvergütung aus dem SPAC); Firefly 2024 196 Mio. USD (inkl. Mondlander)

## Die drei Szenarien

| Parameter | Bear | ASCENT (Basis) | Bull |
| --- | --- | --- | --- |
| Kurz | ASCENT greift nicht: keine Verträge über die heutige Nachfrage hinaus, Zuverlässigkeit stagniert | unsere Strategie umgesetzt: erst Verträge, Nova Scotia nur mit Anker | Europa kauft Bereitschaft und Starts in großem Stil |
| RQ2-Felder | Kern polar/SSO, ESA Launcher Challenge, Zusatzleistungen | + Wechsel weg von Rideshare (ab 2029), Nova Scotia, bezahlte Bereitschaft | + Hyperschall-Tests (ab 2028) |
| Rahmenvertrags-Starts pro Jahr ab 2029 | 0 | 2 | 6 |
| Anker-Starts Nova Scotia pro Jahr | 0 (Standort nicht genutzt) | 3 | 6 |
| Bezahlte Bereitschaft | keine | +15 % pro Jahr | +25 % pro Jahr |
| ESA-Niveau nach 2030 | 0 % (kein Nachfolger) | 50 % | 100 % |
| Erfolgsquote 2027 → 2030 | 75 % → 75 % | 81 % → 92 % | 85 % → 95 % |
| Begründung | nur heute geflogene Nachfrage (RQ1/RQ2); 75 % preist der Versicherungsmarkt ein | sichtbare Nachfrage + Züge A, S, T aus RQ2; 92 % wie reife Kleinträger (RQ2) | Weltraumsicherheits-Budgets werden Verträge (35 Mrd. € in Deutschland bis 2030) |
| Konfidenz | mittel | niedrig | niedrig |

Gleich in allen Szenarien: Preis 12 Mio. € pro Start, Fixkosten 60 Mio. €, Kostenkurve und Größenfaktor. Kein Szenario enthält eine Mittelklasse-Rakete (Auslöser in [Q2](q2-business-areas.md), Capex außerhalb des Horizonts).

## Ergebnisse

| Szenario | Jahr | Starts verkauft | Flüge (inkl. Wiederholung) | Kosten pro Flug | Umsatz | EBIT | EBIT kumuliert seit 2027 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Bear | 2030 | 4,5 | 6,0 | 12,2 Mio. € | 56 Mio. € | −78 Mio. € | −317 Mio. € |
| Bear | 2035 | 1,9 | 2,5 | 19,1 Mio. € | 25 Mio. € | −84 Mio. € | −737 Mio. € |
| Bear | 2040 | 2,9 | 3,9 | 15,3 Mio. € | 39 Mio. € | −82 Mio. € | −1.154 Mio. € |
| ASCENT | 2030 | 11,3 | 12,3 | 8,5 Mio. € | 152 Mio. € | −35 Mio. € | −201 Mio. € |
| ASCENT | 2035 | 11,5 | 12,5 | 8,4 Mio. € | 171 Mio. € | −22 Mio. € | −369 Mio. € |
| ASCENT | 2040 | 14,7 | 15,9 | 7,4 Mio. € | 241 Mio. € | +24 Mio. € | −353 Mio. € |
| Bull | 2030 | 19,3 | 20,3 | 6,5 Mio. € | 256 Mio. € | +37 Mio. € | −27 Mio. € |
| Bull | 2035 | 22,7 | 23,9 | 6,4 Mio. € | 345 Mio. € | +91 Mio. € | +304 Mio. € |
| Bull | 2040 | 30,6 | 32,2 | 6,4 Mio. € | 584 Mio. € | +233 Mio. € | +1.127 Mio. € |

Was dahinter steckt:

- **Bear bricht 2031 ein:** Die ESA Launcher Challenge (ca. 40 Mio. € pro Jahr für Isar) endet 2030 ohne Nachfolger. Der Umsatz fällt von 56 auf 18 Mio. €, die Flüge von 6 auf ca. 2 pro Jahr, ein Flug kostet dann 22,8 Mio. €. Schon 2030 ist der Bruttogewinn negativ (−18 Mio. €), weil jeder Flug mehr kostet als sein Preis und ein Viertel nachgeflogen wird.
- **ASCENT hat eine Delle 2031:** Das ESA-Niveau halbiert sich, das EBIT fällt von −35 auf −44 Mio. €. Danach trägt vor allem die Bereitschaft: 2040 kommen 87 von 241 Mio. € Umsatz (36 %) daraus.
- **Bull hängt an der Bereitschaft:** 2040 stammen 305 von 584 Mio. € (52 %) aus bezahlter Bereitschaft. Ab ca. 21 Flügen (2032) sind die Kosten pro Flug am Boden von 6,43 Mio. €.

## KPIs

| KPI | Bear | ASCENT | Bull |
| --- | --- | --- | --- |
| Dauerhafter Break-even (EBIT ≥ 0 bis 2040) | nicht bis 2040 | 2038 | 2029 |
| Tiefster kumulierter operativer Verlust | −1.154 Mio. € (2040) | −392 Mio. € (2037) | −97 Mio. € (2028) |
| Flüge 2030 gegen 12 (unsere Lesart des Isar-Plans) | 6,0 | 12,3 | 20,3 |
| Kapazität (ca. 30 Starts: Andøya 18 + Nova Scotia 12) | weit darunter | darunter (2040: 15,9) | 2040 überschritten (32,2); Andøya allein ab 2036 über 18 |

Zwei Stellschrauben für das Gespräch:

- **Rahmenverträge bis zum Break-even 2035 (ASCENT):** 4,9 Starts pro Jahr statt 2, alles andere gleich. Gelöst per Bisektion auf der echten EBIT-Funktion; die Verträge fliegen von Andøya und müssen in dessen Kapazität passen. 3 Verträge → Break-even 2037, 4 → 2036, 5 → 2035, 6 → 2034.
- **Anker-Starts, die Nova Scotia bezahlen:** 13,4 Mio. € ÷ (12 Mio. € − 8,47 Mio. € ÷ 92 %) = 13,4 ÷ 2,79 ≈ **4,8 Starts pro Jahr** (ASCENT 2030; 2035: 4,6). Jeder Anker-Start trägt nur ca. 2,8 Mio. € bei, weil er die Kosten pro Flug und die Nachflüge mitbezahlen muss.

## Was wir nicht wissen (Sensitivität ASCENT)

| Annahme | Basis | Spanne | Dauerhafter Break-even ASCENT | EBIT 2035 |
| --- | --- | --- | --- | --- |
| Fixkosten pro Jahr | 60 Mio. € | 40–90 Mio. € | 2036 bis nicht bis 2040 | −2 bis −52 Mio. € |
| Größenfaktor Spectrum zu Electron | 1,5 | 1,2–2,0 | 2036 bis nicht bis 2040 | −1 bis −58 Mio. € |
| Geflogener Anteil der Bereitschaft | 30 % | 20–50 % | 2038 (unverändert) | −22 bis −23 Mio. € |
| Marge auf die Bereitschaftsgebühr | 70 % | 50–80 % | 2039 bis 2038 | −29 bis −19 Mio. € |
| Wachstum der Bereitschaft | 15 % | 10–25 % | nicht bis 2040 bis 2035 | Szenario-Parameter |

- **Fixkosten und Größenfaktor** sind die unsichersten Zahlen und verschieben den Break-even um Jahre. Beide sind im Tool Regler.
- **Bull** bleibt in allen Spannen bei Break-even 2028–2031, **Bear** erreicht ihn in keiner.

## Meilensteine für SSVE

Investieren in Stufen: ASCENT mittragen, jede Tranche nur an einem datierten Meilenstein freigeben.

| # | Meilenstein | Messgröße und Termin | Wenn verfehlt |
| --- | --- | --- | --- |
| 1 | Zuverlässigkeit | mindestens 3 von 4 Flügen 2027 erreichen den Orbit | nächste Tranche zurückhalten |
| 2 | Verträge | bis 2029 Rahmenverträge für ≥ 2 Starts pro Jahr über die heutige Nachfrage hinaus, dazu ein bezahlter Bereitschaftsvertrag mit einem europäischen Staat | wir sind im Bear: kein Nova Scotia, Kostenbasis senken |
| 3 | Nova Scotia | unterschriebener Anker, der die Gebühr deckt (ca. 5 Starts pro Jahr bei ASCENT-Kosten), bevor die Gebühr 2030 voll läuft | Standort nicht eröffnen |

## Grenzen des Modells

- **Reale Euro von 2026,** keine Inflation. Kein Capex: Integrationshalle und Raketenlager für die Bereitschaft (ca. 20 Mio. €) und die suborbitale Spectrum-Variante für Bull (ca. 10 Mio. €) sind nicht gerechnet.
- **Nachflüge im selben Jahr,** ohne Versicherungsleistung, ohne Pad-Sperre nach einem Fehlstart und ohne verlorene Kunden.
- **Nova-Scotia-Gebühr ab Mai 2029** (30 Monate nach Übergabe), 2029 anteilig, ab 2030 voll (nach Codex-Runde 3).
- **Bear** nimmt an, dass Isar den Komplex in Nova Scotia nicht übernimmt. Ist die Gebühr bindend, verliert Bear zusätzlich 13,4 Mio. € pro Jahr.
- **Rahmenverträge und Anker** sind Annahmen über künftige Verträge, kein Auftragsbestand.
- **Tiefster kumulierter Verlust** ist kein Finanzierungsbedarf: Capex, Working Capital, Anzahlungen und die vorhandene Kasse fehlen.

## Wie das Modell entstanden ist

- Claude hat das Modell geschrieben, Codex hat es in drei Runden geprüft.
- **Übernommen** u. a.:
  - Gebührenbeginn Nova Scotia 2030 (statt ab erstem Start)
  - Kostenboden ab 21 Flügen: keine Lernkurve über Rocket Labs gemessene Menge hinaus
  - Bear ohne Bereitschaftsvertrag und ohne Wechsel weg von Rideshare
  - Break-even auf der echten EBIT-Funktion statt einer geschlossenen Formel; KPI „dauerhafter Break-even“
  - Bereitschaft und Zusatzleistungen mit eigener Marge statt 100 %
  - Kostenbrücke offengelegt, Label „vor Abschreibungen auf Werk und Pads“
  - „tiefster kumulierter Verlust“ statt „Finanzierungsbedarf“
  - Erfolgsquote ASCENT 2027 auf 81 %, damit 2028 wie in Q2 bei ca. 85 % liegt
- **Abgelehnt:** Kosten pro Flug nach verkauften statt geflogenen Starts. Auch fehlgeschlagene Raketen werden gebaut und bringen die Linie voran; das Produktionsvolumen ist der richtige Treiber.

## Quellen

- Rocket Lab, Geschäftsbericht 2025 (Kosten pro Electron-Start 2023–2025, Startmarge): https://www.sec.gov/Archives/edgar/data/1819994/000181999426000013/rklb-20251231.htm
- Rocket Lab, Geschäftsbericht 2021 (R&D und SG&A 2020/2021): https://www.sec.gov/Archives/edgar/data/1819994/000095017022004458/rklb-20211231.htm
- Firefly Aerospace, S-1 (Kosten 2024): https://www.sec.gov/Archives/edgar/data/1860160/000119312525158225/d849748ds1.htm
- OHB, Geschäftsbericht 2025 (Personalkosten pro Kopf): https://www.ohb.de/wp-content/uploads/2026/06/OHB_GB2025_E_safe.pdf
- Isar, Flug 2 im Orbit (über 400 Mitarbeitende): https://isaraerospace.com/press/history-for-european-spaceflight-isar-aerospace-reaches-orbit-and-deploys-payloads-on-second-flight
- Isar, Nova Scotia (Gebühr, Befreiung): https://isaraerospace.com/press/sovereign-space-access-for-germany-and-canada-isar-aerospace-and-maritime-launch-services-sign-contract-to-advance-orbital-launch-capability-from-spaceport-nova-scotia
- Isar, ESA European Launcher Challenge: https://isaraerospace.com/press/isar-aerospace-signs-contract-with-esa-under-the-european-launcher-challenge
- Weltraumsicherheit Deutschland (ESUT, 25.9.2025): https://esut.de/en/2025/09/meldungen/63743/space-security-pistorius-weltraum/
- McDowell, Space Activities in 2025 (Rocket Labs 21 Starts): https://planet4589.org/space/papers/space25.pdf
- Expertengespräch: [Robbie Schingler](../expert/robbie-schingler.md)
- Herleitung der Felder: [Q2](q2-business-areas.md), Standortlast: [Q3](q3-site-portfolio.md)

## Nachtrag Codex-Prüfung (13:50)

- Runde 3: Gebühr ab Mai 2029 anteilig; Hinweis im Tool, dass Bull ab 2036 mehr Pads in Andøya braucht (Kosten nicht im P&L); Nova-Scotia-Lücke im Basisfall als Zahl (bei 3 Ankern kostet der Standort ca. 6 Mio. € pro Jahr).
- Offen für das Team: ASCENT rechnet wie RQ3 mit 3 Anker-Starts, Meilenstein 3 verlangt bei vollen Kosten ca. 5. Entweder RQ3-Auslöser auf 5 anheben oder den Standort bewusst als souveräne Option mit Zuschuss führen.
