import { FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { Badge, Button, Card, EmptyState, Input, PageHeader, Select, Spinner, Textarea } from "../../components/ui";
import { toast } from "sonner";

export function NotificationsPage() {
  const q = useQuery({ queryKey: ["notifs"], queryFn: () => api.get<{ id: string; title: string; body: string; priority: string; read: boolean; createdAt: string }[]>("/notifications") });
  const qc = useQueryClient();
  return (
    <div>
      <PageHeader title="Notificações" subtitle="Prioridade: urgente, importante, oportunidade, informativo." actions={<Button variant="outline" onClick={async () => { await api.post("/notifications/read-all"); void qc.invalidateQueries({ queryKey: ["notifs"] }); }}>Marcar lidas</Button>} />
      {q.isLoading ? <Spinner /> : !q.data?.length ? <EmptyState title="Caixa limpa" hint="Os alertas inteligentes aparecem aqui." /> : (
        <ul className="space-y-2">
          {q.data.map((n) => (
            <li key={n.id}><Card className={n.read ? "opacity-70" : ""}><Badge>{n.priority}</Badge><p className="font-semibold">{n.title}</p><p className="text-sm">{n.body}</p></Card></li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function OpportunitiesPage() {
  const q = useQuery({ queryKey: ["opps"], queryFn: () => api.get<{ id: string; kind: string; title: string; body: string }[]>("/opportunities") });
  const courses = useQuery({ queryKey: ["courses"], queryFn: () => api.get<{ id: string; title: string; description: string }[]>("/opportunities/academy") });
  const machines = useQuery({ queryKey: ["machines"], queryFn: () => api.get<{ id: string; name: string; province: string; pricePerDay: number }[]>("/opportunities/machines") });
  return (
    <div>
      <PageHeader title="Oportunidades" subtitle="Compradores, programas, financiamento, formação e máquinas." />
      <div className="grid gap-3 md:grid-cols-2">
        {q.data?.map((o) => (
          <Card key={o.id}><Badge>{o.kind}</Badge><h3 className="mt-2 font-display text-xl">{o.title}</h3><p className="text-sm">{o.body}</p></Card>
        ))}
      </div>
      <h2 className="mt-8 font-display text-2xl">Agri Academy</h2>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {courses.data?.map((c) => <Card key={c.id}><h3 className="font-semibold">{c.title}</h3><p className="text-sm">{c.description}</p></Card>)}
      </div>
      <h2 className="mt-8 font-display text-2xl">AgriMachines</h2>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {machines.data?.map((m) => <Card key={m.id}>{m.name} · {m.province} · {m.pricePerDay} Kz/dia</Card>)}
      </div>
    </div>
  );
}

export function InventoryPage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["inv"], queryFn: () => api.get<{ id: string; name: string; quantity: number; unit: string; alerts: string[] }[]>("/inventory") });
  const mut = useMutation({
    mutationFn: (body: unknown) => api.post("/inventory", body),
    onSuccess: () => { toast.success("Item adicionado"); void qc.invalidateQueries({ queryKey: ["inv"] }); },
  });
  return (
    <div>
      <PageHeader title="Stock" subtitle="Sementes, fertilizantes, colheita e alertas." />
      <Card className="mb-4">
        <form className="grid gap-2 md:grid-cols-4" onSubmit={(e: FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          mut.mutate({ name: fd.get("name"), kind: fd.get("kind"), quantity: Number(fd.get("quantity")), unit: fd.get("unit") });
        }}>
          <Input name="name" placeholder="Nome" required />
          <Select name="kind"><option>SEED</option><option>FERTILIZER</option><option>HARVEST</option><option>TOOL</option></Select>
          <Input name="quantity" type="number" required />
          <Input name="unit" defaultValue="kg" />
          <Button type="submit">Adicionar</Button>
        </form>
      </Card>
      {q.data?.map((i) => (
        <Card key={i.id} className="mb-2">
          <p className="font-semibold">{i.name} · {i.quantity} {i.unit}</p>
          {i.alerts.map((a) => <p key={a} className="text-sm text-earth-700">{a}</p>)}
        </Card>
      ))}
    </div>
  );
}

export function CommunityPage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["comm"], queryFn: () => api.get<{ id: string; title: string; body: string; category: string; author: { name: string } }[]>("/community") });
  const mut = useMutation({
    mutationFn: (body: unknown) => api.post("/community", body),
    onSuccess: () => { toast.success("Publicado"); void qc.invalidateQueries({ queryKey: ["comm"] }); },
  });
  return (
    <div>
      <PageHeader title="AgriCommunity" subtitle="Rede profissional agrícola." />
      <Card className="mb-4">
        <form onSubmit={(e: FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          mut.mutate({ category: fd.get("category"), title: fd.get("title"), body: fd.get("body") });
        }} className="space-y-2">
          <Select name="category"><option>Agricultura</option><option>Milho</option><option>Café</option><option>Negócios</option></Select>
          <Input name="title" required placeholder="Título" />
          <Textarea name="body" required />
          <Button type="submit">Publicar</Button>
        </form>
      </Card>
      {q.data?.map((p) => (
        <Card key={p.id} className="mb-2"><Badge>{p.category}</Badge><h3 className="font-display text-xl">{p.title}</h3><p className="text-sm">{p.body}</p><p className="text-xs opacity-60">{p.author.name}</p></Card>
      ))}
    </div>
  );
}

export function WarehousesPage() {
  const q = useQuery({ queryKey: ["wh"], queryFn: () => api.get<{ id: string; name: string; type: string; province: string; availableTons: number; capacityTons: number; pricePerTonDay: number | null }[]>("/warehouses") });
  return (
    <div>
      <PageHeader title="AgriStorage" subtitle="Silos, câmaras e centros de distribuição." />
      <div className="grid gap-3 md:grid-cols-2">
        {q.data?.map((w) => (
          <Card key={w.id}>
            <h3 className="font-display text-xl">{w.name}</h3>
            <p>{w.type} · {w.province}</p>
            <p className="text-sm">{w.availableTons}/{w.capacityTons} t disponíveis · {w.pricePerTonDay ?? "—"} Kz/t/dia</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function ProfilePage() {
  const { id } = useParams();
  const q = useQuery({
    queryKey: ["profile", id],
    queryFn: () => api.get<{
      name: string; bio: string | null; intent: string; province: string | null; trustScore: number; agriScore: number;
      identityVerified: boolean; badges: { badge: string }[];
      listings: { id: string; title: string; availableQty: number; unit: string }[];
      stats: { completed: number; reviewAvg: number; fulfillmentRate: number; trustScore: number };
    }>(`/users/${id}`),
  });
  if (q.isLoading) return <Spinner />;
  if (!q.data) return <p>Perfil não encontrado.</p>;
  const u = q.data;
  return (
    <div>
      <PageHeader title={u.name} subtitle={`${u.intent} · ${u.province ?? ""}`} />
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <p>{u.bio}</p>
          <p className="mt-3 text-sm">AgriTrust {u.trustScore} · AgriScore {u.agriScore} (indicador interno, não garante crédito)</p>
          <div className="mt-2 flex flex-wrap gap-2">{u.badges.map((b) => <Badge key={b.badge} tone="gold">{b.badge}</Badge>)}</div>
        </Card>
        <Card>
          <p>Pedidos concluídos: {u.stats.completed}</p>
          <p>Cumprimento: {Math.round(u.stats.fulfillmentRate * 100)}%</p>
          <p>Avaliação: {u.stats.reviewAvg.toFixed(1)}</p>
        </Card>
      </div>
      <h2 className="mt-6 font-display text-2xl">Catálogo</h2>
      <ul className="mt-3 space-y-2">
        {u.listings.map((l) => (
          <li key={l.id}><Link className="font-semibold" to={`/app/marketplace/${l.id}`}>{l.title} · {l.availableQty}{l.unit}</Link></li>
        ))}
      </ul>
    </div>
  );
}

export function SearchPage() {
  const qParam = new URLSearchParams(window.location.search).get("q") ?? "";
  const q = useQuery({
    queryKey: ["search", qParam],
    queryFn: () => api.get<{ listings: { id: string; title: string }[]; users: { id: string; name: string }[]; demands: { id: string; title: string }[] }>(`/search?q=${encodeURIComponent(qParam)}`),
    enabled: qParam.length >= 2,
  });
  return (
    <div>
      <PageHeader title="Pesquisa global" subtitle={qParam || "Utilize a barra de comando ou ?q="} />
      {q.data && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card><h3>Ofertas</h3>{q.data.listings.map((l) => <p key={l.id}><Link to={`/app/marketplace/${l.id}`}>{l.title}</Link></p>)}</Card>
          <Card><h3>Pessoas</h3>{q.data.users.map((u) => <p key={u.id}><Link to={`/app/perfil/${u.id}`}>{u.name}</Link></p>)}</Card>
          <Card><h3>Procuras</h3>{q.data.demands.map((d) => <p key={d.id}><Link to={`/app/procuras/${d.id}`}>{d.title}</Link></p>)}</Card>
        </div>
      )}
    </div>
  );
}

export function PublicCatalogPage({ kind }: { kind: "listings" | "demands" }) {
  const q = useQuery({
    queryKey: ["pub", kind],
    queryFn: () => kind === "listings"
      ? api.get<{ items: { id: string; title: string; province: string; pricePerUnit: number; product: { name: string } }[] }>("/listings")
      : api.get<{ items: { id: string; title: string }[] }>("/demands"),
  });
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link to="/" className="font-display text-xl">AgriAngola OS</Link>
      <h1 className="mt-6 font-display text-4xl">{kind === "listings" ? "Encontrar produtos" : "Encontrar compradores"}</h1>
      <div className="mt-6 space-y-3">
        {kind === "listings"
          ? (q.data as { items: { id: string; title: string; province: string; pricePerUnit: number; product: { name: string } }[] } | undefined)?.items.map((l) => (
            <Card key={l.id}><p className="font-semibold">{l.product.name} · {l.province}</p><p className="text-sm">{l.pricePerUnit} Kz</p><Link to="/entrar" className="text-sm text-gold-600">Entrar para negociar</Link></Card>
          ))
          : (q.data as { items: { id: string; title: string }[] } | undefined)?.items.map((d) => (
            <Card key={d.id}>{d.title}</Card>
          ))}
      </div>
    </div>
  );
}
