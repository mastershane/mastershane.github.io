
export type Color = 'Red' | 'Blue' | 'Green' | 'White' | 'Yellow';
export type Roll = 1 | 2 | 3;
// tslint:disable: interface-name
export interface Camel {
	color: Color;
}

export interface Tile {
	camels: Color[];
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
	color: Color;
}

export interface DieRoll extends Die {
	Roll: Roll;
}

export interface Map<T> {
	[K: string]: T;
}

// lets just calculate every outcome and get the odds of each
export const getOdds = (camelState: CamelState, dice: Die[]): CamelOdds[] => {

	const camelWins: Map<{first: number, second: number}> = {
		'Red': {first: 0, second: 0},
		'Blue': {first: 0, second: 0},
		'Green': {first: 0, second: 0},
		'White': {first: 0, second: 0},
		'Yellow': {first: 0, second: 0},
	};

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
				1 , 2, 3,
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
	});

	const getBetValue = (firstOdds: number, secondOdds: number, betValue: number) => {
		const loseOdds = 1 - (firstOdds + secondOdds);
		return (firstOdds * betValue) + (secondOdds * 1) + (loseOdds * -1);
	};

	return Object.keys(camelWins).map((k) => {
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
		} ;
		return camelOdds;
	});
};

// need to account for deserts and stuff like that on the camel state
export const simulateWinner = (camelState: CamelState, timeLine: DieRoll[]): {first: Color, second: Color }  => {
	const clone: CamelState = {
		tiles: [...camelState.tiles.map((t) => ({camels: [...t.camels]}))],
	};

	const moveCamelUnit = (dieRoll: DieRoll) => {
		const tileIndex = clone.tiles.findIndex((t) => t.camels.indexOf(dieRoll.color) > -1);
		const tile = clone.tiles[tileIndex];

		// getting and removing the camel unit
		const camelUnit = tile.camels.splice(tile.camels.indexOf(dieRoll.color));

		const destinationIndex = tileIndex + dieRoll.Roll;

		// making sure that tiles in front exist in the array
		if (destinationIndex >= clone.tiles.length) {
			for (let i = clone.tiles.length - 1; i < destinationIndex; i++) {
				clone.tiles.push({camels: []});
			}
		}

		// move each camel in the unit (preserving vertical order)
		camelUnit.forEach((c) => {
			clone.tiles[destinationIndex].camels.push(c);
		});		
	};

	timeLine.forEach((roll) => {
		moveCamelUnit(roll);
	});

	const winners: Color[] = [];

	for (let t = clone.tiles.length - 1; t >= 0; t--) {
		const tile = clone.tiles[t];
		for (let c = tile.camels.length - 1; c >= 0; c--) {
			winners.push(tile.camels[c]);
			if (winners.length === 2) {
				return {
					first: winners[0], 
					second: winners[1],
				};
			}
		}
	}
	throw Error('this code should not be reached');
};

function permute<T>(permutation: T[]) {
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

const sampleCamelState: CamelState = {
	tiles: [
		{camels: ['Blue']},
		{camels: ['Red', 'Green']},
		{camels: ['Yellow', 'White']},
	],
};

export const testOdds = () => {
	const oddsResult = getOdds(sampleCamelState, [
		{color: 'Green'}, 
		{color: 'White'}, 
		{color: 'Red'}, 
		{color: 'Blue'}, 
		{color: 'Yellow'},
	]);
	const output = JSON.stringify(oddsResult, null, '\t');
	// tslint:disable-next-line: no-console
	console.log(output);
};

