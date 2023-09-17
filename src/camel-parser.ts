// convert camel code into the camel state data model

import { CamelState, ChaosColor, Color, Die, Hazard, Map, Tile } from "./camel";

const codeColorMap: Map<Color | ChaosColor> = {
    "r": "Red",
    "u": "Blue",
    "g": "Green",
    "y": "Yellow",
    "w": "White",
    "p": "Purple",
    "b": "Black"
};
const hazardCodeMap: Map<Hazard> = {
    "o":"Oasis",
    "d": "Desert"
};

export const parseCamel = (camelCode: string): CamelState => {
    const tiles = camelCode.toLowerCase().split(",").map(squareString => {
        const tile:Tile = {camels: []};
        squareString.split('').forEach(character => {
            switch(character) {
                case "r":
                case "u":
                case "g":
                case "y":
                case "w":
                case "b":
                case "p":
                    tile.camels.push(codeColorMap[character]);
                    break;
                case "o":
                case "d":
                    tile.hazard = hazardCodeMap[character];
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

export const toCamelCode = (camelState: CamelState): string => {
    
    return camelState.tiles.map(tile => {
        if(tile.hazard){
            switch(tile.hazard){
                case 'Oasis':
                    return 'o';
                case 'Desert':
                    return 'd';
            }
        }
        return tile.camels.map(colorToCode).join('');
    }).join(',');
}

export const toDiceCode = (dice: Die[]) => {
    return dice.map(d => colorToCode(d.color)).join('');
};

export const colorToCode = (color: Color | ChaosColor) => {
    switch(color) {
        case 'Red':
            return 'r';
        case 'Green':
            return 'g';
        case 'Blue': 
            return 'u';
        case 'White':
            return 'w';
        case 'Yellow':
            return 'y';
        case 'Black':
            return 'b';
        case 'Purple':
            return 'p';
    }
};
