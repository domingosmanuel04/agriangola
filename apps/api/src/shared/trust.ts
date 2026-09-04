export type TrustInputs = {
  identityVerified: boolean;
  orgVerified: boolean;
  fulfillmentRate: number;
  reviewAvg: number;
  reviewCount: number;
  cancellations: number;
  disputesLost: number;
  completedOrders: number;
};

export function computeTrustScore(i: TrustInputs): number {
  let score = 35;
  if (i.identityVerified) score += 12;
  if (i.orgVerified) score += 10;
  score += Math.min(20, i.fulfillmentRate * 20);
  score += Math.min(12, (i.reviewAvg / 5) * 12);
  score += Math.min(8, Math.log10(1 + i.reviewCount) * 4);
  score += Math.min(10, Math.log10(1 + i.completedOrders) * 5);
  score -= Math.min(15, i.cancellations * 2);
  score -= Math.min(20, i.disputesLost * 5);
  return Math.max(0, Math.min(100, Math.round(score)));
}

export type TrustBadge =
  | "IDENTITY_VERIFIED"
  | "COMPANY_VERIFIED"
  | "PRODUCER_VERIFIED"
  | "COOPERATIVE_VERIFIED"
  | "TRUSTED_BUYER";

export const BADGE_LABELS: Record<TrustBadge, string> = {
  IDENTITY_VERIFIED: "Identidade verificada",
  COMPANY_VERIFIED: "Empresa verificada",
  PRODUCER_VERIFIED: "Produtor verificado",
  COOPERATIVE_VERIFIED: "Cooperativa verificada",
  TRUSTED_BUYER: "Comprador confiável",
};
