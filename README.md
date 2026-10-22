# Isar Aerospace – Expansion Strategy Tool

Interactive decision tool for the SSCO AI Hackathon (Stern Stewart & Co., 21–22 Oct 2026). Case context and conventions: [CLAUDE.md](CLAUDE.md). Knowledge base: [wiki/](wiki/README.md). Progress: [progress/](progress/README.md).

| Folder | Content |
| --- | --- |
| `warehouse/` | Fact warehouse in Supabase: every number with its source, assumptions, GCAT satellites ([README](warehouse/README.md)) |
| `dashboard/` | The tool (Vite, React, TypeScript) and model, reading a snapshot of the warehouse |
| `pipeline/` | GCAT classification used to build the satellite table |
| `wiki/` | Knowledge wiki: case, company, technology, market, analysis per question, sources |
| `progress/` | Progress log per hackathon phase |

## Run

```bash
cd dashboard && npm install && npm run dev
```

- `npm test`: model unit tests (orbit reach, Q1 funnel, parity with the SQL view, warehouse integrity)
- `npm run build`: type-check and build `dist/index.html`, a single self-contained file that runs offline

## Checkpoint

```bash
scripts/checkpoint.sh "what changed"
```

Commits everything, moves to the branch of the current hackathon phase and pushes it together with `main`.
