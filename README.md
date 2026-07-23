# Draft Lab

Factor-based fantasy football draft & season tool. React + Vite; live data from ESPN / Sleeper / FantasyPros + baked fftoolbox schedule strength.

- **Use it:** double-click `start-draft-lab.cmd` → http://localhost:8843/ (serves the built app in `dist/`)
- **Develop:** `npm run dev` (hot reload on the same port — stop the static server first), edit `src/app.jsx`
- **Ship:** `npm run build` (refreshes `dist/`)

State (league settings, marks, draft tracker, my team) persists in browser localStorage.
