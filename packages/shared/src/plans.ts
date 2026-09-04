export const PLANS = ["FREE", "PROFESSIONAL", "BUSINESS", "ENTERPRISE"] as const;
export type Plan = (typeof PLANS)[number];

export const PLAN_LIMITS: Record<
  Plan,
  { listings: number; demands: number; aiMessagesPerDay: number; seats: number }
> = {
  FREE: { listings: 5, demands: 3, aiMessagesPerDay: 8, seats: 1 },
  PROFESSIONAL: { listings: 50, demands: 40, aiMessagesPerDay: 80, seats: 5 },
  BUSINESS: { listings: 500, demands: 500, aiMessagesPerDay: 400, seats: 25 },
  ENTERPRISE: { listings: 10_000, demands: 10_000, aiMessagesPerDay: 5_000, seats: 500 },
};

export const PLAN_LABELS: Record<Plan, string> = {
  FREE: "Gratuito",
  PROFESSIONAL: "Profissional",
  BUSINESS: "Empresarial",
  ENTERPRISE: "Enterprise",
};
