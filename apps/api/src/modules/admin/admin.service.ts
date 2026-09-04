import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  assertAdmin(intent: string) {
    if (intent !== "ADMIN" && intent !== "OPERATOR") {
      throw new ForbiddenException("Acesso restrito à administração");
    }
  }

  async overview() {
    const [
      users,
      listings,
      demands,
      orders,
      disputes,
      gmv,
    ] = await this.prisma.$transaction([
      this.prisma.user.count(),
      this.prisma.listing.count({ where: { status: "ACTIVE" } }),
      this.prisma.demand.count({ where: { status: "OPEN" } }),
      this.prisma.order.count(),
      this.prisma.dispute.count({ where: { status: "OPEN" } }),
      this.prisma.order.aggregate({ _sum: { totalAmount: true } }),
    ]);
    const byIntent = await this.prisma.user.groupBy({ by: ["intent"], _count: true });
    const recentOrders = await this.prisma.order.findMany({
      take: 12,
      orderBy: { createdAt: "desc" },
      include: { buyer: { select: { name: true } }, seller: { select: { name: true } } },
    });
    return {
      kpis: {
        users,
        listings,
        demands,
        orders,
        disputes,
        gmv: gmv._sum.totalAmount ?? 0,
      },
      byIntent,
      recentOrders,
    };
  }

  users(q?: string) {
    return this.prisma.user.findMany({
      where: q
        ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] }
        : {},
      select: {
        id: true,
        email: true,
        name: true,
        intent: true,
        province: true,
        trustScore: true,
        identityVerified: true,
        isBlocked: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  }

  async verifyUser(id: string, verified: boolean) {
    return this.prisma.user.update({
      where: { id },
      data: { identityVerified: verified },
    });
  }

  async blockUser(id: string, blocked: boolean) {
    return this.prisma.user.update({ where: { id }, data: { isBlocked: blocked } });
  }

  listings() {
    return this.prisma.listing.findMany({
      include: { product: true, seller: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 80,
    });
  }

  async hideListing(id: string) {
    return this.prisma.listing.update({ where: { id }, data: { status: "HIDDEN" } });
  }

  disputes() {
    return this.prisma.dispute.findMany({
      include: { order: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async resolveDispute(id: string, resolution: string) {
    return this.prisma.dispute.update({
      where: { id },
      data: { status: "RESOLVED", resolution },
    });
  }

  audit() {
    return this.prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  }

  controlTower() {
    return this.overview();
  }
}
