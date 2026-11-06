import { DEFAULT_RULES, Rules } from "./rules";

export type Color = "Red" | "Blue" | "Green" | "Yellow" | "Purple";
export type ChaosColor = "White" | "Black";
export type Roll = 1 | 2 | 3;
export type Hazard = "Desert" | "Oasis";

export const GoodColors: Array<Color> = ["Red", "Blue", "Green", "Yellow", "Purple"];

// number of spaces on the race track. A racing camel that moves to an index
// >= TRACK_LENGTH has crossed the finish line.
export const TRACK_LENGTH = 16;

export const isRacingCamel = (c: string): c is Color =>
  GoodColors.includes(c as Color);

// true once any racing camel has crossed the finish line
export const hasFinished = (camelState: CamelState): boolean => {
  for (let t = TRACK_LENGTH; t < camelState.tiles.length; t++) {
    if (camelState.tiles[t].camels.some(isRacingCamel)) {
      return true;
    }
  }
  return false;
};

// tslint:disable: interface-name
export interface Camel {
  color: Color | ChaosColor;
}

export interface Tile {
  camels: Array<Color | ChaosColor>;
  hazard?: Hazard;
}

export interface CamelState {
  tiles: Tile[];
}

export interface CamelOdds {
  camel: Color;
  firstPlaceOdds: number;
  secondPlaceOdds: number;
  fiveValue: number;
  threeValue: number;
  twoValue: number;
}

export interface Die {
  color: Color | "Gray";
}

export interface GoodDie {
  color: Color;
}

export interface DieRoll {
  color: Color | ChaosColor;
  Roll: Roll;
}

export interface Map<T> {
  [K: string]: T;
}

export interface OddsResult {
  camelOdds: CamelOdds[];
  desertHit: number[];
  oasisHits: number[];
  // odds that a camel crosses the finish line during this leg
  gameEndOdds: number;
}

interface TileHits {
  tile: Tile;
  hits: number;
}

// lets just calculate every outcome and get the odds of each
export const getOdds = (
  camelState: CamelState,
  dice: Die[],
  rules: Rules = DEFAULT_RULES
): OddsResult => {
  //hack to remove gray rolls since we don't know how to calculate
  // const dice: GoodDie[] = allDice.filter((d) => d.color !== 'Gray') as GoodDie[];

  let timelineCount = 0;
  let gameEndCount = 0;
  const camelWins: Record<Color, { first: number; second: number }> = {
    Red: { first: 0, second: 0 },
    Blue: { first: 0, second: 0 },
    Green: { first: 0, second: 0 },
    Purple: { first: 0, second: 0 },
    Yellow: { first: 0, second: 0 },
  };

  const tileHits = camelState.tiles.map((t, i) => ({ tile: t, hits: 0 }));

  const hasGray = dice.find((d) => d.color === "Gray") !== undefined;

  const permutations = !hasGray
    ? permute(dice.map<Color>((d) => d.color as Color))
    : permute(
        dice.map<Color | ChaosColor>((d) =>
          d.color !== "Gray" ? d.color : "Black"
        )
      ).concat(
        permute(dice.map((d) => (d.color !== "Gray" ? d.color : "White")))
      );

  // populate all timelines
  permutations.forEach((permutation) => {
    interface RollNode extends DieRoll {
      nextRolls: RollNode[];
    }
    const addDieRolls = (index: number, previousRolls?: RollNode[]) => {
      // the leg ends once only rules.diceLeftAtLegEnd dice are left
      if (index >= permutation.length - rules.diceLeftAtLegEnd) {
        return [];
      }

      const die = permutation[index];

      const rollValues: Roll[] = [1, 2, 3];

      const rolls: RollNode[] = rollValues.map((n: Roll) => ({
        color: die,
        Roll: n,
        nextRolls: [],
      }));

      // graph will use references fyi, hopefully wont be an issue
      if (previousRolls) {
        previousRolls.forEach((r) => (r.nextRolls = rolls));
      }
      addDieRolls(index + 1, rolls);
      return rolls;
    };
    const rollGraph = addDieRolls(0);
    const traverse = (rollNode: RollNode, rolls: DieRoll[]) => {
      const clone = [...rolls];
      clone.push(rollNode);
      if (rollNode.nextRolls.length) {
        rollNode.nextRolls.forEach((r) => {
          traverse(r, clone);
        });
      } else {
        timelineCount++;
        const winners = simulateWinner(camelState, clone);
        if (winners.gameEnded) {
          gameEndCount++;
        }

        camelWins[winners.first].first = camelWins[winners.first].first + 1;
        camelWins[winners.second].second = camelWins[winners.second].second + 1;
        winners.tileHits.forEach((t, i) => {
          tileHits[i].hits = tileHits[i].hits + t.hits;
        });
      }
    };
    rollGraph.forEach((n) => traverse(n, []));
  });

  const getBetValue = (
    firstOdds: number,
    secondOdds: number,
    betValue: number
  ) => {
    const loseOdds = 1 - (firstOdds + secondOdds);
    return firstOdds * betValue + secondOdds * 1 + loseOdds * -1;
  };

  const oddsResult: OddsResult = {
    camelOdds: (Object.keys(camelWins) as Array<Color>).map((k) => {
      const wins = camelWins[k];
      const firstOdds = wins.first / timelineCount;
      const secondOdds = wins.second / timelineCount;
      const camelOdds: CamelOdds = {
        camel: k as Color,
        firstPlaceOdds: firstOdds,
        secondPlaceOdds: secondOdds,
        fiveValue: getBetValue(firstOdds, secondOdds, 5),
        threeValue: getBetValue(firstOdds, secondOdds, 3),
        twoValue: getBetValue(firstOdds, secondOdds, 2),
      };

      return camelOdds;
    }),
    desertHit: [],
    oasisHits: [],
    gameEndOdds: gameEndCount / timelineCount,
  };
  tileHits.forEach((t) => {
    if (t.tile.hazard) {
      switch (t.tile.hazard) {
        case "Desert":
          oddsResult.desertHit.push(t.hits / timelineCount);
          break;
        case "Oasis":
          oddsResult.oasisHits.push(t.hits / timelineCount);
          break;
      }
    }
  });

  return oddsResult;
};

