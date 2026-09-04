import { Controller, Get, Module } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CurrentUser, type AuthUser } from "../../common/decorators/current-user.decorator";

@Controller("dashboard")
export class DashboardController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async home(@CurrentUser() user: AuthUser) {
    const me = await this.prisma.user.findUnique({ where: { id: user.id } });
    const [listings, demands, orders, negotiations, notifications, weather, prices] = await Promise.all([
      this.prisma.listing.findMany({
        where: { status: "ACTIVE" },
        include: { product: true, seller: { select: { name: true, trustScore: true } } },
        take: 6,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.demand.findMany({
        where: { status: "OPEN", ...(me?.province ? { province: me.province } : {}) },
        include: { product: true, buyer: { select: { name: true } } },
        take: 5,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.order.findMany({
        where: { OR: [{ buyerId: user.id }, { sellerId: user.id }] },
        take: 6,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.negotiation.findMany({
        where: { OR: [{ buyerId: user.id }, { sellerId: user.id }], status: { in: ["OPEN", "COUNTERED", "ACCEPTED"] } },
        take: 5,
        orderBy: { updatedAt: "desc" },
      }),
      this.prisma.notification.findMany({
        where: { userId: user.id, read: false },
        take: 6,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.weatherSnapshot.findFirst({
        where: { province: me?.province ?? "Luanda" },
        orderBy: { capturedAt: "desc" },
      }),
      this.prisma.marketPrice.findMany({
        take: 8,
        orderBy: { capturedAt: "desc" },
        include: { product: true },
      }),
    ]);

    const mySold = await this.prisma.order.aggregate({
      where: { sellerId: user.id },
      _sum: { totalAmount: true },
      _count: true,
    });
    const myBought = await this.prisma.order.aggregate({
      where: { buyerId: user.id },
      _sum: { totalAmount: true },
      _count: true,
    });

    const feed = [
      demands.length ? `${demands.length} compradores procuram produtos na sua região.` : null,
      prices[0] ? `Preço recente de ${prices[0].product.name}: ${prices[0].priceKg} Kz/kg.` : null,
      weather?.alert ? weather.alert : weather ? `Clima em ${weather.province}: ${weather.condition}, ${weather.temperature}°C.` : null,
    ].filter(Boolean);

    return {
      user: me,
      kpis: {
        sold: mySold._sum.totalAmount ?? 0,
        soldCount: mySold._count,
        bought: myBought._sum.totalAmount ?? 0,
        boughtCount: myBought._count,
        openNegotiations: negotiations.length,
        trustScore: me?.trustScore ?? 40,
        agriScore: me?.agriScore ?? 40,
      },
      listings,
      demands,
      orders,
      negotiations,
      notifications,
      weather,
      prices,
      feed,
    };
  }
}

@Module({ controllers: [DashboardController] })
export class DashboardModule {}
