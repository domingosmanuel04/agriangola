import { Module, Body, Controller, Get, Post } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { Public } from "../../common/decorators/public.decorator";
import { CurrentUser, type AuthUser } from "../../common/decorators/current-user.decorator";
import { IsOptional, IsString } from "class-validator";

class EventDto {
  @IsString()
  name!: string;
  @IsOptional()
  props?: Record<string, unknown>;
}

@Controller("analytics")
export class AnalyticsController {
  constructor(private readonly prisma: PrismaService) {}

  @Post("events")
  async track(@CurrentUser() user: AuthUser, @Body() dto: EventDto) {
    await this.prisma.analyticsEvent.create({
      data: { userId: user.id, name: dto.name, props: dto.props as object | undefined },
    });
    return { ok: true };
  }

  @Public()
  @Get("kpis")
  async kpis() {
    const [users, listings, orders, gmv] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.listing.count({ where: { status: "ACTIVE" } }),
      this.prisma.order.count(),
      this.prisma.order.aggregate({ _sum: { totalAmount: true } }),
    ]);
    return { mau: users, listings, orders, gmv: gmv._sum.totalAmount ?? 0 };
  }
}

@Module({
  controllers: [AnalyticsController],
})
export class AnalyticsModule {}
