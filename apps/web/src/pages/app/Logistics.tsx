import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  PageHeader,
  Select,
  Spinner,
} from "../../components/ui";
import { useAuth } from "../../store/auth";
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
  transporterId?: string | null;
  vehicle?: {
    id: string;
    plate: string;
    type: string;
    capacityTons: number;
  } | null;
  order: {
    code: string;
    productName: string;
    quantity: number;
    unit: string;
    buyer?: { name: string };
    seller?: { name: string };
  };
  events: {
    id: string;
    status: string;
    note: string | null;
    createdAt: string;
  }[];
};

export function LogisticsPage() {
  const q = useQuery({
    queryKey: ["ships"],
    queryFn: () => api.get<Shipment[]>("/shipments"),
  });
  const vehicles = useQuery({
    queryKey: ["vehicles"],
    queryFn: () =>
      api.get<
        {
          id: string;
          plate: string;
          capacityTons: number;
          type: string;
          owner: { name: string };
        }[]
      >("/shipments/vehicles"),
  });
  return (
    <div>
      <PageHeader title="Agri Logistics" subtitle="Cargas, frota e tracking." />
      <Card className="mb-4">
        <h2 className="font-display text-xl">Frota disponível</h2>
        <ul className="mt-3 grid gap-2 md:grid-cols-2">
          {vehicles.data?.map((v) => (
            <li key={v.id} className="rounded-xl bg-cream-100 p-3 text-sm">
              {v.owner.name} · {v.type} · {v.capacityTons}t · {v.plate}
            </li>
          ))}
        </ul>
      </Card>
      {q.isLoading ? (
        <Spinner />
      ) : !q.data?.length ? (
        <EmptyState
          title="Sem envios"
          hint="Solicite transporte a partir de um pedido."
        />
      ) : (
        <div className="space-y-3">
          {q.data.map((s) => (
            <Link key={s.id} to={`/app/logistica/${s.id}`}>
              <Card className="flex items-center justify-between">
                <p className="font-semibold">
                  {s.order.code} · {s.order.productName}
                </p>
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
  const { user } = useAuth();
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["ship", id],
    queryFn: () => api.get<Shipment>(`/shipments/${id}`),
  });
  const vehicles = useQuery({
    queryKey: ["vehicles", user?.id],
    queryFn: () =>
      api.get<
        {
          id: string;
          plate: string;
          capacityTons: number;
          type: string;
          owner: { name: string };
        }[]
      >("/shipments/vehicles"),
    enabled: user?.intent === "TRANSPORTER",
  });
  const [vehicleId, setVehicleId] = useState("");
  if (q.isLoading || !q.data) return <Spinner />;
  const s = q.data;
  const idx = FLOW.indexOf(s.status);

  async function accept() {
    try {
      await api.post(`/shipments/${id}/accept`, {
        vehicleId: vehicleId || undefined,
      });
      toast.success("Carga aceite");
      void qc.invalidateQueries({ queryKey: ["ship", id] });
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Não foi possível aceitar a carga",
      );
    }
  }
  async function advance() {
    try {
      await api.post(`/shipments/${id}/advance`);
      toast.success("Estado atualizado");
      void qc.invalidateQueries({ queryKey: ["ship", id] });
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Não foi possível avançar o estado",
      );
    }
  }

  return (
    <div>
      <PageHeader
        title={`Envio ${s.order.code}`}
        subtitle={`${s.order.quantity} ${s.order.unit} de ${s.order.productName}`}
      />
      <Card>
        <div className="mb-5 grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted">Origem</p>
            <p className="font-semibold">{s.pickupAddress ?? "A definir"}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Destino</p>
            <p className="font-semibold">{s.dropoffAddress ?? "A definir"}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Custo estimado</p>
            <p className="font-semibold">
              {s.quotedPrice
                ? `${s.quotedPrice.toLocaleString("pt-AO")} Kz`
                : "A negociar"}
            </p>
          </div>
        </div>
        <ol className="space-y-3">
          {FLOW.map((st, i) => (
            <li
              key={st}
              className={`flex items-center gap-3 rounded-xl p-3 ${i <= idx ? "bg-forest-100" : "bg-cream-100"}`}
            >
              <span className="font-mono text-xs">{i + 1}</span>
              <span className="font-semibold">{LABELS[st]}</span>
            </li>
          ))}
        </ol>
        <div className="mt-4 flex gap-2">
          {s.status === "REQUESTED" && user?.intent === "TRANSPORTER" && (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Select
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                aria-label="Selecionar veículo"
              >
                <option value="">Selecionar veículo</option>
                {vehicles.data?.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.type} · {v.plate} · {v.capacityTons}t
                  </option>
                ))}
              </Select>
              <Button onClick={() => void accept()}>
                Aceitar como transportador
              </Button>
            </div>
          )}
          {s.status !== "DELIVERED" &&
            s.status !== "CANCELLED" &&
            s.status !== "REQUESTED" &&
            (s.transporterId === user?.id ||
              s.order.buyer?.name === user?.name ||
              s.order.seller?.name === user?.name) && (
              <Button variant="gold" onClick={() => void advance()}>
                Avançar estado
              </Button>
            )}
        </div>
      </Card>
    </div>
  );
}
