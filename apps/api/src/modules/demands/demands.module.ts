import { Module } from "@nestjs/common";
import { DemandsController } from "./demands.controller";
import { DemandsService } from "./demands.service";
import { MatchingService } from "../matching/matching.service";
import { AuditService } from "../../common/audit.service";

@Module({
  controllers: [DemandsController],
  providers: [DemandsService, MatchingService, AuditService],
  exports: [DemandsService],
})
export class DemandsModule {}
