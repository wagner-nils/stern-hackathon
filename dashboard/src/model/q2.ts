import type { ExpansionField } from "../data/warehouse";

// RQ2 expansion fields rolled forward. Mirrors the SQL view v_q2_expansion_fields; a test keeps both equal.

export interface Q2Settings {
  /** Cost of capital for the EVA proxy. */
  wacc: number;
  /** Override for one field's growth, used for the most uncertain lever (paid readiness). */
  growthOverride?: { id: string; growth: number };
}

export interface FieldYear {
  marketEur: number;
  revenueEur: number;
  grossProfitEur: number;
  fixedCostEur: number;
  capitalChargeEur: number;
  /** Gross profit − fixed cost − WACC × capital tied up: ranks fields, not a valuation. */
  evaProxyEur: number;
}

/** Capital is charged from the decision year on, before a field earns anything. */
const CAPITAL_FROM = 2027;

export function fieldYear(f: ExpansionField, year: number, s: Q2Settings): FieldYear {
  const growth = s.growthOverride?.id === f.id ? s.growthOverride.growth : f.growth;
  const marketEur = f.market_2025_eur * Math.pow(1 + growth, year - 2025);
  const active = year >= f.start_year && year <= (f.end_year ?? 9999);
  const revenueEur = active ? marketEur * f.isar_share : 0;
  const grossProfitEur = revenueEur * f.gross_margin;
  const fixedCostEur = active ? f.fixed_cost_eur : 0;
  const capitalChargeEur = year >= CAPITAL_FROM ? f.capex_eur * s.wacc : 0;
  return { marketEur, revenueEur, grossProfitEur, fixedCostEur, capitalChargeEur, evaProxyEur: grossProfitEur - fixedCostEur - capitalChargeEur };
}

/** Sum of several fields in one year. */
export function portfolio(fields: ExpansionField[], year: number, s: Q2Settings): FieldYear {
  return fields
    .map((f) => fieldYear(f, year, s))
    .reduce(
      (a, b) => ({
        marketEur: a.marketEur + b.marketEur,
        revenueEur: a.revenueEur + b.revenueEur,
        grossProfitEur: a.grossProfitEur + b.grossProfitEur,
        fixedCostEur: a.fixedCostEur + b.fixedCostEur,
        capitalChargeEur: a.capitalChargeEur + b.capitalChargeEur,
        evaProxyEur: a.evaProxyEur + b.evaProxyEur,
      }),
      { marketEur: 0, revenueEur: 0, grossProfitEur: 0, fixedCostEur: 0, capitalChargeEur: 0, evaProxyEur: 0 },
    );
}

/** Extra launches a year a site needs to earn its fixed cost: fixed cost ÷ margin ÷ price per launch. */
export const breakEvenLaunches = (f: ExpansionField, pricePerLaunchEur: number) =>
  f.fixed_cost_eur > 0 && f.gross_margin > 0 ? f.fixed_cost_eur / f.gross_margin / pricePerLaunchEur : 0;
