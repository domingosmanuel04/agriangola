import { useQuery } from "@tanstack/react-query";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "../../lib/api";
import { Card, PageHeader, Spinner } from "../../components/ui";
import { kz } from "../../lib/utils";

type Summary = {
  product: { name: string };
  province: string;
  current: number;
  average: number;
  change: number;
  insight: string;
  series: { t: string; price: number }[];
};

export function PricesPage() {
  const q = useQuery({ queryKey: ["prices"], queryFn: () => api.get<Summary[]>("/prices") });
  const intel = useQuery({
    queryKey: ["intel"],
    queryFn: () => api.get<{ topDemand: { name: string; qty: number }[]; gmv: number; openDemands: number; activeListings: number }>("/prices/intelligence"),
  });
  if (q.isLoading) return <Spinner />;
  const milho = q.data?.filter((s) => s.product.name === "Milho").slice(0, 1)[0];
  return (
    <div>
      <PageHeader title="AgriPrice & Market Intelligence" subtitle="Preços, tendências e oportunidades. Previsões são estimativas." />
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <Card><p className="text-xs">GMV demo</p><p className="font-display text-2xl">{kz(intel.data?.gmv ?? 0)}</p></Card>
        <Card><p className="text-xs">Ofertas activas</p><p className="font-display text-2xl">{intel.data?.activeListings ?? "—"}</p></Card>
        <Card><p className="text-xs">Procuras abertas</p><p className="font-display text-2xl">{intel.data?.openDemands ?? "—"}</p></Card>
      </div>
      {milho && (
        <Card className="mb-4 h-72">
          <p className="mb-2 font-semibold">Milho · {milho.province}</p>
          <ResponsiveContainer width="100%" height="90%">
            <LineChart data={milho.series.map((s) => ({ ...s, t: s.t.slice(5, 10) }))}>
              <XAxis dataKey="t" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="price" stroke="#2d6a4f" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}
      <div className="grid gap-3 md:grid-cols-2">
        {q.data?.slice(0, 12).map((s) => (
          <Card key={`${s.product.name}-${s.province}`}>
            <p className="font-semibold">{s.product.name} · {s.province}</p>
            <p className="text-2xl">{s.current} Kz/kg</p>
            <p className="text-xs text-forest-700/60">média {s.average} · variação {(s.change * 100).toFixed(1)}%</p>
            <p className="mt-2 text-sm">{s.insight}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
