# Purchase Coach

Frontend for the **meridian** "Purchase Coach" experience — check a purchase before you swipe,
see the best card to use, and how it lands against your goals.

Ported from the Claude Design prototype (`Purchase Coach.dc.html`). All numbers are mocked demo
data living in `src/lib/coach.ts`; there is no backend yet.

## Stack

- [Vite](https://vite.dev) + React 19 + TypeScript
- Plain CSS (`src/styles.css`) with design tokens as custom properties
- Deployed as **static assets on Cloudflare Workers** (`wrangler.jsonc`, SPA fallback) — no
  worker script required until a backend is added.

## Develop

```sh
npm install
npm run dev          # Vite dev server with HMR
npm run cf:dev       # build, then serve dist/ through the Workers runtime (wrangler dev)
```

## Deploy

```sh
npm run deploy       # tsc + vite build, then wrangler deploy
```

Requires `wrangler login` once. When a backend is needed, add `"main": "src/worker.ts"` to
`wrangler.jsonc` and the assets binding keeps serving the SPA alongside it.

## Layout

```
src/
  App.tsx                 state machine: home / answer / goals, toasts, timers
  lib/coach.ts            parsing, card ranking, verdicts, mocked data
  components/
    Nav.tsx               top bar
    CoachInput.tsx        "About to buy something?" card + chips
    HomeView.tsx          net worth + spending cards (S0)
    AnswerView.tsx        S1 quick check · S2 considered · S3 plan
    CardRow.tsx           credit-card row with generated card art
    GoalsView.tsx         S4 goals (tracked / empty / add form)
    Money.tsx, Toast.tsx
  styles.css              tokens + component classes
```

`App` accepts the same demo props as the prototype: `shimmerMs`, `demoControls`, `startWithGoal`.
