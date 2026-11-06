import React, { useState } from 'react';
import './App.css';
import { colorToCode, parseCamel, parseDice, toCamelCode } from './camel-parser'
import { CamelState, ChaosColor, Color, DieRoll, generateInitialState, getOdds, hasFinished, moveCamelUnit, OddsResult, Roll } from './camel'
import { Results } from './results';
import { DiceChips, Track } from './Track';
import { toggleHazard } from './hazards';
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
  tileError?: string;
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

  const computeResults = (boardInput: string, diceInput: string) => {
    const dice = parseDice(diceInput);
    return {
      results: getOdds(parseCamel(boardInput), dice),
      longTermResults: runLongTerm(parseCamel(boardInput), dice),
    };
  };

  const calculate = () => {
    try {
      setState({...state, ...computeResults(state.boardInput, state.diceInput), error: undefined, tileError: undefined});
    } catch (e) {
      setState({...state, error: 'Error made during calculation'});
      console.log(e);
    }
  };

  // the track is drawn from whatever is in the camel code box
  let trackState: CamelState | undefined;
  try {
    trackState = parseCamel(state.boardInput);
  } catch {
    trackState = undefined;
  }

  const onSpaceClick = (index: number) => {
    if (!trackState) {
      return;
    }
    const toggled = toggleHazard(trackState, index);
    if ('error' in toggled) {
      setState({...state, tileError: toggled.error});
      return;
    }
    const boardInput = toCamelCode(toggled.state);
    // keep the odds in sync with the board if they were already calculated
    if (state.results) {
      try {
        setState({...state, boardInput, ...computeResults(boardInput, state.diceInput), error: undefined, tileError: undefined});
        return;
      } catch (e) {
        console.log(e);
      }
    }
    setState({...state, boardInput, tileError: undefined});
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
      setState({...state, boardInput: toCamelCode(camelState), diceInput: remainingDice, results, longTermResults, error: undefined, tileError: undefined});

    } catch(e) {
      setState({...state, error: 'Error made during calculation'});
      console.log(e);
    }
  };

  let diceColors: ReturnType<typeof parseDice> = [];
  try {
    diceColors = parseDice(state.diceInput).filter(d => d.color);
  } catch {
    diceColors = [];
  }

  return (
    <div className="container">
      <h1 className="app-title">🐪 The Camelculator 🐪</h1>
      <p className="app-subtitle">Camel (C)up Calculator</p>

      <section className="track-panel">
        {trackState
          ? <Track state={trackState} onSpaceClick={onSpaceClick} />
          : <div className="alert alert-warning">The camel code can't be read, so the track can't be drawn.</div>
        }
        <div className="track-footer">
          <span className="text-muted">Click an empty space to add an oasis 🌴 (+1). Click again for a desert 🏜️ (−1), and again to remove it.</span>
          <span className="dice-left">Dice left: <DiceChips dice={diceColors.map(d => d.color)} /></span>
        </div>
        {state.tileError && <div className="tile-error text-danger">{state.tileError}</div>}
      </section>

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
      <details className="help">
        <summary>How to write camel code</summary>
        <p>Separate spaces with a ",". Camels stack so that the right most camel will be on top. Example: rw,,o,gby. Multiple empty spaces can be written as a number (e.g. ,5,).</p>
        <ul>
          <li>r: Red Camel</li>
          <li>g: Green Camel</li>
          <li>u: Blue Camel</li>
          <li>p: Purple Camel</li>
          <li>y: Yellow Camel</li>
          <li>w: White Camel</li>
          <li>b: Black Camel</li>
          <li>c: Gray die (rolls for black or white; if only one of them is carrying racing camels, or one is directly on top of the other, that one moves instead)</li>
          <li>d: Desert (−1, camels go underneath)</li>
          <li>o: Oasis (+1, camels go on top)</li>
        </ul>
      </details>
      <br />
      {state.error && 
        <div className="alert alert-danger" role="alert">
          {state.error}
        </div>
      }
      {trackState && hasFinished(trackState) &&
        <div className="alert alert-success" role="alert">
          A camel has crossed the finish line. The game is over!
        </div>
      }
      {state.results && <><h3>Leg Bets</h3><Results results={state.results}/></>}
      <br />
      {state.longTermResults && <><h3>Long Term Bets</h3><LongTermResults results={state.longTermResults}/></>}
    </div>
  );
}

export default App;


