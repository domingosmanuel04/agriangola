import { Module } from "@nestjs/common";
import { AgriAiController } from "./agri-ai.controller";
import { AgriAiService } from "./agri-ai.service";

@Module({
  controllers: [AgriAiController],
  providers: [AgriAiService],
})
export class AgriAiModule {}
