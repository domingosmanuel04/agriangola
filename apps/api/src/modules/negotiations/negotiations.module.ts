import { Module } from "@nestjs/common";
import { NegotiationsController } from "./negotiations.controller";
import { NegotiationsService } from "./negotiations.service";
import { AuditService } from "../../common/audit.service";

@Module({
  controllers: [NegotiationsController],
  providers: [NegotiationsService, AuditService],
  exports: [NegotiationsService],
})
export class NegotiationsModule {}
