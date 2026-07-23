import { describe, it, expect } from "vitest";
import { pSurvive, snakeOwner, nextPickOf, recommendPick, parsePickList, gradeDraft } from "./app.jsx";
import { mk, LG } from "./testkit.js";

describe("snakeOwner", () => {
  it("runs forward in even rounds and reverses in odd rounds", () => {
    const T = 10;
    expect(snakeOwner(0, T)).toBe(0);
    expect(snakeOwner(9, T)).toBe(9);
    expect(snakeOwner(10, T)).toBe(9); // round 1 starts from the end
    expect(snakeOwner(19, T)).toBe(0);
    expect(snakeOwner(20, T)).toBe(0); // round 2 forward again
  });
});

describe("nextPickOf", () => {
  it("finds a slot's next pick in the snake", () => {
    // slot 0 in a 10-team snake owns overall picks 0, 19, 20, 39, ...
    expect(nextPickOf(0, 1, 10)).toBe(19);
    expect(nextPickOf(9, 0, 10)).toBe(9);
  });
});

describe("pSurvive", () => {
  it("is high well before ADP and low well after", () => {
    expect(pSurvive(50, 20)).toBeGreaterThan(80);
    expect(pSurvive(50, 80)).toBeLessThan(20);
  });
  it("returns null when ADP is unknown", () => {
    expect(pSurvive(null, 10)).toBeNull();
    expect(pSurvive(999, 10)).toBeNull();
  });
});

describe("recommendPick", () => {
  it("returns null for an empty pool", () => {
    expect(recommendPick([], [], LG(), 20)).toBeNull();
  });
  it("returns a player with at least one stated reason", () => {
    const pool = [
      mk({ n: "Elite RB", pos: "RB", par: 120, adp: 3, rank: 1 }),
      mk({ n: "Good WR", pos: "WR", par: 90, adp: 8, rank: 2 }),
    ];
    const r = recommendPick(pool, [], LG(), 20);
    expect(r && r.p).toBeTruthy();
    expect(Array.isArray(r.reasons) && r.reasons.length).toBeGreaterThan(0);
  });
  it("favors a position of need over a slightly higher-value luxury pick", () => {
    const roster = [mk({ pos: "RB", par: 110 }), mk({ pos: "RB", par: 100 }), mk({ pos: "RB", par: 80 })];
    const cand = [
      mk({ n: "4th RB", pos: "RB", par: 85, adp: 30, rank: 20 }),
      mk({ n: "1st WR", pos: "WR", par: 70, adp: 32, rank: 25 }),
    ];
    const r = recommendPick(cand, roster, LG(), 40);
    expect(r.p.pos).toBe("WR");
  });
});

describe("parsePickList", () => {
  const pool = [
    mk({ id: "chase", n: "Ja'Marr Chase", pos: "WR" }),
    mk({ id: "bijan", n: "Bijan Robinson", pos: "RB" }),
    mk({ id: "jefferson", n: "Justin Jefferson", pos: "WR" }),
  ];
  it("strips pick-number prefixes and trailing position/team tags", () => {
    const text = "1.01 Ja'Marr Chase, WR, CIN\nRound 1, Pick 2: Bijan Robinson\nJustin Jefferson WR MIN";
    const { ids, unmatched } = parsePickList(text, pool, []);
    expect(ids).toEqual(["chase", "bijan", "jefferson"]);
    expect(unmatched).toHaveLength(0);
  });
  it("skips already-taken players and reports names it can't match", () => {
    const { ids, unmatched } = parsePickList("Bijan Robinson\nNobody McGhost", pool, ["bijan"]);
    expect(ids).toHaveLength(0);
    expect(unmatched).toContain("Nobody McGhost");
  });
});

describe("gradeDraft", () => {
  const lg = LG();
  const pool = [];
  for (let i = 0; i < 120; i++) pool.push(mk({ pos: ["QB", "RB", "WR", "TE"][i % 4], par: Math.max(1, 130 - i) }));
  const starters = (scale) => [
    mk({ pos: "QB", par: 60 * scale, proj: 200 + 60 * scale }),
    mk({ pos: "RB", par: 120 * scale, proj: 200 + 120 * scale }),
    mk({ pos: "RB", par: 80 * scale, proj: 200 + 80 * scale }),
    mk({ pos: "WR", par: 110 * scale, proj: 200 + 110 * scale }),
    mk({ pos: "WR", par: 70 * scale, proj: 200 + 70 * scale }),
    mk({ pos: "TE", par: 40 * scale, proj: 200 + 40 * scale }),
  ];
  it("returns a letter, a bounded score and bullets", () => {
    const g = gradeDraft(starters(1), lg, pool);
    expect(typeof g.letter).toBe("string");
    expect(g.score).toBeGreaterThanOrEqual(40);
    expect(g.score).toBeLessThanOrEqual(99);
    expect(g.bullets.length).toBeGreaterThan(0);
  });
  it("grades a stronger roster above a weaker one", () => {
    expect(gradeDraft(starters(1.3), lg, pool).score).toBeGreaterThan(gradeDraft(starters(0.2), lg, pool).score);
  });
  it("returns null for an empty roster", () => {
    expect(gradeDraft([], lg, pool)).toBeNull();
  });
});
