import { describe, expect, it } from "vitest";
import { computeCompatibility } from "@agriangola/shared";

describe("compatibilidade", () => {
  it("é alta quando todos os factores alinham", () => {
    const r = computeCompatibility({
      productMatch: true,
      quantityRatio: 1,
      priceFit: 1,
      distanceKm: 20,
      qualityMatch: true,
      availabilityFit: 1,
      reputation: 95,
      deadlineFit: 1,
      historyBonus: 1,
      logisticsFit: 1,
    });
    expect(r.score).toBeGreaterThan(90);
  });
});
