import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { ListingsService } from "./listings.service";
import { CreateListingDto, ListingQueryDto } from "./dto";
import { CurrentUser, type AuthUser } from "../../common/decorators/current-user.decorator";
import { Public } from "../../common/decorators/public.decorator";

@ApiTags("listings")
@Controller("listings")
export class ListingsController {
  constructor(private readonly listings: ListingsService) {}

  @Public()
  @Get()
  search(@Query() q: ListingQueryDto) {
    return this.listings.search(q);
  }

  @Public()
  @Get("catalog/products")
  products() {
    return this.listings.products();
  }

  @ApiBearerAuth()
  @Get("mine")
  mine(@CurrentUser() user: AuthUser) {
    return this.listings.mine(user.id);
  }

  @Public()
  @Get(":id")
  get(@Param("id") id: string) {
    return this.listings.get(id);
  }

  @ApiBearerAuth()
  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateListingDto) {
    return this.listings.create(user.id, dto);
  }
}
