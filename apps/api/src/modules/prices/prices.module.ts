import { Module, Controller, Get, Query } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { Public } from "../../common/decorators/public.decorator";

@Controller("prices")
export class PricesController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  async list(@Query("productId") productId?: string, @Query("province") province?: string) {
    const where = {
      ...(productId ? { productId } : {}),
      ...(province ? { province } : {}),
    };
    const rows = await this.prisma.marketPrice.findMany({
      where,
      include: { product: true },
      orderBy: { capturedAt: "desc" },
      take: 400,
    });
    const byKey = new Map<string, typeof rows>();
    for (const r of rows) {
      const k = `${r.productId}:${r.province}`;
      const arr = byKey.get(k) ?? [];
      arr.push(r);
      byKey.set(k, arr);
    }
    const summaries = [...byKey.entries()].map(([, series]) => {
      const sorted = [...series].sort((a, b) => a.capturedAt.getTime() - b.capturedAt.getTime());
      const last = sorted[sorted.length - 1];
      const prev = sorted[Math.max(0, sorted.length - 6)];
      const avg = sorted.reduce((s, x) => s + x.priceKg, 0) / sorted.length;
      const change = prev.priceKg ? (last.priceKg - prev.priceKg) / prev.priceKg : 0;
      const insight =
        change > 0.05
          ? "Preço provavelmente subirá / já em alta."
          : change < -0.05
            ? "Oferta acima da procura ou correcção de preço."
            : "Mercado relativamente estável. Avalie janela de venda.";
      return {
        product: last.product,
        province: last.province,
        current: last.priceKg,
        average: Math.round(avg),
        change,
        insight,
        series: sorted.map((s) => ({ t: s.capturedAt, price: s.priceKg })),
      };
    });
    return summaries;
  }

  @Public()
  @Get("intelligence")
  async intelligence() {
    const [listings, demands, orders] = await Promise.all([
      this.prisma.listing.findMany({ where: { status: "ACTIVE" }, include: { product: true } }),
      this.prisma.demand.findMany({ where: { status: "OPEN" }, include: { product: true } }),
      this.prisma.order.findMany(),
    ]);
    const demandByProduct = new Map<string, number>();
    for (const d of demands) demandByProduct.set(d.product.name, (demandByProduct.get(d.product.name) ?? 0) + d.quantity);
    const topDemand = [...demandByProduct.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
    return {
      topDemand: topDemand.map(([name, qty]) => ({ name, qty })),
      activeListings: listings.length,
      openDemands: demands.length,
      gmv: orders.reduce((s, o) => s + o.totalAmount, 0),
      volume: orders.reduce((s, o) => s + o.quantity, 0),
    };
  }
}

@Module({ controllers: [PricesController] })
export class PricesModule {}
