import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from "class-validator";
import { Type } from "class-transformer";
import { QualityGrade } from "@prisma/client";

export class CreateDemandDto {
  @IsString()
  productId!: string;
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  quantity!: number;
  @IsOptional()
  @IsString()
  unit?: string;
  @IsOptional()
  @IsEnum(QualityGrade)
  quality?: QualityGrade;
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxPrice?: number;
  @IsString()
  province!: string;
  @IsOptional()
  @IsString()
  municipality?: string;
  @IsOptional()
  @IsDateString()
  neededBy?: string;
  @IsOptional()
  @IsBoolean()
  deliveryIncluded?: boolean;
  @IsOptional()
  @IsString()
  notes?: string;
  @IsOptional()
  @IsBoolean()
  recurring?: boolean;
  @IsOptional()
  @IsString()
  recurrence?: string;
}

export class DemandQueryDto {
  @IsOptional()
  @IsString()
  productId?: string;
  @IsOptional()
  @IsString()
  province?: string;
  @IsOptional()
  @IsString()
  q?: string;
  @IsOptional()
  @Type(() => Number)
  page?: number;
}
