import { useEffect, useState } from "react";
import { type AssumptionId, type AssumptionValues, defaultValues } from "../data/assumptions";

const ids = Object.keys(defaultValues) as AssumptionId[];

// The scenario lives in the URL hash, so a tuned scenario can be bookmarked or sent as a link.
function readHash(): Partial<AssumptionValues> {
  try {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const read: Partial<AssumptionValues> = {};
    for (const id of ids) {
      const raw = params.get(id);
      const value = raw === null ? NaN : Number(raw);
      if (Number.isFinite(value)) read[id] = value;
    }
    return read;
  } catch {
    return {};
  }
}

function writeHash(values: AssumptionValues) {
  const changed = ids.filter((id) => values[id] !== defaultValues[id]).map((id) => [id, String(values[id])]);
  const hash = changed.length ? `#${new URLSearchParams(changed)}` : "";
  try {
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}${hash}`);
  } catch {
    // Sandboxed frames may refuse history access; the scenario still works, it just is not in the URL.
  }
}

export function useScenario() {
  const [values, setValues] = useState<AssumptionValues>(() => ({ ...defaultValues, ...readHash() }));

  useEffect(() => writeHash(values), [values]);

  return {
    values,
    set: (id: AssumptionId, value: number) => setValues((prev) => ({ ...prev, [id]: value })),
    reset: () => setValues(defaultValues),
    isDefault: ids.every((id) => values[id] === defaultValues[id]),
  };
}
