// Monte Carlo estimate of the long term (overall winner / overall loser) bets.
//
// Short term bets only depend on the current leg, so every outcome can be
// enumerated. Long term bets depend on every leg until a camel crosses the
// finish line, which is far too many outcomes to enumerate. Instead we play
// the rest of the game out many times with random dice and count how often
// each camel finishes first and last. With N games the estimated probability
// p has a standard error of sqrt(p * (1 - p) / N), so 20,000 games gives
// odds that are accurate to within about +/- 0.7%.
//
// Assumptions made for the simulated future legs:
//  - The current leg continues with the remaining dice and the current
//    desert / oasis tiles.
//  - Every later leg uses all six dice (five racing colors + gray) and, like
//    the current leg, ends when only one die is left in the pyramid.
//  - No desert / oasis tiles are placed in later legs (we can't know where
//    players will put them), since tiles are removed at the end of a leg.
//  - The game ends immediately when a racing camel crosses the finish line.

import {
  CamelState,
  Color,
  Die,
  getRandomRoll,
  GoodColors,
  moveCamelUnit,
  TRACK_LENGTH,
} from "./camel";

// payouts for the 1st, 2nd, 3rd... correct long term bet on a camel.
// Every incorrect long term bet loses 1.
export const LONG_TERM_PAYOUTS = [8, 5, 3, 2, 1];

export const DEFAULT_SIMULATIONS = 20000;

// guards against a pathological game that never ends
const MAX_ROLLS_PER_GAME = 1000;

const fullPyramid = (): Die[] => [
  { color: "Red" },
  { color: "Blue" },
  { color: "Green" },
  { color: "Yellow" },
  { color: "Purple" },
  { color: "Gray" },
];

export interface LongTermCamelOdds {
  camel: Color;
  winOdds: number;
  loseOdds: number;
  // standard error of the estimated odds
  winError: number;
  loseError: number;
  // expected value of a winner / loser bet for each entry in LONG_TERM_PAYOUTS
  winValues: number[];
  loseValues: number[];
}

export interface LongTermResult {
  camelOdds: LongTermCamelOdds[];
  simulations: number;
  // average number of legs (including the current one) until the game ends
  averageLegs: number;
}

export interface GameOutcome {
  first: Color;
  last: Color;
  legs: number;
}

const cloneState = (camelState: CamelState): CamelState => ({
  tiles: camelState.tiles.map((t) => ({
    camels: [...t.camels],
    hazard: t.hazard,
  })),
});

const isRacingCamel = (c: string): c is Color =>
  GoodColors.includes(c as Color);

// racing camels ordered from first place to last place
export const getRanking = (camelState: CamelState): Color[] => {
  const ranking: Color[] = [];
  for (let t = camelState.tiles.length - 1; t >= 0; t--) {
    const camels = camelState.tiles[t].camels;
    for (let c = camels.length - 1; c >= 0; c--) {
      const camel = camels[c];
      if (isRacingCamel(camel)) {
        ranking.push(camel);
      }
    }
  }
  return ranking;
};

const hasFinished = (camelState: CamelState): boolean => {
  for (let t = TRACK_LENGTH; t < camelState.tiles.length; t++) {
    if (camelState.tiles[t].camels.some(isRacingCamel)) {
      return true;
    }
  }
  return false;
};

const startNewLeg = (camelState: CamelState): Die[] => {
  camelState.tiles.forEach((t) => (t.hazard = undefined));
  return fullPyramid();
};

// play a single random game from the given state until a camel finishes
export const simulateGame = (
  camelState: CamelState,
  dice: Die[],
  random: () => number = Math.random
): GameOutcome => {
  const state = cloneState(camelState);
  let pyramid: Die[] = dice.map((d) => ({ ...d }));
  let legs = 1;

  if (pyramid.length <= 1) {
    // the current leg is already over
    pyramid = startNewLeg(state);
  }

  let rolls = 0;
  while (!hasFinished(state) && rolls < MAX_ROLLS_PER_GAME) {
    if (pyramid.length <= 1) {
      pyramid = startNewLeg(state);
      legs++;
    }
    moveCamelUnit(state, getRandomRoll(pyramid, random));
    rolls++;
  }

  const ranking = getRanking(state);
  return { first: ranking[0], last: ranking[ranking.length - 1], legs };
};

const betValue = (odds: number, payout: number) =>
  odds * payout - (1 - odds);

export const getLongTermOdds = (
  camelState: CamelState,
  dice: Die[],
  simulations: number = DEFAULT_SIMULATIONS,
  random: () => number = Math.random
): LongTermResult => {
  const racingCamels = getRanking(camelState);
  if (racingCamels.length < 2) {
    throw new Error("At least two racing camels are needed");
  }

  const wins: Record<string, number> = {};
  const losses: Record<string, number> = {};
  racingCamels.forEach((c) => {
    wins[c] = 0;
    losses[c] = 0;
  });

  let totalLegs = 0;
  for (let i = 0; i < simulations; i++) {
    const outcome = simulateGame(camelState, dice, random);
    wins[outcome.first]++;
    losses[outcome.last]++;
    totalLegs += outcome.legs;
  }

  const standardError = (p: number) => Math.sqrt((p * (1 - p)) / simulations);

  const camelOdds = GoodColors.filter((c) => racingCamels.includes(c)).map(
    (camel) => {
      const winOdds = wins[camel] / simulations;
      const loseOdds = losses[camel] / simulations;
      return {
        camel,
        winOdds,
        loseOdds,
        winError: standardError(winOdds),
        loseError: standardError(loseOdds),
        winValues: LONG_TERM_PAYOUTS.map((p) => betValue(winOdds, p)),
        loseValues: LONG_TERM_PAYOUTS.map((p) => betValue(loseOdds, p)),
      };
    }
  );

  return {
    camelOdds,
    simulations,
    averageLegs: totalLegs / simulations,
  };
};

// small seedable random number generator so results can be reproduced in tests
export const seededRandom = (seed: number): (() => number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
