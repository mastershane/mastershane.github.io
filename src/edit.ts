import { CamelState, ChaosColor, Color, TRACK_LENGTH } from "./camel";

export type CamelColor = Color | ChaosColor;

// Camels can be moved onto any space on the track that doesn't have a desert
// or oasis tile on it.
export const canPlaceCamel = (state: CamelState, spaceIndex: number): boolean =>
  spaceIndex >= 0 && spaceIndex < TRACK_LENGTH && !state.tiles[spaceIndex]?.hazard;

// Returns a new state with one camel moved to the given space and stack
// position (0 is the bottom of the stack, counted without the moving camel),
// or undefined if the camel can't go there. Camels that were above it in its
// old stack stay where they are.
export const moveCamelTo = (
  state: CamelState,
  color: CamelColor,
  spaceIndex: number,
  stackIndex: number
): CamelState | undefined => {
  if (!canPlaceCamel(state, spaceIndex)) {
    return undefined;
  }
  const tiles = state.tiles.map((t) => ({ camels: t.camels.filter((c) => c !== color), hazard: t.hazard }));
  if (tiles.every((t, i) => t.camels.length === state.tiles[i].camels.length)) {
    return undefined; // the camel isn't on the board
  }
  while (tiles.length < TRACK_LENGTH) {
    tiles.push({ camels: [], hazard: undefined });
  }
  const stack = tiles[spaceIndex].camels;
  stack.splice(Math.max(0, Math.min(stackIndex, stack.length)), 0, color);

  // drop empty spaces at the end so the camel code stays short
  while (tiles.length && !tiles[tiles.length - 1].camels.length && !tiles[tiles.length - 1].hazard) {
    tiles.pop();
  }
  return { tiles };
};
