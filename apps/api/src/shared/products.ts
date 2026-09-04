export type CropCategory =
  | "CEREALS"
  | "PULSES"
  | "TUBERS"
  | "HORTICULTURE"
  | "FRUIT"
  | "CASH_CROPS"
  | "LIVESTOCK"
  | "INPUTS"
  | "MACHINERY"
  | "OTHER";

export type CatalogProduct = {
  slug: string;
  name: string;
  category: CropCategory;
  unit: "kg" | "t" | "saco" | "caixa" | "unidade" | "litro" | "cabeca";
  typicalPriceKzPerKg: number;
  harvestMonths: number[];
  plantMonths: number[];
  aliases: string[];
};

export const CATALOG_PRODUCTS: CatalogProduct[] = [
  {
    slug: "milho",
    name: "Milho",
    category: "CEREALS",
    unit: "t",
    typicalPriceKzPerKg: 280,
    harvestMonths: [5, 6, 7],
    plantMonths: [10, 11, 12, 1, 2],
    aliases: ["maize", "corn"],
  },
  {
    slug: "feijao",
    name: "Feijão",
    category: "PULSES",
    unit: "t",
    typicalPriceKzPerKg: 850,
    harvestMonths: [4, 5, 6],
    plantMonths: [10, 11, 12, 1],
    aliases: ["bean", "feijão-manteiga"],
  },
  {
    slug: "arroz",
    name: "Arroz",
    category: "CEREALS",
    unit: "t",
    typicalPriceKzPerKg: 620,
    harvestMonths: [4, 5, 6],
    plantMonths: [11, 12, 1],
    aliases: ["rice"],
  },
  {
    slug: "soja",
    name: "Soja",
    category: "CASH_CROPS",
    unit: "t",
    typicalPriceKzPerKg: 540,
    harvestMonths: [4, 5, 6],
    plantMonths: [11, 12, 1],
    aliases: ["soy", "soya"],
  },
  {
    slug: "cafe",
    name: "Café",
    category: "CASH_CROPS",
    unit: "t",
    typicalPriceKzPerKg: 4200,
    harvestMonths: [5, 6, 7, 8],
    plantMonths: [10, 11],
    aliases: ["coffee", "robusta", "arabica"],
  },
  {
    slug: "mandioca",
    name: "Mandioca",
    category: "TUBERS",
    unit: "t",
    typicalPriceKzPerKg: 180,
    harvestMonths: [6, 7, 8, 9],
    plantMonths: [9, 10, 11],
    aliases: ["cassava", "yuca"],
  },
  {
    slug: "batata",
    name: "Batata",
    category: "TUBERS",
    unit: "t",
    typicalPriceKzPerKg: 450,
    harvestMonths: [3, 4, 8, 9],
    plantMonths: [1, 2, 6, 7],
    aliases: ["potato"],
  },
  {
    slug: "tomate",
    name: "Tomate",
    category: "HORTICULTURE",
    unit: "t",
    typicalPriceKzPerKg: 520,
    harvestMonths: [3, 4, 5, 8, 9],
    plantMonths: [1, 2, 6, 7],
    aliases: ["tomato"],
  },
  {
    slug: "banana",
    name: "Banana",
    category: "FRUIT",
    unit: "t",
    typicalPriceKzPerKg: 310,
    harvestMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    plantMonths: [9, 10, 11],
    aliases: [],
  },
  {
    slug: "abacaxi",
    name: "Abacaxi",
    category: "FRUIT",
    unit: "t",
    typicalPriceKzPerKg: 380,
    harvestMonths: [11, 12, 1, 2],
    plantMonths: [3, 4],
    aliases: ["ananás", "pineapple"],
  },
  {
    slug: "pecuaria-bovinos",
    name: "Bovinos",
    category: "LIVESTOCK",
    unit: "cabeca",
    typicalPriceKzPerKg: 1800,
    harvestMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    plantMonths: [],
    aliases: ["gado", "vacas", "bois"],
  },
];

export function findCatalogProduct(q: string): CatalogProduct | undefined {
  const s = q.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
  return CATALOG_PRODUCTS.find((p) => {
    const name = p.name.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
    return p.slug === s || name === s || p.aliases.some((a) => a.toLowerCase() === s);
  });
}
