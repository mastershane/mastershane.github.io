import React from "react";
import { LongTermResult, LONG_TERM_PAYOUTS } from "./long-term";
import { getBgColor } from "./results";
import { DEFAULT_RULES, displayName, Rules } from "./rules";

interface Props {
  results: LongTermResult;
  rules?: Rules;
}

const percent = (value: number) => `${(value * 100).toFixed(1)}%`;

export const LongTermResults = ({ results, rules = DEFAULT_RULES }: Props) => {
  const renderTable = (kind: "win" | "lose") => (
    <table className="table table-bordered">
      <thead>
        <tr>
          <th>Camel</th>
          <th>{kind === "win" ? "Win Odds" : "Lose Odds"}</th>
          {LONG_TERM_PAYOUTS.map((p) => (
            <th key={p}>{p} Value</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {results.camelOdds.map((r) => {
          const odds = kind === "win" ? r.winOdds : r.loseOdds;
          const error = kind === "win" ? r.winError : r.loseError;
          const values = kind === "win" ? r.winValues : r.loseValues;
          return (
            <tr key={r.camel}>
              <th scope="row">{displayName(r.camel, rules)}</th>
              <td>
                {percent(odds)} <small>± {percent(error * 2)}</small>
              </td>
              {values.map((v, i) => (
                <td key={i} style={{ backgroundColor: getBgColor(v) }}>
                  {+v.toFixed(2)}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  return (
    <>
      <h4>Overall Winner Bets</h4>
      {renderTable("win")}
      <h4>Overall Loser Bets</h4>
      {renderTable("lose")}
      <p>
        <small>
          Estimated from {results.simulations.toLocaleString()} simulated games
          (about {results.averageLegs.toFixed(1)} legs left on average). The ±
          is a 95% confidence range. Each "Value" column is the expected value
          if your bet is the 1st, 2nd, 3rd... correct bet on that camel.
        </small>
      </p>
    </>
  );
};
