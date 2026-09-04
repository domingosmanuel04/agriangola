import { Body, Controller, Get, Param, Patch } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { CurrentUser, type AuthUser } from "../../common/decorators/current-user.decorator";
import { IsOptional, IsString } from "class-validator";

class UpdateMeDto {
  @IsOptional()
  @IsString()
  name?: string;
  @IsOptional()
  @IsString()
  bio?: string;
  @IsOptional()
  @IsString()
  province?: string;
  @IsOptional()
  @IsString()
  municipality?: string;
  @IsOptional()
  @IsString()
  phone?: string;
}

@ApiTags("users")
@ApiBearerAuth()
@Controller("users")
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get("me")
  me(@CurrentUser() user: AuthUser) {
    return this.users.profile(user.id);
  }

  @Patch("me")
  update(@CurrentUser() user: AuthUser, @Body() dto: UpdateMeDto) {
    return this.users.updateMe(user.id, dto);
  }

  @Get(":id")
  profile(@Param("id") id: string) {
    return this.users.profile(id);
  }
}
