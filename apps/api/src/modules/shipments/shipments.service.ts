import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { ShipmentStatus } from "@prisma/client";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";

export class RequestShipmentDto {
  @IsString()
  orderId!: string;
  @IsOptional()
  @IsString()
  pickupAddress?: string;
  @IsOptional()
  @IsString()
  dropoffAddress?: string;
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  quotedPrice?: number;
}

const FLOW: ShipmentStatus[] = [
  "REQUESTED",
  "ACCEPTED",
  "EN_ROUTE_PICKUP",
  "PICKED_UP",
  "IN_TRANSIT",
  "ARRIVED",
  "DELIVERED",
];

@Injectable()
export class ShipmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async request(userId: string, dto: RequestShipmentDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
    });
    if (!order) throw new NotFoundException("Pedido não encontrado");
    if (order.buyerId !== userId && order.sellerId !== userId)
      throw new BadRequestException();
    const existing = await this.prisma.shipment.findUnique({
      where: { orderId: order.id },
    });
    if (existing) return this.get(existing.id);

    const shipment = await this.prisma.shipment.create({
      data: {
        orderId: order.id,
        pickupAddress: dto.pickupAddress ?? order.provinceFrom ?? undefined,
        dropoffAddress: dto.dropoffAddress ?? order.provinceTo ?? undefined,
        quotedPrice: dto.quotedPrice,
        status: "REQUESTED",
        events: {
          create: { status: "REQUESTED", note: "Transporte solicitado" },
        },
      },
      include: { events: true, order: true },
    });
    const transporters = await this.prisma.user.findMany({
      where: { intent: "TRANSPORTER" },
      take: 10,
    });
    if (transporters.length) {
      await this.prisma.notification.createMany({
        data: transporters.map((t) => ({
          userId: t.id,
          title: "Nova carga disponível",
          body: `${order.quantity} ${order.unit} de ${order.productName}`,
          link: `/app/logistics/${shipment.id}`,
          priority: "OPPORTUNITY",
        })),
      });
    }
    return shipment;
  }

  async list(userId: string) {
    return this.prisma.shipment.findMany({
      where: {
        OR: [
          { transporterId: userId },
          { order: { buyerId: userId } },
          { order: { sellerId: userId } },
        ],
      },
      include: {
        order: true,
        vehicle: true,
        events: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async get(id: string, userId?: string) {
    const s = await this.prisma.shipment.findUnique({
      where: { id },
      include: {
        order: { include: { buyer: true, seller: true } },
        vehicle: true,
        events: { orderBy: { createdAt: "asc" } },
      },
    });
    if (!s) throw new NotFoundException();
    if (
      userId &&
      s.order.buyerId !== userId &&
      s.order.sellerId !== userId &&
      s.transporterId !== userId
    )
      throw new ForbiddenException();
    return s;
  }

  async accept(id: string, transporterId: string, vehicleId?: string) {
    const shipment = await this.get(id);
    const transporter = await this.prisma.user.findUnique({
      where: { id: transporterId },
      select: { intent: true },
    });
    if (transporter?.intent !== "TRANSPORTER")
      throw new ForbiddenException(
        "Apenas transportadores podem aceitar cargas",
      );
    if (shipment.status !== "REQUESTED")
      throw new BadRequestException("Esta carga já foi atribuída");
    const vehicle = vehicleId
      ? await this.prisma.vehicle.findUnique({ where: { id: vehicleId } })
      : null;
    if (
      vehicleId &&
      (!vehicle || vehicle.ownerId !== transporterId || !vehicle.available)
    )
      throw new BadRequestException("Veículo indisponível");
    if (vehicle && vehicle.capacityTons < shipment.order.quantity)
      throw new BadRequestException("A capacidade do veículo é insuficiente");
    return this.prisma.shipment.update({
      where: { id },
      data: {
        transporterId,
        vehicleId,
        status: "ACCEPTED",
        events: {
          create: { status: "ACCEPTED", note: "Transportador aceite" },
        },
      },
    });
  }

  async advance(id: string, userId: string) {
    const s = await this.get(id, userId);
    if (
      s.transporterId !== userId &&
      s.order.buyerId !== userId &&
      s.order.sellerId !== userId
    )
      throw new ForbiddenException();
    if (s.status === "REQUESTED")
      throw new BadRequestException("Atribua primeiro um transportador");
    const idx = FLOW.indexOf(s.status);
    if (idx < 0 || idx >= FLOW.length - 1)
      throw new BadRequestException("Não é possível avançar");
    const next = FLOW[idx + 1];
    const updated = await this.prisma.shipment.update({
      where: { id },
      data: {
        status: next,
        events: { create: { status: next, note: statusLabel(next) } },
      },
      include: { events: true, order: true },
    });
    if (next === "DELIVERED") {
      await this.prisma.order.update({
        where: { id: s.orderId },
        data: { status: "DELIVERED" },
      });
      await this.prisma.notification.createMany({
        data: [
          {
            userId: s.order.buyerId,
            title: "Entrega confirmada",
            body: `O pedido ${s.order.code} chegou ao destino.`,
            link: `/app/orders/${s.orderId}`,
            priority: "IMPORTANT",
          },
          {
            userId: s.order.sellerId,
            title: "Entrega confirmada",
            body: `O pedido ${s.order.code} foi entregue.`,
            link: `/app/orders/${s.orderId}`,
            priority: "INFO",
          },
        ],
      });
    }
    return updated;
  }

  async vehicles() {
    return this.prisma.vehicle.findMany({
      where: { available: true },
      include: {
        owner: { select: { id: true, name: true, trustScore: true } },
      },
    });
  }
}

function statusLabel(s: ShipmentStatus): string {
  const map: Record<ShipmentStatus, string> = {
    REQUESTED: "Pedido confirmado / transporte solicitado",
    ACCEPTED: "Transportador aceite",
    EN_ROUTE_PICKUP: "Veículo a caminho da recolha",
    PICKED_UP: "Produto recolhido",
    IN_TRANSIT: "Em trânsito",
    ARRIVED: "Chegou ao destino",
    DELIVERED: "Entrega confirmada",
    CANCELLED: "Cancelado",
  };
  return map[s];
}
