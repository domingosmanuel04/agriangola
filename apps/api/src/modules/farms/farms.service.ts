import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { IsNumber, IsOptional, IsString, Min } from "class-validator";
import { Type } from "class-transformer";
import { provinceByName } from "../../shared";

export class CreateFarmDto {
  @IsString()
  name!: string;
  @IsString()
  province!: string;
  @IsOptional()
  @IsString()
  municipality?: string;
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  areaHa!: number;
  @IsOptional()
  @IsString()
  soilType?: string;
  @IsOptional()
  @IsString()
  irrigation?: string;
}

export class DiaryDto {
  @IsString()
  farmId!: string;
  @IsString()
  kind!: string;
  @IsString()
  body!: string;
}

export class FieldDto {
  @IsString()
  farmId!: string;
  @IsString()
  name!: string;
  @IsNumber()
  @Type(() => Number)
  areaHa!: number;
  @IsOptional()
  @IsString()
  crop?: string;
}

@Injectable()
export class FarmsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(ownerId: string, dto: CreateFarmDto) {
    const geo = provinceByName(dto.province);
    const membership = await this.prisma.membership.findFirst({ where: { userId: ownerId } });
    return this.prisma.farm.create({
      data: {
        ownerId,
        organizationId: membership?.organizationId,
        name: dto.name,
        province: dto.province,
        municipality: dto.municipality,
        areaHa: dto.areaHa,
        soilType: dto.soilType,
        irrigation: dto.irrigation,
        lat: geo?.lat,
        lng: geo?.lng,
      },
    });
  }

  async mine(ownerId: string) {
    return this.prisma.farm.findMany({
      where: { ownerId },
      include: { fields: true, diary: { orderBy: { createdAt: "desc" }, take: 10 } },
    });
  }

  async get(id: string) {
    const farm = await this.prisma.farm.findUnique({
      where: { id },
      include: {
        fields: { include: { crops: true } },
        diary: { orderBy: { createdAt: "desc" }, take: 30 },
        workers: true,
        owner: { select: { id: true, name: true } },
      },
    });
    if (!farm) throw new NotFoundException();
    return farm;
  }

  async addField(userId: string, dto: FieldDto) {
    const farm = await this.prisma.farm.findUnique({ where: { id: dto.farmId } });
    if (!farm || farm.ownerId !== userId) throw new NotFoundException();
    return this.prisma.field.create({
      data: { farmId: dto.farmId, name: dto.name, areaHa: dto.areaHa, crop: dto.crop },
    });
  }

  async diary(userId: string, dto: DiaryDto) {
    return this.prisma.farmDiaryEntry.create({
      data: { farmId: dto.farmId, authorId: userId, kind: dto.kind, body: dto.body },
    });
  }

  calendar(crop: string) {
    const plans: Record<string, { month: number; activity: string }[]> = {
      milho: [
        { month: 1, activity: "Preparação do solo / plantio tardio" },
        { month: 2, activity: "Plantio" },
        { month: 3, activity: "Adubação de cobertura" },
        { month: 4, activity: "Monitorização de pragas" },
        { month: 5, activity: "Controlo e irrigação" },
        { month: 6, activity: "Colheita" },
        { month: 7, activity: "Secagem e armazenamento" },
      ],
      tomate: [
        { month: 1, activity: "Sementeira em viveiro" },
        { month: 2, activity: "Transplante" },
        { month: 3, activity: "Tutoramento e adubação" },
        { month: 4, activity: "Colheita escalonada" },
      ],
      cafe: [
        { month: 5, activity: "Início da colheita" },
        { month: 6, activity: "Colheita e secagem" },
        { month: 7, activity: "Beneficiação" },
        { month: 10, activity: "Poda e plantio" },
      ],
    };
    const key = crop.toLowerCase();
    return plans[key] ?? plans.milho;
  }
}
