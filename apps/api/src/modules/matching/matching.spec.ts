import { computeCompatibility, haversineKm } from "../../shared";

describe("AgriMatch Engine", () => {
  it("scores a strong local match highly", () => {
    const { score } = computeCompatibility({
      productMatch: true,
      quantityRatio: 1,
      priceFit: 1,
      distanceKm: 40,
      qualityMatch: true,
      availabilityFit: 1,
      reputation: 90,
      deadlineFit: 1,
      historyBonus: 0.5,
      logisticsFit: 1,
    });
    expect(score).toBeGreaterThan(85);
  });

  it("penalizes product mismatch", () => {
    const { score } = computeCompatibility({
      productMatch: false,
      quantityRatio: 1,
      priceFit: 1,
      distanceKm: 10,
      qualityMatch: true,
      availabilityFit: 1,
      reputation: 90,
      deadlineFit: 1,
      historyBonus: 1,
      logisticsFit: 1,
    });
    expect(score).toBeLessThan(80);
  });

  it("computes distance between Luanda and Malanje", () => {
    const km = haversineKm({ lat: -8.838, lng: 13.234 }, { lat: -9.54, lng: 16.341 });
    expect(km).toBeGreaterThan(300);
    expect(km).toBeLessThan(450);
  });
});
