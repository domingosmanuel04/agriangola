import { Body, Controller, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AgriAiService } from "./agri-ai.service";
import { CurrentUser, type AuthUser } from "../../common/decorators/current-user.decorator";
import { IsOptional, IsString, MinLength } from "class-validator";

class AskDto {
  @IsString()
  @MinLength(2)
  prompt!: string;
  @IsOptional()
  @IsString()
  imageHint?: string;
}

@ApiTags("agri-ai")
@ApiBearerAuth()
@Controller("ai")
export class AgriAiController {
  constructor(private readonly ai: AgriAiService) {}

  @Post("ask")
  ask(@CurrentUser() user: AuthUser, @Body() dto: AskDto) {
    return this.ai.ask(user.id, dto.prompt, dto.imageHint);
  }

  @Post("scan")
  scan(@CurrentUser() user: AuthUser, @Body() dto: AskDto) {
    return this.ai.ask(
      user.id,
      dto.prompt || "Identificar produto agrícola na fotografia",
      dto.imageHint ?? dto.prompt,
    );
  }

  @Post("command")
  command(@CurrentUser() user: AuthUser, @Body() dto: AskDto) {
    return this.ai.ask(user.id, dto.prompt);
  }
}
