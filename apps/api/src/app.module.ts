import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { ListingsModule } from "./modules/listings/listings.module";
import { DemandsModule } from "./modules/demands/demands.module";
import { MatchingModule } from "./modules/matching/matching.module";
import { NegotiationsModule } from "./modules/negotiations/negotiations.module";
import { OrdersModule } from "./modules/orders/orders.module";
import { ShipmentsModule } from "./modules/shipments/shipments.module";
import { FarmsModule } from "./modules/farms/farms.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { SearchModule } from "./modules/search/search.module";
import { AgriAiModule } from "./modules/agri-ai/agri-ai.module";
import { AdminModule } from "./modules/admin/admin.module";
import { AnalyticsModule } from "./modules/analytics/analytics.module";
import { MapsModule } from "./modules/maps/maps.module";
import { WeatherModule } from "./modules/weather/weather.module";
import { PricesModule } from "./modules/prices/prices.module";
import { ReviewsModule } from "./modules/reviews/reviews.module";
import { ContractsModule } from "./modules/contracts/contracts.module";
import { InventoryModule } from "./modules/inventory/inventory.module";
import { WarehousesModule } from "./modules/warehouses/warehouses.module";
import { CommunityModule } from "./modules/community/community.module";
import { OpportunitiesModule } from "./modules/opportunities/opportunities.module";
import { HealthModule } from "./modules/health/health.module";
import { ExtraOpsModule } from "./modules/tasks/tasks.module";
import { DashboardModule } from "./modules/dashboard/dashboard.module";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: [".env", "../../.env"] }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    ListingsModule,
    DemandsModule,
    MatchingModule,
    NegotiationsModule,
    OrdersModule,
    ShipmentsModule,
    FarmsModule,
    NotificationsModule,
    SearchModule,
    AgriAiModule,
    AdminModule,
    AnalyticsModule,
    MapsModule,
    WeatherModule,
    PricesModule,
    ReviewsModule,
    ContractsModule,
    InventoryModule,
    WarehousesModule,
    CommunityModule,
    OpportunitiesModule,
    ExtraOpsModule,
    DashboardModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
