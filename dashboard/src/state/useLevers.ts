import { useEffect, useState } from "react";
import type { Q1Levers } from "../model/q1";
import { LEVERS, baseLevers } from "./levers";

const keys = LEVERS.map((l) => l.key);

// Levers that differ from the base case live in the URL hash, so a scenario can be bookmarked or sent as a link.
function readHash(): Partial<Q1Levers> {
  try {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const read: Partial<Q1Levers> = {};
    for (const key of keys) {
      const value = Number(params.get(key) ?? NaN);
      if (Number.isFinite(value)) read[key] = value;
    }
    return read;
  } catch {
    return {};
  }
}

function writeHash(levers: Q1Levers) {
  const changed = keys.filter((k) => Number.isFinite(levers[k]) && levers[k] !== baseLevers[k]).map((k) => [k, String(levers[k])]);
  try {
    window.history.replaceState(null, "", `${window.location.pathname}${changed.length ? `#${new URLSearchParams(changed)}` : ""}`);
  } catch {
    // Sandboxed frames may refuse history access; the scenario still works, it just is not in the URL.
  }
}

export function useLevers() {
  const [state, setLevers] = useState<Q1Levers>(() => ({ ...baseLevers, ...readHash() }));
  // A lever added after the state was created (hot reload during development) falls back to its base value.
  const levers: Q1Levers = { ...baseLevers, ...state };

  useEffect(() => {
    writeHash({ ...baseLevers, ...state });
  }, [state]);

  return {
    levers,
    set: (key: keyof Q1Levers, value: number) => setLevers((prev) => ({ ...prev, [key]: value })),
    reset: () => setLevers(baseLevers),
    isBase: keys.every((k) => levers[k] === baseLevers[k]),
  };
}

export type LeverState = ReturnType<typeof useLevers>;
