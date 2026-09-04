import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { AuditService } from "../../common/audit.service";

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async convertFromNegotiation(negotiationId: string, userId: string) {
    const n = await this.prisma.negotiation.findUnique({
      where: { id: negotiationId },
      include: {
        listing: { include: { product: true } },
        demand: { include: { product: true } },
      },
    });
    if (!n) throw new NotFoundException();
    if (n.buyerId !== userId && n.sellerId !== userId)
      throw new BadRequestException();
    const existing = await this.prisma.order.findFirst({
      where: { negotiationId },
    });
    if (existing) return this.get(existing.id, userId);
    if (n.status !== "ACCEPTED") {
      throw new BadRequestException(
        "Aceite a negociação antes de converter em contrato/pedido",
      );
    }
    const productName =
      n.listing?.product.name ?? n.demand?.product.name ?? "Produto";
    const seq = await this.prisma.order.count();
    const code = `PED-${new Date().getFullYear()}-${String(seq + 1).padStart(6, "0")}`;
    const total = n.quantity * n.pricePerUnit;

    const order = await this.prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          code,
          listingId: n.listingId,
          negotiationId: n.id,
          buyerId: n.buyerId,
          sellerId: n.sellerId,
          productName,
          quantity: n.quantity,
          unit: n.unit,
          pricePerUnit: n.pricePerUnit,
          totalAmount: total,
          status: "CONFIRMED",
          provinceFrom: n.listing?.province,
          provinceTo: n.deliveryPlace ?? n.demand?.province,
        },
      });
      await tx.negotiation.update({
        where: { id: n.id },
        data: { status: "CONVERTED" },
      });
      if (n.listingId) {
        await tx.listing.update({
          where: { id: n.listingId },
          data: { availableQty: { decrement: n.quantity } },
        });
      }
      const invoiceNumber = `FT-${created.code}`;
      await tx.invoice.create({
        data: { orderId: created.id, number: invoiceNumber, amount: total },
      });
      await tx.payment.create({
        data: {
          orderId: created.id,
          amount: total,
          status: "PENDING",
          method: "TRANSFER",
        },
      });
      const contractCode = `CTR-${created.code}`;
      const body = this.contractBody(created.code, n, productName, total);
      await tx.contract.create({
        data: {
          code: contractCode,
          type: "SALE",
          status: "PENDING_SIGNATURE",
          orderId: created.id,
          negotiationId: n.id,
          parties: { buyerId: n.buyerId, sellerId: n.sellerId },
          terms: {
            quantity: n.quantity,
            unit: n.unit,
            pricePerUnit: n.pricePerUnit,
            total,
            deliveryPlace: n.deliveryPlace,
            deliveryDate: n.deliveryDate,
          },
          body,
        },
      });
      return created;
    });

    await this.prisma.notification.createMany({
      data: [
        {
          userId: n.buyerId,
          title: "Pedido criado",
          body: `${code} — ${productName}. Deseja organizar o transporte?`,
          link: `/app/orders/${order.id}`,
          priority: "IMPORTANT",
        },
        {
          userId: n.sellerId,
          title: "Novo pedido confirmado",
          body: `${code} — ${n.quantity} ${n.unit} de ${productName}`,
          link: `/app/orders/${order.id}`,
          priority: "IMPORTANT",
        },
      ],
    });
    await this.audit.log({
      userId,
      action: "CONVERT_ORDER",
      entity: "Order",
      entityId: order.id,
    });
    await this.prisma.analyticsEvent.create({
      data: { userId, name: "purchase", props: { code, total } },
    });
    return this.get(order.id, userId);
  }

  async list(userId: string) {
    return this.prisma.order.findMany({
      where: { OR: [{ buyerId: userId }, { sellerId: userId }] },
      include: {
        buyer: { select: { id: true, name: true } },
        seller: { select: { id: true, name: true } },
        shipment: true,
        payment: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async get(id: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        buyer: {
          select: { id: true, name: true, trustScore: true, province: true },
        },
        seller: {
          select: { id: true, name: true, trustScore: true, province: true },
        },
        listing: { include: { product: true } },
        shipment: {
          include: { events: { orderBy: { createdAt: "asc" } }, vehicle: true },
        },
        contract: true,
        payment: true,
        invoice: true,
        reviews: true,
        disputes: true,
      },
    });
    if (!order) throw new NotFoundException();
    if (order.buyerId !== userId && order.sellerId !== userId)
      throw new BadRequestException("Sem acesso a este pedido");
    return order;
  }

  async updateStatus(
    id: string,
    userId: string,
    status: "DELIVERED" | "COMPLETED" | "CANCELLED",
  ) {
    const order = await this.get(id, userId);
    const updated = await this.prisma.order.update({
      where: { id },
      data: { status },
    });
    if (status === "COMPLETED" && order.payment) {
      await this.prisma.payment.update({
        where: { orderId: id },
        data: { status: "CAPTURED" },
      });
    }
    return updated;
  }

  private contractBody(
    code: string,
    n: {
      quantity: number;
      unit: string;
      pricePerUnit: number;
      deliveryPlace: string | null;
      buyerId: string;
      sellerId: string;
    },
    productName: string,
    total: number,
  ): string {
    return [
      `CONTRATO DE COMPRA E VENDA AGRÍCOLA — ${code}`,
      `Produto: ${productName}`,
      `Quantidade: ${n.quantity} ${n.unit}`,
      `Preço unitário: ${n.pricePerUnit} Kz`,
      `Valor total: ${total} Kz`,
      `Local de entrega: ${n.deliveryPlace ?? "A acordar"}`,
      `Comprador: ${n.buyerId}`,
      `Vendedor: ${n.sellerId}`,
      `Gerado automaticamente pelo AgriAngola OS. As partes devem rever e assinar.`,
    ].join("\n");
  }
}
