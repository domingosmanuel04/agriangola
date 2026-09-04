import { Body, Controller, Get, Module, Post } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CurrentUser, type AuthUser } from "../../common/decorators/current-user.decorator";
import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";

class ReviewDto {
  @IsString()
  orderId!: string;
  @IsString()
  targetId!: string;
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;
  @IsOptional()
  @IsString()
  comment?: string;
}

@Controller("reviews")
export class ReviewsController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  async create(@CurrentUser() user: AuthUser, @Body() dto: ReviewDto) {
    const review = await this.prisma.review.create({
      data: {
        orderId: dto.orderId,
        authorId: user.id,
        targetId: dto.targetId,
        rating: dto.rating,
        comment: dto.comment,
      },
    });
    const agg = await this.prisma.review.aggregate({
      where: { targetId: dto.targetId },
      _avg: { rating: true },
    });
    const completed = await this.prisma.order.count({
      where: { sellerId: dto.targetId, status: "COMPLETED" },
    });
    await this.prisma.user.update({
      where: { id: dto.targetId },
      data: { trustScore: Math.min(99, 40 + Math.round((agg._avg.rating ?? 0) * 8) + Math.min(15, completed)) },
    });
    return review;
  }

  @Get()
  mine(@CurrentUser() user: AuthUser) {
    return this.prisma.review.findMany({
      where: { OR: [{ authorId: user.id }, { targetId: user.id }] },
      include: { author: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });
  }
}

@Module({ controllers: [ReviewsController] })
export class ReviewsModule {}
