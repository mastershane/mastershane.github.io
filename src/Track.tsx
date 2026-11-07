import React, { useRef, useState } from "react";
import { CamelState, ChaosColor, Color, Hazard, Tile, TRACK_LENGTH } from "./camel";
import { CamelColor, canPlaceCamel } from "./edit";
import { colorClass, DEFAULT_RULES, displayName, Rules } from "./rules";

interface Props {
  state: CamelState;
  // called when a space on the track (0 based index) is clicked
  onSpaceClick?: (index: number) => void;
  rules?: Rules;
  // in edit mode camels can be dragged to any legal space and stack position
  editMode?: boolean;
  onMoveCamel?: (color: CamelColor, spaceIndex: number, stackIndex: number) => void;
}

const hazardLabel: Record<Hazard, { icon: string; text: string }> = {
  Oasis: { icon: "🌴", text: "+1" },
  Desert: { icon: "🏜️", text: "−1" },
};

// how far the pointer has to move before a press becomes a drag
const DRAG_THRESHOLD = 4;

interface Drag {
  color: CamelColor;
  pointerId: number;
  startX: number;
  startY: number;
  x: number;
  y: number;
  moved: boolean;
  // where the camel would be dropped, if that is legal
  target?: { spaceIndex: number; stackIndex: number; legal: boolean };
}

interface StackProps {
  camels: Array<Color | ChaosColor>;
  rules: Rules;
  editMode: boolean;
  dragging?: CamelColor;
  // stack position to show the drop marker at
  dropIndex?: number;
  onCamelPointerDown?: (color: CamelColor, e: React.PointerEvent) => void;
}

const CamelStack = ({ camels, rules, editMode, dragging, dropIndex, onCamelPointerDown }: StackProps) => {
  // the dragged camel is shown faded where it came from, and isn't counted
  // when working out the drop position
  const items: React.ReactNode[] = [];
  let position = 0;
  camels.forEach((c) => {
    const isDragged = c === dragging;
    if (!isDragged) {
      if (dropIndex === position) {
        items.push(<div key="drop" className="camel-drop-marker" />);
      }
      position++;
    }
    items.push(
      <div
        key={c}
        data-camel={isDragged ? undefined : c}
        className={`camel ${colorClass(c, rules)}${editMode ? " camel-editable" : ""}${isDragged ? " camel-dragging" : ""}`}
        title={displayName(c, rules)}
        aria-label={displayName(c, rules)}
        onPointerDown={editMode ? (e) => onCamelPointerDown?.(c, e) : undefined}
        // in edit mode a click on a camel shouldn't also count as clicking its space
        onClick={editMode ? (e) => e.stopPropagation() : undefined}
      />
    );
  });
  if (dropIndex !== undefined && dropIndex >= position) {
    items.push(<div key="drop" className="camel-drop-marker" />);
  }
  // the last camel in the array is on top of the stack
  return <div className="camel-stack">{items}</div>;
};

export const Track = ({ state, onSpaceClick, rules = DEFAULT_RULES, editMode = false, onMoveCamel }: Props) => {
  const [drag, setDrag] = useState<Drag | undefined>();
  // a click event follows the pointerup of a drag; ignore it
  const justDragged = useRef(false);

  const spaces: Tile[] = [];
  for (let i = 0; i < TRACK_LENGTH; i++) {
    spaces.push(state.tiles[i] ?? { camels: [] });
  }
  const finished = state.tiles.slice(TRACK_LENGTH).flatMap((t) => t.camels);

  // work out which space and stack position is under the pointer
  const findTarget = (x: number, y: number): Drag["target"] => {
    const element = document.elementFromPoint(x, y);
    const space = element?.closest<HTMLElement>("[data-space]");
    if (!space) {
      return undefined;
    }
    const spaceIndex = Number(space.dataset.space);
    // stack positions count up from the bottom: every camel whose middle is
    // below the pointer goes under the dropped camel
    const camels = Array.from(space.querySelectorAll<HTMLElement>("[data-camel]"));
    const stackIndex = camels.filter((c) => {
      const rect = c.getBoundingClientRect();
      return rect.top + rect.height / 2 > y;
    }).length;
    return { spaceIndex, stackIndex, legal: canPlaceCamel(state, spaceIndex) };
  };

  const onCamelPointerDown = (color: CamelColor, e: React.PointerEvent) => {
    if (e.button !== 0) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    setDrag({ color, pointerId: e.pointerId, startX: e.clientX, startY: e.clientY, x: e.clientX, y: e.clientY, moved: false });
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag || e.pointerId !== drag.pointerId) {
      return;
    }
    const moved = drag.moved || Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) > DRAG_THRESHOLD;
    setDrag({ ...drag, x: e.clientX, y: e.clientY, moved, target: moved ? findTarget(e.clientX, e.clientY) : undefined });
  };

  const endDrag = (e: React.PointerEvent, drop: boolean) => {
    if (!drag || e.pointerId !== drag.pointerId) {
      return;
    }
    if (drag.moved) {
      justDragged.current = true;
      setTimeout(() => (justDragged.current = false), 0);
    }
    const target = drag.moved ? findTarget(e.clientX, e.clientY) : undefined;
    setDrag(undefined);
    if (drop && target?.legal) {
      onMoveCamel?.(drag.color, target.spaceIndex, target.stackIndex);
    }
  };

  const target = drag?.moved ? drag.target : undefined;

  return (
    <div
      className={`track${editMode ? " track-editing" : ""}${drag?.moved ? " track-dragging" : ""}`}
      role="list"
      aria-label="Race track"
      onPointerMove={onPointerMove}
      onPointerUp={(e) => endDrag(e, true)}
      onPointerCancel={(e) => endDrag(e, false)}
    >
      {spaces.map((tile, i) => {
        const hazard = tile.hazard ? hazardLabel[tile.hazard] : undefined;
        const title = tile.hazard
          ? `Space ${i + 1}: ${tile.hazard} (${hazard!.text}). Click to change.`
          : tile.camels.length
          ? `Space ${i + 1}`
          : `Space ${i + 1}: click to add an oasis or desert`;
        const isTarget = target?.spaceIndex === i;
        return (
          <button
            type="button"
            role="listitem"
            key={i}
            data-space={i}
            className={`space${tile.hazard ? " space-" + tile.hazard.toLowerCase() : ""}${
              isTarget ? (target!.legal ? " space-drop" : " space-no-drop") : ""
            }`}
            title={title}
            onClick={() => {
              if (!justDragged.current) {
                onSpaceClick?.(i);
              }
            }}
          >
            <span className="space-number">{i + 1}</span>
            {hazard && (
              <span className="hazard">
                <span className="hazard-icon">{hazard.icon}</span>
                {hazard.text}
              </span>
            )}
            <CamelStack
              camels={tile.camels}
              rules={rules}
              editMode={editMode}
              dragging={drag?.moved ? drag.color : undefined}
              dropIndex={isTarget && target!.legal ? target!.stackIndex : undefined}
              onCamelPointerDown={onCamelPointerDown}
            />
          </button>
        );
      })}
      <div className="space space-finish" role="listitem" title="Finish line">
        <span className="space-number">🏁</span>
        <CamelStack
          camels={finished}
          rules={rules}
          editMode={editMode}
          dragging={drag?.moved ? drag.color : undefined}
          onCamelPointerDown={onCamelPointerDown}
        />
      </div>
      {drag?.moved && (
        <div
          className={`camel camel-ghost ${colorClass(drag.color, rules)}`}
          style={{ left: drag.x, top: drag.y }}
          aria-hidden="true"
        />
      )}
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
