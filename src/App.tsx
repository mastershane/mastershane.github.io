import React, { useState } from 'react';
import './App.css';
import { parseCamel, parseDice, toCamelCode } from './camel-parser'
import {
  CamelState, ChaosColor, CHAOS_COLORS, Color, DieRoll, generateInitialState, GoodColors,
  hasFinished, placeStartingCamel, Roll,
} from './camel'
import { Results } from './results';
import { DiceChips, Track } from './Track';
import { toggleHazard } from './hazards';
import { DEFAULT_SIMULATIONS } from './long-term';
import { LongTermResults } from './long-term-results';
import { DieChoiceGroup, DieOption, DiceSelector } from './DiceSelector';
import { useOdds } from './useOdds';
import { Edition, RULES, Rules } from './rules';
import { applyRoll as applyGameRoll, finishLeg, RollOutcome } from './game';

const EDITION_KEY = 'camelculator-edition';

// remember which edition the viewer plays; storage may be unavailable
const loadEdition = (): Edition => {
  try {
    const saved = window.localStorage.getItem(EDITION_KEY);
    return saved === 'v1' || saved === 'v2' ? saved : 'v2';
  } catch {
    return 'v2';
  }
};

const saveEdition = (edition: Edition) => {
  try {
    window.localStorage.setItem(EDITION_KEY, edition);
  } catch {
    // ignore
  }
};
const ROLLS: Roll[] = [1, 2, 3];

type Phase = 'setup' | 'playing';

interface IState {
  phase: Phase;
  // during setup: whether the "pick dice and numbers" selector is open
  manualSetup: boolean;
  boardInput: string;
  diceInput: string;
  simulations: string;
  error?: string;
  tileError?: string;
  notice?: string;
}

const newGameState = (simulations: string, rules: Rules): IState => ({
  phase: 'setup',
  manualSetup: false,
  boardInput: '',
  diceInput: rules.pyramid,
  simulations,
});

const swatch = (color: string) => `camel-${color.toLowerCase()}`;

