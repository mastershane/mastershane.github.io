import { getOdds, simulateWinner } from "./camel";
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
