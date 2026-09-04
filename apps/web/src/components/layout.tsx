import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  ArrowRight,
  Bell,
  Bot,
  Boxes,
  Building2,
  Command,
  Container,
  LayoutDashboard,
  LogIn,
  LogOut,
  Map,
  Menu,
  MoreHorizontal,
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
  { to: "/app", label: "Visão geral", icon: LayoutDashboard, end: true },
  { to: "/app/marketplace", label: "Marketplace", icon: ShoppingBag },
  { to: "/app/procuras", label: "Procura de mercado", icon: Search },
  { to: "/app/negociacoes", label: "Negociações", icon: Boxes },
  { to: "/app/pedidos", label: "Pedidos", icon: Container },
  { to: "/app/logistica", label: "Logística", icon: Truck },
  { to: "/app/mapa", label: "Mapa de Angola", icon: Map },
  { to: "/app/fazenda", label: "Minha fazenda", icon: Tractor },
  { to: "/app/ai", label: "AgriAI", icon: Bot },
];

const SECONDARY_NAV = [
  { to: "/app/stock", label: "Stock", icon: Boxes },
  { to: "/app/armazens", label: "Armazéns", icon: Building2 },
  { to: "/app/comunidade", label: "Comunidade", icon: MoreHorizontal },
  { to: "/app/precos", label: "AgriPrice", icon: TrendingUpIcon },
  { to: "/app/oportunidades", label: "Oportunidades", icon: SparkleIcon },
];

function TrendingUpIcon(props: { className?: string }) {
  return <span className={props.className}>↗</span>;
}

function SparkleIcon(props: { className?: string }) {
  return <span className={props.className}>✦</span>;
}

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
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[272px_1fr]">
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[272px] flex-col border-r border-white/10 green-gradient-deep text-white shadow-lift transition-transform lg:static lg:shadow-none ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="flex h-[76px] items-center justify-between border-b border-white/10 px-5">
          <Link
            to="/app"
            className="flex items-center gap-2 font-display text-lg font-extrabold tracking-tight"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-500 text-sm text-primary-950">
              A
            </span>
            Agri<span className="text-primary-500">Angola</span>
          </Link>
          <button
            className="lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-5 pb-3 pt-6 text-[10px] font-bold uppercase tracking-[0.18em] text-primary-100/45">
          Operação
        </div>
        <nav className="space-y-1 px-3">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive ? "bg-primary-500 text-primary-950 shadow-soft" : "text-primary-100/75 hover:bg-white/10 hover:text-white"}`
              }
            >
              <n.icon className="h-4 w-4" />
              {n.label}
            </NavLink>
          ))}
          <div className="my-5 border-t border-white/10 pt-5">
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-primary-100/45">
              Recursos
            </p>
            {SECONDARY_NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive ? "bg-white/10 text-primary-500" : "text-primary-100/65 hover:bg-white/10 hover:text-white"}`
                }
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </NavLink>
            ))}
          </div>
          {(user?.intent === "ADMIN" || user?.intent === "OPERATOR") && (
            <NavLink
              to="/app/admin"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gold-400 hover:bg-white/10"
            >
              <Building2 className="h-4 w-4" />
              Administração
            </NavLink>
          )}
        </nav>
        <div className="mt-auto m-3 rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-xs font-semibold text-white">Precisa de ajuda?</p>
          <p className="mt-1 text-xs leading-5 text-primary-100/55">
            Fale com o AgriAI para encontrar o próximo passo.
          </p>
          <Link
            to="/app/ai"
            className="mt-3 inline-flex text-xs font-bold text-primary-500"
          >
            Abrir AgriAI <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-[76px] items-center gap-3 border-b border-line bg-white/90 px-4 backdrop-blur-xl sm:px-6">
          <button
            className="lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <form
            onSubmit={onCommand}
            className="flex min-w-0 flex-1 items-center gap-2"
          >
            <Command className="h-4 w-4 shrink-0 text-primary-800" />
            <Input
              value={cmd}
              onChange={(e) => setCmd(e.target.value)}
              placeholder="Pergunte ao AgriAI ou procure uma operação..."
              className="h-10 border-0 bg-canvas shadow-none focus:ring-0"
              aria-label="Comando universal"
            />
          </form>
          <Link
            to="/app/notificacoes"
            className="relative rounded-lg p-2 text-muted hover:bg-primary-100 hover:text-primary-800"
            aria-label="Notificações"
          >
            <Bell className="h-5 w-5" />
            {(unread.data?.count ?? 0) > 0 && (
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-gold-500" />
            )}
          </Link>
          <div className="hidden items-center gap-3 border-l border-line pl-3 sm:flex">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-primary-100 text-sm font-bold text-primary-800">
              {user?.name?.slice(0, 1).toUpperCase()}
            </span>
            <div className="hidden lg:block">
              <p className="text-xs text-muted">Sessão ativa</p>
              <Link
                to={`/app/perfil/${user?.id}`}
                className="text-sm font-bold text-ink hover:text-primary-800"
              >
                {user?.name}
              </Link>
            </div>
            <Button
              variant="ghost"
              onClick={() => {
                logout();
                nav("/");
              }}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>
        <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function PublicHeader() {
  const [open, setOpen] = useState(false);
  const items = useMemo(
    () => [
      { to: "/marketplace", label: "Explorar", route: true },
      { to: "#como-funciona", label: "Como funciona", route: false },
      { to: "#produtores", label: "Para produtores", route: false },
      { to: "#compradores", label: "Para compradores", route: false },
      { to: "#mercado", label: "Mercado", route: false },
    ],
    [],
  );
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line/80 bg-canvas/90 px-4 backdrop-blur-xl sm:px-6">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 font-display text-xl font-extrabold tracking-tight text-ink"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-800 text-sm text-white shadow-soft">
            A
          </span>
          Agri<span className="text-primary-800">Angola</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-semibold text-muted lg:flex">
          {items.map((i) =>
            i.route ? (
              <Link
                key={i.to}
                to={i.to}
                className="transition hover:text-primary-800"
              >
                {i.label}
              </Link>
            ) : (
              <a
                key={i.to}
                href={i.to}
                className="transition hover:text-primary-800"
              >
                {i.label}
              </a>
            ),
          )}
        </nav>
        <div className="hidden items-center gap-3 sm:flex">
          <Link
            to="/entrar"
            className="inline-flex items-center gap-2 px-2 text-sm font-semibold text-ink hover:text-primary-800"
          >
            <LogIn className="h-4 w-4" /> Entrar
          </Link>
          <Link to="/comecar">
            <Button className="rounded-lg px-4 py-2.5">
              Começar agora <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <button
          className="rounded-lg p-2 text-ink sm:hidden"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <nav className="mx-auto grid max-w-7xl gap-1 border-t border-line py-3 sm:hidden">
          {items.map((i) =>
            i.route ? (
              <Link
                key={i.to}
                to={i.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-semibold text-ink hover:bg-primary-100"
              >
                {i.label}
              </Link>
            ) : (
              <a
                key={i.to}
                href={i.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-semibold text-ink hover:bg-primary-100"
              >
                {i.label}
              </a>
            ),
          )}
          <Link
            to="/entrar"
            onClick={() => setOpen(false)}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-semibold text-ink"
          >
            <LogIn className="h-4 w-4 text-primary-800" /> Entrar
          </Link>
          <Link to="/comecar" onClick={() => setOpen(false)}>
            <Button className="mt-1 w-full rounded-lg">
              Começar agora <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </nav>
      )}
    </header>
  );
}
