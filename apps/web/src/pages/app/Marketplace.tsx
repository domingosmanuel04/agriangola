import { FormEvent, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ANGOLA_PROVINCES } from "@agriangola/shared";
import { api } from "../../lib/api";
import { Badge, Button, Card, EmptyState, Field, Input, PageHeader, Select, Spinner, Textarea } from "../../components/ui";
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
  seller: { id: string; name: string; trustScore: number; identityVerified: boolean; province: string | null };
  organization?: { name: string; verified: boolean } | null;
};

type Product = { id: string; name: string; slug: string; unit: string };

export function MarketplacePage() {
  const [q, setQ] = useState("");
  const [province, setProvince] = useState("");
  const [productId, setProductId] = useState("");
  const products = useQuery({ queryKey: ["products"], queryFn: () => api.get<Product[]>("/listings/catalog/products") });
  const list = useQuery({
    queryKey: ["listings", q, province, productId],
    queryFn: () => {
      const p = new URLSearchParams();
      if (q) p.set("q", q);
      if (province) p.set("province", province);
      if (productId) p.set("productId", productId);
      return api.get<{ items: Listing[]; total: number }>(`/listings?${p.toString()}`);
    },
  });

  return (
    <div>
      <PageHeader
        title="Marketplace B2B"
        subtitle="Ofertas profissionais com lote, qualidade, origem e reputação — não é um classificado."
        actions={
          <Link to="/app/marketplace/nova">
            <Button variant="gold">Publicar oferta</Button>
          </Link>
        }
      />
      <Card className="mb-5 grid gap-3 md:grid-cols-4">
        <Input placeholder="Pesquisar produto ou lote" value={q} onChange={(e) => setQ(e.target.value)} />
        <Select value={productId} onChange={(e) => setProductId(e.target.value)}>
          <option value="">Todos os produtos</option>
          {products.data?.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </Select>
        <Select value={province} onChange={(e) => setProvince(e.target.value)}>
          <option value="">Todas as províncias</option>
          {ANGOLA_PROVINCES.map((p) => (
            <option key={p.code}>{p.name}</option>
          ))}
        </Select>
        <p className="self-center text-sm text-forest-700/60">{list.data?.total ?? 0} ofertas activas</p>
      </Card>
      {list.isLoading ? (
        <Spinner />
      ) : !list.data?.items.length ? (
        <EmptyState title="Sem ofertas" hint="Ajuste os filtros ou publique a primeira oferta." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.data.items.map((l) => (
            <Link key={l.id} to={`/app/marketplace/${l.id}`}>
              <Card className="h-full hover:shadow-glow">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-display text-xl">{l.product.name}</p>
                  <Badge tone="gold">Classe {l.quality}</Badge>
                </div>
                <p className="mt-1 text-xs text-forest-700/50">{l.lotCode}</p>
                <p className="mt-3 text-sm">{qty(l.availableQty, l.unit)} · {l.province}</p>
                <p className="mt-1 font-semibold">{kz(l.pricePerUnit, l.unit)} {l.negotiable ? "· negociável" : ""}</p>
                <p className="mt-3 text-xs text-forest-700/60">
                  {l.seller.name} · AgriTrust {l.seller.trustScore}
                  {l.seller.identityVerified ? " · verificado" : ""}
                </p>
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
  const q = useQuery({ queryKey: ["listing", id], queryFn: () => api.get<Listing>(`/listings/${id}`) });
  const matches = useQuery({
    queryKey: ["match-listing", id],
    queryFn: () => api.get<{ demand: { id: string; title: string }; score: number }[]>(`/matching/listings/${id}`),
    enabled: !!id,
  });
  const [qtyV, setQtyV] = useState("");
  const [price, setPrice] = useState("");

  if (q.isLoading) return <Spinner />;
  if (!q.data) return <p>Oferta não encontrada.</p>;
  const l = q.data;

  async function propose() {
    try {
      const n = await api.post<{ id: string }>("/negotiations", {
        listingId: l.id,
        quantity: Number(qtyV || l.availableQty),
        pricePerUnit: Number(price || l.pricePerUnit),
        message: "Pedido de cotação via AgriAngola OS",
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
          <div><dt className="text-forest-700/50">Quantidade</dt><dd>{qty(l.availableQty, l.unit)} de {qty(l.quantity, l.unit)}</dd></div>
          <div><dt className="text-forest-700/50">Preço</dt><dd>{kz(l.pricePerUnit, l.unit)}</dd></div>
          <div><dt className="text-forest-700/50">Qualidade</dt><dd>Classe {l.quality}</dd></div>
          <div><dt className="text-forest-700/50">Origem</dt><dd>{l.province}</dd></div>
          <div><dt className="text-forest-700/50">Colheita</dt><dd>{l.harvestDate ? new Date(l.harvestDate).toLocaleDateString("pt-AO") : "—"}</dd></div>
          <div><dt className="text-forest-700/50">Entrega</dt><dd>{l.deliveryAvailable ? "Disponível" : "A negociar"}</dd></div>
        </dl>
      </Card>
      <div className="space-y-4">
        <Card>
          <p className="text-xs uppercase text-gold-600">Produtor</p>
          <Link to={`/app/perfil/${l.seller.id}`} className="font-display text-2xl hover:text-gold-600">{l.seller.name}</Link>
          <p className="text-sm">AgriTrust {l.seller.trustScore} {l.seller.identityVerified && <Badge>Identidade verificada</Badge>}</p>
        </Card>
        <Card>
          <h2 className="font-display text-xl">Solicitar cotação</h2>
          <div className="mt-3 space-y-3">
            <Field label="Quantidade"><Input value={qtyV} onChange={(e) => setQtyV(e.target.value)} placeholder={String(l.availableQty)} /></Field>
            <Field label="Preço proposto"><Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder={String(l.pricePerUnit)} /></Field>
            <Button className="w-full" onClick={() => void propose()}>Fazer proposta</Button>
          </div>
        </Card>
        <Card>
          <h2 className="font-display text-xl">Compradores compatíveis</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {matches.data?.slice(0, 5).map((m) => (
              <li key={m.demand.id} className="flex justify-between">
                <Link to={`/app/procuras/${m.demand.id}`}>{m.demand.title}</Link>
                <Badge tone="gold">{m.score}</Badge>
              </li>
            ))}
            {!matches.data?.length && <p className="text-forest-700/60">Sem procuras compatíveis neste momento.</p>}
          </ul>
        </Card>
      </div>
    </div>
  );
}

export function NewListingPage() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const products = useQuery({ queryKey: ["products"], queryFn: () => api.get<Product[]>("/listings/catalog/products") });
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
      <PageHeader title="Publicar oferta" subtitle="A IA pode pré-preencher a partir do comando universal. Confirme os dados." />
      <Card>
        <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
          <Field label="Produto">
            <Select name="productId" required>
              {products.data?.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Província">
            <Select name="province">{ANGOLA_PROVINCES.map((p) => <option key={p.code}>{p.name}</option>)}</Select>
          </Field>
          <Field label="Quantidade (t)"><Input name="quantity" type="number" step="0.1" min="0.1" required /></Field>
          <Field label="Preço por unidade (Kz)"><Input name="pricePerUnit" type="number" min="0" required /></Field>
          <Field label="Qualidade">
            <Select name="quality"><option>A</option><option>B</option><option>C</option><option>MISTO</option></Select>
          </Field>
          <Field label="Variedade"><Input name="variety" /></Field>
          <div className="md:col-span-2">
            <Field label="Descrição"><Textarea name="description" rows={4} /></Field>
          </div>
          <Button type="submit" disabled={mut.isPending}>{mut.isPending ? "A publicar…" : "Publicar"}</Button>
        </form>
      </Card>
    </div>
  );
}
