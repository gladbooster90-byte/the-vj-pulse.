# Working on this repo (Base44 sandbox notes)

## What this app actually is
A **single-process, client-side Vite SPA** (React 19 + Tailwind v4). Everything renders in the
browser: catalog, subscriptions, admin — all state lives in React context, backed by
Firestore when reachable and by `src/data/seedData.ts` + `localStorage` otherwise.

- `express` and `@google/genai` are listed in `package.json` but **no server or Gemini call
  exists in the code**. There is nothing to run besides `vite`. Do not invent a backend.
- No environment variables are read by application code. `.env.example` (`GEMINI_API_KEY`,
  `APP_URL`) is vestigial AI Studio metadata — no secret is required to boot.

## Running it
```bash
docker compose -f docker-compose.base44.yml up -d --build
docker compose -f docker-compose.base44.yml logs -f web
```
Expect: `bun install --frozen-lockfile` (fast, ~1s), then `VITE v8 ready`, then a healthy
container. The user-facing entry point is **port 3000**.

## Non-obvious setup facts
- **Package manager is bun** (`bun.lock`, lockfileVersion 2). Install with
  `bun install --frozen-lockfile`; do not introduce npm/pnpm lockfiles.
- Dependencies live in the named volume `vj_pulse_node_modules` (bind-mounted source would
  otherwise hide them), so they are installed on every container start. That is intentional.
- The runtime image (`oven/bun:1`) ships **no `curl`** — the compose healthcheck probes with
  bun's own `fetch`. Keep that if you edit the healthcheck.
- Preview host allowlist comes for free: Vite ≥ 6.1 reads the platform-provided bare
  `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS` env var (`.e2b.app` in the sandbox). `vite.config.ts`
  needs no change; a request with a foreign `Host` header correctly gets 403.
- `BASE44_PREVIEW_MODE` is passed through bare into the service. Nothing in this repo branches
  on it yet — there was no need to.

## Expected "errors" that are not bugs
Firestore/Auth warnings in the browser console (`Firestore snapshot error for movies`,
`Google Sign-in failed`) are normal when the sandbox cannot reach the committed Firebase
project. The app deliberately falls back to seed data, so the UI stays fully usable.
Google sign-in popups will not work in the sandbox (the preview origin is not an
authorized Firebase auth domain) — that is a limitation of the preview origin, not the code.

## Verifying it works
1. `curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/` → `200`.
2. The served HTML must contain `/@vite/client` and a module script at `/src/main.tsx` —
   proof it is the live dev server, not a prebuilt bundle.
3. In the preview: home page renders the hero "The Last House" with zero console errors.
