import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { RequestShipmentDto, ShipmentsService } from "./shipments.service";
import {
  CurrentUser,
  type AuthUser,
} from "../../common/decorators/current-user.decorator";
import { IsOptional, IsString } from "class-validator";

class AcceptDto {
  @IsOptional()
  @IsString()
  vehicleId?: string;
}

@ApiTags("logistics")
@ApiBearerAuth()
@Controller("shipments")
export class ShipmentsController {
  constructor(private readonly shipments: ShipmentsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.shipments.list(user.id);
  }

  @Get("vehicles")
  vehicles() {
    return this.shipments.vehicles();
  }

  @Post()
  request(@CurrentUser() user: AuthUser, @Body() dto: RequestShipmentDto) {
    return this.shipments.request(user.id, dto);
  }

  @Get(":id")
  get(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return this.shipments.get(id, user.id);
  }

  @Post(":id/accept")
  accept(
    @Param("id") id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: AcceptDto,
  ) {
    return this.shipments.accept(id, user.id, dto.vehicleId);
  }

  @Post(":id/advance")
  advance(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return this.shipments.advance(id, user.id);
  }
}
