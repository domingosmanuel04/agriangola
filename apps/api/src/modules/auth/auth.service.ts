import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../../prisma/prisma.service";
import { AuditService } from "../../common/audit.service";
import { LoginDto, RegisterDto } from "./dto";
import { OrgType, UserIntent } from "@prisma/client";
import { computeTrustScore } from "../../shared";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly audit: AuditService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (exists) throw new BadRequestException("Este email já está registado");

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const trustScore = computeTrustScore({
      identityVerified: false,
      orgVerified: false,
      fulfillmentRate: 0,
      reviewAvg: 0,
      reviewCount: 0,
      cancellations: 0,
      disputesLost: 0,
      completedOrders: 0,
    });

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        name: dto.name,
        intent: dto.intent,
        phone: dto.phone,
        province: dto.province,
        municipality: dto.municipality,
        trustScore,
        agriScore: trustScore,
      },
    });

    const orgName = dto.organizationName ?? `${dto.name}`;
    const org = await this.prisma.organization.create({
      data: {
        name: orgName,
        slug: slugify(`${orgName}-${user.id.slice(-6)}`),
        type: intentToOrgType(dto.intent),
        province: dto.province,
        municipality: dto.municipality,
        memberships: {
          create: { userId: user.id, role: "OWNER" },
        },
      },
    });

    await this.audit.log({
      userId: user.id,
      action: "REGISTER",
      entity: "User",
      entityId: user.id,
    });
    await this.prisma.analyticsEvent.create({
      data: { userId: user.id, name: "signup", props: { intent: dto.intent } },
    });

    return this.issue(user.id, user.email, user.intent, user.name, org.id);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: { memberships: true },
    });
    if (!user) throw new UnauthorizedException("Credenciais inválidas");
    if (user.isBlocked) throw new UnauthorizedException("Conta bloqueada");
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException("Credenciais inválidas");

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });
    await this.audit.log({
      userId: user.id,
      action: "LOGIN",
      entity: "User",
      entityId: user.id,
    });
    await this.prisma.analyticsEvent.create({
      data: { userId: user.id, name: "login" },
    });

    return this.issue(
      user.id,
      user.email,
      user.intent,
      user.name,
      user.memberships[0]?.organizationId,
    );
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        memberships: { include: { organization: true } },
        badges: true,
        farms: true,
      },
    });
    if (!user) throw new UnauthorizedException();
    const { passwordHash: _, ...safe } = user;
    return safe;
  }

  private issue(
    id: string,
    email: string,
    intent: UserIntent,
    name: string,
    organizationId?: string,
  ) {
    const accessToken = this.jwt.sign({ sub: id, email, intent, name });
    return { accessToken, user: { id, email, intent, name, organizationId } };
  }
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

function intentToOrgType(intent: UserIntent): OrgType {
  if (intent === "COOPERATIVE") return "COOPERATIVE";
  if (intent === "COMPANY" || intent === "EXPORTER" || intent === "FINANCIAL") return "COMPANY";
  if (intent === "ADMIN") return "INSTITUTION";
  return "INDIVIDUAL";
}
