import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CreateFarmDto, DiaryDto, FarmsService, FieldDto } from "./farms.service";
import { CurrentUser, type AuthUser } from "../../common/decorators/current-user.decorator";
import { Public } from "../../common/decorators/public.decorator";

@ApiTags("farms")
@ApiBearerAuth()
@Controller("farms")
export class FarmsController {
  constructor(private readonly farms: FarmsService) {}

  @Get()
  mine(@CurrentUser() user: AuthUser) {
    return this.farms.mine(user.id);
  }

  @Public()
  @Get("calendar")
  calendar(@Query("crop") crop = "milho") {
    return this.farms.calendar(crop);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateFarmDto) {
    return this.farms.create(user.id, dto);
  }

  @Post("fields")
  field(@CurrentUser() user: AuthUser, @Body() dto: FieldDto) {
    return this.farms.addField(user.id, dto);
  }

  @Post("diary")
  diary(@CurrentUser() user: AuthUser, @Body() dto: DiaryDto) {
    return this.farms.diary(user.id, dto);
  }

  @Get(":id")
  get(@Param("id") id: string) {
    return this.farms.get(id);
  }
}
