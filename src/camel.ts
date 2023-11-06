
export type Color = 'Red' | 'Blue' | 'Green' | 'Yellow' | 'Purple';
export type ChaosColor = 'White' | 'Black';
export type Roll = 1 | 2 | 3;
export type Hazard = 'Desert' | 'Oasis';

const GoodColors: Array<Color> = ['Red', 'Blue', 'Green', 'Yellow', 'Purple']

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
	color: (Color | "Gray");
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
}

interface TileHits {
	tile: Tile,
	hits: number,
}

// lets just calculate every outcome and get the odds of each
export const getOdds = (camelState: CamelState, allDice: Die[]): OddsResult => {

	//hack to remove gray rolls since we don't know how to calculate
	const dice: GoodDie[] = allDice.filter((d) => d.color !== 'Gray') as GoodDie[];

	const camelWins: Record<Color, {first: number, second: number}> = {
		'Red': {first: 0, second: 0},
		'Blue': {first: 0, second: 0},
		'Green': {first: 0, second: 0},
		'Purple': {first: 0, second: 0},
		'Yellow': {first: 0, second: 0},
	};

	const tileHits = camelState.tiles.map((t, i) => ({tile: t, hits: 0}));

	// having all possible timelines in memory at once may be a burdon - look into streaming.
	const permutations = permute(dice);
	const timelines: DieRoll[][] = [];

	// populate all timelines
	permutations.forEach((permutation) => {
		interface RollNode extends DieRoll {
			nextRolls: RollNode[];
		}
		const addDieRolls = (index: number, previousRolls?: RollNode[]) => {
			if (index >= permutation.length) {
				return [];
			}

			const die = permutation[index];

			const rollValues: Roll[] = [
				1, 2, 3,
			];
			
			const rolls: RollNode[] = rollValues.map((n: Roll) => ({				
				color: die.color,
				Roll: n,
				nextRolls: [],
			}));

			// graph will use references fyi, hopefully wont be an issue
			if (previousRolls) { 
				previousRolls.forEach((r) => r.nextRolls = rolls);
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
				timelines.push(clone);
			}
		};
		rollGraph.forEach((n) => traverse(n, []));		
	});

	timelines.forEach((t) => {
		const winners = simulateWinner(camelState, t);

		camelWins[winners.first].first = camelWins[winners.first].first + 1;
		camelWins[winners.second].second = camelWins[winners.second].second + 1;
		winners.tileHits.forEach((t, i) => {
			tileHits[i].hits = tileHits[i].hits + t.hits;
		})
	});

	const getBetValue = (firstOdds: number, secondOdds: number, betValue: number) => {
		const loseOdds = 1 - (firstOdds + secondOdds);
		return (firstOdds * betValue) + (secondOdds * 1) + (loseOdds * -1);
	};

	const oddsResult: OddsResult =  {
		camelOdds: 	(Object.keys(camelWins) as Array<Color>).map((k) => {
			const wins = camelWins[k];
			const firstOdds = wins.first / timelines.length;
			const secondOdds = wins.second / timelines.length;
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
	};
	tileHits.forEach(t => {
		if(t.tile.hazard){
			switch(t.tile.hazard){
				case 'Desert':
					oddsResult.desertHit.push(t.hits / timelines.length);
					break;
				case 'Oasis':
					oddsResult.oasisHits.push(t.hits / timelines.length);
					break;
			}
		}
	});

	return oddsResult;

};

export const simulateWinner = (camelState: CamelState, timeLine: DieRoll[]): {
	first: Color, second: Color, tileHits: TileHits[] 
}  => {
	const cloneState: CamelState = {
		tiles: [...camelState.tiles.map((t) => ({camels: [...t.camels], hazard: t.hazard}))],
	};

	const tileHits = camelState.tiles.map((t, i) => ({tile: t, hits: 0}));
	// update the state after each die roll in the timeline
	timeLine.forEach((roll) => {

		const hitIndex = moveCamelUnit(cloneState, roll);
		if(hitIndex < tileHits.length){
			tileHits[hitIndex].hits++;
		}
	});

	const winners: Color[] = [];

	// get the end of round first and second place camel
	for (let t = cloneState.tiles.length - 1; t >= 0; t--) {
		const tile = cloneState.tiles[t];

		//Typescript, please don't make me do this
		const goodCamels: Color[] = tile.camels.filter(c => GoodColors.includes(c as Color)) as Color[];
		for (let c = goodCamels.length - 1; c >= 0; c--) {
			winners.push(goodCamels[c]);
			if (winners.length === 2) {
				return {
					first: winners[0], 
					second: winners[1],
					tileHits,
				};
			}
		}
	}
	throw Error('this code should not be reached');
};

// update the camel state based on the DieRoll
// returns the destination index ignoring the special hazard movement
export const moveCamelUnit = (camelState: CamelState, dieRoll: DieRoll): number => {
	const tileIndex = camelState.tiles.findIndex((t) => t.camels.indexOf(dieRoll.color) > -1);
	const tile = camelState.tiles[tileIndex];

	// getting and removing the camel unit
	const camelUnit = tile.camels.splice(tile.camels.indexOf(dieRoll.color));

	const placeCamelsAtTile = (camels: (Color | ChaosColor)[], tile: Tile) => {
		camels.forEach((c) => {
			tile.camels.push(c);
		});
	}
	const isChaos = dieRoll.color === 'White' || dieRoll.color === 'Black';
	const moveIndex = (start: number, spacesAway: number) => {
		return isChaos ? start - spacesAway : start + spacesAway;
	}
	const destinationIndex = moveIndex(tileIndex, dieRoll.Roll);

	const destinationTile = camelState.tiles[destinationIndex];
	if(destinationTile.hazard === 'Desert'){
		const specialDestination = camelState.tiles[moveIndex(destinationIndex, -1)];

		// make sure that the moving camel unit is placed under the other camels
		const otherCamels = specialDestination.camels;
		specialDestination.camels = [];
		
		placeCamelsAtTile(camelUnit, specialDestination);
		placeCamelsAtTile(otherCamels, specialDestination);

	} else if(destinationTile.hazard === 'Oasis'){
		const specialDestinationIndex = moveIndex(destinationIndex, -1);
		
		const specialDestination = camelState.tiles[specialDestinationIndex];
		placeCamelsAtTile(camelUnit, specialDestination);

	} else {
		placeCamelsAtTile(camelUnit, destinationTile);
	}
	return destinationIndex;
};

export const generateInitialState = (): CamelState => {
	const dice: Die[] = [{color:'Red'}, {color:'Green'},{color:'Purple'},{color:'Blue'},{color:'Yellow'}];

	const camelState: CamelState = {tiles:[]};
	for(let i = 0; i < 19; i++){
		camelState.tiles.push({camels: []});
	}
	camelState.tiles[14].camels.push('White');
	camelState.tiles[15].camels.push('Black');
	while(dice.length) {
		const dieRoll = getRandomRoll(dice);
		camelState.tiles[dieRoll.Roll - 1].camels.push(dieRoll.color);
	}
	return camelState;
};

// note: this will actually modify the dice array in the parameter
export const getRandomRoll = (dice: Die[]): DieRoll => {

	const dieIndex = Math.floor(Math.random() * (dice.length));
	const die = dice.splice(dieIndex, 1)[0];
	const rollNumber = Math.floor(Math.random() * 3) + 1
	
	if(die.color === "Gray"){
		const color = Math.random() > .5 ? "White" : "Black";
		return {color, Roll: rollNumber as Roll};
	}

	return {color: die.color, Roll: rollNumber as Roll};
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
