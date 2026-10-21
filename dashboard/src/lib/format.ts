const integer = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 });
const oneDecimal = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 1 });

export const fmtInt = (n: number) => integer.format(n);

export const fmtPct = (fraction: number) => `${oneDecimal.format(fraction * 100)}%`;

export const fmtTonnes = (kg: number) => `${oneDecimal.format(kg / 1000)} t`;

/** Share of `part` in `whole`, 0 when there is no whole. */
export const share = (part: number, whole: number) => (whole > 0 ? part / whole : 0);
