// Number tokens for the journey's audit: sign, value, unit (€ before, % or × after) and magnitude (M, bn, k).
// "−€35 M" → "-35€M", "9.3 %" → "9.3%", "€11.1 bn" → "11.1€bn", "4,521" → "4521".
const TOKEN = /(?<![\w.,])([−-])?(€)?(\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?)(\s?[%×])?(?:[\s\u00a0](M|bn|k)\b)?/g;

// Ranges such as "€40–90 M" are read as "€40 M" and "€90 M"; values compare as numbers ("43.0" = "43").
const ranges = (text) => String(text).replace(/€(\d[\d.,]*)–(\d[\d.,]*)(?:[\s\u00a0](M|bn)\b)/g, "€$1 $3–€$2 $3");

export const tokens = (text) =>
  [...ranges(text).matchAll(TOKEN)].map((m) => {
    const value = String(Number(m[3].replace(/,/g, "")));
    const key = `${m[1] ? "-" : ""}${value}${m[2] ? "€" : ""}${m[4] ? m[4].trim() : ""}${m[5] ?? ""}`;
    return { raw: m[0].trim(), key, bare: !m[1] && !m[2] && !m[4] && !m[5] ? value : null, unit: Boolean(m[2] || m[4] || m[5]) };
  });

export const keys = (text) => new Set(tokens(text).map((t) => t.key));
