import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Cloud, Handshake, TrendingUp, Wallet } from "lucide-react";
import { api } from "../../lib/api";
import { Badge, Card, PageHeader, Spinner } from "../../components/ui";
import { kz } from "../../lib/utils";

type Dash = {
  user: { name: string; intent: string; province: string | null; trustScore: number; agriScore: number };
  kpis: { sold: number; soldCount: number; bought: number; boughtCount: number; openNegotiations: number; trustScore: number };
  listings: { id: string; title: string; availableQty: number; unit: string; pricePerUnit: number; province: string; product: { name: string } }[];
  demands: { id: string; title: string; quantity: number; unit: string; province: string }[];
  orders: { id: string; code: string; productName: string; status: string; totalAmount: number }[];
  notifications: { id: string; title: string; body: string; priority: string }[];
  weather: { province: string; temperature: number; condition: string; rainMm: number; alert?: string } | null;
  feed: string[];
};

export function DashboardPage() {
  const q = useQuery({ queryKey: ["dashboard"], queryFn: () => api.get<Dash>("/dashboard") });
  if (q.isLoading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (q.error || !q.data) return <p>Não foi possível carregar o painel.</p>;
  const d = q.data;
  return (
    <div>
      <PageHeader
        title={`Olá, ${d.user.name.split(" ")[0]}`}
        subtitle="Painel personalizado do AgriAngola OS — dados reais da sua conta e do mercado."
      />
      <div className="grid gap-4 md:grid-cols-4">
        <Kpi icon={Wallet} label="Volume vendido" value={kz(d.kpis.sold)} hint={`${d.kpis.soldCount} pedidos`} />
        <Kpi icon={Handshake} label="Negociações abertas" value={String(d.kpis.openNegotiations)} hint="A acompanhar" />
        <Kpi icon={TrendingUp} label="AgriTrust" value={`${d.kpis.trustScore}`} hint={`AgriScore ${d.user.agriScore} (não é garantia de crédito)`} />
        <Kpi icon={Cloud} label="Clima" value={d.weather ? `${d.weather.temperature}°C` : "—"} hint={d.weather?.alert ?? d.weather?.condition} />
      </div>
      {d.feed.length > 0 && (
        <Card className="mt-4 bg-forest-900 text-cream-50">
          <p className="text-xs uppercase tracking-widest text-gold-400">Recomendado para si</p>
          <ul className="mt-3 space-y-2 text-sm">
            {d.feed.map((f) => (
              <li key={f}>• {f}</li>
            ))}
          </ul>
        </Card>
      )}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-xl">Ofertas recentes</h2>
            <Link to="/app/marketplace" className="text-sm font-semibold text-gold-600">Ver tudo</Link>
          </div>
          <ul className="space-y-3">
            {d.listings.map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-3 text-sm">
                <Link to={`/app/marketplace/${l.id}`} className="font-semibold hover:text-gold-600">
                  {l.product.name} · {l.province}
                </Link>
                <span className="text-forest-700/70">{l.availableQty}{l.unit} · {kz(l.pricePerUnit)}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-xl">Quero comprar</h2>
            <Link to="/app/procuras" className="text-sm font-semibold text-gold-600">Ver procuras</Link>
          </div>
          <ul className="space-y-3">
            {d.demands.map((x) => (
              <li key={x.id}>
                <Link to={`/app/procuras/${x.id}`} className="text-sm font-semibold hover:text-gold-600">{x.title}</Link>
              </li>
            ))}
            {d.demands.length === 0 && <p className="text-sm text-forest-700/60">Sem procuras na sua região.</p>}
          </ul>
        </Card>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-display text-xl">Pedidos</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {d.orders.map((o) => (
              <li key={o.id} className="flex justify-between">
                <Link to={`/app/pedidos/${o.id}`} className="font-semibold">{o.code}</Link>
                <Badge>{o.status}</Badge>
              </li>
            ))}
            {d.orders.length === 0 && <p className="text-sm text-forest-700/60">Ainda sem pedidos.</p>}
          </ul>
        </Card>
        <Card>
          <h2 className="font-display text-xl">Alertas</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {d.notifications.map((n) => (
              <li key={n.id}>
                <p className="font-semibold">{n.title}</p>
                <p className="text-forest-700/70">{n.body}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, hint }: { icon: typeof Wallet; label: string; value: string; hint?: string }) {
  return (
    <Card>
      <Icon className="h-4 w-4 text-gold-600" />
      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-forest-700/60">{label}</p>
      <p className="font-display text-2xl">{value}</p>
      {hint ? <p className="mt-1 text-xs text-forest-700/60">{hint}</p> : null}
    </Card>
  );
}
