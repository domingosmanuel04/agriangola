import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { AuditService } from "../../common/audit.service";
import { CreateListingDto, ListingQueryDto } from "./dto";
import { provinceByName } from "../../shared";

@Injectable()
export class ListingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async create(sellerId: string, dto: CreateListingDto) {
    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException("Produto não encontrado");
    const membership = await this.prisma.membership.findFirst({ where: { userId: sellerId } });
    const geo = provinceByName(dto.province);
    const year = new Date().getFullYear();
    const seq = await this.prisma.listing.count();
    const lotCode = `AGRI-${product.slug.toUpperCase()}-${year}-${String(seq + 1).padStart(6, "0")}`;
    const listing = await this.prisma.listing.create({
      data: {
        lotCode,
        title: dto.title ?? `${product.name} — ${dto.province}`,
        description: dto.description,
        productId: dto.productId,
        variety: dto.variety,
        quantity: dto.quantity,
        availableQty: dto.quantity,
        unit: dto.unit ?? product.unit,
        pricePerUnit: dto.pricePerUnit,
        negotiable: dto.negotiable ?? true,
        quality: dto.quality ?? "A",
        province: dto.province,
        municipality: dto.municipality,
        harvestDate: dto.harvestDate ? new Date(dto.harvestDate) : undefined,
        availableFrom: dto.availableFrom ? new Date(dto.availableFrom) : undefined,
        paymentTerms: dto.paymentTerms,
        deliveryTerms: dto.deliveryTerms,
        deliveryAvailable: dto.deliveryAvailable ?? false,
        recurring: dto.recurring ?? false,
        sellerId,
        organizationId: membership?.organizationId,
        lat: geo?.lat,
        lng: geo?.lng,
        photos: [],
      },
      include: { product: true, seller: { select: publicUser } },
    });
    await this.audit.log({
      userId: sellerId,
      action: "CREATE_LISTING",
      entity: "Listing",
      entityId: listing.id,
    });
    await this.prisma.analyticsEvent.create({
      data: { userId: sellerId, name: "listing_created", props: { lotCode } },
    });
    await this.notifyNearbyBuyers(listing.id, product.name, dto.province);
    return listing;
  }

  async search(q: ListingQueryDto) {
    const page = Math.max(1, q.page ?? 1);
    const limit = Math.min(50, q.limit ?? 12);
    const where: Prisma.ListingWhereInput = {
      status: "ACTIVE",
      ...(q.productId ? { productId: q.productId } : {}),
      ...(q.province ? { province: q.province } : {}),
      ...(q.municipality ? { municipality: q.municipality } : {}),
      ...(q.quality ? { quality: q.quality as never } : {}),
      ...(q.minQty ? { availableQty: { gte: q.minQty } } : {}),
      ...(q.maxPrice ? { pricePerUnit: { lte: q.maxPrice } } : {}),
      ...(q.q
        ? {
            OR: [
              { title: { contains: q.q, mode: "insensitive" } },
              { lotCode: { contains: q.q, mode: "insensitive" } },
              { product: { name: { contains: q.q, mode: "insensitive" } } },
            ],
          }
        : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.listing.findMany({
        where,
        include: {
          product: true,
          seller: { select: publicUser },
          organization: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.listing.count({ where }),
    ]);
    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async get(id: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: {
        product: { include: { category: true } },
        seller: { select: publicUser },
        organization: true,
        farm: true,
      },
    });
    if (!listing) throw new NotFoundException("Oferta não encontrada");
    await this.prisma.listing.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
    return listing;
  }

  async mine(sellerId: string) {
    return this.prisma.listing.findMany({
      where: { sellerId },
      include: { product: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async products() {
    return this.prisma.product.findMany({ include: { category: true }, orderBy: { name: "asc" } });
  }

  private async notifyNearbyBuyers(listingId: string, productName: string, province: string) {
    const buyers = await this.prisma.user.findMany({
      where: {
        intent: { in: ["BUYER", "COMPANY", "EXPORTER"] },
        province,
      },
      take: 20,
    });
    if (!buyers.length) return;
    await this.prisma.notification.createMany({
      data: buyers.map((b) => ({
        userId: b.id,
        title: `Nova oferta de ${productName}`,
        body: `Há uma nova oferta de ${productName} em ${province}.`,
        link: `/app/marketplace/${listingId}`,
        priority: "OPPORTUNITY",
      })),
    });
  }
}

const publicUser = {
  id: true,
  name: true,
  intent: true,
  province: true,
  trustScore: true,
  identityVerified: true,
  avatarUrl: true,
} as const;
