import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { OrdersService } from "./orders.service";
import { CurrentUser, type AuthUser } from "../../common/decorators/current-user.decorator";
import { IsIn, IsString } from "class-validator";

class StatusDto {
  @IsString()
  @IsIn(["DELIVERED", "COMPLETED", "CANCELLED"])
  status!: "DELIVERED" | "COMPLETED" | "CANCELLED";
}

@ApiTags("orders")
@ApiBearerAuth()
@Controller("orders")
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.orders.list(user.id);
  }

  @Post("from-negotiation/:negotiationId")
  convert(@Param("negotiationId") negotiationId: string, @CurrentUser() user: AuthUser) {
    return this.orders.convertFromNegotiation(negotiationId, user.id);
  }

  @Get(":id")
  get(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return this.orders.get(id, user.id);
  }

  @Patch(":id/status")
  status(@Param("id") id: string, @CurrentUser() user: AuthUser, @Body() dto: StatusDto) {
    return this.orders.updateStatus(id, user.id, dto.status);
  }
}
