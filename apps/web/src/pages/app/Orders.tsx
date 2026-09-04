import { Link, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { Badge, Button, Card, EmptyState, PageHeader, Spinner } from "../../components/ui";
import { kz } from "../../lib/utils";
import { toast } from "sonner";

type Order = {
  id: string;
  code: string;
  productName: string;
  quantity: number;
  unit: string;
  totalAmount: number;
  status: string;
  buyer: { name: string };
  seller: { name: string };
  shipment?: { id: string; status: string } | null;
  contract?: { id: string; code: string; status: string; body: string; signedBuyerAt: string | null; signedSellerAt: string | null } | null;
  payment?: { status: string; method: string; amount: number } | null;
  invoice?: { number: string; amount: number } | null;
};

export function OrdersPage() {
  const q = useQuery({ queryKey: ["orders"], queryFn: () => api.get<Order[]>("/orders") });
  return (
    <div>
      <PageHeader title="Pedidos" subtitle="Do acordo ao pagamento — com estados reais." />
      {q.isLoading ? <Spinner /> : !q.data?.length ? <EmptyState title="Sem pedidos" hint="Converta uma negociação aceite em contrato." /> : (
        <div className="space-y-3">
          {q.data.map((o) => (
            <Link key={o.id} to={`/app/pedidos/${o.id}`}>
              <Card className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{o.code} · {o.productName}</p>
                  <p className="text-sm text-forest-700/70">{kz(o.totalAmount)}</p>
                </div>
                <Badge>{o.status}</Badge>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function OrderDetailPage() {
  const { id } = useParams();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["order", id], queryFn: () => api.get<Order>(`/orders/${id}`) });
  if (q.isLoading || !q.data) return <Spinner />;
  const o = q.data;

  async function ship() {
    const s = await api.post<{ id: string }>("/shipments", { orderId: o.id });
    toast.success("Transporte solicitado");
    void qc.invalidateQueries({ queryKey: ["order", id] });
    return s;
  }
  async function complete() {
    await api.patch(`/orders/${id}/status`, { status: "COMPLETED" });
    toast.success("Pedido concluído");
    void qc.invalidateQueries({ queryKey: ["order", id] });
  }
  async function sign() {
    if (!o.contract) return;
    await api.post(`/contracts/${o.contract.id}/sign`);
    toast.success("Assinatura registada");
    void qc.invalidateQueries({ queryKey: ["order", id] });
  }

  return (
    <div className="space-y-4">
      <PageHeader title={o.code} subtitle={`${o.productName} · ${o.quantity} ${o.unit}`} />
      <div className="grid gap-4 md:grid-cols-3">
        <Card><p className="text-xs">Total</p><p className="font-display text-2xl">{kz(o.totalAmount)}</p></Card>
        <Card><p className="text-xs">Estado</p><Badge>{o.status}</Badge></Card>
        <Card><p className="text-xs">Pagamento</p><p>{o.payment?.status ?? "Pendente"} · {o.payment?.method}</p><p className="mt-2 text-xs text-forest-700/60">Métodos futuros: transferência, carteiras, mobile money, escrow via parceiro. Não armazenamos dados financeiros sensíveis.</p></Card>
      </div>
      <Card>
        <h2 className="font-display text-xl">Contrato {o.contract?.code}</h2>
        <pre className="mt-3 whitespace-pre-wrap rounded-xl bg-cream-100 p-4 text-sm">{o.contract?.body}</pre>
        <div className="mt-3 flex gap-2">
          <Button variant="outline" onClick={() => void sign()}>Assinar</Button>
          <Button onClick={() => {
            const blob = new Blob([o.contract?.body ?? ""], { type: "text/plain" });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = `${o.contract?.code ?? o.code}.txt`;
            a.click();
          }}>Exportar</Button>
        </div>
      </Card>
      <Card>
        <h2 className="font-display text-xl">Deseja organizar o transporte?</h2>
        <p className="mt-2 text-sm text-forest-700/70">Solicitar, escolher transportador, comparar e acompanhar.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {!o.shipment && <Button variant="gold" onClick={() => void ship()}>Solicitar transporte</Button>}
          {o.shipment && <Link to={`/app/logistica/${o.shipment.id}`}><Button>Acompanhar envio ({o.shipment.status})</Button></Link>}
          <Button variant="outline" onClick={() => void complete()}>Confirmar conclusão</Button>
        </div>
      </Card>
    </div>
  );
}
