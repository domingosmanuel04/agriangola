import { FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ANGOLA_PROVINCES } from "@agriangola/shared";
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
import { toast } from "sonner";

type Demand = {
  id: string;
  title: string;
  quantity: number;
  unit: string;
  quality: string;
  maxPrice: number | null;
  province: string;
  neededBy: string | null;
  notes: string | null;
  product: { id: string; name: string };
  buyer: { id: string; name: string; trustScore: number };
  matches?: {
    id: string;
    score: number;
    listing?: {
      id: string;
      title: string;
      province: string;
      availableQty: number;
      unit: string;
      pricePerUnit: number;
      seller: { name: string };
    };
  }[];
};

export function DemandsPage() {
  const q = useQuery({
    queryKey: ["demands"],
    queryFn: () => api.get<{ items: Demand[] }>("/demands"),
  });
  return (
    <div>
      <PageHeader
        title="Quero comprar"
        subtitle="O motor AgriMatch encontra produtores compatíveis automaticamente."
        actions={
          <Link to="/app/procuras/nova">
            <Button variant="gold">Publicar procura</Button>
          </Link>
        }
      />
      {q.isLoading ? (
        <Spinner />
      ) : !q.data?.items.length ? (
        <EmptyState
          title="Sem procuras"
          hint="Publique uma necessidade de compra."
        />
      ) : (
        <div className="space-y-3">
          {q.data.items.map((d) => (
            <Link key={d.id} to={`/app/procuras/${d.id}`}>
              <Card className="flex flex-wrap items-center justify-between gap-3 hover:shadow-glow">
                <div>
                  <p className="font-display text-xl">{d.title}</p>
                  <p className="text-sm text-forest-700/70">
                    {d.buyer.name} · AgriTrust {d.buyer.trustScore}
                  </p>
                </div>
                <Badge>Classe {d.quality}</Badge>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function DemandDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const q = useQuery({
    queryKey: ["demand", id],
    queryFn: () => api.get<Demand>(`/demands/${id}`),
  });
  if (q.isLoading) return <Spinner />;
  if (!q.data) return <p>Procura não encontrada.</p>;
  const d = q.data;

  async function offer(listingId: string, qty: number, price: number) {
    try {
      const n = await api.post<{ id: string }>("/negotiations", {
        listingId,
        demandId: d.id,
        quantity: qty,
        pricePerUnit: price,
        message: "Oferta em resposta à procura",
      });
      toast.success("Proposta enviada");
      nav(`/app/negociacoes/${n.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha");
    }
  }

  return (
    <div>
      <PageHeader
        title={d.title}
        subtitle={d.notes ?? "Matching automático com ofertas activas."}
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <p className="text-sm">
            Quantidade: {d.quantity} {d.unit}
          </p>
          <p className="text-sm">Preço máx.: {d.maxPrice ?? "—"} Kz</p>
          <p className="text-sm">Local: {d.province}</p>
          <p className="text-sm">
            Prazo:{" "}
            {d.neededBy
              ? new Date(d.neededBy).toLocaleDateString("pt-AO")
              : "flexível"}
          </p>
        </Card>
        <Card className="lg:col-span-2">
          <h2 className="font-display text-xl">Índice de compatibilidade</h2>
          <ul className="mt-4 space-y-3">
            {d.matches?.map((m) => (
              <li
                key={m.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-forest-800/10 p-3"
              >
                <div>
                  <p className="font-semibold">
                    {m.listing?.title ?? "Oferta"}
                  </p>
                  <p className="text-xs text-forest-700/60">
                    {m.listing?.seller.name} · {m.listing?.province}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone="gold">{m.score}</Badge>
                  {m.listing && (
                    <Button
                      variant="outline"
                      onClick={() =>
                        void offer(
                          m.listing!.id,
                          Math.min(d.quantity, m.listing!.availableQty),
                          d.maxPrice ?? m.listing!.pricePerUnit,
                        )
                      }
                    >
                      Propor
                    </Button>
                  )}
                </div>
              </li>
            ))}
            {!d.matches?.length && (
              <p className="text-sm text-forest-700/60">
                Ainda sem matches. Publique mais ofertas no marketplace.
              </p>
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
}

export function NewDemandPage() {
  const nav = useNavigate();
  const products = useQuery({
    queryKey: ["products"],
    queryFn: () =>
      api.get<{ id: string; name: string }[]>("/listings/catalog/products"),
  });
  const mut = useMutation({
    mutationFn: (body: unknown) => api.post("/demands", body),
    onSuccess: () => {
      toast.success("Procura publicada — matching em curso");
      nav("/app/procuras");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    mut.mutate({
      productId: fd.get("productId"),
      quantity: Number(fd.get("quantity")),
      maxPrice: Number(fd.get("maxPrice")) || undefined,
      province: fd.get("province"),
      quality: fd.get("quality"),
      neededBy: fd.get("neededBy") || undefined,
      notes: fd.get("notes") || undefined,
      deliveryIncluded: true,
    });
  }

  return (
    <div>
      <PageHeader
        title="Publicar procura"
        subtitle="O sistema encontra produtores compatíveis."
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
          <Field label="Quantidade">
            <Input
              name="quantity"
              type="number"
              required
              min="0.1"
              step="0.1"
            />
          </Field>
          <Field label="Preço máximo (Kz)">
            <Input name="maxPrice" type="number" />
          </Field>
          <Field label="Qualidade">
            <Select name="quality">
              <option>A</option>
              <option>B</option>
              <option>C</option>
            </Select>
          </Field>
          <Field label="Necessário até">
            <Input name="neededBy" type="date" />
          </Field>
          <div className="md:col-span-2">
            <Field label="Condições">
              <Textarea name="notes" rows={3} />
            </Field>
          </div>
          <Button type="submit" disabled={mut.isPending}>
            Publicar procura
          </Button>
        </form>
      </Card>
    </div>
  );
}
