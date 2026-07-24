# Deploying Draft Lab to the web

The app is a static Vite build (`npm run build` → `dist/`). Three of its four live-data
sources (ESPN projections, ESPN game logs, Sleeper) allow cross-origin browser requests and
work on any domain. **FantasyPros** only allows `localhost`, so on a hosted domain it's
proxied through a tiny serverless function (`/api/fp`). Both hosts below run that function
alongside the static site. Pick one.

First, get the repo on GitHub (both hosts deploy from git):

```sh
# create an empty repo at github.com/<you>/draft-lab (no README), then:
git remote add origin https://github.com/<you>/draft-lab.git
git push -u origin main
```

## Option 1 — Cloudflare Pages (recommended)

1. Dashboard → **Workers & Pages → Create → Pages → Connect to Git** → pick `draft-lab`.
2. Build settings:
   - **Framework preset:** None
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
3. **Save and Deploy.** Cloudflare auto-detects the `functions/` folder, so `/api/fp` just works.
   Your site is live at `https://draft-lab.pages.dev` (custom domain optional).

> **Node version:** the repo pins Node 22 via `.node-version` / `.nvmrc` (Vite 8 needs Node ≥ 20).
> If a build ever fails with a Node/engine error, set an env var **`NODE_VERSION=22`** in the Pages
> project (Settings → Environment variables) and redeploy.

## Option 2 — Netlify

1. Dashboard → **Add new site → Import an existing project** → pick `draft-lab`.
2. It reads `netlify.toml` (build `npm run build`, publish `dist`, functions in
   `netlify/functions`, and the `/api/fp` redirect). Just confirm and deploy.
3. Live at `https://<name>.netlify.app`.

### No-GitHub alternative (Netlify CLI)

```sh
npm i -g netlify-cli
netlify login
netlify deploy --build --prod   # bundles the function + static site, no GitHub needed
```

## After deploying

Open the site and check the status pill (top-left). It should read **● LIVE**. If FantasyPros
is the only thing failing, confirm the function deployed — visit `https://<your-site>/api/fp?scoring=PPR`
directly; it should return JSON. Everything else (ESPN, Sleeper, game logs) needs no proxy.

Note: player data, projections and ADP are **preseason** and served from public endpoints that
can change; the in-app data panel shows per-source freshness and falls back to the last good data.
