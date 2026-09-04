import { FormEvent, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { Badge, Button, Card, EmptyState, Field, Input, PageHeader, Spinner, Textarea } from "../../components/ui";
import { toast } from "sonner";
import { kz } from "../../lib/utils";

type Neg = {
  id: string;
  status: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  deliveryPlace: string | null;
  deliveryDate: string | null;
  buyer: { id: string; name: string };
  seller: { id: string; name: string };
  listing?: { product: { name: string }; lotCode: string } | null;
  messages: { id: string; kind: string; body: string; createdAt: string; authorId: string; quantity?: number | null; pricePerUnit?: number | null }[];
};

export function NegotiationsPage() {
  const q = useQuery({ queryKey: ["negs"], queryFn: () => api.get<Neg[]>("/negotiations") });
  return (
    <div>
      <PageHeader title="Negociações" subtitle="Propostas, contrapropostas e conversão em contrato." />
      {q.isLoading ? <Spinner /> : !q.data?.length ? <EmptyState title="Sem negociações" hint="Peça uma cotação a partir de uma oferta ou procura." /> : (
        <div className="space-y-3">
          {q.data.map((n) => (
            <Link key={n.id} to={`/app/negociacoes/${n.id}`}>
              <Card className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{n.listing?.product.name ?? "Negociação"} · {n.quantity} {n.unit}</p>
                  <p className="text-sm text-forest-700/70">{n.buyer.name} ↔ {n.seller.name} · {kz(n.pricePerUnit)}</p>
                </div>
                <Badge>{n.status}</Badge>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function NegotiationDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["neg", id], queryFn: () => api.get<Neg>(`/negotiations/${id}`) });
  const summary = useQuery({ queryKey: ["neg-sum", id], queryFn: () => api.get<Record<string, unknown>>(`/negotiations/${id}/summary`) });
  const [price, setPrice] = useState("");
  const [qty, setQty] = useState("");
  const [body, setBody] = useState("");

  const counter = useMutation({
    mutationFn: () => api.post(`/negotiations/${id}/counter`, {
      pricePerUnit: price ? Number(price) : undefined,
      quantity: qty ? Number(qty) : undefined,
      body,
    }),
    onSuccess: () => {
      toast.success("Contraproposta enviada");
      void qc.invalidateQueries({ queryKey: ["neg", id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (q.isLoading || !q.data) return <Spinner />;
  const n = q.data;

  async function accept() {
    await api.post(`/negotiations/${id}/accept`);
    toast.success("Aceite");
    void qc.invalidateQueries({ queryKey: ["neg", id] });
  }
  async function convert() {
    const order = await api.post<{ id: string }>(`/orders/from-negotiation/${id}`);
    toast.success("Convertido em pedido e contrato");
    nav(`/app/pedidos/${order.id}`);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
      <Card>
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl">{n.listing?.product.name ?? "Negociação"}</h1>
          <Badge>{n.status}</Badge>
        </div>
        <p className="mt-2 text-sm">{n.quantity} {n.unit} · {kz(n.pricePerUnit, n.unit)} · {n.deliveryPlace ?? "entrega a definir"}</p>
        <ol className="mt-6 space-y-3">
          {n.messages.map((m) => (
            <li key={m.id} className="rounded-xl bg-cream-100 p-3 text-sm">
              <p className="text-xs text-forest-700/50">{m.kind} · {new Date(m.createdAt).toLocaleString("pt-AO")}</p>
              <p>{m.body}</p>
            </li>
          ))}
        </ol>
        {n.status !== "CONVERTED" && n.status !== "REJECTED" && n.status !== "CANCELLED" && (
          <form
            className="mt-6 space-y-3"
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              counter.mutate();
            }}
          >
            <Field label="Quantidade"><Input value={qty} onChange={(e) => setQty(e.target.value)} /></Field>
            <Field label="Preço"><Input value={price} onChange={(e) => setPrice(e.target.value)} /></Field>
            <Field label="Mensagem"><Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={2} /></Field>
            <div className="flex flex-wrap gap-2">
              <Button type="submit">Contraproposta</Button>
              <Button type="button" variant="outline" onClick={() => void accept()}>Aceitar</Button>
              {n.status === "ACCEPTED" && (
                <Button type="button" variant="gold" onClick={() => void convert()}>
                  Converter em contrato
                </Button>
              )}
            </div>
          </form>
        )}
      </Card>
      <Card className="bg-forest-900 text-cream-50">
        <p className="text-xs uppercase text-gold-400">Resumo AgriAI</p>
        <pre className="mt-3 whitespace-pre-wrap font-sans text-sm">{JSON.stringify(summary.data, null, 2)}</pre>
      </Card>
    </div>
  );
}
