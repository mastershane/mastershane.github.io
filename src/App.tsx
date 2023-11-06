import React, { useState } from 'react';
import './App.css';
import { colorToCode, parseCamel, parseDice, toCamelCode } from './camel-parser'
import { ChaosColor, Color, DieRoll, generateInitialState, getOdds, moveCamelUnit, OddsResult, Roll } from './camel'
import { Results } from './results';


const initialDice = "rguypc" ;
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
    diceInput: initialDice
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
      const color = selectedOption[0] as Color | ChaosColor;
      const dieRoll: DieRoll = {
        color: color,
        Roll: parseInt(selectedOption[1]) as Roll,
      }
      const camelState = parseCamel(state.boardInput);
      moveCamelUnit(camelState, dieRoll);
  
      const dieColor = color === 'Black' || color === 'White' ? 'Gray' : color;
      let remainingDice = state.diceInput.replace(colorToCode(dieColor), '');
      
      // if there is only one die left, reset the board and remove all hazards
      if(remainingDice.length <= 1){
        remainingDice = initialDice;
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
      <h1>🐪 The Camelculator 🐪</h1>
      <h3>Camel (C)up Calculator</h3>
      <p>Enter a game state using camel code. Separate spaces with a ",". Camels stack so that the right most camel will be on top. Example: rw,,o,gby</p>
      <h3>Key:</h3>
      <ul>
        <li>r: Red Camel</li>
        <li>g: Green Camel</li>
        <li>u: Blue Camel</li>
        <li>p: Purple Camel</li>
        <li>y: Yellow Camel</li>
        <li>d: Desert</li>
        <li>o: Oasis</li>
      </ul>
      <p>Mulitple spaces can be inputted as a number (e.g. ,5,)</p>
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
            {parseDice(state.diceInput).map(d => {
              const renderForColor = (color: Color | ChaosColor) => {
                return ( 
                  <optgroup key={color} label={color}>
                    <option value={color + '_1'}>{color + ' 1'}</option>
                    <option value={color + '_2'}>{color + ' 2'}</option>
                    <option value={color + '_3'}>{color + ' 3'}</option>
                  </optgroup>
                  );
              };
              if(d.color === 'Gray'){
                return [
                  renderForColor("Black"),
                  renderForColor("White"),
                ]
              }
              return renderForColor(d.color);
            }

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
      {state.results && <Results results={state.results}/>}
    </div>
  );
}

export default App;


