# Screenshot-Journey für Stern Stewart

Stern Stewart bat nach dem Hackathon jede Gruppe um eine „Screenshot-Journey“: eine geführte Bildstrecke durch das Ergebnis. Dieser Ordner enthält die Abgabe (PDF) und die Pipeline, die sie aus dem Tool erzeugt. Konzept, Bauplan, Review-Log und Mail-Entwürfe liegen nur lokal (`.gitignore`).

| Datei | Inhalt |
| --- | --- |
| [out/SSCO-AI-Hackathon_Isar-Aerospace_Screenshot-Journey_Team-Benedikt-Luca-Nils.pdf](out/SSCO-AI-Hackathon_Isar-Aerospace_Screenshot-Journey_Team-Benedikt-Luca-Nils.pdf) | **Die Abgabe:** 29 Seiten, 16:9: Teil 1 nach einer Trennseite das Tool in 22 Screenshots (klickbar wie das Tool), Teil 2 nach einer Trennseite die Argumentation auf drei Beraterseiten (Executive Summary mit den Gates, Wirtschaftlichkeit, Arbeitsweise mit Logos aus `build/logos`), am Ende Team und GitHub-Link |
| `out/pages/page-NN.png` | Jede Seite als Bild (1920 × 1080), aus dem PDF gerastert; wird beim Build erzeugt, nicht in git |
| `screens/*.png` | Die 22 Original-Screenshots des Tools (1440 × 783 px, doppelte Auflösung), `screens/shots.json` mit Herkunft (Commit, SHA-256), klickbaren Flächen und sichtbarem Text |
| `content/pages.mjs` | **Alle Texte der Journey** (Titel, Bildunterschriften, Notizen); hier ändert man Inhalte |
| `capture/` | Skripte, die das Tool im Headless-Chrome öffnen und die Screenshots aufnehmen |
| `build/` | Renderer, Layout, Schriften und die Prüfungen (Layout, Zahlen-Audit mit eigenen Tests in `audit.test.mjs`, PDF) |
| `out/overview.png` | Alle 29 Seiten auf einen Blick |

## Neu bauen

Voraussetzungen: Google Chrome, Node, `pdfinfo`/`pdftoppm` (Poppler), `uv` (lädt `pypdf` für die Link-Prüfung), `dashboard/node_modules`.

```bash
cd dashboard && npx vite build --outDir /tmp/journey-final
```

```bash
node journey/capture/capture.mjs --final /tmp/journey-final/index.html --final-commit b1fc283 --v1404 <build-1404>/index.html --v1404-commit a8e11d2
```

```bash
node journey/build/build.mjs
```

Die Aufnahme prüft zuerst, ob jede übergebene HTML-Datei wirklich der Build ihres Commits ist (sie baut den Commit neu und vergleicht SHA-256; `--no-verify` überspringt das). Geprüft am 28.10.: Beide Tool-Fassungen bauen aus git byte-gleich (SHA-256 wie in `screens/shots.json`), und ein kompletter Neuaufbau ergibt pixelgleiche Seiten (höchstens zwei Pixel weichen durch Kantenglättung ab).

Die Q4-Ansicht stammt aus der Tool-Fassung von 14:04 (`a8e11d2`); bauen mit `git archive a8e11d2 dashboard | tar -x -C <ordner>`, `node_modules` verlinken, `npx vite build`. Wer nur Texte ändert, braucht keine neue Aufnahme: `content/pages.mjs` bearbeiten und `node journey/build/build.mjs` laufen lassen.

Auf den Screens führen blaue „Explained · p. …“-Marken zu der Seite in Teil 2, die das Element erklärt; die Aufnahme bricht ab, wenn eine Marke Text verdecken würde. Unscharfe Schatten und Filter sind verboten, weil Vorschau sie als graue Kästen zeichnet.

Der Build bricht ab (Exit 1, PDF heißt dann `*.FAILED.pdf`), wenn eine Aufnahme fehlt oder veraltet ist, das Modell im Arbeitsstand nicht dem der Aufnahmen entspricht, ein Test fehlschlägt, eine Seite überläuft, eine Zahl in einer Bildunterschrift weder im Tool noch in den Repo-Zahlen noch in der Modell-Nachrechnung (`build/rerun.ts`) steht, das PDF über 10 MB liegt oder Seitenzahl, Format oder Schriften nicht stimmen. Warnungen (Zahl nicht auf dem Screenshot der Seite sichtbar, Screenshot unter 45 % Größe) stehen in `out/build-report.json`.

## Mit Claude Cowork weiterarbeiten

- Cowork kann das PDF, die Seiten-PNGs und die Original-Screenshots direkt verwenden, etwa für eine PowerPoint-Fassung. Abgegeben wurde das PDF.
- Für Textänderungen ist `content/pages.mjs` die eine Quelle. Neu bauen kann nur eine Umgebung mit Chrome und Node (Claude Code auf diesem Mac).
- Vertraulich bleiben die Case-Unterlagen (`wiki/case`), die Expertennotizen (`wiki/expert`), das Transkript (`wiki/transcript`) und `.env`; alle stehen in `.gitignore`.

## Schriften

Manrope, Inter und DM Mono (SIL Open Font License), aus `dashboard/node_modules/@fontsource` kopiert, wie im Tool selbst.
