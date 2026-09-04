import { Body, Controller, Get, Param, Patch, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AdminService } from "./admin.service";
import { CurrentUser, type AuthUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { RolesGuard } from "../../common/guards/roles.guard";
import { IsBoolean, IsString } from "class-validator";

class VerifyDto {
  @IsBoolean()
  verified!: boolean;
}
class BlockDto {
  @IsBoolean()
  blocked!: boolean;
}
class ResolveDto {
  @IsString()
  resolution!: string;
}

@ApiTags("admin")
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles("ADMIN", "OPERATOR")
@Controller("admin")
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get("overview")
  overview(@CurrentUser() user: AuthUser) {
    this.admin.assertAdmin(user.intent);
    return this.admin.overview();
  }

  @Get("control-tower")
  tower(@CurrentUser() user: AuthUser) {
    this.admin.assertAdmin(user.intent);
    return this.admin.controlTower();
  }

  @Get("users")
  users(@CurrentUser() user: AuthUser, @Query("q") q?: string) {
    this.admin.assertAdmin(user.intent);
    return this.admin.users(q);
  }

  @Patch("users/:id/verify")
  verify(@CurrentUser() user: AuthUser, @Param("id") id: string, @Body() dto: VerifyDto) {
    this.admin.assertAdmin(user.intent);
    return this.admin.verifyUser(id, dto.verified);
  }

  @Patch("users/:id/block")
  block(@CurrentUser() user: AuthUser, @Param("id") id: string, @Body() dto: BlockDto) {
    this.admin.assertAdmin(user.intent);
    return this.admin.blockUser(id, dto.blocked);
  }

  @Get("listings")
  listings(@CurrentUser() user: AuthUser) {
    this.admin.assertAdmin(user.intent);
    return this.admin.listings();
  }

  @Patch("listings/:id/hide")
  hide(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    this.admin.assertAdmin(user.intent);
    return this.admin.hideListing(id);
  }

  @Get("disputes")
  disputes(@CurrentUser() user: AuthUser) {
    this.admin.assertAdmin(user.intent);
    return this.admin.disputes();
  }

  @Patch("disputes/:id")
  resolve(@CurrentUser() user: AuthUser, @Param("id") id: string, @Body() dto: ResolveDto) {
    this.admin.assertAdmin(user.intent);
    return this.admin.resolveDispute(id, dto.resolution);
  }

  @Get("audit")
  audit(@CurrentUser() user: AuthUser) {
    this.admin.assertAdmin(user.intent);
    return this.admin.audit();
  }
}
