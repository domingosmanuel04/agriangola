import { IsDateString, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { Type } from "class-transformer";

export class StartNegotiationDto {
  @IsOptional()
  @IsString()
  listingId?: string;
  @IsOptional()
  @IsString()
  demandId?: string;
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  quantity!: number;
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  pricePerUnit!: number;
  @IsOptional()
  @IsString()
  unit?: string;
  @IsOptional()
  @IsDateString()
  deliveryDate?: string;
  @IsOptional()
  @IsString()
  deliveryPlace?: string;
  @IsOptional()
  @IsString()
  message?: string;
}

export class CounterDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  quantity?: number;
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  pricePerUnit?: number;
  @IsOptional()
  @IsString()
  body?: string;
  @IsOptional()
  @IsDateString()
  deliveryDate?: string;
  @IsOptional()
  @IsString()
  deliveryPlace?: string;
  @IsOptional()
  @IsString()
  transportNotes?: string;
  @IsOptional()
  @IsString()
  paymentNotes?: string;
}
