import React from 'react';
import { OddsResult } from "./camel"


function getBgColor(value: number) {
	var r, g, b = 0;
	if(value < 1) {
		r = 255;
		g = Math.round(255 * ((value * .5) + -.5));
	}
    else if(value <=3){
        g = 255;
        r = Math.round(255 - 85 * value);
    }
    else {
        g = 255;
		r = 0
    }

	var h = r * 0x10000 + g * 0x100 + b * 0x1;
	return '#' + ('000000' + h.toString(16)).slice(-6);
}

interface Props {
    results: OddsResult
}

export const Results = ({ results }: Props) => {
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
                        <th scope="row">{r.camel}</th>
                        <td style={{backgroundColor: getBgColor(r.fiveValue)}}>{+r.fiveValue.toFixed(3)}</td>
                        <td style={{backgroundColor: getBgColor(r.threeValue)}}>{+r.threeValue.toFixed(3)}</td>
                        <td style={{backgroundColor: getBgColor(r.twoValue)}}>{+r.twoValue.toFixed(3)}</td>
                        <td>{+r.firstPlaceOdds.toFixed(3)}</td>
                        <td>{+r.secondPlaceOdds.toFixed(3)}</td>
                    </tr>
                )}
            </tbody>
        </table>
        {results.desertHit.map((d, i) =>
            <div>Desert {i + 1} value: {+d.toFixed(3)}</div>
        )}
        {results.oasisHits.map((o, i) =>
            <div>Oasis {i + 1} value: {+o.toFixed(3)}</div>
        )}
    </>;
}