import { useEffect, useRef, useState } from "react";

const reducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

/** Counts from the previous value to the new one, so the effect of a slider is easy to follow. */
export function Tween({ value, format, ms = 700 }: { value: number; format: (n: number) => string; ms?: number }) {
  const [shown, setShown] = useState(0);
  const current = useRef(0);

  useEffect(() => {
    const from = current.current;
    if (reducedMotion() || from === value) {
      current.current = value;
      setShown(value);
      return;
    }
    const start = performance.now();
    let frame = 0;
    const step = (now: number) => {
      const k = Math.min(1, (now - start) / ms);
      const v = from + (value - from) * (1 - Math.pow(1 - k, 3));
      current.current = v;
      setShown(v);
      if (k < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value, ms]);

  return <>{format(shown)}</>;
}
