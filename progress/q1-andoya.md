# Q1 – Welcher Anteil der globalen Launch-Nachfrage ist von Andøya aus bedienbar?

Zeitfenster: 21.10. 13:45–15:45 · Branch `phase/q1-andoya`

## Antwortlogik (Funnel)

1. Globale Nachfrage (Satelliten/Jahr und Masse/Jahr)
2. Orbit von Andøya erreichbar (Inklination aus Breite und erlaubten Azimuten)
3. Passt in Spectrum (Nutzlast je Orbitklasse)
4. Offen für einen europäischen Launcher (ohne captive: Starlink, China, Russland; US-Regierung als Regler)
5. Will einen dedizierten Kleinträger statt Rideshare
6. Von Isar tatsächlich fliegbar (Starts/Jahr × Nutzlast × Auslastung)

Ergebnis: Anteil nach Anzahl und nach Masse, plus welche Stufe der Engpass ist (Nachfrage oder Kapazität).

## Inputs je Rolle

| Input | Owner | Status |
| --- | --- | --- |
| Erreichbare Inklinationen Andøya, Spectrum-Nutzlast je Orbit | Nils | Recherche läuft |
| Startkadenz Andøya, Auslastung, Preis pro Start | Luca | offen |
| Nachfrage nach Orbit, Masse, Kundentyp; Anteil dedicated vs. Rideshare | Benedikt | offen |

## Entscheidungen

- Tool auf Englisch, Notion intern auf Deutsch.
- Q1 wird als generische Engine gebaut (Standorte als Daten), damit Q2 nur „Standort hinzufügen“ ist.

## Offene Fragen

- Welche Nachfragebasis: historisch (2024/2025) oder Prognose 2030?
- Zählen wir Satelliten, Masse oder Umsatz als Hauptmetrik?
