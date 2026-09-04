export type MatchInputs = {
  productMatch: boolean;
  quantityRatio: number;
  priceFit: number;
  distanceKm: number;
  qualityMatch: boolean;
  availabilityFit: number;
  reputation: number;
  deadlineFit: number;
  historyBonus: number;
  logisticsFit: number;
};

export type MatchResult = {
  score: number;
  breakdown: Record<string, number>;
};

const WEIGHTS = {
  product: 22,
  quantity: 14,
  price: 14,
  distance: 12,
  quality: 8,
  availability: 8,
  reputation: 8,
  deadline: 6,
  history: 4,
  logistics: 4,
};

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function computeCompatibility(input: MatchInputs): MatchResult {
  const product = input.productMatch ? 1 : 0;
  const quantity = clamp01(input.quantityRatio);
  const price = clamp01(input.priceFit);
  const distance = clamp01(1 - input.distanceKm / 800);
  const quality = input.qualityMatch ? 1 : 0.45;
  const availability = clamp01(input.availabilityFit);
  const reputation = clamp01(input.reputation / 100);
  const deadline = clamp01(input.deadlineFit);
  const history = clamp01(input.historyBonus);
  const logistics = clamp01(input.logisticsFit);

  const breakdown = {
    produto: product * WEIGHTS.product,
    quantidade: quantity * WEIGHTS.quantity,
    preco: price * WEIGHTS.price,
    distancia: distance * WEIGHTS.distance,
    qualidade: quality * WEIGHTS.quality,
    disponibilidade: availability * WEIGHTS.availability,
    reputacao: reputation * WEIGHTS.reputation,
    prazo: deadline * WEIGHTS.deadline,
    historico: history * WEIGHTS.history,
    logistica: logistics * WEIGHTS.logistics,
  };

  const score = Object.values(breakdown).reduce((s, v) => s + v, 0);
  return { score: Math.round(score * 10) / 10, breakdown };
}
