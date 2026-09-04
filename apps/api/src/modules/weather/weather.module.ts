import { Module, Controller, Get, Query } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { Public } from "../../common/decorators/public.decorator";

@Controller("weather")
export class WeatherController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  async get(@Query("province") province = "Luanda") {
    const snaps = await this.prisma.weatherSnapshot.findMany({
      where: { province },
      orderBy: { capturedAt: "desc" },
      take: 7,
    });
    const latest = snaps[0];
    const alerts: string[] = [];
    if (latest) {
      if (latest.rainMm >= 20) alerts.push("Possibilidade elevada de chuva nas próximas 24 horas.");
      if (latest.rainMm < 2 && latest.temperature > 30) alerts.push("Risco de stress hídrico.");
      if (latest.rainMm >= 8 && latest.rainMm < 20) alerts.push("Condições favoráveis para plantio em zonas de sequeiro.");
      if (latest.alert) alerts.push(latest.alert);
    }
    return { province, latest, forecast: snaps, alerts };
  }
}

@Module({ controllers: [WeatherController] })
export class WeatherModule {}
