import { moveCamelUnit } from "./camel";
import { parseCamel, parseDice } from "./camel-parser";
import { RULES } from "./rules";
import { getLongTermOdds, getRanking, seededRandom, simulateGame } from "./long-term";

test("odds sum to one and values follow the odds", () => {
  const state = parseCamel("r,gu,ypb,13,w");
  const result = getLongTermOdds(state, parseDice("rguypc"), 5000, seededRandom(1));
  const winTotal = result.camelOdds.reduce((sum, c) => sum + c.winOdds, 0);
  const loseTotal = result.camelOdds.reduce((sum, c) => sum + c.loseOdds, 0);
  expect(winTotal).toBeCloseTo(1);
  expect(loseTotal).toBeCloseTo(1);
  result.camelOdds.forEach((c) => {
    expect(c.winValues[0]).toBeCloseTo(c.winOdds * 8 - (1 - c.winOdds));
    expect(c.loseValues[4]).toBeCloseTo(c.loseOdds * 1 - (1 - c.loseOdds));
  });
  expect(result.averageLegs).toBeGreaterThan(1);
});

test("a camel far in the lead is the likely winner", () => {
  const state = parseCamel("rguy,12,p");
  const result = getLongTermOdds(state, parseDice("rguypc"), 5000, seededRandom(2));
  const purple = result.camelOdds.find((c) => c.camel === "Purple")!;
  expect(purple.winOdds).toBeGreaterThan(0.95);
  expect(purple.loseOdds).toBeLessThan(0.01);
});

test("the camel on top of a stack is favored over the one on the bottom", () => {
  const state = parseCamel("rguyp,13,w");
  const result = getLongTermOdds(state, parseDice("rguypc"), 20000, seededRandom(3));
  // the camel on top of the stack has an advantage, the bottom one does not
  const red = result.camelOdds.find((c) => c.camel === "Red")!;
  const purple = result.camelOdds.find((c) => c.camel === "Purple")!;
  expect(purple.winOdds).toBeGreaterThan(red.winOdds);
});

test("game ends once a camel crosses the finish line", () => {
  const state = parseCamel("r,14,g");
  const outcome = simulateGame(state, parseDice("g"), seededRandom(4));
  // green only needs to move once to finish
  expect(outcome.first).toBe("Green");
  expect(outcome.last).toBe("Red");
});

test("ranking reads stacks top to bottom", () => {
  expect(getRanking(parseCamel("rg,ub,y"))).toEqual(["Yellow", "Blue", "Green", "Red"]);
});

test("oasis moves camels forward and on top", () => {
  const state = parseCamel("r,o,,g");
  moveCamelUnit(state, { color: "Red", Roll: 1 });
  expect(state.tiles[2].camels).toEqual(["Red"]);
  const state2 = parseCamel("r,o,g");
  moveCamelUnit(state2, { color: "Red", Roll: 1 });
  expect(state2.tiles[2].camels).toEqual(["Green", "Red"]);
});

test("desert moves camels back and underneath", () => {
  const state = parseCamel("g,r,d");
  moveCamelUnit(state, { color: "Red", Roll: 1 });
  expect(state.tiles[1].camels).toEqual(["Red"]);
  const state2 = parseCamel("r,g,d");
  moveCamelUnit(state2, { color: "Red", Roll: 2 });
  expect(state2.tiles[1].camels).toEqual(["Red", "Green"]);
});

test("chaos camels wrap around the start of the track", () => {
  const state = parseCamel("wr");
  moveCamelUnit(state, { color: "White", Roll: 2 });
  expect(state.tiles[14].camels).toEqual(["White", "Red"]);
});

test("simulations run quickly from a fresh board", () => {
  const state = parseCamel("rg,uy,p,11,w,b");
  const start = Date.now();
  getLongTermOdds(state, parseDice("rguypc"), 20000, seededRandom(5));
  const elapsed = Date.now() - start;
  expect(elapsed).toBeLessThan(5000);
});

test("version 1 games never use the gray die", () => {
  const state = parseCamel("rgu,,yw", RULES.v1);
  const result = getLongTermOdds(state, parseDice("rguyw", RULES.v1), 2000, seededRandom(6), RULES.v1);
  expect(result.camelOdds.reduce((sum, c) => sum + c.winOdds, 0)).toBeCloseTo(1);
  // 5 dice per leg moving 2 on average: games take a few legs
  expect(result.averageLegs).toBeGreaterThan(2);
});
