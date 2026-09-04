import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { Badge, Button, Card, Input, PageHeader, Spinner } from "../../components/ui";
import { kz } from "../../lib/utils";
import { useState } from "react";
import { toast } from "sonner";

type Overview = {
  kpis: { users: number; listings: number; demands: number; orders: number; disputes: number; gmv: number };
  byIntent: { intent: string; _count: number }[];
  recentOrders: { id: string; code: string; productName: string; totalAmount: number; buyer: { name: string }; seller: { name: string } }[];
};

type AdminUser = {
  id: string;
  email: string;
  name: string;
  intent: string;
  province: string | null;
  trustScore: number;
  identityVerified: boolean;
  isBlocked: boolean;
};

export function AdminPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const ov = useQuery({ queryKey: ["admin-ov"], queryFn: () => api.get<Overview>("/admin/overview") });
  const users = useQuery({ queryKey: ["admin-users", q], queryFn: () => api.get<AdminUser[]>(`/admin/users?q=${encodeURIComponent(q)}`) });
  const audit = useQuery({ queryKey: ["audit"], queryFn: () => api.get<{ id: string; action: string; entity: string; createdAt: string }[]>("/admin/audit") });

  if (ov.isLoading) return <Spinner />;
  if (ov.error) return <p>Acesso restrito à administração.</p>;

  async function verify(id: string, verified: boolean) {
    await api.patch(`/admin/users/${id}/verify`, { verified });
    toast.success("Actualizado");
    void qc.invalidateQueries({ queryKey: ["admin-users"] });
  }
  async function block(id: string, blocked: boolean) {
    await api.patch(`/admin/users/${id}/block`, { blocked });
    toast.success(blocked ? "Conta bloqueada" : "Conta desbloqueada");
    void qc.invalidateQueries({ queryKey: ["admin-users"] });
  }

  return (
    <div>
      <PageHeader title="Control Tower" subtitle="KPIs nacionais, utilizadores, moderação e auditoria." />
      <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
        {ov.data && Object.entries(ov.data.kpis).map(([k, v]) => (
          <Card key={k}>
            <p className="text-xs uppercase">{k}</p>
            <p className="font-display text-xl">{k === "gmv" ? kz(Number(v)) : String(v)}</p>
          </Card>
        ))}
      </div>
      <Card className="mt-4">
        <h2 className="font-display text-xl">Utilizadores</h2>
        <Input className="mt-2 max-w-sm" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Pesquisar" />
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead><tr className="text-forest-700/60"><th>Nome</th><th>Perfil</th><th>Trust</th><th></th></tr></thead>
            <tbody>
              {users.data?.map((u) => (
                <tr key={u.id} className="border-t border-forest-800/10">
                  <td className="py-2">{u.name}<div className="text-xs opacity-60">{u.email}</div></td>
                  <td>{u.intent}</td>
                  <td>{u.trustScore} {u.identityVerified && <Badge>ID</Badge>}</td>
                  <td className="space-x-2">
                    <Button variant="outline" onClick={() => void verify(u.id, !u.identityVerified)}>Verificar</Button>
                    <Button variant="danger" onClick={() => void block(u.id, !u.isBlocked)}>{u.isBlocked ? "Desbloquear" : "Bloquear"}</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card className="mt-4">
        <h2 className="font-display text-xl">Auditoria</h2>
        <ul className="mt-3 max-h-64 space-y-1 overflow-auto text-xs">
          {audit.data?.map((a) => (
            <li key={a.id}>{new Date(a.createdAt).toLocaleString("pt-AO")} · {a.action} · {a.entity}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
