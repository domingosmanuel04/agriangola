import { Module } from "@nestjs/common";
import { ListingsController } from "./listings.controller";
import { ListingsService } from "./listings.service";
import { AuditService } from "../../common/audit.service";

@Module({
  controllers: [ListingsController],
  providers: [ListingsService, AuditService],
  exports: [ListingsService],
})
export class ListingsModule {}
