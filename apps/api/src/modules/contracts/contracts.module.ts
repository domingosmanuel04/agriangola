import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Module,
  Param,
  Post,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import {
  CurrentUser,
  type AuthUser,
} from "../../common/decorators/current-user.decorator";

@Controller("contracts")
export class ContractsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.prisma.contract.findMany({
      where: {
        OR: [{ order: { buyerId: user.id } }, { order: { sellerId: user.id } }],
      },
      include: { order: true },
      orderBy: { createdAt: "desc" },
    });
  }

  @Get(":id")
  async get(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    const contract = await this.prisma.contract.findUnique({
      where: { id },
      include: { order: true },
    });
    if (
      contract?.order &&
      contract.order.buyerId !== user.id &&
      contract.order.sellerId !== user.id
    )
      throw new ForbiddenException();
    return contract;
  }

  @Post(":id/sign")
  async sign(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    const c = await this.prisma.contract.findUnique({
      where: { id },
      include: { order: true },
    });
    if (!c?.order) return c;
    if (c.order.buyerId !== user.id && c.order.sellerId !== user.id)
      throw new ForbiddenException();
    const isBuyer = c.order.buyerId === user.id;
    const data = isBuyer
      ? { signedBuyerAt: new Date() }
      : { signedSellerAt: new Date() };
    const updated = await this.prisma.contract.update({ where: { id }, data });
    if (
      (updated.signedBuyerAt || data.signedBuyerAt) &&
      (updated.signedSellerAt || data.signedSellerAt)
    ) {
      return this.prisma.contract.update({
        where: { id },
        data: { status: "ACTIVE" },
      });
    }
    return updated;
  }
}

@Module({ controllers: [ContractsController] })
export class ContractsModule {}
