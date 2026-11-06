// Applying rolls to a board written in camel code.
import { DieRoll, getRandomRoll, hasFinished, moveCamelUnit } from "./camel";
import { colorToCode, parseCamel, parseDice, toCamelCode, toDiceCode } from "./camel-parser";

export const FULL_PYRAMID = "rguypc";

export interface RollOutcome {
  boardInput: string;
  diceInput: string;
  // the leg ended, so the pyramid was refilled and the tiles removed
  legEnded: boolean;
  gameOver: boolean;
}

const finishRolls = (boardInput: string, diceInput: string, rolls: DieRoll[]): RollOutcome => {
  const camelState = parseCamel(boardInput);
  let remaining = diceInput;
  for (const roll of rolls) {
    moveCamelUnit(camelState, roll);
    const die = roll.color === "Black" || roll.color === "White" ? "Gray" : roll.color;
    remaining = remaining.replace(colorToCode(die), "");
  }

  const gameOver = hasFinished(camelState);
  // when only one die is left the leg is over: refill the pyramid and remove all tiles
  const legEnded = remaining.length <= 1 && !gameOver;
  if (legEnded) {
    remaining = FULL_PYRAMID;
    camelState.tiles.forEach((t) => (t.hazard = undefined));
  }
  return { boardInput: toCamelCode(camelState), diceInput: remaining, legEnded, gameOver };
};

export const applyRoll = (boardInput: string, diceInput: string, roll: DieRoll): RollOutcome =>
  finishRolls(boardInput, diceInput, [roll]);

// Randomly roll the dice left in the pyramid until the leg (or game) ends.
export const finishLeg = (
  boardInput: string,
  diceInput: string,
  random: () => number = Math.random
): RollOutcome & { rolls: DieRoll[] } => {
  const camelState = parseCamel(boardInput);
  const pyramid = parseDice(diceInput).filter((d) => d.color);
  const rolls: DieRoll[] = [];
  while (pyramid.length > 1 && !hasFinished(camelState)) {
    const roll = getRandomRoll(pyramid, random);
    moveCamelUnit(camelState, roll);
    rolls.push(roll);
  }
  return { ...finishRolls(boardInput, toDiceCode(parseDice(diceInput).filter((d) => d.color)), rolls), rolls };
};
