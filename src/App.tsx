import React, { useState } from 'react';
import './App.css';
import { parseCamel, parseDice } from './camel-parser'
import { CamelOdds, getOdds } from './camel'

interface IState {
  boardInput: string;
  diceInput: string;
  results?: CamelOdds[];
}
function App() {

  const [state, setState] = useState<IState>({ boardInput: "", diceInput: "rgbyw" });

  const calculate = () => {
    const camelState = parseCamel(state.boardInput);
    const dice = parseDice(state.diceInput);
    const results = getOdds(camelState, dice);
    setState({...state, results})
  }

  return (
    <div className="container">
      <h1>Cameluculator</h1>
      <p>Enter a game state using camel code. Separate spaces with a ",". Camels stack so that the right most camel will be on top. Example: rw,,o,gby</p>
      <h3>Key:</h3>
      <ul>
        <li>r: Red Camel</li>
        <li>g: Green Camel</li>
        <li>w: White Camel</li>
        <li>b: Blue Camel</li>
        <li>y: Yellow Camel</li>
        <li>d: Desert</li>
        <li>o: Oasis</li>
      </ul>
      <form onSubmit={(e) => {calculate(); e.preventDefault();}}>
        <div className="form-group">
          <label className="form-label" htmlFor="camel-code">Camel Code </label>
          <input className="form-control" type="text" id="camel-code" spellCheck="false" value={state.boardInput} onChange={(e) => setState({...state, boardInput: e.target.value})} />
        </div>
        <div className="form-group">  
          <label htmlFor="dice">Remaining Dice </label>
          <input className="form-control" type="text" id="dice" spellCheck="false" value={state.diceInput} onChange={(e) => setState({...state, diceInput: e.target.value})} /> 
        </div>
        <br />
        <input className="btn btn-primary" type="submit" value="Calculate!"/>
      </form>
      <br />
      {state.results &&
        <table className="table table-bordered">
          <tr>
            <th>Camel</th>
            <th>Five Value</th>
            <th>Three Value</th>
            <th>Two Value</th>
            <th>First Place Odds</th>
            <th>Second Place Odds</th>
          </tr>
          {state.results.map(r => 
              <tr key={r.camel}>
              <th scope="row">{r.camel}</th>
              <td>{r.fiveValue.toFixed(3)}</td>
              <td>{r.threeValue.toFixed(3)}</td>
              <td>{r.twoValue.toFixed(3)}</td>
              <td>{r.firstPlaceOdds.toFixed(3)}</td>
              <td>{r.secondPlaceOdds.toFixed(3)}</td>
            </tr>
          )}
        </table>
      }
    </div>
  );
}

export default App;


