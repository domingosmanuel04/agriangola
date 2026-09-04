import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { computeCompatibility, haversineKm } from "../../shared";

@Injectable()
export class MatchingService {
  constructor(private readonly prisma: PrismaService) {}

  async recomputeForDemand(demandId: string) {
    const demand = await this.prisma.demand.findUnique({ where: { id: demandId } });
    if (!demand) return [];
    const listings = await this.prisma.listing.findMany({
      where: { status: "ACTIVE", productId: demand.productId },
      include: { seller: true },
    });
    const results: { listingId: string; score: number; breakdown: Record<string, number> }[] = [];

    for (const listing of listings) {
      const distanceKm =
        demand.lat && demand.lng && listing.lat && listing.lng
          ? haversineKm(
              { lat: demand.lat, lng: demand.lng },
              { lat: listing.lat, lng: listing.lng },
            )
          : demand.province === listing.province
            ? 40
            : 280;
      const qtyRatio = Math.min(1, listing.availableQty / demand.quantity);
      const priceFit =
        demand.maxPrice && demand.maxPrice > 0
          ? listing.pricePerUnit <= demand.maxPrice
            ? 1
            : Math.max(0, 1 - (listing.pricePerUnit - demand.maxPrice) / demand.maxPrice)
          : 0.7;
      const days =
        demand.neededBy && listing.availableFrom
          ? (listing.availableFrom.getTime() - demand.neededBy.getTime()) / 86_400_000
          : 0;
      const deadlineFit = days <= 0 ? 1 : Math.max(0, 1 - days / 30);
      const { score, breakdown } = computeCompatibility({
        productMatch: listing.productId === demand.productId,
        quantityRatio: qtyRatio,
        priceFit,
        distanceKm,
        qualityMatch: listing.quality === demand.quality,
        availabilityFit: listing.availableQty > 0 ? 1 : 0,
        reputation: listing.seller.trustScore,
        deadlineFit,
        historyBonus: 0.2,
        logisticsFit: listing.deliveryAvailable || demand.deliveryIncluded ? 1 : 0.5,
      });
      results.push({ listingId: listing.id, score, breakdown });
    }

    await this.prisma.matchScore.deleteMany({ where: { demandId } });
    if (results.length) {
      await this.prisma.matchScore.createMany({
        data: results.map((r) => ({
          demandId,
          listingId: r.listingId,
          score: r.score,
          breakdown: r.breakdown,
        })),
      });
    }
    return results.sort((a, b) => b.score - a.score);
  }

  async forListing(listingId: string) {
    const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) return [];
    const demands = await this.prisma.demand.findMany({
      where: { status: "OPEN", productId: listing.productId },
      include: { buyer: { select: { id: true, name: true, trustScore: true } }, product: true },
    });
    return demands
      .map((d) => {
        const distanceKm =
          d.lat && d.lng && listing.lat && listing.lng
            ? haversineKm({ lat: d.lat, lng: d.lng }, { lat: listing.lat, lng: listing.lng })
            : d.province === listing.province
              ? 40
              : 280;
        const { score, breakdown } = computeCompatibility({
          productMatch: true,
          quantityRatio: Math.min(1, listing.availableQty / d.quantity),
          priceFit: d.maxPrice ? (listing.pricePerUnit <= d.maxPrice ? 1 : 0.4) : 0.7,
          distanceKm,
          qualityMatch: listing.quality === d.quality,
          availabilityFit: 1,
          reputation: d.buyer.trustScore,
          deadlineFit: 0.8,
          historyBonus: 0.1,
          logisticsFit: 0.6,
        });
        return { demand: d, score, breakdown };
      })
      .sort((a, b) => b.score - a.score);
  }
}
