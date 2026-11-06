/* eslint-disable no-restricted-globals */
// Runs the odds calculations off the main thread so the board stays responsive.
import { computeOdds, OddsRequest } from "./odds";

const ctx = self as unknown as {
  onmessage: (e: MessageEvent<OddsRequest>) => void;
  postMessage: (message: unknown) => void;
};

ctx.onmessage = (e) => {
  ctx.postMessage(computeOdds(e.data));
};

export {};
