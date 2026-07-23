// Shared factories for the Vitest suite — minimal player/league objects with sensible defaults.
export const mk = (o = {}) => ({
  id: o.id || "auto-" + Math.random().toString(36).slice(2),
  n: "Test Player",
  pos: "RB",
  tm: "DET",
  par: null,
  ecr: null,
  proj: 0,
  avg25: 0,
  adp: 999,
  bye: null,
  inj: "",
  comp: 70,
  edge: null,
  trending: false,
  cuff: null,
  rank: 1,
  f: { sch: 75, off: 75, cmp: 75, sos: 72, dur: 80 },
  ...o,
});

export const LG = (o = {}) => ({
  scoring: "PPR", teams: 10, qb: 1, rb: 2, wr: 2, te: 1, flex: 1, sf: 0, k: 1, dst: 1, bench: 6, ...o,
});
