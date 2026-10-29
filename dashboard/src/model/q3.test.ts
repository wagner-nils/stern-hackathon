import { describe, expect, it } from "vitest";
import { assumption, expansionFields, siteNodes, sqlSiteLoad } from "../data/warehouse";
import { relativeUnitCost, siteLoad } from "./q3";

const base = {
  wacc: assumption("q2_wacc").value,
  padCadence: assumption("q3_pad_cadence").value,
  nsAnchor: assumption("q3_ns_anchor_launches").value,
  pricePerLaunchEur: assumption("fixed_price_per_launch_eur").value,
};

describe("Q3 site load", () => {
  it("gives exactly the numbers of the SQL view v_q3_site_load", () => {
    expect(sqlSiteLoad.length).toBeGreaterThan(0);
    for (const row of sqlSiteLoad) {
      const l = siteLoad(expansionFields, siteNodes, row.year, base).find((x) => x.siteId === row.site_id)!;
      expect(l.pursue).toBeCloseTo(row.pursue_launches, 1);
      expect(l.conditional).toBeCloseTo(row.conditional_launches, 1);
      expect(l.anchor).toBeCloseTo(row.anchor_launches, 6);
      expect(l.capacityProposed).toBeCloseTo(row.capacity_proposed, 1);
    }
  });

  it("makes a line with a quarter of the volume about twice as expensive per rocket at a 0.7 learning rate", () => {
    expect(relativeUnitCost(3, 12, 0.7)).toBeCloseTo(2.04, 1);
  });
});
