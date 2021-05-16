// convert camel code into the camel state data model

import { CamelState, Color, Die, Map, Tile } from "./camel";

const codeColorMap: Map<Color> = {
    "r": "Red",
    "b": "Blue",
    "g": "Green",
    "y": "Yellow",
    "w": "White",
}

export const parseCamel = (camelCode: string): CamelState => {
    const tiles = camelCode.split(",").map(squareString => {
        const tile:Tile = {camels: []};
        squareString.split('').forEach(character => {
            switch(character) {
                case "r":
                case "b":
                case "g":
                case "y":
                case "w":
                    tile.camels.push(codeColorMap[character]);
                    break;
                default:
                    throw new Error(`Unsupported Character ${character} found in camel string`)
            }
        });
        return tile;
    });
    return { tiles };
};

export const parseDice = (diceCode: string): Die[] => {
    return diceCode.split("").map(c => ({ color: codeColorMap[c] }));
};
