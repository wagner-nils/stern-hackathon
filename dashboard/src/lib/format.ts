const integer = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 });
const oneDecimal = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 1 });

export const fmtInt = (n: number) => integer.format(n);

export const fmtOne = (n: number) => oneDecimal.format(n);

/** Per cent with one decimal, or two significant digits below 1%. */
export const fmtPct = (fraction: number) => {
  const pct = fraction * 100;
  if (pct > 0 && pct < 1) return `${pct.toPrecision(2)}%`;
  return `${oneDecimal.format(pct)}%`;
};

export const fmtTonnes = (kg: number) => `${kg >= 10000 ? integer.format(kg / 1000) : oneDecimal.format(kg / 1000)} t`;

export const fmtEur = (eur: number) => {
  if (eur >= 1e9) return `€${oneDecimal.format(eur / 1e9)} bn`;
  if (eur >= 1e6) return `€${integer.format(eur / 1e6)} M`;
  return `€${integer.format(eur)}`;
};

export const fmtEurRange = ([low, high]: [number, number]) =>
  Math.abs(high - low) < 1 ? fmtEur(low) : `${fmtEur(low)}–${fmtEur(high).replace("€", "")}`;

/** Share of `part` in `whole`, 0 when there is no whole. */
export const share = (part: number, whole: number) => (whole > 0 ? part / whole : 0);
