import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CATALOG_PRODUCTS, findCatalogProduct, provinceByName } from "../../shared";

export type AiAction = {
  type: "OPEN_LISTING" | "OPEN_DEMAND" | "OPEN_LOGISTICS" | "OPEN_SEARCH" | "NONE";
  payload?: Record<string, unknown>;
};

export type AiReply = {
  answer: string;
  confidence: number;
  agent: string;
  actions: AiAction[];
  sources: string[];
  disclaimer: string;
};

const DISCLAIMER =
  "Estimativa do AgriAI com base em dados da plataforma e referências agronómicas gerais. Não substitui um técnico agrícola presencial nem constitui aconselhamento financeiro.";

@Injectable()
export class AgriAiService {
  constructor(private readonly prisma: PrismaService) {}

  async ask(userId: string, prompt: string, imageHint?: string): Promise<AiReply> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const text = prompt.toLowerCase();
    let reply: AiReply;

    if (imageHint) {
      reply = this.visionStub(imageHint);
    } else if (/quanto (devo|preciso) plantar|produzir \d+|toneladas/.test(text) && /plantar|produzir/.test(text)) {
      reply = await this.yieldQuestion(text, user?.province);
    } else if (/cultura.*(adequada|melhor)|o que plantar|qual cultura/.test(text)) {
      reply = this.cropForRegion(user?.province ?? extractProvince(text));
    } else if (/fatur|quanto posso ganhar|receita/.test(text)) {
      reply = await this.revenueQuestion(text, user?.province);
    } else if (/onde (posso|consigo) vender|comprador|quem (compra|procura)/.test(text)) {
      reply = await this.sellWhere(text, user?.province);
    } else if (/quanto (devo|posso) cobrar|preço|preco/.test(text)) {
      reply = await this.priceQuestion(text, user?.province);
    } else if (/evolu(ç|c)ão do preço|historico de preco|histórico/.test(text)) {
      reply = await this.priceHistory(text);
    } else if (/perda|perdas|pós-colheita|pos-colheita/.test(text)) {
      reply = this.lossPrevention(text);
    } else if (/transport|carga|levar/.test(text)) {
      reply = await this.logistics(text);
    } else if (/aceitar|proposta/.test(text)) {
      reply = this.dealAdvice(text);
    } else if (/cota(ç|c)ão|orcamento|orçamento/.test(text)) {
      reply = this.quoteDraft(text);
    } else if (/relat(ó|o)rio|banco|produ(ç|c)ão deste ano/.test(text)) {
      reply = await this.report(userId);
    } else if (/plano agr(í|i)cola|12 meses/.test(text)) {
      reply = this.yearPlan(user?.province);
    } else if (/quero vender/.test(text)) {
      reply = this.commandSell(text);
    } else if (/encontrar? (um )?transporte|transporte de/.test(text)) {
      reply = this.commandTransport(text);
    } else {
      reply = await this.fallback(text, user?.province);
    }

