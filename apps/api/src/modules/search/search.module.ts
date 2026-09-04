import { Controller, Get, Module, Query } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { Public } from "../../common/decorators/public.decorator";

@Controller("search")
export class SearchController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  async search(@Query("q") q = "") {
    const term = q.trim();
    if (term.length < 2) return { listings: [], users: [], demands: [], warehouses: [], courses: [] };
    const [listings, users, demands, warehouses, courses] = await Promise.all([
      this.prisma.listing.findMany({
        where: {
          status: "ACTIVE",
          OR: [
            { title: { contains: term, mode: "insensitive" } },
            { lotCode: { contains: term, mode: "insensitive" } },
            { product: { name: { contains: term, mode: "insensitive" } } },
          ],
        },
        include: { product: true },
        take: 8,
      }),
      this.prisma.user.findMany({
        where: { name: { contains: term, mode: "insensitive" }, isBlocked: false },
        select: { id: true, name: true, intent: true, province: true, trustScore: true },
        take: 6,
      }),
      this.prisma.demand.findMany({
        where: { status: "OPEN", title: { contains: term, mode: "insensitive" } },
        take: 6,
      }),
      this.prisma.warehouse.findMany({
        where: { name: { contains: term, mode: "insensitive" } },
        take: 5,
      }),
      this.prisma.course.findMany({
        where: { title: { contains: term, mode: "insensitive" } },
        take: 5,
      }),
    ]);
    return { listings, users, demands, warehouses, courses };
  }
}

@Module({ controllers: [SearchController] })
export class SearchModule {}
