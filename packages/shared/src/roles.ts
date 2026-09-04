export const USER_INTENTS = [
  "PRODUCER",
  "COOPERATIVE",
  "BUYER",
  "COMPANY",
  "TRANSPORTER",
  "WAREHOUSE",
  "AGRONOMIST",
  "SUPPLIER",
  "INVESTOR",
  "FINANCIAL",
  "EXPORTER",
  "CONSUMER",
  "ADMIN",
] as const;

export type UserIntent = (typeof USER_INTENTS)[number];

export const USER_INTENT_LABELS: Record<UserIntent, string> = {
  PRODUCER: "Sou produtor",
  COOPERATIVE: "Sou cooperativa",
  BUYER: "Sou comprador",
  COMPANY: "Sou empresa",
  TRANSPORTER: "Sou transportador",
  WAREHOUSE: "Tenho armazém",
  AGRONOMIST: "Sou técnico agrícola",
  SUPPLIER: "Sou fornecedor",
  INVESTOR: "Sou investidor",
  FINANCIAL: "Sou instituição financeira",
  EXPORTER: "Sou exportador",
  CONSUMER: "Sou consumidor",
  ADMIN: "Sou administrador",
};

export const USER_INTENT_DESCRIPTIONS: Record<UserIntent, string> = {
  PRODUCER: "Gerir fazenda, publicar ofertas e vender produção",
  COOPERATIVE: "Agregar membros, negociar volumes e gerir contratos",
  BUYER: "Encontrar fornecedores, publicar procuras e negociar",
  COMPANY: "Compras corporativas, fornecedores e pedidos recorrentes",
  TRANSPORTER: "Receber cargas, cotar rotas e acompanhar entregas",
  WAREHOUSE: "Disponibilizar capacidade de armazenamento",
  AGRONOMIST: "Apoiar produtores, diagnósticos e recomendações",
  SUPPLIER: "Vender sementes, insumos e equipamentos",
  INVESTOR: "Descobrir oportunidades e acompanhar o mercado",
  FINANCIAL: "Avaliar pedidos de crédito e seguros agrícolas",
  EXPORTER: "Encontrar lotes exportáveis e requisitos",
  CONSUMER: "Comprar produtos rastreáveis com passaporte digital",
  ADMIN: "Operar a plataforma, verificar e moderar",
};

export const ORG_ROLES = [
  "OWNER",
  "ADMIN",
  "MANAGER",
  "FINANCE",
  "SALES",
  "LOGISTICS",
  "AGRONOMIST",
  "WORKER",
  "VIEWER",
] as const;

export type OrgRole = (typeof ORG_ROLES)[number];
