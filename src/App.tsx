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
    <div className="App">
      <h1>Cameluculator</h1>
      <p>Enter a game state using camel code. Separate spaces with a "," and camels stack so that the right most camel will be on top.</p>
      <h3>Key:</h3>
      <ul>
        <li>r: Red Camel</li>
        <li>g: Green Camel</li>
        <li>w: White Camel</li>
        <li>b: Blue Camel</li>
        <li>y: Yellow Camel</li>
        {/* <li>d: Desert</li>
        <li>o: Oasis</li> */}
      </ul>
      <form onSubmit={(e) => {calculate(); e.preventDefault();}}>
        <label>
          Camel Code
          <input type="text" value={state.boardInput} onChange={(e) => setState({...state, boardInput: e.target.value})} />
        </label>
        <br />
        <label>
          Remaining Dice
          <input type="text" value={state.diceInput} onChange={(e) => setState({...state, diceInput: e.target.value})} />
        </label>
        <br />
        <input type="submit" value="Calculate!"/>
        {state.results &&
          <table>
            <tr>
              <th>Camel</th>
              <th>Five Value</th>
              <th>Three Value</th>
              <th>Two Value</th>
              <th>First Place Odds</th>
              <th>Second Place Odds</th>
            </tr>
            {state.results.map(r => 
               <tr>
                <td>{r.camel}</td>
                <td>{r.fiveValue.toFixed(3)}</td>
                <td>{r.threeValue.toFixed(3)}</td>
                <td>{r.twoValue.toFixed(3)}</td>
                <td>{r.firstPlaceOdds.toFixed(3)}</td>
                <td>{r.secondPlaceOdds.toFixed(3)}</td>
              </tr>
            )}
          </table>
        }
      </form>
    </div>
  );
}

export default App;


