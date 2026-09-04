import { FormEvent, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ANGOLA_PROVINCES } from "@agriangola/shared";
import {
  ArrowDownUp,
  ArrowRight,
  Check,
  MapPin,
  PackageSearch,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { api } from "../../lib/api";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  PageHeader,
  Select,
  Spinner,
  Textarea,
} from "../../components/ui";
import { kz, qty } from "../../lib/utils";
import { toast } from "sonner";

type Listing = {
  id: string;
  lotCode: string;
  title: string;
  description: string | null;
  availableQty: number;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  negotiable: boolean;
  quality: string;
  province: string;
  harvestDate: string | null;
  deliveryAvailable: boolean;
  views: number;
  product: { id: string; name: string; slug: string };
  seller: {
    id: string;
    name: string;
    trustScore: number;
    identityVerified: boolean;
    province: string | null;
  };
  organization?: { name: string; verified: boolean } | null;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  unit: string;
  category?: { id: string; name: string } | null;
};

type SortMode = "recent" | "price-asc" | "price-desc" | "quantity-desc";

const QUALITY_OPTIONS = ["A", "B", "C", "MISTO"];

export function MarketplacePage() {
  const [q, setQ] = useState("");
  const [province, setProvince] = useState("");
  const [productId, setProductId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [quality, setQuality] = useState("");
  const [minQty, setMinQty] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState<SortMode>("recent");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const products = useQuery({
    queryKey: ["products"],
    queryFn: () => api.get<Product[]>("/listings/catalog/products"),
  });
  const list = useQuery({
    queryKey: ["listings", q, province, productId, quality, minQty, maxPrice],
    queryFn: () => {
      const p = new URLSearchParams();
      if (q) p.set("q", q);
      if (province) p.set("province", province);
      if (productId) p.set("productId", productId);
      if (quality) p.set("quality", quality);
      if (minQty) p.set("minQty", minQty);
      if (maxPrice) p.set("maxPrice", maxPrice);
      p.set("limit", "50");
      return api.get<{ items: Listing[]; total: number }>(
        `/listings?${p.toString()}`,
      );
    },
  });

  const categories = useMemo(() => {
    const grouped = new Map<
      string,
      { id: string; name: string; productIds: Set<string> }
    >();
    products.data?.forEach((product) => {
      if (!product.category) return;
      const current = grouped.get(product.category.id) ?? {
        id: product.category.id,
        name: product.category.name,
        productIds: new Set<string>(),
      };
      current.productIds.add(product.id);
      grouped.set(product.category.id, current);
    });
    return [...grouped.values()];
  }, [products.data]);

  const items = useMemo(() => {
    const category = categories.find((item) => item.id === categoryId);
    const values = (list.data?.items ?? []).filter(
      (item) => !category || category.productIds.has(item.product.id),
    );
    if (sort === "price-asc")
      return values.sort((a, b) => a.pricePerUnit - b.pricePerUnit);
    if (sort === "price-desc")
      return values.sort((a, b) => b.pricePerUnit - a.pricePerUnit);
    if (sort === "quantity-desc")
      return values.sort((a, b) => b.availableQty - a.availableQty);
    return values;
  }, [categories, categoryId, list.data?.items, sort]);

  const activeFilters = [
    province,
    productId,
    categoryId,
    quality,
    minQty,
    maxPrice,
  ].filter(Boolean).length;
  const selectedProduct = products.data?.find(
    (product) => product.id === productId,
  );
  const clearFilters = () => {
    setQ("");
    setProvince("");
    setProductId("");
    setCategoryId("");
    setQuality("");
    setMinQty("");
    setMaxPrice("");
    setSort("recent");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Encontre o que move o seu negócio"
        subtitle="Produtos agrícolas verificados, com origem, quantidade e condições claras."
        actions={
          <Link to="/app/marketplace/nova">
            <Button>
              <PackageSearch className="h-4 w-4" /> Publicar oferta
            </Button>
          </Link>
        }
      />
      <div className="rounded-2xl green-gradient-soft p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-800" />
            <Input
              className="h-11 border-white/80 pl-10 shadow-sm"
              placeholder="Pesquisar por produto, lote ou palavra-chave"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Pesquisar no marketplace"
            />
          </label>
          <button
            type="button"
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-primary-800/15 bg-white px-4 text-sm font-bold text-primary-800 shadow-sm lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" /> Filtros{" "}
            {activeFilters > 0 && (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary-800 px-1 text-xs text-white">
                {activeFilters}
              </span>
            )}
          </button>
          <div className="hidden min-w-[210px] lg:block">
            <Select
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              aria-label="Filtrar por província"
            >
              <option value="">Todas as províncias</option>
              {ANGOLA_PROVINCES.map((p) => (
                <option key={p.code}>{p.name}</option>
              ))}
            </Select>
          </div>
          <div className="hidden min-w-[190px] lg:block">
            <Select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortMode)}
              aria-label="Ordenar resultados"
            >
              <option value="recent">Mais recentes</option>
              <option value="price-asc">Menor preço</option>
              <option value="price-desc">Maior preço</option>
              <option value="quantity-desc">Maior quantidade</option>
            </Select>
          </div>
        </div>
        <div
          className={`mt-4 grid gap-3 border-t border-primary-800/10 pt-4 sm:grid-cols-2 lg:grid-cols-4 ${filtersOpen ? "" : "hidden lg:grid"}`}
        >
          <Select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            aria-label="Filtrar por produto"
          >
            <option value="">Todos os produtos</option>
            {products.data?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
          <Select
            value={quality}
            onChange={(e) => setQuality(e.target.value)}
            aria-label="Filtrar por qualidade"
          >
            <option value="">Todas as qualidades</option>
            {QUALITY_OPTIONS.map((value) => (
              <option key={value} value={value}>
                Classe {value}
              </option>
            ))}
          </Select>
          <Input
            type="number"
            min="0"
            value={minQty}
            onChange={(e) => setMinQty(e.target.value)}
            placeholder="Quantidade mínima"
            aria-label="Quantidade mínima"
          />
          <Input
            type="number"
            min="0"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Preço máximo (Kz)"
            aria-label="Preço máximo"
          />
        </div>
        {categories.length > 0 && (
          <div className="mt-4 flex gap-2 overflow-x-auto border-t border-primary-800/10 pt-4 pb-1">
            <button
              type="button"
              onClick={() => setCategoryId("")}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition ${!categoryId ? "bg-primary-800 text-white" : "bg-white text-muted hover:text-primary-800"}`}
            >
              Todas as categorias
            </button>
            {categories.map((category) => (
              <button
                type="button"
                key={category.id}
                onClick={() => {
                  setCategoryId(category.id);
                  setProductId("");
                }}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition ${categoryId === category.id ? "bg-primary-800 text-white" : "bg-white text-muted hover:text-primary-800"}`}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}
        {(activeFilters > 0 || q || categoryId) && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-primary-900">
              Filtros ativos:
            </span>
            {q && (
              <button
                type="button"
                onClick={() => setQ("")}
                className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-primary-800 shadow-sm"
              >
                Pesquisa: {q}
                <X className="h-3 w-3" />
              </button>
            )}
            {selectedProduct && (
              <span className="rounded-full bg-white px-2.5 py-1 text-primary-800">
                {selectedProduct.name}
              </span>
            )}
            {categoryId && (
              <span className="rounded-full bg-white px-2.5 py-1 text-primary-800">
                {
                  categories.find((category) => category.id === categoryId)
                    ?.name
                }
              </span>
            )}
            {province && (
              <span className="rounded-full bg-white px-2.5 py-1 text-primary-800">
                {province}
              </span>
            )}
            <button
              type="button"
              onClick={clearFilters}
              className="font-bold text-primary-800 underline"
            >
              Limpar tudo
            </button>
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-ink">
            {items.length} ofertas disponíveis
          </p>
          <p className="text-xs text-muted">
            Encontre fornecedores para a sua próxima operação.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted">
          <ArrowDownUp className="h-3.5 w-3.5" /> Ordenação:{" "}
          <span className="font-semibold text-ink">
            {sort === "recent"
              ? "Mais recentes"
              : sort === "price-asc"
                ? "Menor preço"
                : sort === "price-desc"
                  ? "Maior preço"
                  : "Maior quantidade"}
          </span>
        </div>
      </div>
      {list.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Card className="h-56 animate-pulse bg-primary-100/40">
            <span />
          </Card>
          <Card className="h-56 animate-pulse bg-primary-100/40">
            <span />
          </Card>
          <Card className="h-56 animate-pulse bg-primary-100/40">
            <span />
          </Card>
        </div>
      ) : !items.length ? (
        <EmptyState
          title="Não encontramos ofertas"
          hint="Experimente remover um filtro ou pesquisar por outra cultura."
          action={
            <Button variant="outline" onClick={clearFilters}>
              Limpar filtros
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((l) => (
            <Link key={l.id} to={`/app/marketplace/${l.id}`} className="group">
              <Card className="relative h-full overflow-hidden border-line transition duration-200 group-hover:-translate-y-1 group-hover:border-primary-500 group-hover:shadow-lift">
                <div className="absolute right-5 top-5 flex items-center gap-2">
                  <Badge tone="forest">Classe {l.quality}</Badge>
                  {l.seller.identityVerified && (
                    <span
                      className="grid h-6 w-6 place-items-center rounded-full bg-primary-100 text-primary-800"
                      title="Vendedor verificado"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  )}
                </div>
                <p className="pr-24 text-xs font-semibold uppercase tracking-wide text-primary-800">
                  {l.product.name}
                </p>
                <h3 className="mt-2 font-display text-xl font-extrabold text-ink">
                  {l.title}
                </h3>
                <p className="mt-1 text-xs text-muted">Lote {l.lotCode}</p>
                <div className="mt-5 grid grid-cols-2 gap-3 border-y border-line py-4 text-sm">
                  <div>
                    <p className="text-xs text-muted">Disponível</p>
                    <p className="mt-1 font-bold text-ink">
                      {qty(l.availableQty, l.unit)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">Preço indicativo</p>
                    <p className="mt-1 font-bold text-primary-800">
                      {kz(l.pricePerUnit, l.unit)}
                    </p>
                  </div>
                </div>
                <p className="mt-4 flex items-center gap-1 text-xs text-muted">
                  <MapPin className="h-3.5 w-3.5 text-primary-800" />{" "}
                  {l.province}
                  <span className="mx-1">·</span>
                  {l.seller.name}
                </p>
                <div className="mt-5 flex items-center justify-between text-sm font-bold text-primary-800">
                  {l.negotiable ? "Preço negociável" : "Oferta disponível"}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function ListingDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const q = useQuery({
    queryKey: ["listing", id],
    queryFn: () => api.get<Listing>(`/listings/${id}`),
  });
  const matches = useQuery({
    queryKey: ["match-listing", id],
    queryFn: () =>
      api.get<{ demand: { id: string; title: string }; score: number }[]>(
        `/matching/listings/${id}`,
      ),
    enabled: !!id,
  });
  const [qtyV, setQtyV] = useState("");
  const [price, setPrice] = useState("");
  const [deliveryPlace, setDeliveryPlace] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [message, setMessage] = useState("Pedido de cotação via AgriAngola OS");

  if (q.isLoading) return <Spinner />;
  if (!q.data) return <p>Oferta não encontrada.</p>;
  const l = q.data;

  async function propose() {
    try {
      const n = await api.post<{ id: string }>("/negotiations", {
        listingId: l.id,
        quantity: Number(qtyV || l.availableQty),
        pricePerUnit: Number(price || l.pricePerUnit),
        deliveryPlace: deliveryPlace || undefined,
        deliveryDate: deliveryDate || undefined,
        message,
      });
      toast.success("Negociação iniciada");
      nav(`/app/negociacoes/${n.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
      <Card>
        <p className="text-xs text-forest-700/50">{l.lotCode}</p>
        <h1 className="font-display text-4xl">{l.product.name}</h1>
        <p className="mt-2 text-forest-700/80">{l.description}</p>
        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-forest-700/50">Quantidade</dt>
            <dd>
              {qty(l.availableQty, l.unit)} de {qty(l.quantity, l.unit)}
            </dd>
          </div>
          <div>
            <dt className="text-forest-700/50">Preço</dt>
            <dd>{kz(l.pricePerUnit, l.unit)}</dd>
          </div>
          <div>
            <dt className="text-forest-700/50">Qualidade</dt>
            <dd>Classe {l.quality}</dd>
          </div>
          <div>
            <dt className="text-forest-700/50">Origem</dt>
            <dd>{l.province}</dd>
          </div>
          <div>
            <dt className="text-forest-700/50">Colheita</dt>
            <dd>
              {l.harvestDate
                ? new Date(l.harvestDate).toLocaleDateString("pt-AO")
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-forest-700/50">Entrega</dt>
            <dd>{l.deliveryAvailable ? "Disponível" : "A negociar"}</dd>
          </div>
        </dl>
      </Card>
      <div className="space-y-4">
        <Card>
          <p className="text-xs uppercase text-gold-600">Produtor</p>
          <Link
            to={`/app/perfil/${l.seller.id}`}
            className="font-display text-2xl hover:text-gold-600"
          >
            {l.seller.name}
          </Link>
          <p className="text-sm">
            AgriTrust {l.seller.trustScore}{" "}
            {l.seller.identityVerified && <Badge>Identidade verificada</Badge>}
          </p>
        </Card>
        <Card>
          <h2 className="font-display text-xl">Solicitar cotação</h2>
          <div className="mt-3 space-y-3">
            <Field label="Quantidade">
              <Input
                value={qtyV}
                onChange={(e) => setQtyV(e.target.value)}
                placeholder={String(l.availableQty)}
              />
            </Field>
            <Field label="Preço proposto">
              <Input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder={String(l.pricePerUnit)}
              />
            </Field>
            <Field label="Local de entrega">
              <Input
                value={deliveryPlace}
                onChange={(e) => setDeliveryPlace(e.target.value)}
                placeholder="Ex.: Luanda, Viana"
              />
            </Field>
            <Field label="Data de entrega">
              <Input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
              />
            </Field>
            <Field label="Mensagem">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
            </Field>
            <Button className="w-full" onClick={() => void propose()}>
              Fazer proposta
            </Button>
          </div>
        </Card>
        <Card>
          <h2 className="font-display text-xl">Compradores compatíveis</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {matches.data?.slice(0, 5).map((m) => (
              <li key={m.demand.id} className="flex justify-between">
                <Link to={`/app/procuras/${m.demand.id}`}>
                  {m.demand.title}
                </Link>
                <Badge tone="gold">{m.score}</Badge>
              </li>
            ))}
            {!matches.data?.length && (
              <p className="text-forest-700/60">
                Sem procuras compatíveis neste momento.
              </p>
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
}

export function NewListingPage() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const products = useQuery({
    queryKey: ["products"],
    queryFn: () => api.get<Product[]>("/listings/catalog/products"),
  });
  const mut = useMutation({
    mutationFn: (body: unknown) => api.post("/listings", body),
    onSuccess: () => {
      toast.success("Oferta publicada");
      void qc.invalidateQueries({ queryKey: ["listings"] });
      nav("/app/marketplace");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    mut.mutate({
      productId: fd.get("productId"),
      quantity: Number(fd.get("quantity")),
      pricePerUnit: Number(fd.get("pricePerUnit")),
      province: fd.get("province"),
      quality: fd.get("quality"),
      description: fd.get("description"),
      variety: fd.get("variety") || undefined,
      negotiable: true,
    });
  }

  return (
    <div>
      <PageHeader
        title="Publicar oferta"
        subtitle="A IA pode pré-preencher a partir do comando universal. Confirme os dados."
      />
      <Card>
        <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
          <Field label="Produto">
            <Select name="productId" required>
              {products.data?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Província">
            <Select name="province">
              {ANGOLA_PROVINCES.map((p) => (
                <option key={p.code}>{p.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Quantidade (t)">
            <Input
              name="quantity"
              type="number"
              step="0.1"
              min="0.1"
              required
            />
          </Field>
          <Field label="Preço por unidade (Kz)">
            <Input name="pricePerUnit" type="number" min="0" required />
          </Field>
          <Field label="Qualidade">
            <Select name="quality">
              <option>A</option>
              <option>B</option>
              <option>C</option>
              <option>MISTO</option>
            </Select>
          </Field>
          <Field label="Variedade">
            <Input name="variety" />
          </Field>
          <div className="md:col-span-2">
            <Field label="Descrição">
              <Textarea name="description" rows={4} />
            </Field>
          </div>
          <Button type="submit" disabled={mut.isPending}>
            {mut.isPending ? "A publicar…" : "Publicar"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
