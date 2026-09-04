import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { DemandsService } from "./demands.service";
import { CreateDemandDto, DemandQueryDto } from "./dto";
import { CurrentUser, type AuthUser } from "../../common/decorators/current-user.decorator";
import { Public } from "../../common/decorators/public.decorator";

@ApiTags("demands")
@Controller("demands")
export class DemandsController {
  constructor(private readonly demands: DemandsService) {}

  @Public()
  @Get()
  search(@Query() q: DemandQueryDto) {
    return this.demands.search(q);
  }

  @ApiBearerAuth()
  @Get("mine")
  mine(@CurrentUser() user: AuthUser) {
    return this.demands.mine(user.id);
  }

  @Public()
  @Get(":id")
  get(@Param("id") id: string) {
    return this.demands.get(id);
  }

  @ApiBearerAuth()
  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateDemandDto) {
    return this.demands.create(user.id, dto);
  }
}
