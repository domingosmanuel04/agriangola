import { Controller, Get, Module, Query } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { Public } from "../../common/decorators/public.decorator";

@Controller("warehouses")
export class WarehousesController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  list(@Query("province") province?: string, @Query("type") type?: string) {
    return this.prisma.warehouse.findMany({
      where: {
        ...(province ? { province } : {}),
        ...(type ? { type: type as never } : {}),
      },
      include: { organization: { select: { name: true, verified: true } } },
    });
  }
}

@Module({ controllers: [WarehousesController] })
export class WarehousesModule {}
