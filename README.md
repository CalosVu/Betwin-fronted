# Betwin-fronted

Frontend di **betwin** (SPA statica sopra la REST API del backend): Vite + React 19
(TypeScript) + Tailwind 4 + shadcn/ui, dati via TanStack Query su **tipi generati dal
contratto OpenAPI** del backend.

Il backend, la wiki di progetto (`BetwinWiki/`) e il piano vivono nel repo
[`CalosVu/betwin`](https://github.com/CalosVu/betwin): questo repo contiene solo il FE.

## Setup

```bash
npm install
npm run dev          # dev server su :5173 con proxy /api → localhost:8080 (backend acceso)
```

## Comandi

| Comando | Cosa fa |
|---|---|
| `npm run dev` | Dev server con proxy verso il backend |
| `npm test` | Unit/component test (Vitest + React Testing Library) |
| `npm run build` | Build statica di produzione in `dist/` |
| `npm run genera-tipi` | Rigenera `src/api/schema.d.ts` dal contratto OpenAPI (backend acceso su :8080) |
| `npx playwright install` | Una tantum: scarica i browser per l'e2e |
| `npx playwright test` | E2E (avvia da solo il dev server) |

## Struttura

- `src/pagine/` — le cinque viste: Partite, Dettaglio (due analisti affiancati con
  disaccordi evidenziati), Proposte + carrello schedina, Schedine, Pannello.
- `src/lib/` — logica pura testata (carrello, disaccordi modello↔AI).
- `src/api/` — client tipato (`openapi-fetch`) e tipi generati.
- `e2e/` — test Playwright.

La documentazione funzionale completa è nella wiki del repo backend
(`BetwinWiki/Sezioni/Frontend.md`).
