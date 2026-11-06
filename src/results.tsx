import React from 'react';
import { OddsResult } from "./camel"
import { DEFAULT_RULES, displayName, Rules } from "./rules"


// Background color for an expected value: red at -1 (always lose the bet),
// yellow at 0 (break even) and green at 3 or more.
export function getBgColor(value: number) {
    const v = Math.min(3, Math.max(-1, Number.isFinite(value) ? value : 0));
    const red = v <= 0 ? 255 : Math.round(255 * (1 - v / 3));
    const green = v >= 0 ? 255 : Math.round(255 * (v + 1));
    return `rgb(${red}, ${green}, 0)`;
}

interface Props {
    results: OddsResult
    rules?: Rules
}

export const Results = ({ results, rules = DEFAULT_RULES }: Props) => {
    return <>
        <table className="table table-bordered">
            <thead>
                <tr>
                    <th>Camel</th>
                    <th>Five Value</th>
                    <th>Three Value</th>
                    <th>Two Value</th>
                    <th>First Place Odds</th>
                    <th>Second Place Odds</th>
                </tr>
            </thead>
            <tbody>
                {results.camelOdds.map(r =>
                    <tr key={r.camel}>
                        <th scope="row">{displayName(r.camel, rules)}</th>
                        <td style={{backgroundColor: getBgColor(r.fiveValue)}}>{+r.fiveValue.toFixed(3)}</td>
                        <td style={{backgroundColor: getBgColor(r.threeValue)}}>{+r.threeValue.toFixed(3)}</td>
                        <td style={{backgroundColor: getBgColor(r.twoValue)}}>{+r.twoValue.toFixed(3)}</td>
                        <td>{+r.firstPlaceOdds.toFixed(3)}</td>
                        <td>{+r.secondPlaceOdds.toFixed(3)}</td>
                    </tr>
                )}
            </tbody>
        </table>
        {results.gameEndOdds > 0 &&
            <div>Odds the game ends this leg: {+(results.gameEndOdds * 100).toFixed(1)}%</div>
        }
        {results.desertHit.map((d, i) =>
            <div>Desert {i + 1} value: {+d.toFixed(3)}</div>
        )}
        {results.oasisHits.map((o, i) =>
            <div>Oasis {i + 1} value: {+o.toFixed(3)}</div>
        )}
    </>;
}