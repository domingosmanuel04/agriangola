import { Body, Controller, Get, Module, Post, Query } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CurrentUser, type AuthUser } from "../../common/decorators/current-user.decorator";
import { Public } from "../../common/decorators/public.decorator";
import { IsString } from "class-validator";

class PostDto {
  @IsString()
  category!: string;
  @IsString()
  title!: string;
  @IsString()
  body!: string;
}

@Controller("community")
export class CommunityController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  list(@Query("category") category?: string) {
    return this.prisma.communityPost.findMany({
      where: category ? { category } : {},
      include: { author: { select: { name: true, intent: true, province: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: PostDto) {
    return this.prisma.communityPost.create({
      data: { authorId: user.id, ...dto },
    });
  }
}

@Module({ controllers: [CommunityController] })
export class CommunityModule {}
