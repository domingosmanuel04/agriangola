import { Controller, Get, Module } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { Public } from "../../common/decorators/public.decorator";

@Controller("opportunities")
export class OpportunitiesController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  list() {
    return this.prisma.opportunity.findMany({ orderBy: { createdAt: "desc" } });
  }

  @Public()
  @Get("academy")
  academy() {
    return this.prisma.course.findMany({ include: { lessons: { orderBy: { order: "asc" } } } });
  }

  @Public()
  @Get("machines")
  machines() {
    return this.prisma.machineListing.findMany({ where: { available: true } });
  }
}

@Module({ controllers: [OpportunitiesController] })
export class OpportunitiesModule {}
