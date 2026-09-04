import { Body, Controller, Get, Module, Post } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CurrentUser, type AuthUser } from "../../common/decorators/current-user.decorator";
import { IsOptional, IsString } from "class-validator";

class TaskDto {
  @IsString()
  title!: string;
  @IsOptional()
  @IsString()
  dueAt?: string;
}

@Controller("tasks")
export class TasksController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.prisma.task.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: TaskDto) {
    return this.prisma.task.create({
      data: { userId: user.id, title: dto.title, dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined },
    });
  }

  @Post(":id/done")
  async done(@CurrentUser() user: AuthUser, @Body() _b: unknown) {
    return { ok: true };
  }
}

@Controller("disputes")
export class DisputesController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Body() body: { orderId: string; reason: "QUALITY" | "DELAY" | "WRONG_QUANTITY" | "NON_PAYMENT" | "TRANSPORT" | "DAMAGE" | "WRONG_PRODUCT" | "OTHER"; details: string },
  ) {
    return this.prisma.dispute.create({
      data: { orderId: body.orderId, openerId: user.id, reason: body.reason, details: body.details },
    });
  }
}

@Module({ controllers: [TasksController, DisputesController] })
export class ExtraOpsModule {}
