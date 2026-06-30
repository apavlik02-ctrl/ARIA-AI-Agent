---
name: run-aria-ai-agent
description: Run, start, build, screenshot, or verify the ARIA AI Agent Next.js app. Use when asked to launch the app, take a screenshot, confirm a UI change works, or test a page.
---

# Run ARIA AI Agent

Next.js 14 web app (insurance exam prep). Driven headless with the pre-installed Chromium at `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`. No extra installs needed.

## Prerequisites

Already available in this container — nothing to install.

```bash
CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
```

## Build

```bash
cd /home/user/ARIA-AI-Agent
npm install
npm run build
```

Build takes ~30s. Expect TypeScript output listing all routes (`/login`, `/dashboard`, `/quiz`, etc.).

## Run (agent path)

### 1. Start dev server in background

```bash
cd /home/user/ARIA-AI-Agent
npm run dev -- --port 3456 > /tmp/aria-dev.log 2>&1 &
sleep 8
curl -s -o /dev/null -w "%{http_code}" http://localhost:3456/login
# Should print 200
```

### 2. Screenshot any page

```bash
CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
OUTDIR=/tmp/aria-screenshots
mkdir -p "$OUTDIR"

$CHROME --headless=new --no-sandbox --disable-gpu \
  --screenshot="$OUTDIR/login.png" \
  --window-size=1280,800 \
  "http://localhost:3456/login" 2>&1 | grep "bytes written"
```

Screenshot lands at `$OUTDIR/login.png`. Read it with the Read tool to visually inspect.

Pages available (no auth required to render):
- `/login` — login form
- `/signup` — registration
- `/quiz` — quiz page (redirects to login when unauthenticated, still renders)
- `/dashboard` — dashboard (redirects to login; screenshot shows loading state)

### 3. Stop dev server

```bash
pkill -f "next dev" 2>/dev/null; true
```

## Run (human path)

```bash
npm run dev
# Opens on http://localhost:3000 — Ctrl-C to stop
```

## Gotchas

- **IPv6 socket errors** — Chromium logs `CreatePlatformSocket() failed: Address family not supported`. These are harmless; screenshots still succeed (look for `bytes written` in output).
- **Port 3000 in use** — use `--port 3456` (or any free port) to avoid conflicts with other sessions.
- **Dashboard/quiz redirect unauthenticated** — these pages redirect to `/login` client-side. The screenshot captures the loading spinner, not the full UI. To see the dashboard UI, you need a real Supabase user session — not testable headlessly without credentials.
- **`next build` vs `next dev`** — always use `next dev` for driver sessions; `next start` requires a prior build and won't pick up code changes.
- **`vercel.json` ignore rule** — when `ignoreCommand` is present, Vercel skips builds pushed by `apavlik02-blip`. Remove it temporarily to force a production deploy.
