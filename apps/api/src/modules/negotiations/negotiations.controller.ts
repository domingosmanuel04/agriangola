import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { NegotiationsService } from "./negotiations.service";
import { CounterDto, StartNegotiationDto } from "./dto";
import { CurrentUser, type AuthUser } from "../../common/decorators/current-user.decorator";

@ApiTags("negotiations")
@ApiBearerAuth()
@Controller("negotiations")
export class NegotiationsController {
  constructor(private readonly negotiations: NegotiationsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.negotiations.list(user.id);
  }

  @Post()
  start(@CurrentUser() user: AuthUser, @Body() dto: StartNegotiationDto) {
    return this.negotiations.start(user.id, dto);
  }

  @Get(":id")
  get(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return this.negotiations.get(id, user.id);
  }

  @Post(":id/counter")
  counter(@Param("id") id: string, @CurrentUser() user: AuthUser, @Body() dto: CounterDto) {
    return this.negotiations.counter(id, user.id, dto);
  }

  @Post(":id/accept")
  accept(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return this.negotiations.accept(id, user.id);
  }

  @Post(":id/reject")
  reject(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return this.negotiations.reject(id, user.id);
  }

  @Get(":id/summary")
  summary(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return this.negotiations.summarize(id, user.id);
  }
}
