import { applyRoll, finishLeg, FULL_PYRAMID } from "./game";
import { seededRandom } from "./long-term";

test("a roll moves the camel and uses up its die", () => {
  const outcome = applyRoll("r,o,,g", "rgc", { color: "Red", Roll: 1 });
  expect(outcome.boardInput).toBe(",o,r,g");
  expect(outcome.diceInput).toBe("gc");
  expect(outcome.legEnded).toBe(false);
});

test("the leg ends when one die is left", () => {
  const outcome = applyRoll("r,o,,g", "rg", { color: "Red", Roll: 1 });
  expect(outcome.legEnded).toBe(true);
  expect(outcome.diceInput).toBe(FULL_PYRAMID);
  expect(outcome.boardInput).not.toContain("o");
});

test("finishing the leg rolls all but one die", () => {
  const outcome = finishLeg("rguyp,12,b,w", "rguypc", seededRandom(9));
  expect(outcome.rolls).toHaveLength(5);
  expect(outcome.legEnded).toBe(true);
  expect(outcome.diceInput).toBe(FULL_PYRAMID);
});

test("finishing the leg stops when the game ends", () => {
  // purple is one step from the finish line, so it ends the game once rolled
  const outcome = finishLeg("rguy,14,p", "pr", seededRandom(1));
  expect(outcome.rolls).toHaveLength(1);
  if (outcome.rolls[0].color === "Purple") {
    expect(outcome.gameOver).toBe(true);
    expect(outcome.legEnded).toBe(false);
  } else {
    expect(outcome.legEnded).toBe(true);
  }
});
