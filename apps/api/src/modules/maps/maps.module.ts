import { Module } from "@nestjs/common";
import { Controller, Get, Query } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { Public } from "../../common/decorators/public.decorator";
import { ANGOLA_PROVINCES } from "../../shared";

@Controller("maps")
export class MapsController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get("pois")
  async pois(@Query("kind") kind?: string, @Query("province") province?: string) {
    return this.prisma.mapPoi.findMany({
      where: {
        ...(kind ? { kind } : {}),
        ...(province ? { province } : {}),
      },
    });
  }

  @Public()
  @Get("heatmap")
  async heatmap(@Query("metric") metric = "production") {
    const listings = await this.prisma.listing.findMany({ where: { status: "ACTIVE" } });
    const demands = await this.prisma.demand.findMany({ where: { status: "OPEN" } });
    return ANGOLA_PROVINCES.map((p) => {
      const prod = listings.filter((l) => l.province === p.name).reduce((s, l) => s + l.availableQty, 0);
      const demand = demands.filter((d) => d.province === p.name).reduce((s, d) => s + d.quantity, 0);
      const prices = listings.filter((l) => l.province === p.name);
      const avgPrice = prices.length ? prices.reduce((s, l) => s + l.pricePerUnit, 0) / prices.length : 0;
      const value =
        metric === "demand" ? demand : metric === "prices" ? avgPrice : metric === "opportunity" ? demand - prod : prod;
      return { ...p, production: prod, demand, avgPrice, value };
    });
  }
}

@Module({ controllers: [MapsController] })
export class MapsModule {}
