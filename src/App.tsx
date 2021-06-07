import React, { useState } from 'react';
import './App.css';
import { colorToCode, parseCamel, parseDice, toCamelCode } from './camel-parser'
import { Color, DieRoll, generateInitialState, getOdds, moveCamelUnit, OddsResult, Roll } from './camel'

interface IState {
  boardInput: string;
  diceInput: string;
  results?: OddsResult;
  error?: string;
}
function App() {

  // create a random initial state will all dice remaining
  const [state, setState] = useState<IState>({ 
    boardInput: toCamelCode(generateInitialState()), 
    diceInput: "rgbyw" 
  });

  const calculate = () => {
    try {
      const camelState = parseCamel(state.boardInput);
      const dice = parseDice(state.diceInput);
      const results = getOdds(camelState, dice);
      setState({...state, results, error: undefined})
    } catch (e) {
      setState({...state, error: 'Error made during calculation'});
      console.log(e);
    }
  };

  const selectNextRoll = (e: any) => {
    try {
      // option format is Color_Roll e.g. Red_1
      const selectedOption = e.target.value.split('_');
      const color = selectedOption[0] as Color;
      const dieRoll: DieRoll = {
        color: color,
        Roll: parseInt(selectedOption[1]) as Roll,
      }
      const camelState = parseCamel(state.boardInput);
      moveCamelUnit(camelState, dieRoll);

      let remainingDice = state.diceInput.replace(colorToCode(color), '');
      
      // if there are no remaining dice. Move to next round and clear the board;
      if(!remainingDice){
        remainingDice = 'rwgby';
        camelState.tiles.forEach(t => t.hazard = undefined);
      }

      const dice = parseDice(remainingDice);
      const results = getOdds(camelState, dice);
      setState({boardInput: toCamelCode(camelState), diceInput: remainingDice, results});

    } catch(e) {
      setState({...state, error: 'Error made during calculation'});
      console.log(e);
    }
  };

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
        {state.results && 
          <select className="form-select" onChange={selectNextRoll} value='_' style={{marginTop: '10px'}}>
            <option selected disabled value='_'>Select Next Roll</option>
            {parseDice(state.diceInput).map(d =>
              <optgroup label={d.color}>
                <option value={d.color + '_1'}>{d.color + ' 1'}</option>
                <option value={d.color + '_2'}>{d.color + ' 2'}</option>
                <option value={d.color + '_3'}>{d.color + ' 3'}</option>
              </optgroup>
            )}
          </select>
        }
      </form>
      <br />
      {state.error && 
        <div className="alert alert-danger" role="alert">
          {state.error}
        </div>
      }
      {state.results && <>
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
            {state.results.camelOdds.map(r => 
                <tr key={r.camel}>
                <th scope="row">{r.camel}</th>
                <td>{+r.fiveValue.toFixed(3)}</td>
                <td>{+r.threeValue.toFixed(3)}</td>
                <td>{+r.twoValue.toFixed(3)}</td>
                <td>{+r.firstPlaceOdds.toFixed(3)}</td>
                <td>{+r.secondPlaceOdds.toFixed(3)}</td>
              </tr>
            )}
          </tbody>
        </table>
        {state.results.desertHit.map((d, i) => 
          <div>Desert {i + 1} value: {+d.toFixed(3)}</div>
        )}
        {state.results.oasisHits.map((o, i) => 
          <div>Oasis {i + 1} value: {+o.toFixed(3)}</div>
        )}
      </>}
    </div>
  );
}

export default App;


