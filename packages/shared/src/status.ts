export const LISTING_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "RESERVED",
  "SOLD",
  "EXPIRED",
  "HIDDEN",
] as const;
export type ListingStatus = (typeof LISTING_STATUSES)[number];

export const DEMAND_STATUSES = ["OPEN", "MATCHED", "FULFILLED", "EXPIRED", "CANCELLED"] as const;
export type DemandStatus = (typeof DEMAND_STATUSES)[number];

export const NEGOTIATION_STATUSES = [
  "OPEN",
  "COUNTERED",
  "ACCEPTED",
  "REJECTED",
  "CONVERTED",
  "CANCELLED",
] as const;
export type NegotiationStatus = (typeof NEGOTIATION_STATUSES)[number];

export const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "IN_TRANSIT",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
  "DISPUTED",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const SHIPMENT_STATUSES = [
  "REQUESTED",
  "ACCEPTED",
  "EN_ROUTE_PICKUP",
  "PICKED_UP",
  "IN_TRANSIT",
  "ARRIVED",
  "DELIVERED",
  "CANCELLED",
] as const;
export type ShipmentStatus = (typeof SHIPMENT_STATUSES)[number];

export const CONTRACT_TYPES = [
  "SALE",
  "RECURRING_SUPPLY",
  "TRANSPORT",
  "STORAGE",
  "SERVICE",
  "CONTRACTED_PRODUCTION",
] as const;
export type ContractType = (typeof CONTRACT_TYPES)[number];

export const DISPUTE_REASONS = [
  "WRONG_PRODUCT",
  "WRONG_QUANTITY",
  "DELAY",
  "NON_PAYMENT",
  "QUALITY",
  "TRANSPORT",
  "DAMAGE",
  "OTHER",
] as const;
export type DisputeReason = (typeof DISPUTE_REASONS)[number];

export const NOTIFICATION_PRIORITIES = ["URGENT", "IMPORTANT", "OPPORTUNITY", "INFO"] as const;
export type NotificationPriority = (typeof NOTIFICATION_PRIORITIES)[number];

export const QUALITY_GRADES = ["A", "B", "C", "MISTO"] as const;
export type QualityGrade = (typeof QUALITY_GRADES)[number];
