import { describe, it, expect } from "vitest";
import { valueGradeOf, ecrGradeOf, gaugeColor, sosGrade, usageRole, shortVerdict, gameFP } from "./app.jsx";
import { mk } from "./testkit.js";

describe("ecrGradeOf", () => {
  it("ranks a better (lower) ECR higher", () => {
    expect(ecrGradeOf(1)).toBeGreaterThan(ecrGradeOf(50));
    expect(ecrGradeOf(50)).toBeGreaterThan(ecrGradeOf(200));
  });
  it("returns null for missing or out-of-range ranks", () => {
    expect(ecrGradeOf(null)).toBeNull();
    expect(ecrGradeOf(0)).toBeNull();
    expect(ecrGradeOf(500)).toBeNull();
  });
});

describe("valueGradeOf", () => {
  it("grades an elite PAR in the 90s", () => {
    const g = valueGradeOf(mk({ pos: "RB", par: 150, ecr: 3 }));
    expect(g).toBeGreaterThanOrEqual(90);
    expect(g).toBeLessThanOrEqual(99);
  });
  it("is monotonic in PAR — more value, higher grade", () => {
    const lo = valueGradeOf(mk({ pos: "WR", par: 20, ecr: 60 }));
    const hi = valueGradeOf(mk({ pos: "WR", par: 120, ecr: 6 }));
    expect(hi).toBeGreaterThan(lo);
  });
  it("REGRESSION: kickers and defenses are capped in a low band (<=63)", () => {
    // guards the bug where a kicker surfaced at model rank #7 overall
    expect(valueGradeOf(mk({ pos: "K", par: 15, ecr: 120 }))).toBeLessThanOrEqual(63);
    expect(valueGradeOf(mk({ pos: "DST", par: 12, ecr: 110 }))).toBeLessThanOrEqual(63);
    // even an absurd projection + elite ECR can't lift a kicker into the early rounds
    expect(valueGradeOf(mk({ pos: "K", par: 300, ecr: 1 }))).toBeLessThanOrEqual(63);
  });
  it("caps players with no projection to a bench-tier grade", () => {
    expect(valueGradeOf(mk({ pos: "RB", par: null, ecr: null }))).toBeLessThanOrEqual(58);
  });
  it("always stays within [40, 99]", () => {
    for (const par of [-40, -10, 0, 30, 90, 300]) {
      const g = valueGradeOf(mk({ pos: "WR", par, ecr: 30 }));
      expect(g).toBeGreaterThanOrEqual(40);
      expect(g).toBeLessThanOrEqual(99);
    }
  });
});

describe("gaugeColor", () => {
  const hue = (s) => Number(s.match(/hsl\((\d+)/)[1]);
  it("returns an hsl() string", () => {
    expect(gaugeColor(80)).toMatch(/^hsl\(/);
  });
  it("runs red (low) to green (high) as the value rises", () => {
    expect(hue(gaugeColor(40))).toBeLessThan(hue(gaugeColor(95)));
    expect(hue(gaugeColor(40))).toBeLessThan(30);    // red end
    expect(hue(gaugeColor(95))).toBeGreaterThan(120); // green end
  });
});

describe("usageRole", () => {
  it("returns null when there's no usage (rookies, deep bench)", () => {
    expect(usageRole(null, "WR")).toBeNull();
    expect(usageRole({}, "WR")).toBeNull();
  });
  it("grades a WR alpha (high target share) above a role-player", () => {
    const alpha = usageRole({ ts: 30 }, "WR");   // ~30% target share
    const role = usageRole({ ts: 12 }, "WR");     // ~12%
    expect(alpha).toBeGreaterThan(role);
    expect(alpha).toBeGreaterThan(85);
    expect(role).toBeLessThan(70);
  });
  it("grades an RB workhorse above a committee back by touches/game", () => {
    const bell = usageRole({ tpg: 19 }, "RB");
    const comm = usageRole({ tpg: 8 }, "RB");
    expect(bell).toBeGreaterThan(comm);
    expect(bell).toBeGreaterThanOrEqual(90);
  });
  it("stays within [42, 95] and ignores QBs", () => {
    expect(usageRole({ ts: 99 }, "WR")).toBeLessThanOrEqual(95);
    expect(usageRole({ ts: 1 }, "WR")).toBeGreaterThanOrEqual(42);
    expect(usageRole({ tpg: 25 }, "QB")).toBeNull();
  });
});

describe("shortVerdict", () => {
  it("flags a no-projection player as a watchlist name", () => {
    expect(shortVerdict(mk({ proj: 0 }))).toMatch(/watchlist/i);
  });
  it("calls out clear value and clear overpricing", () => {
    expect(shortVerdict(mk({ proj: 250, comp: 82, edge: 20 }))).toMatch(/value/i);
    expect(shortVerdict(mk({ proj: 250, comp: 80, edge: -20 }))).toMatch(/overpriced/i);
  });
  it("scales the call with the grade", () => {
    expect(shortVerdict(mk({ proj: 250, comp: 90, edge: 0 }))).toMatch(/elite/i);
    expect(shortVerdict(mk({ proj: 250, comp: 64, edge: 0 }))).toMatch(/late-round/i);
  });
});

describe("gameFP (game-log fantasy points)", () => {
  const names = ["passingYards", "passingTouchdowns", "interceptions", "rushingYards", "rushingTouchdowns"];
  it("scores a QB line by standard weights (yds .04, passTD 4, INT -2, rushYd .1, rushTD 6)", () => {
    // 394 pass yds (15.76) + 2 passTD (8) + 0 INT + 30 rush yds (3) + 2 rushTD (12) = 38.76 -> 38.8
    expect(gameFP(names, ["394", "2", "0", "30", "2"], 1)).toBeCloseTo(38.8, 1);
  });
  it("applies the league reception weight (PPR 1, half .5, std 0) and parses comma numbers", () => {
    const rec = ["receptions", "receivingYards", "receivingTouchdowns"];
    // 8 rec, 1,105 yds (110.5), 1 TD (6)
    expect(gameFP(rec, ["8", "1,105", "1"], 1)).toBeCloseTo(124.5, 1);
    expect(gameFP(rec, ["8", "1,105", "1"], 0.5)).toBeCloseTo(120.5, 1);
    expect(gameFP(rec, ["8", "1,105", "1"], 0)).toBeCloseTo(116.5, 1);
  });
});

describe("sosGrade", () => {
  it("maps the easiest slate high and the hardest low", () => {
    expect(sosGrade(1)).toBe(95);
    expect(sosGrade(32)).toBe(55);
    expect(sosGrade(1)).toBeGreaterThan(sosGrade(32));
  });
});
