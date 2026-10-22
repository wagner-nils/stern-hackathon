import { describe, expect, it } from "vitest";
import { assumption, expansionFields, sqlExpansion } from "../data/warehouse";
import { fieldYear, portfolio } from "./q2";

const base = { wacc: assumption("q2_wacc").value };

describe("Q2 expansion model", () => {
  it("gives exactly the numbers of the SQL view v_q2_expansion_fields", () => {
    expect(sqlExpansion.length).toBeGreaterThan(0);
    for (const row of sqlExpansion) {
      const f = expansionFields.find((x) => x.id === row.id)!;
      const y = fieldYear(f, row.year, base);
      expect(y.revenueEur).toBeCloseTo(row.isar_revenue_eur, -1);
      expect(y.grossProfitEur).toBeCloseTo(row.gross_profit_eur, -1);
      expect(y.evaProxyEur).toBeCloseTo(row.eva_proxy_eur, -1);
    }
  });

  it("earns nothing before a field starts and charges capital from 2027", () => {
    const mid = expansionFields.find((f) => f.id === "mid_class_rocket")!;
    const y = fieldYear(mid, 2030, base);
    expect(y.revenueEur).toBe(0);
    expect(y.evaProxyEur).toBeCloseTo(-mid.capex_eur * base.wacc);
  });

  it("raises the readiness field's revenue with a higher growth override", () => {
    const pursue = expansionFields.filter((f) => f.recommendation === "pursue");
    const low = portfolio(pursue, 2035, { ...base, growthOverride: { id: "sovereign_readiness", growth: 0.1 } });
    const high = portfolio(pursue, 2035, { ...base, growthOverride: { id: "sovereign_readiness", growth: 0.25 } });
    expect(high.revenueEur).toBeGreaterThan(low.revenueEur);
  });
});
