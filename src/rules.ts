// Differences between the editions of the game.
//  - Version 1: five racing camels and five dice. A leg ends once every die
//    has been rolled.
//  - Version 2: adds the black and white crazy camels and the gray die. A leg
//    ends when one die is left in the pyramid.
export type Edition = "v1" | "v2";

export interface Rules {
  edition: Edition;
  name: string;
  // camel code of the dice in a full pyramid
  pyramid: string;
  // the leg ends once this many dice are left in the pyramid
  diceLeftAtLegEnd: number;
  crazyCamels: boolean;
}

export const RULES: Record<Edition, Rules> = {
  v1: {
    edition: "v1",
    name: "Version 1",
    pyramid: "rguyp",
    diceLeftAtLegEnd: 0,
    crazyCamels: false,
  },
  v2: {
    edition: "v2",
    name: "Version 2",
    pyramid: "rguypc",
    diceLeftAtLegEnd: 1,
    crazyCamels: true,
  },
};

export const DEFAULT_RULES = RULES.v2;
