import React, { useState } from 'react';
import './App.css';
import { colorToCode, parseCamel, parseDice, toCamelCode } from './camel-parser'
import { CamelState, ChaosColor, Color, DieRoll, generateInitialState, getOdds, moveCamelUnit, OddsResult, Roll } from './camel'
import { Results } from './results';
import { Visualizer } from './Visualizer';
import { DEFAULT_SIMULATIONS, getLongTermOdds, LongTermResult } from './long-term';
import { LongTermResults } from './long-term-results';


const initialDice = "rguypc" ;
interface IState {
  boardInput: string;
  diceInput: string;
  results?: OddsResult;
  longTermResults?: LongTermResult;
  simulations: string;
  error?: string;
}
function App() {

  // create a random initial state will all dice remaining
  const [state, setState] = useState<IState>({ 
    boardInput: toCamelCode(generateInitialState()), 
    diceInput: initialDice,
    simulations: String(DEFAULT_SIMULATIONS),
  });

  const runLongTerm = (camelState: CamelState, dice: ReturnType<typeof parseDice>) => {
    const simulations = parseInt(state.simulations);
    return getLongTermOdds(camelState, dice, simulations > 0 ? simulations : DEFAULT_SIMULATIONS);
  };

  const [camelState, setCamelState] = useState<CamelState | undefined>()

  const calculate = () => {
    try {
      const camelState = parseCamel(state.boardInput);
      const dice = parseDice(state.diceInput);
      const results = getOdds(camelState, dice);
      const longTermResults = runLongTerm(camelState, dice);
      setState({...state, results, longTermResults, error: undefined})
      setCamelState(camelState);
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
      const longTermResults = runLongTerm(camelState, dice);
      setState({...state, boardInput: toCamelCode(camelState), diceInput: remainingDice, results, longTermResults, error: undefined});
      setCamelState(camelState);

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
        <li>w: White Camel</li>
        <li>b: Black Camel</li>
        <li>c: Gray die (rolls for black or white)</li>
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
        <div className="form-group">
          <label htmlFor="simulations">Long Term Simulations </label>
          <input className="form-control" type="number" min="1" id="simulations" value={state.simulations} onChange={(e) => setState({...state, simulations: e.target.value})} />
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
      {state.results && <><h3>Leg Bets</h3><Results results={state.results}/></>}
      <br />
      {state.longTermResults && <><h3>Long Term Bets</h3><LongTermResults results={state.longTermResults}/></>}
      <br />
      {camelState && <Visualizer state={camelState} />}
      
    </div>
  );
}

export default App;


