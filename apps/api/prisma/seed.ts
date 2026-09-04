import { Organization, PrismaClient, Product, QualityGrade, User, UserIntent } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { ANGOLA_PROVINCES, CATALOG_PRODUCTS } from "@agriangola/shared";

const prisma = new PrismaClient();
const DEMO_PASSWORD = "AgriDemo2026!";

async function main() {
  console.log("A semear AgriAngola OS (dados de demonstração)…");
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const categories = await Promise.all(
    [
      ["cereals", "Cereais"],
      ["pulses", "Leguminosas"],
      ["tubers", "Tubérculos"],
      ["horticulture", "Hortícolas"],
      ["fruit", "Frutas"],
      ["cash", "Culturas de rendimento"],
      ["livestock", "Pecuária"],
    ].map(([slug, name]) =>
      prisma.category.upsert({ where: { slug }, update: {}, create: { slug, name } }),
    ),
  );
  const cat = (slug: string) => categories.find((c) => c.slug === slug) ?? categories[0];

  const products: Product[] = [];
  for (const p of CATALOG_PRODUCTS) {
    const categoryId =
      p.category === "CEREALS"
        ? cat("cereals").id
        : p.category === "PULSES"
          ? cat("pulses").id
          : p.category === "TUBERS"
            ? cat("tubers").id
            : p.category === "HORTICULTURE"
              ? cat("horticulture").id
              : p.category === "FRUIT"
                ? cat("fruit").id
                : p.category === "LIVESTOCK"
                  ? cat("livestock").id
                  : cat("cash").id;
    products.push(
      await prisma.product.upsert({
        where: { slug: p.slug },
        update: { name: p.name, unit: p.unit },
        create: { slug: p.slug, name: p.name, unit: p.unit, categoryId, description: `Produto demonstrativo: ${p.name}` },
      }),
    );
  }
  const P = (slug: string) => products.find((x) => x.slug === slug)!;

  type UDef = {
    email: string;
    name: string;
    intent: UserIntent;
    province: string;
    municipality?: string;
    bio: string;
    trust: number;
    verified?: boolean;
    org: { name: string; type: "INDIVIDUAL" | "COOPERATIVE" | "COMPANY" | "INSTITUTION"; nif?: string };
  };

  const defs: UDef[] = [
    {
      email: "admin@agriangola.ao",
      name: "Operações AgriAngola",
      intent: "ADMIN",
      province: "Luanda",
      bio: "Backoffice nacional da plataforma.",
      trust: 99,
      verified: true,
      org: { name: "AgriAngola OS", type: "INSTITUTION", nif: "5000000001" },
    },
    {
      email: "maria.nzinga@agriangola.ao",
      name: "Maria Nzinga",
      intent: "PRODUCER",
      province: "Malanje",
      municipality: "Malanje",
      bio: "Produtora de milho e feijão. 120 ha em Malanje. Dados de demonstração.",
      trust: 86,
      verified: true,
      org: { name: "Fazenda Nzinga", type: "INDIVIDUAL" },
    },
    {
      email: "coop.kwanza@agriangola.ao",
      name: "Cooperativa Kwanza Verde",
      intent: "COOPERATIVE",
      province: "Cuanza Sul",
      municipality: "Porto Amboim",
      bio: "Cooperativa com 180 membros. Café, milho e hortícolas.",
      trust: 91,
      verified: true,
      org: { name: "Cooperativa Kwanza Verde", type: "COOPERATIVE", nif: "5412003301" },
    },
    {
      email: "hotel.baia@agriangola.ao",
      name: "Hotel Baía Luanda",
      intent: "COMPANY",
      province: "Luanda",
      bio: "Hotelaria — compras semanais de hortícolas e frutas.",
      trust: 88,
      verified: true,
      org: { name: "Hotel Baía Luanda", type: "COMPANY", nif: "5411882200" },
    },
    {
      email: "super.kikolo@agriangola.ao",
      name: "Supermercado Kikolo",
      intent: "BUYER",
      province: "Luanda",
      municipality: "Cazenga",
      bio: "Rede retalhista. Procura milho, feijão, tomate e banana.",
      trust: 84,
      verified: true,
      org: { name: "Supermercado Kikolo", type: "COMPANY" },
    },
    {
      email: "trans.planalto@agriangola.ao",
      name: "Planalto Logística",
      intent: "TRANSPORTER",
      province: "Huambo",
      bio: "Frota de camiões 10–28 t. Rotas Planalto–Luanda.",
      trust: 82,
      verified: true,
      org: { name: "Planalto Logística", type: "COMPANY" },
    },
    {
      email: "silos.huambo@agriangola.ao",
      name: "Silos do Planalto",
      intent: "WAREHOUSE",
      province: "Huambo",
      bio: "Capacidade 8 000 t. Secagem e silos.",
      trust: 80,
      verified: true,
      org: { name: "Silos do Planalto", type: "COMPANY" },
    },
    {
      email: "tecnico.lubango@agriangola.ao",
      name: "Ing. Paulo Tchissola",
      intent: "AGRONOMIST",
      province: "Huíla",
      municipality: "Lubango",
      bio: "Técnico agrícola — hortícolas e irrigação.",
      trust: 77,
      org: { name: "Consultoria Tchissola", type: "INDIVIDUAL" },
    },
    {
      email: "sementes.benguela@agriangola.ao",
      name: "AgroInsumos Benguela",
      intent: "SUPPLIER",
      province: "Benguela",
      bio: "Sementes certificadas, fertilizantes e irrigação.",
      trust: 79,
      verified: true,
      org: { name: "AgroInsumos Benguela", type: "COMPANY" },
    },
    {
      email: "export.cafe@agriangola.ao",
      name: "AngoCafé Export",
      intent: "EXPORTER",
      province: "Luanda",
      bio: "Exportação de café robusta. Dados de demonstração.",
      trust: 90,
      verified: true,
      org: { name: "AngoCafé Export", type: "COMPANY" },
    },
    {
      email: "fazenda.huila@agriangola.ao",
      name: "Fazenda Serra da Leba",
      intent: "PRODUCER",
      province: "Huíla",
      municipality: "Humpata",
      bio: "Batata, hortícolas e gado. 85 ha.",
      trust: 81,
      verified: true,
      org: { name: "Fazenda Serra da Leba", type: "INDIVIDUAL" },
    },
    {
      email: "cafe.uige@agriangola.ao",
      name: "João Kassule",
      intent: "PRODUCER",
      province: "Uíge",
      bio: "Café robusta familiar. 12 ha.",
      trust: 74,
      verified: true,
      org: { name: "Roça Kassule", type: "INDIVIDUAL" },
    },
  ];

  const users: Array<User & { org: Organization }> = [];
  for (const d of defs) {
    const u = await prisma.user.upsert({
      where: { email: d.email },
      update: {},
      create: {
        email: d.email,
        passwordHash,
        name: d.name,
        intent: d.intent,
        province: d.province,
        municipality: d.municipality,
        bio: d.bio,
        trustScore: d.trust,
        agriScore: d.trust - 4,
        identityVerified: d.verified ?? false,
        isDemo: true,
        lat: ANGOLA_PROVINCES.find((p) => p.name === d.province)?.lat,
        lng: ANGOLA_PROVINCES.find((p) => p.name === d.province)?.lng,
      },
    });
    const slug = d.org.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const org = await prisma.organization.upsert({
      where: { slug },
      update: {},
      create: {
        name: d.org.name,
        slug,
        type: d.org.type,
        nif: d.org.nif,
        province: d.province,
        verified: d.verified ?? false,
        isDemo: true,
        plan: d.intent === "COMPANY" || d.intent === "EXPORTER" ? "BUSINESS" : "PROFESSIONAL",
        lat: u.lat ?? undefined,
        lng: u.lng ?? undefined,
      },
    });
    await prisma.membership.upsert({
      where: { userId_organizationId: { userId: u.id, organizationId: org.id } },
      update: {},
      create: { userId: u.id, organizationId: org.id, role: "OWNER" },
    });
    if (d.verified) {
      await prisma.userBadge.upsert({
        where: { userId_badge: { userId: u.id, badge: "IDENTITY_VERIFIED" } },
        update: {},
        create: { userId: u.id, badge: "IDENTITY_VERIFIED" },
      });
    }
    users.push({ ...u, org });
  }

  const U = (email: string) => users.find((x) => x.email === email)!;
  const maria = U("maria.nzinga@agriangola.ao");
  const coop = U("coop.kwanza@agriangola.ao");
  const hotel = U("hotel.baia@agriangola.ao");
  const superK = U("super.kikolo@agriangola.ao");
  const trans = U("trans.planalto@agriangola.ao");
  const silos = U("silos.huambo@agriangola.ao");
  const huila = U("fazenda.huila@agriangola.ao");
  const cafe = U("cafe.uige@agriangola.ao");
  const exportC = U("export.cafe@agriangola.ao");

  const farmMaria = await prisma.farm.create({
    data: {
      ownerId: maria.id,
      organizationId: maria.org.id,
      name: "Fazenda Nzinga — Bloco Norte",
      province: "Malanje",
      municipality: "Malanje",
      areaHa: 120,
      soilType: "Franco-argiloso",
      irrigation: "Sequeiro + aspersão pontual",
      lat: -9.54,
      lng: 16.341,
      isDemo: true,
      fields: {
        create: [
          { name: "Talhão A — Milho", areaHa: 80, crop: "Milho", variety: "ZM 523", plantedAt: new Date("2026-02-10"), harvestAt: new Date("2026-07-15") },
          { name: "Talhão B — Feijão", areaHa: 25, crop: "Feijão", variety: "manteiga", plantedAt: new Date("2026-01-20") },
          { name: "Talhão C — Hortícolas", areaHa: 15, crop: "Tomate", variety: "Rio Grande" },
        ],
      },
    },
  });

  await prisma.farmDiaryEntry.createMany({
    data: [
      { farmId: farmMaria.id, authorId: maria.id, kind: "PLANTIO", body: "Plantio de milho no Talhão A — 80 ha. Humidade do solo adequada após chuvas." },
      { farmId: farmMaria.id, authorId: maria.id, kind: "PRAGA", body: "Lagarta do cartucho pontual no bordo este. Aplicação localizada." },
      { farmId: farmMaria.id, authorId: maria.id, kind: "CUSTO", body: "Fertilizante NPK 12-24-12 — 8 t. Custo 4.800.000 Kz." },
    ],
  });

  await prisma.inventoryItem.createMany({
    data: [
      { organizationId: maria.org.id, name: "Semente milho ZM 523", kind: "SEED", quantity: 420, unit: "kg", minQuantity: 80 },
      { organizationId: maria.org.id, name: "NPK 12-24-12", kind: "FERTILIZER", quantity: 2.5, unit: "t", minQuantity: 1 },
      { organizationId: maria.org.id, name: "Milho colhido seco", kind: "HARVEST", quantity: 320, unit: "t", minQuantity: 0 },
    ],
  });

  const listingsData = [
    {
      seller: maria,
      farmId: farmMaria.id,
      product: P("milho"),
      qty: 320,
      price: 275,
      province: "Malanje",
      quality: "A" as QualityGrade,
      harvest: "2026-07-15",
      desc: "Milho seco, 13% humidade. Lote demonstrativo AGRI-MILHO-2026. Origem Fazenda Nzinga, 120 ha.",
    },
    {
      seller: maria,
      product: P("feijao"),
      qty: 18,
      price: 820,
      province: "Malanje",
      quality: "A" as QualityGrade,
      harvest: "2026-05-20",
      desc: "Feijão manteiga seleccionado. Dados de demonstração.",
    },
    {
      seller: coop,
      product: P("cafe"),
      qty: 42,
      price: 4100,
      province: "Cuanza Sul",
      quality: "A" as QualityGrade,
      harvest: "2026-06-30",
      desc: "Café robusta cherry seco. Cooperativa Kwanza Verde.",
    },
    {
      seller: coop,
      product: P("tomate"),
      qty: 12,
      price: 490,
      province: "Cuanza Sul",
      quality: "A" as QualityGrade,
      harvest: "2026-08-20",
      desc: "Tomate fresco, colheita escalonada.",
    },
    {
      seller: huila,
      product: P("batata"),
      qty: 60,
      price: 430,
      province: "Huíla",
      quality: "A" as QualityGrade,
      harvest: "2026-08-01",
      desc: "Batata de altitude, Humpata.",
    },
    {
      seller: huila,
      product: P("tomate"),
      qty: 25,
      price: 510,
      province: "Huíla",
      quality: "B" as QualityGrade,
      harvest: "2026-08-18",
      desc: "Tomate para indústria e retalho.",
    },
    {
      seller: cafe,
      product: P("cafe"),
      qty: 6.5,
      price: 3950,
      province: "Uíge",
      quality: "B" as QualityGrade,
      harvest: "2026-07-10",
      desc: "Café familiar robusta.",
    },
    {
      seller: maria,
      product: P("mandioca"),
      qty: 40,
      price: 170,
      province: "Malanje",
      quality: "B" as QualityGrade,
      harvest: "2026-08-01",
      desc: "Mandioca fresca para processamento.",
    },
    {
      seller: coop,
      product: P("banana"),
      qty: 15,
      price: 300,
      province: "Cuanza Sul",
      quality: "A" as QualityGrade,
      harvest: "2026-08-22",
      desc: "Banana prata, cacho seleccionado.",
    },
    {
      seller: huila,
      product: P("pecuaria-bovinos"),
      qty: 40,
      price: 185000,
      province: "Huíla",
      quality: "A" as QualityGrade,
      harvest: "2026-08-01",
      desc: "Bovinos de corte — preço por cabeça (demonstração).",
    },
  ];

  const listings = [];
  let i = 0;
  for (const L of listingsData) {
    i += 1;
    const geo = ANGOLA_PROVINCES.find((p) => p.name === L.province);
    const lotCode = `AGRI-${L.product.slug.toUpperCase()}-2026-${String(i).padStart(6, "0")}`;
    listings.push(
      await prisma.listing.create({
        data: {
          lotCode,
          title: `${L.product.name} — ${L.province}`,
          description: `${L.desc} [DADOS DE DEMONSTRAÇÃO]`,
          productId: L.product.id,
          quantity: L.qty,
          availableQty: L.qty,
          unit: L.product.unit,
          pricePerUnit: L.price,
          quality: L.quality,
          province: L.province,
          harvestDate: new Date(L.harvest),
          availableFrom: new Date(L.harvest),
          sellerId: L.seller.id,
          organizationId: L.seller.org.id,
          farmId: "farmId" in L ? (L as { farmId?: string }).farmId : undefined,
          lat: geo?.lat,
          lng: geo?.lng,
          deliveryAvailable: L.province !== "Uíge",
          negotiable: true,
          certifications: L.quality === "A" ? ["Origem verificada (demo)"] : [],
          paymentTerms: "Transferência / acordo comercial",
          deliveryTerms: "FOB origem ou CIF Luanda a negociar",
          isDemo: true,
          photos: [],
        },
      }),
    );
  }

  const demands = await Promise.all([
    prisma.demand.create({
      data: {
        title: "Procura Tomate — 50t em Luanda",
        productId: P("tomate").id,
        quantity: 50,
        unit: "t",
        quality: "A",
        maxPrice: 540,
        province: "Luanda",
        neededBy: new Date("2026-09-15"),
        deliveryIncluded: true,
        notes: "Fornecimento para hotelaria e retalho. Dados de demonstração.",
        buyerId: hotel.id,
        recurring: true,
        recurrence: "WEEKLY",
        lat: -8.838,
        lng: 13.234,
        isDemo: true,
      },
    }),
    prisma.demand.create({
      data: {
        title: "Procura Milho — 200t em Luanda",
        productId: P("milho").id,
        quantity: 200,
        unit: "t",
        quality: "A",
        maxPrice: 290,
        province: "Luanda",
        neededBy: new Date("2026-09-01"),
        buyerId: superK.id,
        lat: -8.838,
        lng: 13.234,
        isDemo: true,
      },
    }),
    prisma.demand.create({
      data: {
        title: "Procura Café — 20t para exportação",
        productId: P("cafe").id,
        quantity: 20,
        unit: "t",
        quality: "A",
        maxPrice: 4300,
        province: "Luanda",
        buyerId: exportC.id,
        neededBy: new Date("2026-10-01"),
        isDemo: true,
        lat: -8.838,
        lng: 13.234,
      },
    }),
    prisma.demand.create({
      data: {
        title: "Procura Feijão — 30t",
        productId: P("feijao").id,
        quantity: 30,
        unit: "t",
        quality: "A",
        maxPrice: 880,
        province: "Luanda",
        buyerId: superK.id,
        isDemo: true,
      },
    }),
  ]);

  await prisma.vehicle.create({
    data: {
      ownerId: trans.id,
      organizationId: trans.org.id,
      type: "TRUCK",
      plate: "LD-44-88-AO",
      capacityTons: 28,
      province: "Huambo",
      available: true,
    },
  });
  await prisma.vehicle.create({
    data: {
      ownerId: trans.id,
      organizationId: trans.org.id,
      type: "REEFER",
      plate: "LD-12-20-AO",
      capacityTons: 14,
      refrigerated: true,
      province: "Luanda",
      available: true,
    },
  });

  await prisma.warehouse.create({
    data: {
      organizationId: silos.org.id,
      name: "Silo Huambo Central",
      type: "SILO",
      province: "Huambo",
      capacityTons: 8000,
      availableTons: 2100,
      pricePerTonDay: 85,
      conditions: "Secagem disponível. Dados de demonstração.",
      lat: -12.776,
      lng: 15.739,
      isDemo: true,
    },
  });
  await prisma.warehouse.create({
    data: {
      organizationId: silos.org.id,
      name: "Câmara frigorífica Viana",
      type: "COLD",
      province: "Luanda",
      municipality: "Viana",
      capacityTons: 400,
      availableTons: 90,
      pricePerTonDay: 420,
      lat: -8.9,
      lng: 13.37,
      isDemo: true,
    },
  });

  const milhoListing = listings.find((l) => l.lotCode.includes("MILHO"))!;
  const neg = await prisma.negotiation.create({
    data: {
      listingId: milhoListing.id,
      demandId: demands[1].id,
      buyerId: superK.id,
      sellerId: maria.id,
      status: "ACCEPTED",
      quantity: 80,
      unit: "t",
      pricePerUnit: 278,
      deliveryPlace: "Luanda — Cazenga",
      deliveryDate: new Date("2026-09-05"),
      messages: {
        create: [
          { authorId: superK.id, kind: "PROPOSAL", body: "Proposta: 80 t a 270 Kz/kg, recolha em Malanje.", quantity: 80, pricePerUnit: 270 },
          { authorId: maria.id, kind: "COUNTER", body: "Contraproposta: 278 Kz/kg, qualidade Classe A.", quantity: 80, pricePerUnit: 278 },
          { authorId: superK.id, kind: "ACCEPT", body: "Aceite." },
        ],
      },
    },
  });

  const order = await prisma.order.create({
    data: {
      code: "PED-2026-000001",
      listingId: milhoListing.id,
      negotiationId: neg.id,
      buyerId: superK.id,
      sellerId: maria.id,
      productName: "Milho",
      quantity: 80,
      unit: "t",
      pricePerUnit: 278,
      totalAmount: 80 * 278 * 1000,
      status: "CONFIRMED",
      provinceFrom: "Malanje",
      provinceTo: "Luanda",
    },
  });
  await prisma.negotiation.update({ where: { id: neg.id }, data: { status: "CONVERTED" } });
  await prisma.invoice.create({ data: { orderId: order.id, number: "FT-PED-2026-000001", amount: order.totalAmount } });
  await prisma.payment.create({ data: { orderId: order.id, amount: order.totalAmount, status: "PENDING" } });
  await prisma.contract.create({
    data: {
      code: "CTR-PED-2026-000001",
      type: "SALE",
      status: "PENDING_SIGNATURE",
      orderId: order.id,
      negotiationId: neg.id,
      parties: { buyer: superK.name, seller: maria.name },
      terms: { quantity: 80, unit: "t", pricePerUnit: 278 },
      body: "Contrato demonstrativo de compra e venda de milho — AgriAngola OS.",
    },
  });

  for (const product of products) {
    for (const prov of ["Luanda", "Malanje", "Huambo", "Huíla", "Benguela", "Uíge"]) {
      const base = CATALOG_PRODUCTS.find((c) => c.slug === product.slug)?.typicalPriceKzPerKg ?? 300;
      for (let w = 0; w < 10; w++) {
        const jitter = 1 + (Math.sin(w + prov.length) * 0.08 + (w % 3) * 0.01);
        await prisma.marketPrice.create({
          data: {
            productId: product.id,
            province: prov,
            priceKg: Math.round(base * jitter * (prov === "Luanda" ? 1.08 : 0.96)),
            capturedAt: new Date(Date.now() - (10 - w) * 7 * 86400000),
            isDemo: true,
          },
        });
      }
    }
  }

  for (const p of ANGOLA_PROVINCES) {
    const rain = p.region === "sul" ? 2 : p.region === "norte" ? 14 : 8;
    await prisma.weatherSnapshot.create({
      data: {
        province: p.name,
        temperature: p.region === "sul" ? 24 : 28,
        humidity: 62,
        rainMm: rain,
        windKmh: 12,
        condition: rain > 10 ? "Chuva dispersa" : rain > 4 ? "Parcialmente nublado" : "Céu limpo",
        alert: rain > 12 ? "Possibilidade elevada de chuva nas próximas 24 horas." : rain < 3 ? "Risco de stress hídrico." : "Condições favoráveis para plantio.",
        isDemo: true,
      },
    });
  }

  const poiKinds: { kind: string; name: string; province: string; lat: number; lng: number }[] = [
    { kind: "farm", name: "Fazenda Nzinga", province: "Malanje", lat: -9.54, lng: 16.341 },
    { kind: "cooperative", name: "Cooperativa Kwanza Verde", province: "Cuanza Sul", lat: -11.206, lng: 13.844 },
    { kind: "warehouse", name: "Silo Huambo Central", province: "Huambo", lat: -12.776, lng: 15.739 },
    { kind: "market", name: "Mercado do Kinaxixi", province: "Luanda", lat: -8.83, lng: 13.234 },
    { kind: "factory", name: "Indústria alimentar Viana", province: "Luanda", lat: -8.9, lng: 13.37 },
    { kind: "cold", name: "Frigorífico Viana", province: "Luanda", lat: -8.905, lng: 13.38 },
    { kind: "weather", name: "Estação INAMET Huambo", province: "Huambo", lat: -12.78, lng: 15.74 },
  ];
  await prisma.mapPoi.createMany({ data: poiKinds.map((p) => ({ ...p, isDemo: true })) });

  await prisma.communityPost.createMany({
    data: [
      { authorId: maria.id, category: "Milho", title: "Secagem do milho no Planalto", body: "Partilha (demo): reduzimos perdas de 14% para 8% com lona + silo." },
      { authorId: cafe.id, category: "Café", title: "Colheita robusta no Uíge", body: "Cereja madura e terreiro elevado. Dados de demonstração." },
      { authorId: huila.id, category: "Hortícolas", title: "Tomate em Humpata", body: "Altitude ajuda na qualidade. Procuramos compradores em Luanda." },
    ],
  });

  const course = await prisma.course.create({
    data: {
      slug: "gestao-agricola-essencial",
      title: "Gestão agrícola essencial",
      description: "Curso demonstrativo: planeamento, custos e comercialização.",
      category: "Gestão",
      durationMin: 90,
      isDemo: true,
      lessons: {
        create: [
          { title: "O ciclo do campo ao mercado", order: 1, kind: "VIDEO", body: "Conteúdo demonstrativo." },
          { title: "Quiz: custos de produção", order: 2, kind: "QUIZ", body: "Perguntas de demonstração." },
        ],
      },
    },
  });
  await prisma.course.create({
    data: {
      slug: "pos-colheita",
      title: "Pós-colheita e redução de perdas",
      description: "Boas práticas de armazenamento.",
      category: "Pós-colheita",
      durationMin: 60,
      isDemo: true,
    },
  });

  await prisma.opportunity.createMany({
    data: [
      { kind: "FINANCE", title: "Linha de crédito de campanha (parceiro)", body: "Simulação. AgriScore não garante aprovação.", province: "Malanje", isDemo: true },
      { kind: "EXPORT", title: "Procura de café robusta — UE", body: "Requisitos fitossanitários. Checklist no AgriExport.", isDemo: true },
      { kind: "PROGRAM", title: "Programa de sementes melhoradas", body: "Dados de demonstração — ONG/parceiro institucional.", province: "Huambo", isDemo: true },
      { kind: "COURSE", title: course.title, body: "Disponível na Agri Academy.", isDemo: true },
    ],
  });

  await prisma.machineListing.createMany({
    data: [
      { ownerId: trans.id, name: "Trator 90 cv", kind: "TRACTOR", province: "Malanje", pricePerDay: 85000, withOperator: true, isDemo: true },
      { ownerId: trans.id, name: "Ceifeira", kind: "HARVESTER", province: "Huambo", pricePerDay: 210000, withOperator: true, isDemo: true },
    ],
  });

  await prisma.notification.createMany({
    data: [
      { userId: maria.id, title: "Um comprador próximo procura milho", body: "Supermercado Kikolo procura 200 t em Luanda.", link: "/app/demands", priority: "OPPORTUNITY" },
      { userId: maria.id, title: "Stock de NPK baixo", body: "Restam 2,5 t — mínimo 1 t.", link: "/app/inventory", priority: "IMPORTANT" },
      { userId: superK.id, title: "Negociação convertida", body: "Pedido PED-2026-000001 criado.", link: `/app/orders/${order.id}`, priority: "IMPORTANT" },
      { userId: hotel.id, title: "Preço do tomate", body: "O preço médio subiu na sua região (série demo).", link: "/app/prices", priority: "INFO" },
    ],
  });

  console.log("Semente concluída.");
  console.log("Contas demo (password: AgriDemo2026!):");
  for (const d of defs) console.log(`  ${d.email}  [${d.intent}]`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
