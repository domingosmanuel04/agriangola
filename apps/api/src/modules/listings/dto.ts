import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from "class-validator";
import { QualityGrade } from "@prisma/client";
import { Type } from "class-transformer";

export class CreateListingDto {
  @IsString()
  productId!: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  variety?: string;

  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  quantity!: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  pricePerUnit!: number;

  @IsOptional()
  @IsBoolean()
  negotiable?: boolean;

  @IsOptional()
  @IsEnum(QualityGrade)
  quality?: QualityGrade;

  @IsString()
  province!: string;

  @IsOptional()
  @IsString()
  municipality?: string;

  @IsOptional()
  @IsDateString()
  harvestDate?: string;

  @IsOptional()
  @IsDateString()
  availableFrom?: string;

  @IsOptional()
  @IsString()
  paymentTerms?: string;

  @IsOptional()
  @IsString()
  deliveryTerms?: string;

  @IsOptional()
  @IsBoolean()
  deliveryAvailable?: boolean;

  @IsOptional()
  @IsBoolean()
  recurring?: boolean;
}

export class ListingQueryDto {
  @IsOptional()
  @IsString()
  q?: string;
  @IsOptional()
  @IsString()
  productId?: string;
  @IsOptional()
  @IsString()
  province?: string;
  @IsOptional()
  @IsString()
  municipality?: string;
  @IsOptional()
  @IsString()
  quality?: string;
  @IsOptional()
  @Type(() => Number)
  minQty?: number;
  @IsOptional()
  @Type(() => Number)
  maxPrice?: number;
  @IsOptional()
  @IsString()
  verified?: string;
  @IsOptional()
  @Type(() => Number)
  page?: number;
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}
