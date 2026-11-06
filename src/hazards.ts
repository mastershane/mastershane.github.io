import { CamelState, Hazard, TRACK_LENGTH } from "./camel";

// clicking a space cycles: nothing -> oasis -> desert -> nothing
const nextHazard = (hazard?: Hazard): Hazard | undefined =>
  hazard === undefined ? "Oasis" : hazard === "Oasis" ? "Desert" : undefined;

export type ToggleResult = { state: CamelState } | { error: string };

// Returns a new state with the hazard on the given space (0 based) cycled, or
// an error if the rules don't allow a tile there. Spectator tiles can't go on
// the first space, on a space with camels, or next to another tile.
export const toggleHazard = (
  camelState: CamelState,
  index: number
): ToggleResult => {
  if (index < 0 || index >= TRACK_LENGTH) {
    return { error: "Tiles can only be placed on the track." };
  }
  const tiles = camelState.tiles.map((t) => ({
    camels: [...t.camels],
    hazard: t.hazard,
  }));
  while (tiles.length < TRACK_LENGTH) {
    tiles.push({ camels: [], hazard: undefined });
  }
  const tile = tiles[index];
  const hazard = nextHazard(tile.hazard);

  if (hazard && !tile.hazard) {
    if (index === 0) {
      return { error: "Tiles can't be placed on the first space." };
    }
    if (tile.camels.length) {
      return { error: `Space ${index + 1} has camels on it.` };
    }
    if (tiles[index - 1]?.hazard || tiles[index + 1]?.hazard) {
      return { error: `Space ${index + 1} is next to another tile.` };
    }
  }

  tile.hazard = hazard;

  // drop empty spaces at the end so the camel code stays short
  while (tiles.length && !tiles[tiles.length - 1].camels.length && !tiles[tiles.length - 1].hazard) {
    tiles.pop();
  }
  return { state: { tiles } };
};
