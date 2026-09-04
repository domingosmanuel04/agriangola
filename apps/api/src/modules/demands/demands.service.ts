import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { AuditService } from "../../common/audit.service";
import { MatchingService } from "../matching/matching.service";
import { CreateDemandDto, DemandQueryDto } from "./dto";
import { provinceByName } from "../../shared";

@Injectable()
export class DemandsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly matching: MatchingService,
    private readonly audit: AuditService,
  ) {}

  async create(buyerId: string, dto: CreateDemandDto) {
    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException("Produto não encontrado");
    const geo = provinceByName(dto.province);
    const demand = await this.prisma.demand.create({
      data: {
        title: `Procura ${product.name} — ${dto.quantity}${dto.unit ?? product.unit} em ${dto.province}`,
        productId: dto.productId,
        quantity: dto.quantity,
        unit: dto.unit ?? product.unit,
        quality: dto.quality ?? "A",
        maxPrice: dto.maxPrice,
        province: dto.province,
        municipality: dto.municipality,
        neededBy: dto.neededBy ? new Date(dto.neededBy) : undefined,
        deliveryIncluded: dto.deliveryIncluded ?? false,
        notes: dto.notes,
        recurring: dto.recurring ?? false,
        recurrence: dto.recurrence,
        buyerId,
        lat: geo?.lat,
        lng: geo?.lng,
      },
      include: { product: true, buyer: { select: { id: true, name: true, trustScore: true } } },
    });
    const matches = await this.matching.recomputeForDemand(demand.id);
    const top = matches.slice(0, 8);
    for (const m of top) {
      const listing = await this.prisma.listing.findUnique({ where: { id: m.listingId } });
      if (!listing) continue;
      await this.prisma.notification.create({
        data: {
          userId: listing.sellerId,
          title: "Um comprador procura o seu produto",
          body: `${demand.title}. Índice de compatibilidade: ${m.score}.`,
          link: `/app/demands/${demand.id}`,
          priority: "OPPORTUNITY",
        },
      });
    }
    await this.audit.log({
      userId: buyerId,
      action: "CREATE_DEMAND",
      entity: "Demand",
      entityId: demand.id,
    });
    return { demand, matches: top };
  }

  async search(q: DemandQueryDto) {
    const page = Math.max(1, q.page ?? 1);
    const where: Prisma.DemandWhereInput = {
      status: "OPEN",
      ...(q.productId ? { productId: q.productId } : {}),
      ...(q.province ? { province: q.province } : {}),
      ...(q.q ? { title: { contains: q.q, mode: "insensitive" } } : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.demand.findMany({
        where,
        include: { product: true, buyer: { select: { id: true, name: true, trustScore: true, intent: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * 12,
        take: 12,
      }),
      this.prisma.demand.count({ where }),
    ]);
    return { items, total, page, pages: Math.ceil(total / 12) };
  }

  async get(id: string) {
    let demand = await this.prisma.demand.findUnique({
      where: { id },
      include: {
        product: true,
        buyer: { select: { id: true, name: true, trustScore: true, province: true, intent: true } },
        matches: { orderBy: { score: "desc" }, take: 20 },
      },
    });
    if (!demand) throw new NotFoundException("Procura não encontrada");
    if (demand.matches.length === 0) {
      await this.matching.recomputeForDemand(id);
      demand = await this.prisma.demand.findUnique({
        where: { id },
        include: {
          product: true,
          buyer: { select: { id: true, name: true, trustScore: true, province: true, intent: true } },
          matches: { orderBy: { score: "desc" }, take: 20 },
        },
      });
      if (!demand) throw new NotFoundException("Procura não encontrada");
    }
    const listingIds = demand.matches.map((m) => m.listingId);
    const listings = await this.prisma.listing.findMany({
      where: { id: { in: listingIds } },
      include: { product: true, seller: { select: { id: true, name: true, trustScore: true, province: true } } },
    });
    const byId = new Map(listings.map((l) => [l.id, l]));
    return {
      ...demand,
      matches: demand.matches.map((m) => ({ ...m, listing: byId.get(m.listingId) })),
    };
  }

  async mine(buyerId: string) {
    return this.prisma.demand.findMany({
      where: { buyerId },
      include: { product: true, matches: { orderBy: { score: "desc" }, take: 3 } },
      orderBy: { createdAt: "desc" },
    });
  }
}
