import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Cloud,
  Handshake,
  Plus,
  Search,
  ShoppingBag,
  Sprout,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { api } from "../../lib/api";
import { Badge, Button, Card, PageHeader, Spinner } from "../../components/ui";
import { kz } from "../../lib/utils";

type Dash = {
  user: {
    name: string;
    intent: string;
    province: string | null;
    trustScore: number;
    agriScore: number;
  };
  kpis: {
    sold: number;
    soldCount: number;
    bought: number;
    boughtCount: number;
    openNegotiations: number;
    trustScore: number;
  };
  listings: {
    id: string;
    title: string;
    availableQty: number;
    unit: string;
    pricePerUnit: number;
    province: string;
    product: { name: string };
  }[];
  demands: {
    id: string;
    title: string;
    quantity: number;
    unit: string;
    province: string;
  }[];
  orders: {
    id: string;
    code: string;
    productName: string;
    status: string;
    totalAmount: number;
  }[];
  notifications: {
    id: string;
    title: string;
    body: string;
    priority: string;
  }[];
  weather: {
    province: string;
    temperature: number;
    condition: string;
    rainMm: number;
    alert?: string;
  } | null;
  feed: string[];
};

export function DashboardPage() {
  const q = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.get<Dash>("/dashboard"),
  });
  if (q.isLoading)
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  if (q.error || !q.data) return <p>Não foi possível carregar o painel.</p>;
  const d = q.data;
  const isProducer = ["PRODUCER", "COOPERATIVE"].includes(d.user.intent);
  const isBuyer = ["BUYER", "COMPANY", "EXPORTER", "CONSUMER"].includes(
    d.user.intent,
  );
  const roleLabel = isProducer
    ? "Área do produtor"
    : isBuyer
      ? "Área do comprador"
      : "Área de operação";
  return (
    <div>
      <PageHeader
        title={`Olá, ${d.user.name.split(" ")[0]}`}
        subtitle={`${roleLabel}. Aqui está o resumo da sua operação e das oportunidades mais recentes.`}
        actions={
          <div className="flex flex-wrap gap-2">
            {isProducer ? (
              <Link to="/app/marketplace/nova">
                <Button>
                  <Plus className="h-4 w-4" /> Publicar oferta
                </Button>
              </Link>
            ) : (
              <Link to="/app/marketplace">
                <Button>
                  <Search className="h-4 w-4" /> Explorar produtos
                </Button>
              </Link>
            )}
            <Link to={isProducer ? "/app/procuras" : "/app/procuras/nova"}>
              <Button variant="outline">
                {isProducer ? "Ver procura" : "Criar procura"}
              </Button>
            </Link>
          </div>
        }
      />
      <Card className="mb-5 overflow-hidden border-primary-800/10 bg-primary-100/45 p-0">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-start gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-800 text-white">
              {isProducer ? (
                <Sprout className="h-5 w-5" />
              ) : isBuyer ? (
                <ShoppingBag className="h-5 w-5" />
              ) : (
                <TrendingUp className="h-5 w-5" />
              )}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-800">
                {roleLabel}
              </p>
              <h2 className="mt-1 font-display text-xl font-extrabold text-ink">
                {isProducer
                  ? "Faça a sua produção encontrar mercado."
                  : isBuyer
                    ? "Encontre fornecedores para a próxima operação."
                    : "Acompanhe o seu negócio agrícola."}
              </h2>
              <p className="mt-1 text-sm text-muted">
                {isProducer
                  ? "Publique uma oferta e receba oportunidades de compradores na sua região."
                  : isBuyer
                    ? "Compare ofertas verificadas e envie pedidos de cotação."
                    : "Use os dados da plataforma para decidir o próximo passo."}
              </p>
            </div>
          </div>
          <Link
            to={isProducer ? "/app/marketplace/nova" : "/app/marketplace"}
            className="inline-flex items-center text-sm font-bold text-primary-800"
          >
            {isProducer ? "Publicar agora" : "Explorar agora"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Kpi
          icon={Wallet}
          label={isProducer ? "Volume vendido" : "Volume comprado"}
          value={kz(isProducer ? d.kpis.sold : d.kpis.bought)}
          hint={`${isProducer ? d.kpis.soldCount : d.kpis.boughtCount} pedidos`}
          accent="green"
        />
        <Kpi
          icon={Handshake}
          label="Negociações abertas"
          value={String(d.kpis.openNegotiations)}
          hint="A acompanhar"
          accent="gold"
        />
        <Kpi
          icon={TrendingUp}
          label="AgriTrust"
          value={`${d.kpis.trustScore}`}
          hint={`AgriScore ${d.user.agriScore} (não é garantia de crédito)`}
          accent="blue"
        />
        <Kpi
          icon={Cloud}
          label="Clima"
          value={d.weather ? `${d.weather.temperature}°C` : "—"}
          hint={d.weather?.alert ?? d.weather?.condition}
        />
      </div>
      {d.feed.length > 0 && (
        <Card className="mt-4 bg-forest-900 text-cream-50">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs font-bold uppercase tracking-widest text-primary-500">
              Recomendado para si
            </p>
            <Link
              to="/app/oportunidades"
              className="text-xs font-bold text-white/70 hover:text-white"
            >
              Ver oportunidades <ArrowRight className="ml-1 inline h-3 w-3" />
            </Link>
          </div>
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
            <Link
              to="/app/marketplace"
              className="text-sm font-semibold text-gold-600"
            >
              Ver tudo
            </Link>
          </div>
          <ul className="space-y-3">
            {d.listings.map((l) => (
              <li
                key={l.id}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <Link
                  to={`/app/marketplace/${l.id}`}
                  className="font-semibold hover:text-gold-600"
                >
                  {l.product.name} · {l.province}
                </Link>
                <span className="text-forest-700/70">
                  {l.availableQty}
                  {l.unit} · {kz(l.pricePerUnit)}
                </span>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-xl">Quero comprar</h2>
            <Link
              to="/app/procuras"
              className="text-sm font-semibold text-gold-600"
            >
              Ver procuras
            </Link>
          </div>
          <ul className="space-y-3">
            {d.demands.map((x) => (
              <li key={x.id}>
                <Link
                  to={`/app/procuras/${x.id}`}
                  className="text-sm font-semibold hover:text-gold-600"
                >
                  {x.title}
                </Link>
              </li>
            ))}
            {d.demands.length === 0 && (
              <p className="text-sm text-forest-700/60">
                Sem procuras na sua região.
              </p>
            )}
          </ul>
        </Card>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-display text-xl">Pedidos</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {d.orders.map((o) => (
              <li key={o.id} className="flex justify-between">
                <Link to={`/app/pedidos/${o.id}`} className="font-semibold">
                  {o.code}
                </Link>
                <Badge>{o.status}</Badge>
              </li>
            ))}
            {d.orders.length === 0 && (
              <p className="text-sm text-forest-700/60">Ainda sem pedidos.</p>
            )}
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

function Kpi({
  icon: Icon,
  label,
  value,
  hint,
  accent = "green",
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  hint?: string;
  accent?: "green" | "gold" | "blue";
}) {
  const accents = {
    green: "bg-primary-100 text-primary-800",
    gold: "bg-gold-200 text-gold-600",
    blue: "bg-blue-50 text-blue-700",
  };
  return (
    <Card className="relative overflow-hidden p-5">
      <div
        className={`grid h-9 w-9 place-items-center rounded-lg ${accents[accent]}`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-4 text-xs font-bold uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl font-extrabold text-ink">
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </Card>
  );
}
