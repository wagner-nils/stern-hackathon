# Wissens-Wiki: Case Isar Aerospace

Das Wiki bündelt alles, was das Team zum Case weiß: Notion-Recherche (Insider, Investor, Techie), Marktrecherche, die GCAT-Auswertung und die bisherigen Antworten. Stand: 21.10.2026, 17:00.

## Aufbau

| Bereich | Seite | Inhalt |
| --- | --- | --- |
| Case | [Überblick](case/overview.md) | Auftrag, Stakeholder, Regeln, Bewertung, Agenda, Team |
| | [Fragen](case/questions.md) | RQ1–RQ4 mit Status und Links zu den Antworten |
| Unternehmen | [Isar Aerospace](company/isar-aerospace.md) | Geschäftsmodell, Finanzierung, Kunden, Auftragsbuch, Standorte |
| | [Spectrum](company/spectrum.md) | Rakete, Nutzlast, Flüge, Preis, Fertigung |
| Technik | [Orbitphysik](technology/orbital-mechanics.md) | Warum der Standort die erreichbaren Orbits bestimmt |
| | [Startplätze](technology/launch-sites.md) | Anforderungen, Andøya im Detail, Standort-Shortlist |
| | [Kadenz](technology/cadence.md) | Starts pro Jahr, Turnaround, Vorlaufzeiten |
| Markt | [Nachfrage](market/demand.md) | Geflogene Satelliten 2024/2025 (GCAT), Andøya-Band |
| | [Marktgröße und Preise](market/size-and-pricing.md) | Umsatz, Upmass, Prognosen, Preise je Anbieter |
| | [Wettbewerb](market/competition.md) | Rocket Lab, Firefly, SpaceX-Rideshare, Europas Neulinge |
| | [Nachfragetreiber](market/demand-drivers.md) | Verteidigung, ESA, EU, US-Politik, Rideshare-Stopp |
| Analyse | [Q1: Reichweite Andøya](analysis/q1-andoya-reach.md) | TAM/SAM/SOM, Annahmen, Challenge-Punkte |
| | [Q2: Geschäftsfelder](analysis/q2-business-areas.md) | Long List, Bewertungsrahmen, offene Recherche |
| | [Szenarien: Umsatz und EBIT](analysis/scenarios.md) | Bear, ASCENT, Bull 2027–2040; Break-even, Meilensteine; Präsentationsmodus |
| Experte | [Robbie Schingler (Planet)](expert/robbie-schingler.md) | Fragen und Notizen zur Expert Q&A |
| Referenz | [Annahmen-Register](reference/assumptions.md) | Alle Modellannahmen mit Spanne und Quelle |
| | [Quellen](reference/sources.md) | Alle Quellen nach Thema |
| | [Glossar](reference/glossary.md) | Begriffe von Azimut bis TSA |
| Protokoll | [Hackathon-Transkript](transcript/README.md) | Granola-Mitschnitt 21.–22.10. in vier Teilen: Betreuer-Hinweise, Teamentscheidungen, Prompts, offene Punkte |

## Das Wichtigste in Kürze

- **Q1:** Von Andøya aus kann Isar 9,3 % der weltweit gestarteten Satelliten bedienen, aber nur 0,7 % der Masse (Basis 2025, hochgerechnet auf 2027). Bis über 2030 hinaus begrenzt Isars Kapazität: erfolgreiche Starts bei 80–92 % Erfolgsquote. Erst danach wird Andøyas Orbit-Band zum Engpass. Details: [Q1](analysis/q1-andoya-reach.md).
- **Q2:** Erste Hypothese: Verteidigung und schnell abrufbare Starts sowie Missionsservices verfolgen; eigene Konstellation, eigene Startplätze und Satellitenbau bewusst nicht. Details: [Q2](analysis/q2-business-areas.md).
- **Expertengespräch (Planet):**
  - Kunden wählen nach Orbit, Vorlaufzeit, Preis und Zuverlässigkeit.
  - Neue Raketen bekommen erst Demo-Nutzlasten. Die Versicherung für Isars nächsten Flug kostet ca. 25 %.
  - Planet und Isar bieten der Bundesregierung gemeinsam schnelle Wiederherstellung an.
  - Details: [Robbie Schingler](expert/robbie-schingler.md).
- **Größte Unsicherheiten:** Spectrum-Preis (nicht veröffentlicht), Anteil der Kunden, die für einen dedizierten Start zahlen, unabhängige Bestätigung von Flug 2.

## Vertrauliche Seiten

Die Seiten unter `case/`, `expert/` und `transcript/` (Case-Unterlagen nur für Teilnehmende, Notizen aus der geschlossenen Expertenrunde, Gesprächsmitschnitt) liegen nur lokal und stehen in `.gitignore`. Links dorthin funktionieren in der öffentlichen Fassung nicht.

## Konventionen

- **Sprache:** Wiki auf Deutsch, Fachbegriffe auf Englisch. Das Tool selbst ist auf Englisch.
- **Belege:** Jede Zahl hat eine Quelle (Link auf der Seite oder in [Quellen](reference/sources.md)). Eigene Rechnungen sind als solche markiert.
- **Konfidenz:** hoch / mittel / niedrig, wie im Dashboard.
- **Single Source of Truth für alle Zahlen** ist das [Fact-Warehouse](../warehouse/README.md) in Supabase (Fakten mit Quelle, Annahmen mit Begründung). Das Wiki erklärt und belegt die Werte. Wer eine Annahme ändert, ändert sie dort und im [Annahmen-Register](reference/assumptions.md).
- **Neue Erkenntnisse** kommen auf die passende Themenseite, nicht in ein neues Sammeldokument. Jede Seite beginnt mit ihren Kernaussagen.
- **Fortschritt** steht nicht hier, sondern in [progress/](../progress/README.md).
