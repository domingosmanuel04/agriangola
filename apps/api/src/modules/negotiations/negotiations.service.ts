import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { AuditService } from "../../common/audit.service";
import { CounterDto, StartNegotiationDto } from "./dto";

@Injectable()
export class NegotiationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async start(userId: string, dto: StartNegotiationDto) {
    if (!dto.listingId && !dto.demandId) {
      throw new BadRequestException("Indique uma oferta ou uma procura");
    }
    const listing = dto.listingId
      ? await this.prisma.listing.findUnique({ where: { id: dto.listingId } })
      : null;
    const demand = dto.demandId
      ? await this.prisma.demand.findUnique({ where: { id: dto.demandId } })
      : null;
    if (dto.listingId && !listing)
      throw new NotFoundException("Oferta não encontrada");
    if (dto.demandId && !demand)
      throw new NotFoundException("Procura não encontrada");
    if (listing && listing.status !== "ACTIVE")
      throw new BadRequestException("Esta oferta já não está disponível");
    if (demand && demand.status !== "OPEN")
      throw new BadRequestException("Esta procura já não está aberta");
    if (listing && dto.quantity > listing.availableQty)
      throw new BadRequestException("A quantidade excede a oferta disponível");
    if (demand && demand.buyerId !== userId && listing?.sellerId !== userId)
      throw new ForbiddenException("Não pode responder a esta procura");
    if (listing && demand && listing.productId !== demand.productId)
      throw new BadRequestException(
        "Oferta e procura referem produtos diferentes",
      );
    const sellerId = listing?.sellerId;
    const buyerId = demand?.buyerId ?? userId;
    const actualSeller = sellerId ?? userId;
    if (buyerId === actualSeller)
      throw new BadRequestException("Não pode negociar consigo próprio");

    const negotiation = await this.prisma.negotiation.create({
      data: {
        listingId: listing?.id,
        demandId: demand?.id,
        buyerId,
        sellerId: actualSeller,
        quantity: dto.quantity,
        unit: dto.unit ?? listing?.unit ?? "t",
        pricePerUnit: dto.pricePerUnit,
        deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : undefined,
        deliveryPlace: dto.deliveryPlace,
        messages: dto.message
          ? {
              create: {
                authorId: userId,
                body: dto.message,
                kind: "PROPOSAL",
                quantity: dto.quantity,
                pricePerUnit: dto.pricePerUnit,
              },
            }
          : undefined,
      },
      include: { messages: true, listing: { include: { product: true } } },
    });
    const other = userId === buyerId ? actualSeller : buyerId;
    await this.prisma.notification.create({
      data: {
        userId: other,
        title: "Nova proposta de negociação",
        body: `${dto.quantity} ${negotiation.unit} a ${dto.pricePerUnit} Kz`,
        link: `/app/negotiations/${negotiation.id}`,
        priority: "IMPORTANT",
      },
    });
    await this.audit.log({
      userId,
      action: "START_NEGOTIATION",
      entity: "Negotiation",
      entityId: negotiation.id,
    });
    await this.prisma.analyticsEvent.create({
      data: { userId, name: "quote_requested" },
    });
    return negotiation;
  }

  async list(userId: string) {
    return this.prisma.negotiation.findMany({
      where: { OR: [{ buyerId: userId }, { sellerId: userId }] },
      include: {
        listing: { include: { product: true } },
        demand: { include: { product: true } },
        buyer: { select: { id: true, name: true, trustScore: true } },
        seller: { select: { id: true, name: true, trustScore: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  async get(id: string, userId: string) {
    const n = await this.prisma.negotiation.findUnique({
      where: { id },
      include: {
        listing: {
          include: {
            product: true,
            seller: { select: { id: true, name: true } },
          },
        },
        demand: { include: { product: true } },
        buyer: {
          select: { id: true, name: true, trustScore: true, province: true },
        },
        seller: {
          select: { id: true, name: true, trustScore: true, province: true },
        },
        messages: { orderBy: { createdAt: "asc" } },
      },
    });
    if (!n) throw new NotFoundException();
    if (n.buyerId !== userId && n.sellerId !== userId)
      throw new ForbiddenException();
    return n;
  }

  async counter(id: string, userId: string, dto: CounterDto) {
    const n = await this.get(id, userId);
    if (
      n.status === "CONVERTED" ||
      n.status === "CANCELLED" ||
      n.status === "REJECTED"
    ) {
      throw new BadRequestException("Negociação encerrada");
    }
    const updated = await this.prisma.negotiation.update({
      where: { id },
      data: {
        status: "COUNTERED",
        quantity: dto.quantity ?? n.quantity,
        pricePerUnit: dto.pricePerUnit ?? n.pricePerUnit,
        deliveryDate: dto.deliveryDate
          ? new Date(dto.deliveryDate)
          : n.deliveryDate,
        deliveryPlace: dto.deliveryPlace ?? n.deliveryPlace,
        transportNotes: dto.transportNotes ?? n.transportNotes,
        paymentNotes: dto.paymentNotes ?? n.paymentNotes,
        messages: {
          create: {
            authorId: userId,
            kind: "COUNTER",
            body: dto.body ?? "Contraproposta",
            quantity: dto.quantity,
            pricePerUnit: dto.pricePerUnit,
          },
        },
      },
      include: { messages: true },
    });
    const other = userId === n.buyerId ? n.sellerId : n.buyerId;
    await this.prisma.notification.create({
      data: {
        userId: other,
        title: "Contraproposta recebida",
        body: dto.body ?? "A outra parte alterou as condições.",
        link: `/app/negotiations/${id}`,
        priority: "IMPORTANT",
      },
    });
    return updated;
  }

  async accept(id: string, userId: string) {
    const n = await this.get(id, userId);
    if (["CONVERTED", "CANCELLED", "REJECTED"].includes(n.status))
      throw new BadRequestException("Negociação encerrada");
    if (n.status === "ACCEPTED") return n;
    const updated = await this.prisma.negotiation.update({
      where: { id },
      data: {
        status: "ACCEPTED",
        messages: {
          create: { authorId: userId, kind: "ACCEPT", body: "Proposta aceite" },
        },
      },
    });
    return updated;
  }

  async reject(id: string, userId: string) {
    const n = await this.get(id, userId);
    if (["CONVERTED", "CANCELLED", "REJECTED"].includes(n.status))
      throw new BadRequestException("Negociação encerrada");
    return this.prisma.negotiation.update({
      where: { id },
      data: {
        status: "REJECTED",
        messages: {
          create: {
            authorId: userId,
            kind: "REJECT",
            body: "Proposta recusada",
          },
        },
      },
    });
  }

  async summarize(id: string, userId: string) {
    const n = await this.get(id, userId);
    return {
      quantidade: `${n.quantity} ${n.unit}`,
      precoFinal: `${n.pricePerUnit} Kz/${n.unit}`,
      total: n.quantity * n.pricePerUnit,
      entrega: n.deliveryPlace ?? "A definir",
      prazo: n.deliveryDate,
      estado: n.status,
      mensagens: n.messages.length,
    };
  }
}
