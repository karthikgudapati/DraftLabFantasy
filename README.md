# Draft Lab

Factor-based fantasy football draft & season tool. React + Vite; live data from ESPN / Sleeper / FantasyPros + baked fftoolbox schedule strength.

- **Use it:** double-click `start-draft-lab.cmd` → http://localhost:8843/ (serves the built app in `dist/`)
- **Develop:** `npm run dev` (hot reload on the same port — stop the static server first), edit `src/app.jsx`
- **Ship:** `npm run build` (refreshes `dist/`)

State (league settings, marks, draft tracker, my team) persists in browser localStorage.

## What it does

- **Value-anchored grades** — projected points above replacement blended with FantasyPros expert
  consensus, shown as MLB-The-Show-style arc gauges. Methodology is documented in-app (HOW IT WORKS).
- **Player outlooks** — headshots, team colors, five factor gauges, real 2024 usage (target share /
  touches), and a per-player **game log** (weekly chart + full stat table, season dropdown).
- **Draft tools** — tier board, mock draft, a live draft tracker with pick recommendations and
  paste-import, post-draft grades, and a printable cheat sheet.
- **Compare** up to three players side by side; **My Team** for weekly matchup-aware start/sit and waivers.
- Live data: ESPN (ADP · projections · injuries · game logs), Sleeper (rosters · depth charts ·
  bios), FantasyPros (expert ranks · tiers), plus baked fftoolbox strength-of-schedule.

## Deploy it

Static build; three of four data sources are CORS-open, FantasyPros is proxied by a small serverless
function. One-click on Cloudflare Pages or Netlify — see [`DEPLOY.md`](DEPLOY.md).

## Develop

`npm install` · `npm run dev` (hot reload) · `npm test` (Vitest — 36 tests over the grading, draft,
lineup and game-log logic) · `npm run build`.