    await this.prisma.aiInteraction.create({
      data: {
        userId,
        agent: reply.agent,
        prompt,
        response: reply.answer,
        actions: reply.actions as object[],
      },
    });
    return { ...reply, disclaimer: DISCLAIMER };
  }

  private visionStub(hint: string): AiReply {
    const h = hint.toLowerCase();
    const pest = /mancha|folha|doente|amarelo/.test(h);
    return {
      agent: "AgriAI Vision",
      confidence: pest ? 0.62 : 0.55,
      actions: [],
      sources: ["modelo local de triagem visual"],
      disclaimer: DISCLAIMER,
      answer: pest
        ? "A imagem sugere possível stress foliar (manchas/amarelecimento). Causas comuns em Angola: deficiência de azoto, míldio ou ataque de lagarta. Confiança moderada. Recomendação: isolar a zona afectada, fotografar o envés da folha e pedir visita de um técnico. Um diagnóstico presencial pode ser necessário."
        : "Triagem visual: produto agrícola detectado. Qualidade aparente regular a boa. Não foi identificada praga com alta confiança. Utilize o AgriScan no campo com boa luz e fundo simples para melhor resultado. Um diagnóstico técnico presencial pode ser necessário.",
    };
  }

  private async yieldQuestion(text: string, province?: string | null): Promise<AiReply> {
    const tons = Number(text.match(/(\d+(?:[.,]\d+)?)\s*(t|ton)/)?.[1]?.replace(",", ".") ?? 100);
    const crop = detectCrop(text) ?? "milho";
    const yields: Record<string, number> = {
      milho: 3.2,
      tomate: 18,
      feijao: 0.9,
      arroz: 2.4,
      soja: 1.8,
      mandioca: 12,
      cafe: 0.6,
    };
    const y = yields[crop] ?? 3;
    const ha = Math.round((tons / y) * 10) / 10;
    const seedKg = Math.round(ha * (crop === "milho" ? 25 : 12));
    return {
      agent: "AgriAI Farm",
      confidence: 0.74,
      actions: [],
      sources: ["produtividades médias de referência para Angola (estimativa)"],
      disclaimer: DISCLAIMER,
      answer: `Para produzir cerca de ${tons} toneladas de ${crop} em ${province ?? "Angola"}, estime ${ha} hectares com produtividade de referência de ${y} t/ha. Precisará de aproximadamente ${seedKg} kg de semente (ordem de grandeza) e de um plano de fertilização. A produtividade real depende de chuva, solo e gestão. Posso abrir um plano agrícola de 12 meses para esta área.`,
    };
  }

  private cropForRegion(province?: string): AiReply {
    const recs: Record<string, string> = {
      Malanje: "milho, mandioca, feijão e hortícolas de ciclo curto",
      Huambo: "milho, batata, feijão e hortícolas de altitude",
      Huíla: "milho, massango, gado e hortícolas irrigadas",
      Uíge: "café robusta, banana, mandioca",
      Luanda: "hortícolas periurbanas (tomate, cebola, folhosas) e ovos",
      Benguela: "hortícolas, banana e pesca associada à agroindústria",
    };
    const p = province ?? "Malanje";
    return {
      agent: "AgriAI Advisor",
      confidence: 0.7,
      actions: [],
      sources: ["aptidão agro-ecológica simplificada por província"],
      disclaimer: DISCLAIMER,
      answer: `Em ${p}, culturas com boa adequação típica: ${recs[p] ?? "milho, feijão, mandioca e hortícolas conforme disponibilidade de água"}. Confirme solo, acesso a água e mercado local antes de plantar. O AgriAngola OS pode cruzar isto com procuras activas na sua região.`,
    };
  }

  private async revenueQuestion(text: string, province?: string | null): Promise<AiReply> {
    const ha = Number(text.match(/(\d+(?:[.,]\d+)?)\s*hect/)?.[1]?.replace(",", ".") ?? 50);
    const crop = detectCrop(text) ?? "milho";
    const catalog = findCatalogProduct(crop);
    const y = crop === "tomate" ? 18 : crop === "cafe" ? 0.6 : 3.2;
    const price = catalog?.typicalPriceKzPerKg ?? 280;
    const tons = ha * y;
    const revenue = Math.round(tons * 1000 * price);
    return {
      agent: "AgriAI Market",
      confidence: 0.66,
      actions: [],
      sources: ["preços de referência da plataforma (demonstração)"],
      disclaimer: DISCLAIMER,
      answer: `Com ${ha} ha de ${crop} em ${province ?? "Angola"}, uma estimativa bruta é ${tons.toFixed(0)} t × ${price} Kz/kg ≈ ${revenue.toLocaleString("pt-AO")} Kz de faturação potencial. Isto não desconta custos (semente, fertilizante, mão-de-obra, perdas pós-colheita ~8–15%). Não é garantia de receita.`,
    };
  }

  private async sellWhere(text: string, province?: string | null): Promise<AiReply> {
    const crop = detectCrop(text) ?? "tomate";
    const product = await this.prisma.product.findFirst({ where: { slug: crop } });
    const demands = product
      ? await this.prisma.demand.findMany({
          where: { productId: product.id, status: "OPEN" },
          include: { buyer: { select: { name: true, province: true } } },
          take: 5,
          orderBy: { createdAt: "desc" },
        })
      : [];
    const lines = demands
      .map(
        (d) =>
          `• ${d.buyer.name} procura ${d.quantity}${d.unit} em ${d.province}${d.maxPrice ? ` (máx. ${d.maxPrice} Kz)` : ""}`,
      )
      .join("\n");
    return {
      agent: "AgriAI Sales",
      confidence: demands.length ? 0.8 : 0.5,
      actions: [{ type: "OPEN_SEARCH", payload: { kind: "demands", q: crop } }],
      sources: ["procuras activas no AgriAngola OS"],
      disclaimer: DISCLAIMER,
      answer: demands.length
        ? `Encontrei procuras de ${crop}${province ? ` relevantes para ${province}` : ""}:\n${lines}\nPosso iniciar uma cotação com o comprador mais compatível.`
        : `Não há procuras abertas de ${crop} neste momento. Publique uma oferta no marketplace para aparecer nos resultados de matching.`,
    };
  }

  private async priceQuestion(text: string, province?: string | null): Promise<AiReply> {
    const crop = detectCrop(text) ?? "milho";
    const product = await this.prisma.product.findFirst({ where: { slug: crop } });
    const prices = product
      ? await this.prisma.marketPrice.findMany({
          where: { productId: product.id, ...(province ? { province } : {}) },
          orderBy: { capturedAt: "desc" },
          take: 12,
        })
      : [];
    const avg = prices.length ? prices.reduce((s, p) => s + p.priceKg, 0) / prices.length : findCatalogProduct(crop)?.typicalPriceKzPerKg ?? 0;
    const last = prices[0]?.priceKg ?? avg;
    const prev = prices[5]?.priceKg ?? last;
    const trend = last > prev * 1.03 ? "provavelmente a subir" : last < prev * 0.97 ? "pressão de baixa" : "estável";
    return {
      agent: "AgriAI Market",
      confidence: 0.72,
      actions: [],
      sources: ["AgriPrice — série da plataforma"],
      disclaimer: DISCLAIMER,
      answer: `Preço de referência de ${crop}${province ? ` em ${province}` : ""}: cerca de ${Math.round(last)} Kz/kg (média recente ${Math.round(avg)} Kz/kg). Tendência: ${trend}. Ajuste pela qualidade (Classe A vs misto) e pela distância ao comprador. Previsões são estimativas com incerteza.`,
    };
  }

  private async priceHistory(text: string): Promise<AiReply> {
    const crop = detectCrop(text) ?? "milho";
    const product = await this.prisma.product.findFirst({ where: { slug: crop } });
    const series = product
      ? await this.prisma.marketPrice.findMany({
          where: { productId: product.id },
          orderBy: { capturedAt: "asc" },
          take: 30,
        })
      : [];
    const span = series.map((p) => `${p.province}: ${p.priceKg} Kz/kg`).slice(-8).join("; ");
    return {
      agent: "AgriAI Market",
      confidence: 0.7,
      actions: [],
      sources: ["histórico AgriPrice"],
      disclaimer: DISCLAIMER,
      answer: `Evolução recente de ${crop}: ${span || "série ainda limitada"}. Use o painel AgriPrice para o gráfico por província.`,
    };
  }

  private lossPrevention(text: string): AiReply {
    const crop = detectCrop(text) ?? "tomate";
    return {
      agent: "Loss Prevention Engine",
      confidence: 0.68,
      actions: [{ type: "OPEN_SEARCH", payload: { kind: "warehouses" } }],
      sources: ["boas práticas pós-colheita"],
      disclaimer: DISCLAIMER,
      answer: `Para ${crop}, o risco de perda sobe com calor, atraso na venda e armazenamento inadequado. Recomendações: (1) escoar hortícolas em 24–72h; (2) silo/armazém seco para cereais abaixo de 13% humidade; (3) escolher o comprador mais próximo com melhor preço líquido; (4) evitar transbordo excessivo. O AgriStorage lista capacidade disponível.`,
    };
  }

  private async logistics(text: string): Promise<AiReply> {
    const vehicles = await this.prisma.vehicle.findMany({ where: { available: true }, take: 5, include: { owner: true } });
    const lines = vehicles.map((v) => `• ${v.owner.name} — ${v.type} ${v.capacityTons}t (${v.province ?? "n/d"})`).join("\n");
    return {
      agent: "AgriAI Logistics",
      confidence: 0.75,
      actions: [{ type: "OPEN_LOGISTICS", payload: parseRoute(text) }],
      sources: ["frota disponível na plataforma"],
      disclaimer: DISCLAIMER,
      answer: vehicles.length
        ? `Transportadores disponíveis:\n${lines}\nPosso pré-preencher um pedido de transporte.`
        : "Não há veículos disponíveis neste momento. Publique a carga para receber cotações.",
    };
  }

  private dealAdvice(text: string): AiReply {
    return {
      agent: "AgriAI Sales",
      confidence: 0.6,
      actions: [],
      sources: ["regras comerciais simplificadas"],
      disclaimer: DISCLAIMER,
      answer: `Antes de aceitar: compare o preço com a média AgriPrice da sua província, confirme quantidade, qualidade, prazo e quem paga o transporte. Se o preço estiver >8% abaixo da média sem volume compensatório, contraproposte. Nunca aceite operações irreversíveis sem confirmar o contrato no AgriAngola OS.`,
    };
  }

  private quoteDraft(text: string): AiReply {
    const crop = detectCrop(text) ?? "milho";
    const qty = Number(text.match(/(\d+(?:[.,]\d+)?)/)?.[1] ?? 20);
    return {
      agent: "AgriAI Sales",
      confidence: 0.7,
      actions: [{ type: "OPEN_LISTING", payload: { crop, quantity: qty } }],
      sources: [],
      disclaimer: DISCLAIMER,
      answer: `Cotação rascunho: ${qty} t de ${crop}, validade 72 horas, qualidade Classe A, recolha na origem, pagamento por transferência após confirmação de peso. Abra a negociação para formalizar.`,
    };
  }

  private async report(userId: string): Promise<AiReply> {
    const listings = await this.prisma.listing.findMany({ where: { sellerId: userId } });
    const orders = await this.prisma.order.findMany({ where: { sellerId: userId } });
    const gmv = orders.reduce((s, o) => s + o.totalAmount, 0);
    return {
      agent: "AgriAI Finance",
      confidence: 0.8,
      actions: [],
      sources: ["dados da sua conta"],
      disclaimer: DISCLAIMER,
      answer: `Relatório resumido (não é garantia bancária): ${listings.length} ofertas, ${orders.length} pedidos, volume transacionado ${Math.round(gmv).toLocaleString("pt-AO")} Kz. O AgriScore é um indicador interno da plataforma e nunca garante aprovação de crédito. Exporte o PDF no módulo Documentos para o banco.`,
    };
  }

  private yearPlan(province?: string | null): AiReply {
    return {
      agent: "AgriAI Farm",
      confidence: 0.73,
      actions: [],
      sources: ["calendário agrícola de referência"],
      disclaimer: DISCLAIMER,
      answer: `Plano 12 meses (${province ?? "Angola"}):\nJan–Fev: preparação e plantio de milho/feijão.\nMar–Abr: adubação e monitorização.\nMai–Jul: colheita, secagem, venda de cereais.\nAgo–Set: hortícolas irrigadas e manutenção de equipamentos.\nOut–Dez: segundo ciclo se a chuva permitir, contratos antecipados com compradores. Ajuste com o calendário da sua fazenda no Farm Manager.`,
    };
  }

  private commandSell(text: string): AiReply {
    const crop = detectCrop(text) ?? "milho";
    const qty = Number(text.match(/(\d+(?:[.,]\d+)?)/)?.[1] ?? 50);
    const prov = extractProvince(text);
    return {
      agent: "AgriAI Command",
      confidence: 0.84,
      actions: [{ type: "OPEN_LISTING", payload: { crop, quantity: qty, province: prov } }],
      sources: [],
      disclaimer: DISCLAIMER,
      answer: `Vou iniciar a publicação de ${qty} t de ${crop}${prov ? ` em ${prov}` : ""}. Confirme preço e qualidade no formulário — a IA preenche, você confirma.`,
    };
  }

  private commandTransport(text: string): AiReply {
    return {
      agent: "AgriAI Logistics",
      confidence: 0.8,
      actions: [{ type: "OPEN_LOGISTICS", payload: parseRoute(text) }],
      sources: [],
      disclaimer: DISCLAIMER,
      answer: `A abrir o módulo logístico com a rota interpretada. Confirme peso, datas e se precisa de refrigerado.`,
    };
  }

  private async fallback(text: string, province?: string | null): Promise<AiReply> {
    const openDemands = await this.prisma.demand.count({ where: { status: "OPEN" } });
    return {
      agent: "AgriAI Advisor",
      confidence: 0.45,
      actions: [],
      sources: ["contexto da plataforma"],
      disclaimer: DISCLAIMER,
      answer: `Posso ajudar com produção, preços, compradores, transporte, contratos e relatórios. Há ${openDemands} procuras abertas na plataforma. ${province ? `A sua base está em ${province}.` : ""} Reformule com o produto e a quantidade, por exemplo: “Tenho 20 toneladas de tomate, onde posso vender?”`,
    };
  }
}

function detectCrop(text: string): string | undefined {
  const n = text.normalize("NFD").replace(/\p{Diacritic}/gu, "");
  return CATALOG_PRODUCTS.find((p) => n.includes(p.slug) || n.includes(p.name.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "")))?.slug;
}

function extractProvince(text: string): string | undefined {
  const names = [
    "Luanda",
    "Malanje",
    "Huambo",
    "Huíla",
    "Benguela",
    "Uíge",
    "Bié",
    "Namibe",
    "Cabinda",
    "Zaire",
    "Bengo",
    "Moxico",
  ];
  return names.find((p) => text.toLowerCase().includes(p.toLowerCase()));
}

function parseRoute(text: string): Record<string, unknown> {
  const from = extractProvince(text);
  const m = text.match(/para\s+([A-Za-zÁÉÍÓÚáéíóúãõÂê ]+)/i);
  return { from, to: m?.[1]?.trim(), quantity: Number(text.match(/(\d+)\s*t/)?.[1] ?? 10) };
}
