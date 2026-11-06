// Differences between the editions of the game.
//  - Version 1: five racing camels and five dice. A leg ends once every die
//    has been rolled.
//  - Version 2: adds the black and white crazy camels and the gray die. A leg
//    ends when one die is left in the pyramid.
export type Edition = "v1" | "v2";

type CamelName = string;

export interface Rules {
  edition: Edition;
  name: string;
  // camel code of the dice in a full pyramid
  pyramid: string;
  // the leg ends once this many dice are left in the pyramid
  diceLeftAtLegEnd: number;
  crazyCamels: boolean;
  // The calculations always use the same five racing camel slots (Red, Blue,
  // Green, Yellow, Purple). Each edition gives them its own colors.
  // name shown for each camel / die, and the camel code letter for it
  camelNames: Record<string, CamelName>;
  codes: Record<string, string>;
}

export const RULES: Record<Edition, Rules> = {
  v1: {
    edition: "v1",
    name: "Version 1",
    pyramid: "rguyw",
    diceLeftAtLegEnd: 0,
    crazyCamels: false,
    // the original camels: orange, blue, green, yellow and white
    camelNames: { Red: "Orange", Blue: "Blue", Green: "Green", Yellow: "Yellow", Purple: "White" },
    codes: { Red: "r", Blue: "u", Green: "g", Yellow: "y", Purple: "w" },
  },
  v2: {
    edition: "v2",
    name: "Version 2",
    pyramid: "rguypc",
    diceLeftAtLegEnd: 1,
    crazyCamels: true,
    camelNames: {
      Red: "Red", Blue: "Blue", Green: "Green", Yellow: "Yellow", Purple: "Purple",
      White: "White", Black: "Black", Gray: "Gray",
    },
    codes: { Red: "r", Blue: "u", Green: "g", Yellow: "y", Purple: "p", White: "w", Black: "b", Gray: "c" },
  },
};

export const DEFAULT_RULES = RULES.v2;

// the name shown to the player for a camel or die
export const displayName = (color: string, rules: Rules = DEFAULT_RULES): string =>
  rules.camelNames[color] ?? color;

// css class used to color a camel or die
export const colorClass = (color: string, rules: Rules = DEFAULT_RULES): string =>
  `camel-${displayName(color, rules).toLowerCase()}`;
