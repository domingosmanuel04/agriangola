import { Link, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { Badge, Button, Card, EmptyState, PageHeader, Spinner } from "../../components/ui";
import { toast } from "sonner";

const FLOW = [
  "REQUESTED",
  "ACCEPTED",
  "EN_ROUTE_PICKUP",
  "PICKED_UP",
  "IN_TRANSIT",
  "ARRIVED",
  "DELIVERED",
];

const LABELS: Record<string, string> = {
  REQUESTED: "Transporte solicitado",
  ACCEPTED: "Transportador aceite",
  EN_ROUTE_PICKUP: "Veículo a caminho",
  PICKED_UP: "Produto recolhido",
  IN_TRANSIT: "Em trânsito",
  ARRIVED: "Chegou ao destino",
  DELIVERED: "Entrega confirmada",
};

type Shipment = {
  id: string;
  status: string;
  pickupAddress?: string | null;
  dropoffAddress?: string | null;
  quotedPrice?: number | null;
  order: { code: string; productName: string; quantity: number; unit: string };
  events: { id: string; status: string; note: string | null; createdAt: string }[];
};

export function LogisticsPage() {
  const q = useQuery({ queryKey: ["ships"], queryFn: () => api.get<Shipment[]>("/shipments") });
  const vehicles = useQuery({ queryKey: ["vehicles"], queryFn: () => api.get<{ id: string; plate: string; capacityTons: number; type: string; owner: { name: string } }[]>("/shipments/vehicles") });
  return (
    <div>
      <PageHeader title="Agri Logistics" subtitle="Cargas, frota e tracking." />
      <Card className="mb-4">
        <h2 className="font-display text-xl">Frota disponível</h2>
        <ul className="mt-3 grid gap-2 md:grid-cols-2">
          {vehicles.data?.map((v) => (
            <li key={v.id} className="rounded-xl bg-cream-100 p-3 text-sm">{v.owner.name} · {v.type} · {v.capacityTons}t · {v.plate}</li>
          ))}
        </ul>
      </Card>
      {q.isLoading ? <Spinner /> : !q.data?.length ? <EmptyState title="Sem envios" hint="Solicite transporte a partir de um pedido." /> : (
        <div className="space-y-3">
          {q.data.map((s) => (
            <Link key={s.id} to={`/app/logistica/${s.id}`}>
              <Card className="flex items-center justify-between">
                <p className="font-semibold">{s.order.code} · {s.order.productName}</p>
                <Badge>{LABELS[s.status] ?? s.status}</Badge>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function ShipmentDetailPage() {
  const { id } = useParams();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["ship", id], queryFn: () => api.get<Shipment>(`/shipments/${id}`) });
  if (q.isLoading || !q.data) return <Spinner />;
  const s = q.data;
  const idx = FLOW.indexOf(s.status);

  async function accept() {
    await api.post(`/shipments/${id}/accept`, {});
    toast.success("Carga aceite");
    void qc.invalidateQueries({ queryKey: ["ship", id] });
  }
  async function advance() {
    await api.post(`/shipments/${id}/advance`);
    toast.success("Estado actualizado");
    void qc.invalidateQueries({ queryKey: ["ship", id] });
  }

  return (
    <div>
      <PageHeader title={`Envio ${s.order.code}`} subtitle={`${s.order.quantity} ${s.order.unit} de ${s.order.productName}`} />
      <Card>
        <ol className="space-y-3">
          {FLOW.map((st, i) => (
            <li key={st} className={`flex items-center gap-3 rounded-xl p-3 ${i <= idx ? "bg-forest-100" : "bg-cream-100"}`}>
              <span className="font-mono text-xs">{i + 1}</span>
              <span className="font-semibold">{LABELS[st]}</span>
            </li>
          ))}
        </ol>
        <div className="mt-4 flex gap-2">
          {s.status === "REQUESTED" && <Button onClick={() => void accept()}>Aceitar como transportador</Button>}
          {s.status !== "DELIVERED" && s.status !== "CANCELLED" && <Button variant="gold" onClick={() => void advance()}>Avançar estado</Button>}
        </div>
      </Card>
    </div>
  );
}