export const simulateWinner = (
  camelState: CamelState,
  timeLine: DieRoll[]
): {
  first: Color;
  second: Color;
  tileHits: TileHits[];
  gameEnded: boolean;
} => {
  const cloneState: CamelState = {
    tiles: [
      ...camelState.tiles.map((t) => ({
        camels: [...t.camels],
        hazard: t.hazard,
      })),
    ],
  };

  const tileHits = camelState.tiles.map((t, i) => ({ tile: t, hits: 0 }));
  // update the state after each die roll in the timeline. The game (and so
  // the leg) ends as soon as a racing camel crosses the finish line, so any
  // rolls after that never happen and don't affect the bets.
  let gameEnded = hasFinished(cloneState);
  for (const roll of timeLine) {
    if (gameEnded) {
      break;
    }
    const hitIndex = moveCamelUnit(cloneState, roll);
    if (hitIndex >= 0 && hitIndex < tileHits.length) {
      tileHits[hitIndex].hits++;
    }
    gameEnded = hasFinished(cloneState);
  }

  const winners: Color[] = [];

  // get the end of round first and second place camel
  for (let t = cloneState.tiles.length - 1; t >= 0; t--) {
    const tile = cloneState.tiles[t];

    const goodCamels: Color[] = tile.camels.filter((c) =>
      GoodColors.includes(c as Color)
    ) as Color[];
    for (let c = goodCamels.length - 1; c >= 0; c--) {
      winners.push(goodCamels[c]);
      if (winners.length === 2) {
        return {
          first: winners[0],
          second: winners[1],
          tileHits,
          gameEnded,
        };
      }
    }
  }
  throw Error("this code should not be reached");
};

interface CamelPosition {
  tileIndex: number;
  stackIndex: number;
}

const findCamel = (
  camelState: CamelState,
  color: Color | ChaosColor
): CamelPosition | undefined => {
  for (let t = 0; t < camelState.tiles.length; t++) {
    const stackIndex = camelState.tiles[t].camels.indexOf(color);
    if (stackIndex > -1) {
      return { tileIndex: t, stackIndex };
    }
  }
  return undefined;
};

// The gray die shows which crazy camel (black or white) to move, but the
// rules override it in two cases:
//  1. If only one crazy camel is carrying racing camels (has any racing camel
//     above it in its stack), that crazy camel moves.
//  2. Otherwise, if one crazy camel is directly on top of the other, the one
//     on top moves.
export const resolveChaosCamel = (
  camelState: CamelState,
  rolled: ChaosColor
): ChaosColor => {
  const white = findCamel(camelState, "White");
  const black = findCamel(camelState, "Black");
  if (!white || !black) {
    return rolled;
  }

  const isCarrying = (position: CamelPosition) =>
    camelState.tiles[position.tileIndex].camels
      .slice(position.stackIndex + 1)
      .some(isRacingCamel);

  const whiteCarrying = isCarrying(white);
  const blackCarrying = isCarrying(black);
  if (whiteCarrying !== blackCarrying) {
    return whiteCarrying ? "White" : "Black";
  }

  if (white.tileIndex === black.tileIndex) {
    if (white.stackIndex === black.stackIndex + 1) {
      return "White";
    }
    if (black.stackIndex === white.stackIndex + 1) {
      return "Black";
    }
  }

  return rolled;
};

