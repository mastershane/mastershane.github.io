import { getOdds, moveCamelUnit, resolveChaosCamel, simulateWinner } from "./camel";
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
