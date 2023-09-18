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
        if(!isNaN(parseInt(squareString))){
            const numValue = parseInt(squareString);
            
            //todo: check if value is larger than number of spaces left on board, not just 20
            if(numValue <= 0 || numValue > 20){
                throw new Error(`Invalid space skip number ${squareString} found in camel string`)
            }
            const skippedTiles = [];
            for(let i = 0; i < numValue; i++){
                skippedTiles.push({camels: []})
            }
            return skippedTiles;
        }
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
        return [tile];
    }).flatMap(x => x);
    return { tiles };
};

export const parseDice = (diceCode: string): Die[] => {
    return diceCode.split("").map(c => ({ color: codeColorMap[c] }));
};

export const toCamelCode = (camelState: CamelState): string => {
    
    let camelCode = camelState.tiles.map(tile => {
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

    // we can simplify the camel code output by showing a number
    // instead of a bunch of commas in a row e.g. r,,,,g => r,2,g
    while(camelCode.includes(",,,")){
        const loopIndex = camelCode.indexOf(",,,");
        let skipNumber = loopIndex + 2;
        let splitString = ",,,";
        while(camelCode[skipNumber + 1] === ","){
            skipNumber++;
            splitString = splitString + ","
        }
        camelCode = camelCode.replace(splitString, `,${splitString.length - 1},`)
    }

    return camelCode;
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
