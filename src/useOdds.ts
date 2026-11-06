import { useCallback, useEffect, useRef, useState } from "react";
import { OddsResult } from "./camel";
import { LongTermResult } from "./long-term";
import { computeOdds, OddsRequest, OddsResponse } from "./odds";

// wait this long after the last change before calculating, so quick
// repeated clicks (e.g. oasis -> desert) only calculate once
const DEBOUNCE_MS = 250;

export interface OddsState {
  results?: OddsResult;
  longTermResults?: LongTermResult;
  calculating: boolean;
  error?: string;
}

const createWorker = (): Worker | undefined => {
  try {
    return new Worker(new URL("./odds.worker.ts", import.meta.url));
  } catch {
    return undefined;
  }
};

// Calculates odds in a web worker. Only the latest request is kept: a new
// request cancels any calculation that is still running.
export const useOdds = () => {
  const [odds, setOdds] = useState<OddsState>({ calculating: false });
  const worker = useRef<Worker | undefined>();
  const busy = useRef(false);
  const latestId = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>();

  const handleResponse = useCallback((response: OddsResponse) => {
    if (response.id !== latestId.current) {
      return; // a newer request has been made since
    }
    busy.current = false;
    if ("error" in response) {
      setOdds((o) => ({ ...o, calculating: false, error: response.error }));
    } else {
      setOdds({
        results: response.results,
        longTermResults: response.longTermResults,
        calculating: false,
      });
    }
  }, []);

  const getWorker = useCallback(() => {
    if (!worker.current) {
      worker.current = createWorker();
      if (worker.current) {
        worker.current.onmessage = (e: MessageEvent<OddsResponse>) => handleResponse(e.data);
      }
    }
    return worker.current;
  }, [handleResponse]);

  const run = useCallback(
    (request: OddsRequest) => {
      // cancel a calculation that is still running for an older board
      if (busy.current && worker.current) {
        worker.current.terminate();
        worker.current = undefined;
      }
      const w = getWorker();
      busy.current = true;
      if (w) {
        w.postMessage(request);
      } else {
        // no worker support: calculate on the main thread
        handleResponse(computeOdds(request));
      }
    },
    [getWorker, handleResponse]
  );

  const request = useCallback(
    (boardInput: string, diceInput: string, simulations: number) => {
      const id = ++latestId.current;
      setOdds((o) => ({ ...o, calculating: true, error: undefined }));
      if (timer.current) {
        clearTimeout(timer.current);
      }
      timer.current = setTimeout(
        () => run({ id, boardInput, diceInput, simulations }),
        DEBOUNCE_MS
      );
    },
    [run]
  );

  const clear = useCallback(() => {
    latestId.current++;
    if (timer.current) {
      clearTimeout(timer.current);
    }
    setOdds({ calculating: false });
  }, []);

  useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
      worker.current?.terminate();
    },
    []
  );

  return { odds, request, clear };
};
