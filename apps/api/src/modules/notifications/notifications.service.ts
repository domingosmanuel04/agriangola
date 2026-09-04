import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  unreadCount(userId: string) {
    return this.prisma.notification.count({ where: { userId, read: false } });
  }

  async markRead(userId: string, id?: string) {
    if (id) {
      return this.prisma.notification.updateMany({ where: { id, userId }, data: { read: true } });
    }
    return this.prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
  }
}
