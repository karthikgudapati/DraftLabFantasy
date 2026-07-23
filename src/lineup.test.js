import { describe, it, expect } from "vitest";
import { buildLineup } from "./app.jsx";
import { mk, LG } from "./testkit.js";

describe("buildLineup", () => {
  const lg = LG(); // 1QB 2RB 2WR 1TE 1FLEX 1K 1DST
  const roster = () => [
    mk({ id: "qb1", pos: "QB", proj: 300 }),
    mk({ id: "rb1", pos: "RB", proj: 280 }),
    mk({ id: "rb2", pos: "RB", proj: 240 }),
    mk({ id: "rb3", pos: "RB", proj: 200 }),
    mk({ id: "wr1", pos: "WR", proj: 260 }),
    mk({ id: "wr2", pos: "WR", proj: 220 }),
    mk({ id: "te1", pos: "TE", proj: 180 }),
    mk({ id: "k1", pos: "K", proj: 150 }),
    mk({ id: "dst1", pos: "DST", proj: 140 }),
  ];

  it("fills every starting slot in the right shape", () => {
    const { slots } = buildLineup(roster(), lg, null, null, null);
    expect(slots.map((s) => s.label)).toEqual(["QB", "RB", "RB", "WR", "WR", "TE", "FLEX", "K", "DST"]);
    expect(slots.every((s) => s.r)).toBe(true);
  });

  it("puts the best remaining flex-eligible player in FLEX", () => {
    const { slots, bench } = buildLineup(roster(), lg, null, null, null);
    expect(slots.find((s) => s.label === "FLEX").r.p.id).toBe("rb3");
    expect(bench).toHaveLength(0); // 9 players fill 9 slots exactly
  });

  it("REGRESSION: excludes a player on bye in the selected week (FP bye is a string upstream)", () => {
    const withBye = roster().map((p) => (p.id === "rb1" ? { ...p, bye: 6 } : p));
    const { slots, sidelined } = buildLineup(withBye, lg, 6, null, null);
    expect(sidelined.some((x) => x.p.id === "rb1")).toBe(true);
    expect(slots.every((s) => !s.r || s.r.p.id !== "rb1")).toBe(true);
  });

  it("excludes ruled-out (OUT / IR) players from the lineup", () => {
    const withOut = roster().map((p) => (p.id === "wr1" ? { ...p, inj: "OUT" } : p));
    const { sidelined } = buildLineup(withOut, lg, null, null, null);
    expect(sidelined.some((x) => x.p.id === "wr1")).toBe(true);
  });

  it("tilts ppg up for a soft matchup and down for a tough one", () => {
    const sched = { DET: { 1: { opp: "CLE", home: true } } };
    const one = () => [mk({ id: "a", pos: "RB", tm: "DET", proj: 340 })];
    const easy = buildLineup(one(), lg, 1, sched, () => 0.05); // weak opponent defense
    const hard = buildLineup(one(), lg, 1, sched, () => 0.95); // strong opponent defense
    const ppg = (r) => r.slots.find((s) => s.r).r.ppg;
    expect(ppg(easy)).toBeGreaterThan(ppg(hard));
  });
});
