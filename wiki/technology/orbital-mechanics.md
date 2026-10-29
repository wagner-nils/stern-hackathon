# Orbitphysik

## Kernaussagen

- Die Breite des Startplatzes legt die niedrigste direkt erreichbare Inklination fest. Die erlaubten Flugrichtungen legen fest, welche Orbits überhaupt gehen.
- Von Andøya (69,1° N, Flugrichtungen 280–360°) sind nur polare und sonnensynchrone Orbits (90–110,6°) erreichbar.
- Für SSO kostet die hohe Breite keine Nutzlast. Andøyas Schwäche ist die Auswahl an Orbits, nicht die Nutzlast.
- Bahnänderungen nach dem Start sind teuer (ca. 130 m/s pro Grad) und für einen Kleinträger keine Lösung.

## Erreichbare Inklination

Bei einem direkten Aufstieg gilt:

```
cos(i) = sin(Azimut) · cos(Breite)
```

- `i` = Inklination der Bahn, `Azimut` = Flugrichtung im Uhrzeigersinn ab Norden, `Breite` = geografische Breite des Startplatzes.
- Ein Start genau nach Osten (Azimut 90°) erreicht eine Inklination gleich der Breite. Das ist das Minimum.
- Ein Start genau nach Norden erreicht 90° (polar). Westliche Richtungen ergeben retrograde Bahnen über 90°.
- Die Formel ist idealisiert. Reale Korridore hängen zusätzlich an Überflug- und Abwurfzonen der Stufen.

**Andøya:** Breite 69,1° N, lizenziert für Azimut 280–360°.

- Azimut 360° ergibt i = 90°.
- Azimut 280° ergibt cos(i) = sin(280°) · cos(69,1°) = −0,351, also i = 110,6°.
- Damit sind 90–110,6° erreichbar. Das Dashboard rechnet genau so (`dashboard/src/model/orbits.ts`).

## Erdrotation

- Am Äquator bewegt sich die Oberfläche mit ca. 465 m/s nach Osten (ESA für Kourou: 460 m/s). Starts nach Osten bekommen diesen Bonus, Starts nach Westen zahlen ihn.
- Der Effekt entlang der Bahn ist ca. 465 m/s · cos(i) und hängt am Zielorbit, nicht am Standort.
- SSO (ca. 97,5°) ist leicht retrograd und kostet an jedem Standort etwa 61 m/s. Deshalb verliert Andøya bei SSO keine Nutzlast gegenüber Kourou.
- Niedrige Inklinationen und GTO profitieren stark von äquatornahen Standorten wie Kourou.

## Bahnebenenwechsel

```
Δv = 2 · v · sin(Δi / 2)
```

- Im LEO (500 km) kostet 1° Inklinationsänderung ca. 133 m/s (NASA).
- Beispiel: Andøya → 80° wären über 1,3 km/s, für einen Kleinträger nicht bezahlbar.
- Electron erreicht 37° aus Mahia (39° S) nur mit Kick-Stage-Manövern (Doglegs). Für Spectrum ist keine Nutzlastkurve für Doglegs veröffentlicht.

## Welche Orbits Kunden brauchen

| Orbit | Inklination | Typische Nutzer | Von Andøya? |
| --- | --- | --- | --- |
| SSO (sonnensynchron) | 97–99° | Erdbeobachtung, Transporter-Rideshares | ja |
| Polar | ca. 90° | Wetter, Kommunikation in hohen Breiten | ja |
| ISS-Orbit | 51,6° | Raumstation, Versorgung | nein |
| Konstellations-Shells | ca. 43–53° | Starlink, Kuiper | nein |
| SAR-Orbits | 37–45° | Radar-Satelliten (iQPS, Synspective) | nein |
| GTO / GEO | 0–28° | Kommunikation, große Satelliten | nein |

- Dedizierte Electron-Starts 2024–2026: etwa zur Hälfte SSO/polar, zur Hälfte 37–59°. Der SSO-Anteil fiel von 11 von 13 Starts (2024) auf 4 von 12 (2026).
- Nicht jede Erdbeobachtung fliegt SSO. BryceTechs 47 % „Remote Sensing“ sind eine Anwendung, kein SSO-Anteil.

## Quellen

- [ESA: Startplatz Kourou](https://www.esa.int/Enabling_Support/Space_Transportation/Europe_s_Spaceport/Europe_s_Spaceport2)
- [NASA: Orbit Primer](https://science.nasa.gov/wp-content/uploads/2023/05/GDC_OrbitPrimer.pdf)
- [Wikipedia: Inklinationswechsel](https://en.wikipedia.org/wiki/Orbital_inclination_change)
- [Wikipedia: Sonnensynchrone Umlaufbahn](https://en.wikipedia.org/wiki/Sun-synchronous_orbit)
- [Andøya Space: erreichbare Inklinationen](https://andoyaspace.no/spaceport/efficient-way-to-space/)
