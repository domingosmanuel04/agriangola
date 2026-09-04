import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  Bot,
  Boxes,
  Command,
  LayoutDashboard,
  LogOut,
  Map,
  Menu,
  Search,
  ShoppingBag,
  Tractor,
  Truck,
  X,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useAuth } from "../store/auth";
import { Button, Input } from "./ui";
import { toast } from "sonner";

const NAV = [
  { to: "/app", label: "Painel", icon: LayoutDashboard, end: true },
  { to: "/app/marketplace", label: "Marketplace", icon: ShoppingBag },
  { to: "/app/procuras", label: "Procura", icon: Search },
  { to: "/app/negociacoes", label: "Negociações", icon: Boxes },
  { to: "/app/pedidos", label: "Pedidos", icon: Boxes },
  { to: "/app/logistica", label: "Logística", icon: Truck },
  { to: "/app/mapa", label: "Mapa", icon: Map },
  { to: "/app/fazenda", label: "Fazenda", icon: Tractor },
  { to: "/app/ai", label: "AgriAI", icon: Bot },
];

export function AppShell() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [cmd, setCmd] = useState("");
  const nav = useNavigate();
  const loc = useLocation();
  const unread = useQuery({
    queryKey: ["unread"],
    queryFn: () => api.get<{ count: number }>("/notifications/unread-count"),
    refetchInterval: 20_000,
  });

  useEffect(() => {
    setOpen(false);
  }, [loc.pathname]);

  async function onCommand(e: FormEvent) {
    e.preventDefault();
    if (!cmd.trim()) return;
    const res = await api.post<{
      answer: string;
      actions: { type: string; payload?: Record<string, unknown> }[];
    }>("/ai/command", { prompt: cmd });
    toast.message("AgriAI", { description: res.answer.slice(0, 180) });
    const a = res.actions[0];
    if (a?.type === "OPEN_LISTING") nav("/app/marketplace/nova");
    else if (a?.type === "OPEN_LOGISTICS") nav("/app/logistica");
    else if (a?.type === "OPEN_SEARCH") nav("/app/procuras");
    else nav("/app/ai");
    setCmd("");
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-[260px] border-r border-white/10 bg-forest-900 text-cream-100 transition lg:static ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <Link to="/app" className="font-display text-xl text-gold-400">
            AgriAngola OS
          </Link>
          <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Fechar menu">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="space-y-1 px-3 pb-8">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${isActive ? "bg-white/10 text-gold-400" : "text-cream-100/80 hover:bg-white/5"}`
              }
            >
              <n.icon className="h-4 w-4" />
              {n.label}
            </NavLink>
          ))}
          <NavLink to="/app/stock" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-cream-100/80 hover:bg-white/5">
            Stock
          </NavLink>
          <NavLink to="/app/armazens" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-cream-100/80 hover:bg-white/5">
            Armazéns
          </NavLink>
          <NavLink to="/app/comunidade" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-cream-100/80 hover:bg-white/5">
            Comunidade
          </NavLink>
          <NavLink to="/app/precos" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-cream-100/80 hover:bg-white/5">
            AgriPrice
          </NavLink>
          <NavLink to="/app/oportunidades" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-cream-100/80 hover:bg-white/5">
            Oportunidades
          </NavLink>
          {(user?.intent === "ADMIN" || user?.intent === "OPERATOR") && (
            <NavLink to="/app/admin" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gold-400">
              Administração
            </NavLink>
          )}
        </nav>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-forest-800/10 bg-cream-50/80 px-4 backdrop-blur-md">
          <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Abrir menu">
            <Menu className="h-5 w-5" />
          </button>
          <form onSubmit={onCommand} className="flex min-w-0 flex-1 items-center gap-2">
            <Command className="h-4 w-4 shrink-0 text-forest-600" />
            <Input
              value={cmd}
              onChange={(e) => setCmd(e.target.value)}
              placeholder="O que deseja fazer? Ex.: Quero vender 50 toneladas de milho em Luanda"
              className="border-0 bg-transparent shadow-none focus:ring-0"
              aria-label="Comando universal"
            />
          </form>
          <Link to="/app/notificacoes" className="relative rounded-xl p-2 hover:bg-forest-100" aria-label="Notificações">
            <Bell className="h-5 w-5" />
            {(unread.data?.count ?? 0) > 0 && (
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-earth-500" />
            )}
          </Link>
          <div className="hidden items-center gap-2 sm:flex">
            <Link to={`/app/perfil/${user?.id}`} className="text-sm font-semibold">
              {user?.name}
            </Link>
            <Button variant="ghost" onClick={() => { logout(); nav("/"); }}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function PublicHeader() {
  const items = useMemo(
    () => [
      { to: "/marketplace", label: "Encontrar produtos" },
      { to: "/procuras", label: "Encontrar compradores" },
      { to: "/entrar", label: "Entrar" },
    ],
    [],
  );
  return (
    <header className="flex items-center justify-between px-6 py-5">
      <Link to="/" className="font-display text-2xl text-forest-900">
        AgriAngola <span className="text-gold-500">OS</span>
      </Link>
      <nav className="flex items-center gap-4 text-sm font-semibold">
        {items.map((i) => (
          <Link key={i.to} to={i.to} className="text-forest-800 hover:text-gold-600">
            {i.label}
          </Link>
        ))}
        <Link to="/comecar">
          <Button variant="gold">Começar agora</Button>
        </Link>
      </nav>
    </header>
  );
}