// update the camel state based on the DieRoll
// returns the destination index ignoring the special hazard movement
// (or -1 if the rolled camel is not on the board)
export const moveCamelUnit = (
  camelState: CamelState,
  dieRoll: DieRoll
): number => {
  const color =
    dieRoll.color === "White" || dieRoll.color === "Black"
      ? resolveChaosCamel(camelState, dieRoll.color)
      : dieRoll.color;
  const tileIndex = camelState.tiles.findIndex(
    (t) => t.camels.indexOf(color) > -1
  );
  if (tileIndex < 0) {
    // camel isn't on the board, so there is nothing to move
    return -1;
  }
  const tile = camelState.tiles[tileIndex];

  // getting and removing the camel unit
  const camelUnit = tile.camels.splice(tile.camels.indexOf(color));

  const placeCamelsAtTile = (camels: (Color | ChaosColor)[], tile: Tile) => {
    camels.forEach((c) => {
      tile.camels.push(c);
    });
  };
  const isChaos = color === "White" || color === "Black";
  const moveIndex = (start: number, spacesAway: number) => {
    return isChaos ? start - spacesAway : start + spacesAway;
  };
  // chaos camels that move backwards past the first space wrap around to the
  // end of the track. Make sure the board is long enough for any destination
  // (e.g. camels moving past the finish line).
  const getTile = (index: number): Tile => {
    while (camelState.tiles.length <= index) {
      camelState.tiles.push({ camels: [] });
    }
    return camelState.tiles[index];
  };
  const wrap = (index: number) => (index < 0 ? index + TRACK_LENGTH : index);
  const destinationIndex = wrap(moveIndex(tileIndex, dieRoll.Roll));

  const destinationTile = getTile(destinationIndex);
  if (destinationTile.hazard === "Desert") {
    const specialDestination = getTile(wrap(moveIndex(destinationIndex, -1)));

    // make sure that the moving camel unit is placed under the other camels
    const otherCamels = specialDestination.camels;
    specialDestination.camels = [];

    placeCamelsAtTile(camelUnit, specialDestination);
    placeCamelsAtTile(otherCamels, specialDestination);
  } else if (destinationTile.hazard === "Oasis") {
    // oasis moves the camel unit one space further and places it on top
    const specialDestination = getTile(wrap(moveIndex(destinationIndex, 1)));
    placeCamelsAtTile(camelUnit, specialDestination);
  } else {
    placeCamelsAtTile(camelUnit, destinationTile);
  }
  return destinationIndex;
};

export const CHAOS_COLORS: Array<ChaosColor> = ["Black", "White"];

// Where a camel starts for a setup roll. Racing camels start on the space
// shown on their die (1-3). Crazy camels start on space 16, 15 or 14 for a
// roll of 1, 2 or 3. Camels placed on the same space stack on top.
export const startingSpaceIndex = (
  color: Color | ChaosColor,
  roll: Roll
): number =>
  color === "White" || color === "Black" ? TRACK_LENGTH - roll : roll - 1;

// returns a new state with the camel placed for its setup roll
export const placeStartingCamel = (
  camelState: CamelState,
  color: Color | ChaosColor,
  roll: Roll
): CamelState => {
  const tiles = camelState.tiles.map((t) => ({
    camels: [...t.camels],
    hazard: t.hazard,
  }));
  while (tiles.length < TRACK_LENGTH) {
    tiles.push({ camels: [], hazard: undefined });
  }
  tiles[startingSpaceIndex(color, roll)].camels.push(color);
  return { tiles };
};

// Random board setup following the rules: each racing die is rolled and its
// camel placed on that space. The gray die is rolled and the crazy camel it
// shows is placed, then it is rolled again for the other crazy camel (only
// the number matters the second time).
export const generateInitialState = (
  random: () => number = Math.random,
  rules: Rules = DEFAULT_RULES
): CamelState => {
  const dice: Die[] = GoodColors.map((color) => ({ color }));

  let camelState: CamelState = { tiles: [] };
  while (dice.length) {
    const dieRoll = getRandomRoll(dice, random);
    camelState = placeStartingCamel(camelState, dieRoll.color, dieRoll.Roll);
  }
  if (!rules.crazyCamels) {
    return camelState;
  }
  const first = getRandomRoll([{ color: "Gray" }], random);
  const second = getRandomRoll([{ color: "Gray" }], random);
  const other: ChaosColor = first.color === "Black" ? "White" : "Black";
  camelState = placeStartingCamel(camelState, first.color, first.Roll);
  camelState = placeStartingCamel(camelState, other, second.Roll);
  return camelState;
};

// note: this will actually modify the dice array in the parameter
export const getRandomRoll = (
  dice: Die[],
  random: () => number = Math.random
): DieRoll => {
  const dieIndex = Math.floor(random() * dice.length);
  const die = dice.splice(dieIndex, 1)[0];
  const rollNumber = Math.floor(random() * 3) + 1;

  if (die.color === "Gray") {
    const color = random() < 0.5 ? "White" : "Black";
    return { color, Roll: rollNumber as Roll };
  }

  return { color: die.color, Roll: rollNumber as Roll };
};

// returns every possible permutation of an array
function permute<T>(permutation: T[]): T[][] {
  const length = permutation.length;

  const result = [permutation.slice()];
  const c = new Array(length).fill(0);
  let i = 1;
  let k;
  let p;

  while (i < length) {
    if (c[i] < i) {
      k = i % 2 && c[i];
      p = permutation[i];
      permutation[i] = permutation[k];
      permutation[k] = p;
      ++c[i];
      i = 1;
      result.push(permutation.slice());
    } else {
      c[i] = 0;
      ++i;
    }
  }
  return result;
}
