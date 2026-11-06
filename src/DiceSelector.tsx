import React, { useState } from "react";

export interface DieChoice {
  label: string;
  onSelect: () => void;
}

export interface DieChoiceGroup {
  // optional label for the group, e.g. "Black" for the gray die
  label?: string;
  swatch?: string;
  choices: DieChoice[];
}

export interface DieOption {
  key: string;
  name: string;
  // css class used to color the die
  swatch: string;
  groups: DieChoiceGroup[];
}

interface Props {
  dice: DieOption[];
  prompt: string;
}

// Click a die, then click the number it rolled.
export const DiceSelector = ({ dice, prompt }: Props) => {
  const [selectedKey, setSelectedKey] = useState<string | undefined>();
  const selected = dice.find((d) => d.key === selectedKey);

  return (
    <div className="dice-selector">
      <div className="dice-selector-prompt">{prompt}</div>
      <div className="dice-selector-dice">
        {dice.map((d) => (
          <button
            type="button"
            key={d.key}
            className={`die-button${d.key === selectedKey ? " selected" : ""}`}
            aria-pressed={d.key === selectedKey}
            onClick={() => setSelectedKey(d.key === selectedKey ? undefined : d.key)}
          >
            <span className={`die-face ${d.swatch}`} />
            <span className="die-button-name">{d.name}</span>
          </button>
        ))}
      </div>
      {selected && (
        <div className="dice-selector-rolls">
          {selected.groups.map((g, i) => (
            <div className="roll-group" key={i}>
              {g.label && (
                <span className="roll-group-label">
                  {g.swatch && <span className={`die ${g.swatch}`} />}
                  {g.label}
                </span>
              )}
              {g.choices.map((c) => (
                <button
                  type="button"
                  key={c.label}
                  className="btn btn-outline-dark roll-button"
                  onClick={() => {
                    setSelectedKey(undefined);
                    c.onSelect();
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
