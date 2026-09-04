import { Controller, Get, Param, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { MatchingService } from "./matching.service";

@ApiTags("matching")
@ApiBearerAuth()
@Controller("matching")
export class MatchingController {
  constructor(private readonly matching: MatchingService) {}

  @Post("demands/:id/recompute")
  recompute(@Param("id") id: string) {
    return this.matching.recomputeForDemand(id);
  }

  @Get("listings/:id")
  forListing(@Param("id") id: string) {
    return this.matching.forListing(id);
  }
}
