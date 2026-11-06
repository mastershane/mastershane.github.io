// convert camel code into the camel state data model

import { CamelState, ChaosColor, Color, Die, Hazard, Map, Tile } from "./camel";
import { DEFAULT_RULES, Rules } from "./rules";

// camel code letter -> camel / die color for the edition being played
const codeToColor = (rules: Rules): Map<Color | ChaosColor | "Gray"> => {
    const map: Map<Color | ChaosColor | "Gray"> = {};
    Object.keys(rules.codes).forEach(color => {
        map[rules.codes[color]] = color as Color | ChaosColor | "Gray";
    });
    return map;
};

const hazardCodeMap: Map<Hazard> = {
    "o":"Oasis",
    "d": "Desert"
};

export const parseCamel = (camelCode: string, rules: Rules = DEFAULT_RULES): CamelState => {
    const colors = codeToColor(rules);
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
            const color = colors[character];
            if (hazardCodeMap[character]) {
                tile.hazard = hazardCodeMap[character];
            } else if (color && color !== "Gray") {
                tile.camels.push(color);
            } else {
                throw new Error(`Unsupported Character ${character} found in camel string`)
            }
        });
        return [tile];
    }).flatMap(x => x);
    return { tiles };
};

// Unknown letters give a die with no color, which callers filter out.
export const parseDice = (diceCode: string, rules: Rules = DEFAULT_RULES): Die[] => {
    const colors = codeToColor(rules);
    return diceCode.split("").map(c => {
        const color = colors[c];
        // crazy camels don't have their own dice, they move with the gray die
        const dieColor = color === "White" || color === "Black" ? undefined : color;
        return { color: dieColor as Color | "Gray" };
    });
};

export const toCamelCode = (camelState: CamelState, rules: Rules = DEFAULT_RULES): string => {
    
    let camelCode = camelState.tiles.map(tile => {
        if(tile.hazard){
            switch(tile.hazard){
                case 'Oasis':
                    return 'o';
                case 'Desert':
                    return 'd';
            }
        }
        return tile.camels.map(c => colorToCode(c, rules)).join('');
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

export const toDiceCode = (dice: Die[], rules: Rules = DEFAULT_RULES) => {
    return dice.map(d => colorToCode(d.color, rules)).join('');
};

export const colorToCode = (color: Color | "Gray" | ChaosColor, rules: Rules = DEFAULT_RULES): string =>
    rules.codes[color] ?? '';
