# Isar Aerospace – Expansion Strategy Tool

Interactive decision tool for the SSCO AI Hackathon (Stern Stewart & Co., 21–22 Oct 2026). Case context and conventions: [CLAUDE.md](CLAUDE.md). Progress: [progress/](progress/README.md).

## Run

```bash
cd dashboard && npm install && npm run dev
```

- `npm test`: model unit tests (orbit reach, funnel)
- `npm run build`: type-check and build `dist/index.html`, a single self-contained file that runs offline

## Checkpoint

```bash
scripts/checkpoint.sh "what changed"
```

Commits everything, moves to the branch of the current hackathon phase and pushes it together with `main`.
