import { getOdds, OddsResult } from "./camel";
import { parseCamel, parseDice } from "./camel-parser";
import { DEFAULT_SIMULATIONS, getLongTermOdds, LongTermResult } from "./long-term";

export interface OddsRequest {
  id: number;
  boardInput: string;
  diceInput: string;
  simulations: number;
}

export type OddsResponse =
  | { id: number; results: OddsResult; longTermResults: LongTermResult }
  | { id: number; error: string };

// short term and long term odds for a board written in camel code
export const computeOdds = (request: OddsRequest): OddsResponse => {
  try {
    const dice = parseDice(request.diceInput);
    const simulations = request.simulations > 0 ? request.simulations : DEFAULT_SIMULATIONS;
    return {
      id: request.id,
      results: getOdds(parseCamel(request.boardInput), dice),
      longTermResults: getLongTermOdds(parseCamel(request.boardInput), dice, simulations),
    };
  } catch (e) {
    console.log(e);
    return { id: request.id, error: "Error made during calculation" };
  }
};
