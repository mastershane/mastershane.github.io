import React from "react";
import { CamelState, ChaosColor, Color, Hazard, Tile, TRACK_LENGTH } from "./camel";
import { colorClass, DEFAULT_RULES, displayName, Rules } from "./rules";

interface Props {
  state: CamelState;
  // called when a space on the track (0 based index) is clicked
  onSpaceClick?: (index: number) => void;
  rules?: Rules;
}

const hazardLabel: Record<Hazard, { icon: string; text: string }> = {
  Oasis: { icon: "🌴", text: "+1" },
  Desert: { icon: "🏜️", text: "−1" },
};

const CamelStack = ({ camels, rules }: { camels: Array<Color | ChaosColor>; rules: Rules }) => (
  // the last camel in the array is on top of the stack
  <div className="camel-stack">
    {camels.map((c) => (
      <div
        key={c}
        className={`camel ${colorClass(c, rules)}`}
        title={displayName(c, rules)}
        aria-label={displayName(c, rules)}
      />
    ))}
  </div>
);

export const Track = ({ state, onSpaceClick, rules = DEFAULT_RULES }: Props) => {
  const spaces: Tile[] = [];
  for (let i = 0; i < TRACK_LENGTH; i++) {
    spaces.push(state.tiles[i] ?? { camels: [] });
  }
  const finished = state.tiles.slice(TRACK_LENGTH).flatMap((t) => t.camels);

  return (
    <div className="track" role="list" aria-label="Race track">
      {spaces.map((tile, i) => {
        const hazard = tile.hazard ? hazardLabel[tile.hazard] : undefined;
        const title = tile.hazard
          ? `Space ${i + 1}: ${tile.hazard} (${hazard!.text}). Click to change.`
          : tile.camels.length
          ? `Space ${i + 1}`
          : `Space ${i + 1}: click to add an oasis or desert`;
        return (
          <button
            type="button"
            role="listitem"
            key={i}
            className={`space${tile.hazard ? " space-" + tile.hazard.toLowerCase() : ""}`}
            title={title}
            onClick={() => onSpaceClick?.(i)}
          >
            <span className="space-number">{i + 1}</span>
            {hazard && (
              <span className="hazard">
                <span className="hazard-icon">{hazard.icon}</span>
                {hazard.text}
              </span>
            )}
            <CamelStack camels={tile.camels} rules={rules} />
          </button>
        );
      })}
      <div className="space space-finish" role="listitem" title="Finish line">
        <span className="space-number">🏁</span>
        <CamelStack camels={finished} rules={rules} />
      </div>
    </div>
  );
};

export const DiceChips = ({ dice, rules = DEFAULT_RULES }: { dice: Array<Color | "Gray">; rules?: Rules }) => (
  <div className="dice-chips" aria-label="Dice left in the pyramid">
    {dice.map((d, i) => (
      <span key={i} className={`die ${colorClass(d, rules)}`} title={`${displayName(d, rules)} die`} />
    ))}
    {dice.length === 0 && <span className="text-muted">none</span>}
  </div>
);
