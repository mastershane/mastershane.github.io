import { getOdds, OddsResult } from "./camel";
import { parseCamel, parseDice } from "./camel-parser";
import { DEFAULT_SIMULATIONS, getLongTermOdds, LongTermResult } from "./long-term";
import { Edition, RULES } from "./rules";

export interface OddsRequest {
  id: number;
  boardInput: string;
  diceInput: string;
  simulations: number;
  edition: Edition;
}

export type OddsResponse =
  | { id: number; results: OddsResult; longTermResults: LongTermResult }
  | { id: number; error: string };

// short term and long term odds for a board written in camel code
export const computeOdds = (request: OddsRequest): OddsResponse => {
  try {
    const dice = parseDice(request.diceInput);
    const rules = RULES[request.edition];
    const simulations = request.simulations > 0 ? request.simulations : DEFAULT_SIMULATIONS;
    return {
      id: request.id,
      results: getOdds(parseCamel(request.boardInput), dice, rules),
      longTermResults: getLongTermOdds(parseCamel(request.boardInput), dice, simulations, Math.random, rules),
    };
  } catch (e) {
    console.log(e);
    return { id: request.id, error: "Error made during calculation" };
  }
};
