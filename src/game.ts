// Applying rolls to a board written in camel code.
import { DieRoll, getRandomRoll, hasFinished, moveCamelUnit } from "./camel";
import { colorToCode, parseCamel, parseDice, toCamelCode, toDiceCode } from "./camel-parser";
import { DEFAULT_RULES, Rules } from "./rules";

export interface RollOutcome {
  boardInput: string;
  diceInput: string;
  // the leg ended, so the pyramid was refilled and the tiles removed
  legEnded: boolean;
  gameOver: boolean;
}

const finishRolls = (
  boardInput: string,
  diceInput: string,
  rolls: DieRoll[],
  rules: Rules
): RollOutcome => {
  const camelState = parseCamel(boardInput, rules);
  let remaining = diceInput;
  for (const roll of rolls) {
    moveCamelUnit(camelState, roll);
    const die = roll.color === "Black" || roll.color === "White" ? "Gray" : roll.color;
    remaining = remaining.replace(colorToCode(die, rules), "");
  }

  const gameOver = hasFinished(camelState);
  // once the rules say the leg is over: refill the pyramid and remove all tiles
  const legEnded = remaining.length <= rules.diceLeftAtLegEnd && !gameOver;
  if (legEnded) {
    remaining = rules.pyramid;
    camelState.tiles.forEach((t) => (t.hazard = undefined));
  }
  return { boardInput: toCamelCode(camelState, rules), diceInput: remaining, legEnded, gameOver };
};

export const applyRoll = (
  boardInput: string,
  diceInput: string,
  roll: DieRoll,
  rules: Rules = DEFAULT_RULES
): RollOutcome => finishRolls(boardInput, diceInput, [roll], rules);

// Randomly roll the dice left in the pyramid until the leg (or game) ends.
export const finishLeg = (
  boardInput: string,
  diceInput: string,
  random: () => number = Math.random,
  rules: Rules = DEFAULT_RULES
): RollOutcome & { rolls: DieRoll[] } => {
  const camelState = parseCamel(boardInput, rules);
  const pyramid = parseDice(diceInput, rules).filter((d) => d.color);
  const rolls: DieRoll[] = [];
  while (pyramid.length > rules.diceLeftAtLegEnd && !hasFinished(camelState)) {
    const roll = getRandomRoll(pyramid, random);
    moveCamelUnit(camelState, roll);
    rolls.push(roll);
  }
  return { ...finishRolls(boardInput, toDiceCode(parseDice(diceInput, rules).filter((d) => d.color), rules), rolls, rules), rolls };
};
