import { Body, Controller, Get, Module, Post } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CurrentUser, type AuthUser } from "../../common/decorators/current-user.decorator";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";

class InventoryDto {
  @IsString()
  name!: string;
  @IsString()
  kind!: string;
  @IsNumber()
  @Type(() => Number)
  quantity!: number;
  @IsString()
  unit!: string;
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minQuantity?: number;
}

@Controller("inventory")
export class InventoryController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(@CurrentUser() user: AuthUser) {
    const m = await this.prisma.membership.findFirst({ where: { userId: user.id } });
    if (!m) return [];
    const items = await this.prisma.inventoryItem.findMany({ where: { organizationId: m.organizationId } });
    return items.map((i) => ({
      ...i,
      alerts: [
        ...(i.quantity <= i.minQuantity ? ["Stock baixo."] : []),
        ...(i.expiresAt && i.expiresAt.getTime() - Date.now() < 1000 * 60 * 60 * 24 * 14
          ? ["Produto próximo do vencimento."]
          : []),
      ],
    }));
  }

  @Post()
  async create(@CurrentUser() user: AuthUser, @Body() dto: InventoryDto) {
    const m = await this.prisma.membership.findFirst({ where: { userId: user.id } });
    if (!m) return { error: "Sem organização" };
    return this.prisma.inventoryItem.create({
      data: {
        organizationId: m.organizationId,
        name: dto.name,
        kind: dto.kind,
        quantity: dto.quantity,
        unit: dto.unit,
        minQuantity: dto.minQuantity ?? 0,
      },
    });
  }
}

@Module({ controllers: [InventoryController] })
export class InventoryModule {}