function App() {
  const [edition, setEdition] = useState<Edition>(loadEdition);
  const rules = RULES[edition];
  const [state, setState] = useState<IState>(() => newGameState(String(DEFAULT_SIMULATIONS), RULES[loadEdition()]));

  // odds are calculated in the background so the board updates right away
  const { odds, request: requestOdds, clear: clearOdds } = useOdds();
  const recalculate = (boardInput: string, diceInput: string) =>
    requestOdds(boardInput, diceInput, parseInt(state.simulations), edition);

  const newGame = (manualSetup = false, gameRules: Rules = rules) => {
    clearOdds();
    setState({...newGameState(state.simulations, gameRules), manualSetup});
  };

  // the camels and dice differ between editions, so switching starts a new game
  const changeEdition = (next: Edition) => {
    if (next === edition) {
      return;
    }
    setEdition(next);
    saveEdition(next);
    newGame(false, RULES[next]);
  };

  // start playing from the given board with a full pyramid
  const startGame = (boardInput: string) => {
    setState({
      ...state, phase: 'playing', manualSetup: false, boardInput, diceInput: rules.pyramid,
      error: undefined, tileError: undefined, notice: undefined,
    });
    recalculate(boardInput, rules.pyramid);
  };

  const calculate = () => {
    setState({...state, phase: 'playing', manualSetup: false, error: undefined, tileError: undefined});
    recalculate(state.boardInput, state.diceInput);
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
    setState({...state, boardInput, tileError: undefined});
    // keep the odds in sync with the board once the game is being played
    if (state.phase === 'playing') {
      recalculate(boardInput, state.diceInput);
    }
  };

  const LEG_OVER = 'The leg is over. All dice are back in the pyramid and the desert / oasis tiles were removed.';

  const showOutcome = (outcome: RollOutcome, notice?: string) => {
    setState({...state, boardInput: outcome.boardInput, diceInput: outcome.diceInput, error: undefined, tileError: undefined, notice});
    recalculate(outcome.boardInput, outcome.diceInput);
  };

  const applyRoll = (dieRoll: DieRoll) => {
    try {
      const outcome = applyGameRoll(state.boardInput, state.diceInput, dieRoll, rules);
      showOutcome(outcome, outcome.legEnded ? LEG_OVER : undefined);
    } catch (e) {
      setState({...state, error: 'Error made during calculation'});
      console.log(e);
    }
  };

  // roll the rest of the dice in the pyramid randomly to finish the leg
  const nextRound = () => {
    try {
      const outcome = finishLeg(state.boardInput, state.diceInput, Math.random, rules);
      const rolled = outcome.rolls.map(r => `${r.color} ${r.Roll}`).join(', ');
      const summary = rolled ? `Rolled ${rolled}.` : '';
      showOutcome(outcome, outcome.legEnded ? `${summary} ${LEG_OVER}`.trim() : summary || undefined);
    } catch (e) {
      setState({...state, error: 'Error made during calculation'});
      console.log(e);
    }
  };

  // camels that haven't been placed on the board yet during setup
  const unplacedCamels = (): Array<Color | ChaosColor> => {
    const onBoard = new Set((trackState?.tiles ?? []).flatMap(t => t.camels));
    return [...GoodColors, ...(rules.crazyCamels ? CHAOS_COLORS : [])].filter(c => !onBoard.has(c));
  };

  const placeSetupCamel = (color: Color | ChaosColor, roll: Roll) => {
    const board = placeStartingCamel(trackState ?? { tiles: [] }, color, roll);
    const boardInput = toCamelCode(board);
    if (unplacedCamels().length === 1) {
      // that was the last camel, so the game can start
      startGame(boardInput);
    } else {
      setState({...state, boardInput, error: undefined});
    }
  };

  const setupDice = (): DieOption[] => unplacedCamels().map(color => {
    const isChaos = color === 'Black' || color === 'White';
    return {
      key: color,
      name: color,
      swatch: swatch(color),
      groups: [{
        choices: ROLLS.map(roll => ({
          label: isChaos ? `${roll} (space ${17 - roll})` : `${roll}`,
          onSelect: () => placeSetupCamel(color, roll),
        })),
      }],
    };
  });

  const pyramidDice = (): DieOption[] => {
    let dice: ReturnType<typeof parseDice> = [];
    try {
      dice = parseDice(state.diceInput).filter(d => d.color);
    } catch {
      dice = [];
    }
    return dice.map(d => {
      const groupFor = (color: Color | ChaosColor, label?: string): DieChoiceGroup => ({
        label,
        swatch: label ? swatch(color) : undefined,
        choices: ROLLS.map(roll => ({
          label: `${roll}`,
          onSelect: () => applyRoll({ color, Roll: roll }),
        })),
      });
      return {
        key: d.color,
        name: d.color,
        swatch: swatch(d.color),
        groups: d.color === 'Gray'
          ? [groupFor('Black', 'Black'), groupFor('White', 'White')]
          : [groupFor(d.color)],
      };
    });
  };

  let diceColors: ReturnType<typeof parseDice> = [];
  try {
    diceColors = parseDice(state.diceInput).filter(d => d.color);
  } catch {
    diceColors = [];
  }

  const gameOver = state.phase === 'playing' && !!trackState && hasFinished(trackState);

  const renderSetup = () => {
    const remaining = unplacedCamels();
    const chaosLeft = remaining.filter(c => c === 'Black' || c === 'White').length;
    return (
      <section className="controls-panel">
        <h2 className="controls-title">Set up the board</h2>
        <p className="text-muted">Mirror the setup of your real game, or let the calculator roll the starting positions for you.</p>
        <div className="controls-buttons">
          <button type="button" className="btn btn-primary" onClick={() => startGame(toCamelCode(generateInitialState(Math.random, rules)))}>
            Roll automatically
          </button>
          <button
            type="button"
            className={`btn btn-outline-primary${state.manualSetup ? ' active' : ''}`}
            aria-pressed={state.manualSetup}
            onClick={() => setState({...state, manualSetup: !state.manualSetup})}
          >
            Pick dice and numbers
          </button>
          {state.boardInput && (
            <button type="button" className="btn btn-link" onClick={() => newGame(true)}>
              Clear board
            </button>
          )}
        </div>
        {state.manualSetup && (
          <>
            <DiceSelector
              dice={setupDice()}
              prompt={`Click a camel's die, then the number it rolled (${remaining.length} left).`}
            />
            {chaosLeft > 0 && (
              <p className="setup-hint text-muted">
                Crazy camels: the first gray roll places the camel it shows. The second gray roll
                places the other one, and only its number counts.
              </p>
            )}
          </>
        )}
      </section>
    );
  };

  const renderPlaying = () => (
    <section className="controls-panel">
      <div className="controls-header">
        <h2 className="controls-title">{gameOver ? 'Game over' : 'Next roll'}</h2>
        <div className="controls-buttons mb-0">
          {!gameOver && (
            <button type="button" className="btn btn-outline-primary btn-sm" onClick={nextRound} title="Roll the remaining dice automatically to finish this leg">
              Next round
            </button>
          )}
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => newGame()}>
            New game
          </button>
        </div>
      </div>
      {gameOver ? (
        <div className="alert alert-success mb-0" role="alert">
          A camel has crossed the finish line. The game is over!
        </div>
      ) : (
        <DiceSelector dice={pyramidDice()} prompt="Click the die that came out of the pyramid, then the number it rolled." />
      )}
      {state.notice && <div className="notice text-muted">{state.notice}</div>}
    </section>
  );

  return (
    <div className="container">
      <header className="app-header">
        <div>
          <h1 className="app-title">🐪 The Camelculator 🐪</h1>
          <p className="app-subtitle">Camel (C)up Calculator</p>
        </div>
        <div className="edition-toggle">
          <div className="btn-group" role="group" aria-label="Game version">
            {(['v1', 'v2'] as Edition[]).map(e => (
              <button
                key={e}
                type="button"
                className={`btn btn-outline-dark${edition === e ? ' active' : ''}`}
                aria-pressed={edition === e}
                onClick={() => changeEdition(e)}
              >
                {RULES[e].name}
              </button>
            ))}
          </div>
          <small className="text-muted">
            {rules.crazyCamels ? 'Crazy camels and gray die. ' : 'No crazy camels. All 5 dice rolled each leg. '}
            Switching starts a new game.
          </small>
        </div>
      </header>

      <section className="track-panel">
        {trackState
          ? <Track state={trackState} onSpaceClick={onSpaceClick} />
          : <div className="alert alert-warning">The camel code can't be read, so the track can't be drawn.</div>
        }
        <div className="track-footer">
          <span className="text-muted">Click an empty space to add an oasis 🌴 (+1). Click again for a desert 🏜️ (−1), and again to remove it.</span>
          {state.phase === 'playing' && (
            <span className="dice-left">Dice left: <DiceChips dice={diceColors.map(d => d.color)} /></span>
          )}
        </div>
        {state.tileError && <div className="tile-error text-danger">{state.tileError}</div>}
      </section>

      {state.phase === 'setup' ? renderSetup() : renderPlaying()}

      {(state.error || odds.error) &&
        <div className="alert alert-danger" role="alert">
          {state.error || odds.error}
        </div>
      }

      {state.phase === 'playing' && odds.calculating &&
        <div className="calculating" role="status">
          <span className="spinner-border spinner-border-sm" aria-hidden="true" /> Updating odds…
        </div>
      }
      <div className={odds.calculating ? 'results-stale' : undefined}>
        {state.phase === 'playing' && odds.results && <><h3>Leg Bets</h3><Results results={odds.results}/></>}
        {state.phase === 'playing' && odds.longTermResults && <><h3>Long Term Bets</h3><LongTermResults results={odds.longTermResults}/></>}
      </div>

      <details className="help">
        <summary>Edit the board with camel code</summary>
        <form className="camel-code-form" onSubmit={(e) => {calculate(); e.preventDefault();}}>
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
          <input className="btn btn-primary mt-2" type="submit" value="Calculate!"/>
        </form>
        <p>Separate spaces with a ",". Camels stack so that the right most camel will be on top. Example: rw,,o,gby. Multiple empty spaces can be written as a number (e.g. ,5,).</p>
        <ul>
          <li>r: Red Camel</li>
          <li>g: Green Camel</li>
          <li>u: Blue Camel</li>
          <li>p: Purple Camel</li>
          <li>y: Yellow Camel</li>
          {rules.crazyCamels && <>
            <li>w: White Camel</li>
            <li>b: Black Camel</li>
            <li>c: Gray die (rolls for black or white; if only one of them is carrying racing camels, or one is directly on top of the other, that one moves instead)</li>
          </>}
          <li>d: Desert (−1, camels go underneath)</li>
          <li>o: Oasis (+1, camels go on top)</li>
        </ul>
      </details>
    </div>
  );
}

export default App;
