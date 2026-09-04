import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { computeTrustScore } from "../../shared";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async profile(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        badges: true,
        farms: true,
        listings: { where: { status: "ACTIVE" }, take: 8, include: { product: true } },
        reviewsReceived: { take: 8, orderBy: { createdAt: "desc" }, include: { author: true } },
        memberships: { include: { organization: true } },
      },
    });
    if (!user) throw new NotFoundException("Utilizador não encontrado");
    const completed = await this.prisma.order.count({
      where: { sellerId: id, status: "COMPLETED" },
    });
    const cancelled = await this.prisma.order.count({
      where: { sellerId: id, status: "CANCELLED" },
    });
    const reviews = user.reviewsReceived;
    const reviewAvg = reviews.length
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;
    const fulfillmentRate =
      completed + cancelled === 0 ? 0 : completed / (completed + cancelled);
    const trustScore = computeTrustScore({
      identityVerified: user.identityVerified,
      orgVerified: user.memberships.some((m) => m.organization.verified),
      fulfillmentRate,
      reviewAvg,
      reviewCount: reviews.length,
      cancellations: cancelled,
      disputesLost: 0,
      completedOrders: completed,
    });
    const { passwordHash: _, ...safe } = user;
    return {
      ...safe,
      stats: { completed, cancelled, reviewAvg, fulfillmentRate, trustScore },
    };
  }

  async updateMe(
    id: string,
    data: { name?: string; bio?: string; province?: string; municipality?: string; phone?: string },
  ) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        intent: true,
        province: true,
        municipality: true,
        phone: true,
        trustScore: true,
        agriScore: true,
      },
    });
  }
}
