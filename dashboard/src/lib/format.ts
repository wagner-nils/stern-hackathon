const integer = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 });
const oneDecimal = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 1 });
const twoDecimals = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 2 });

export const fmtInt = (n: number) => integer.format(n);

export const fmtOne = (n: number) => oneDecimal.format(n);

/** Per cent with one decimal, or two significant digits below 1%. */
export const fmtPct = (fraction: number) => {
  const pct = fraction * 100;
  if (pct > 0 && pct < 1) return `${pct.toPrecision(2)}%`;
  return `${oneDecimal.format(pct)}%`;
};

/** Mass with enough digits to tell small values apart: 196 kg, 1.25 t, 17.9 t, 2,694 t. */
export const fmtTonnes = (kg: number) => {
  if (kg > 0 && kg < 1000) return `${integer.format(kg)} kg`;
  const t = kg / 1000;
  if (t < 10) return `${twoDecimals.format(t)} t`;
  if (t < 100) return `${oneDecimal.format(t)} t`;
  return `${integer.format(t)} t`;
};

export const fmtEur = (eur: number) => {
  if (eur >= 1e9) return `€${oneDecimal.format(eur / 1e9)} bn`;
  if (eur >= 1e6) return `€${integer.format(eur / 1e6)} M`;
  return `€${integer.format(eur)}`;
};

export const fmtEurRange = ([low, high]: [number, number]) =>
  Math.abs(high - low) < 1 ? fmtEur(low) : `${fmtEur(low)}–${fmtEur(high).replace("€", "")}`;

const money = (v: number, symbol: string) => {
  if (Math.abs(v) >= 1e9) return `${symbol}${oneDecimal.format(v / 1e9)} bn`;
  if (Math.abs(v) >= 1e6) return `${symbol}${oneDecimal.format(v / 1e6)} M`;
  return `${symbol}${integer.format(v)}`;
};

/** A warehouse value in the unit of its metric or assumption. */
export function fmtUnit(value: number, unit: string): string {
  switch (unit) {
    case "share":
      return fmtPct(value);
    case "kg":
      return value >= 10000 ? fmtTonnes(value) : `${fmtInt(value)} kg`;
    case "USD":
      return money(value, "$");
    case "EUR":
      return money(value, "€");
    case "NOK":
      return `NOK ${oneDecimal.format(value / 1e6)} M`;
    case "USD per kg":
      return `$${fmtInt(value)}/kg`;
    case "USD per EUR":
      return `${value} $/€`;
    case "degrees":
      return `${value}°`;
    case "year":
      return String(value);
    case "share per year":
      return `${fmtPct(value)} p.a.`;
    default:
      return `${fmtInt(value)} ${unit}`;
  }
}

/** Share of `part` in `whole`, 0 when there is no whole. */
export const share = (part: number, whole: number) => (whole > 0 ? part / whole : 0);
