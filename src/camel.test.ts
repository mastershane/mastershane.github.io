import { generateInitialState, getOdds, moveCamelUnit, placeStartingCamel, resolveChaosCamel, simulateWinner } from "./camel";
import { seededRandom } from "./long-term";
import { RULES } from "./rules";
import { parseCamel, parseDice } from "./camel-parser";

test("rolls after a camel finishes are ignored", () => {
  // red on space 14, green on space 15
  const state = parseCamel("u,12,r,g");
  const result = simulateWinner(state, [
    { color: "Green", Roll: 2 },
    // without the finish line red would land on top of green
    { color: "Red", Roll: 3 },
  ]);
  expect(result.gameEnded).toBe(true);
  expect(result.first).toBe("Green");
  expect(result.second).toBe("Red");
});

test("short term odds account for the game ending", () => {
  const state = parseCamel("u,12,r,g");
  const result = getOdds(state, parseDice("gr"));
  // only one die is rolled: green finishes on a 2 or 3, red finishes on a 3
  expect(result.gameEndOdds).toBeCloseTo(0.5);
});

test("game end odds are zero when no camel can finish", () => {
  const result = getOdds(parseCamel("rgu,,yp"), parseDice("rguypc"));
  expect(result.gameEndOdds).toBe(0);
});

describe("crazy camel rules", () => {
  test("the rolled crazy camel moves when no special case applies", () => {
    const state = parseCamel("r,,w,,b");
    expect(resolveChaosCamel(state, "White")).toBe("White");
    expect(resolveChaosCamel(state, "Black")).toBe("Black");
  });

  test("the only crazy camel carrying racing camels moves", () => {
    // white is carrying red, black is carrying nothing
    const state = parseCamel("g,,wr,,b");
    expect(resolveChaosCamel(state, "Black")).toBe("White");
    moveCamelUnit(state, { color: "Black", Roll: 1 });
    expect(state.tiles[1].camels).toEqual(["White", "Red"]);
    expect(state.tiles[4].camels).toEqual(["Black"]);
  });

  test("a racing camel anywhere above counts as being carried", () => {
    // black is under white which is under red: both carry red
    const state = parseCamel("g,,bwr");
    // ...so the crazy camel on top (white) moves
    expect(resolveChaosCamel(state, "Black")).toBe("White");
    // black carries red with a white camel in between, white carries nothing
    const state2 = parseCamel("g,,brw");
    expect(resolveChaosCamel(state2, "White")).toBe("Black");
  });

  test("the crazy camel directly on top moves", () => {
    const state = parseCamel("g,,,bw");
    expect(resolveChaosCamel(state, "Black")).toBe("White");
    moveCamelUnit(state, { color: "Black", Roll: 2 });
    expect(state.tiles[3].camels).toEqual(["Black"]);
    expect(state.tiles[1].camels).toEqual(["White"]);
  });

  test("both carrying racing camels on different spaces uses the roll", () => {
    const state = parseCamel("wr,,bg");
    expect(resolveChaosCamel(state, "Black")).toBe("Black");
    expect(resolveChaosCamel(state, "White")).toBe("White");
  });

  test("short term odds use the crazy camel rules", () => {
    // red sits on white and black carries nothing, so every gray roll moves
    // white (and red) backwards. Yellow only passes red on a gray 3.
    const state = parseCamel(",y,,wr,,b");
    // one die is rolled per leg here: gray (black or white face) or blue,
    // which isn't on the board. 12 timelines, 2 of which are a gray 3.
    const result = getOdds(state, parseDice("cu"));
    const yellow = result.camelOdds.find((c) => c.camel === "Yellow")!;
    const red = result.camelOdds.find((c) => c.camel === "Red")!;
    expect(red.firstPlaceOdds).toBeCloseTo(10 / 12);
    expect(yellow.firstPlaceOdds).toBeCloseTo(2 / 12);
  });
});

describe("board setup", () => {
  test("racing camels start on their roll and crazy camels count back from 16", () => {
    let state = placeStartingCamel({ tiles: [] }, "Red", 2);
    state = placeStartingCamel(state, "Blue", 2);
    state = placeStartingCamel(state, "Black", 1);
    state = placeStartingCamel(state, "White", 3);
    expect(state.tiles[1].camels).toEqual(["Red", "Blue"]);
    expect(state.tiles[15].camels).toEqual(["Black"]);
    expect(state.tiles[13].camels).toEqual(["White"]);
  });

  test("random setup places every camel in its starting area", () => {
    const random = seededRandom(7);
    for (let i = 0; i < 50; i++) {
      const state = generateInitialState(random);
      const where = (c: string) => state.tiles.findIndex((t) => t.camels.includes(c as any));
      ["Red", "Blue", "Green", "Yellow", "Purple"].forEach((c) => {
        expect(where(c)).toBeGreaterThanOrEqual(0);
        expect(where(c)).toBeLessThanOrEqual(2);
      });
      ["Black", "White"].forEach((c) => {
        expect(where(c)).toBeGreaterThanOrEqual(13);
        expect(where(c)).toBeLessThanOrEqual(15);
      });
    }
  });
});

describe("version 1 rules", () => {
  test("every die is rolled in the leg", () => {
    const state = parseCamel("r,g");
    const v1 = getOdds(state, parseDice("rg"), RULES.v1);
    const v2 = getOdds(state, parseDice("rg"), RULES.v2);
    const red = (r: typeof v1) => r.camelOdds.find((c) => c.camel === "Red")!.firstPlaceOdds;
    // v2 rolls one die: red only wins if red is rolled (any number)
    expect(red(v2)).toBeCloseTo(0.5);
    // v1 rolls both dice, which changes the odds
    expect(red(v1)).not.toBeCloseTo(red(v2));
  });

  test("random setup has no crazy camels", () => {
    const state = generateInitialState(seededRandom(4), RULES.v1);
    const camels = state.tiles.flatMap((t) => t.camels);
    expect(camels).toHaveLength(5);
    expect(camels).not.toContain("Black");
    expect(camels).not.toContain("White");
  });
});
