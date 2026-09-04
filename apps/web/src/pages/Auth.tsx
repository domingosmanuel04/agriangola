import { FormEvent, type ReactNode, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ANGOLA_PROVINCES,
  USER_INTENT_DESCRIPTIONS,
  USER_INTENT_LABELS,
  USER_INTENTS,
  type UserIntent,
} from "@agriangola/shared";
import { api } from "../lib/api";
import { useAuth } from "../store/auth";
import { Button, Card, Field, Input, Select } from "../components/ui";
import { toast } from "sonner";

export function StartPage() {
  const [params] = useSearchParams();
  const preset = (params.get("intent") as UserIntent | null) ?? null;
  const [intent, setIntent] = useState<UserIntent | null>(preset);
  if (!intent) {
    return (
      <AuthFrame title="Como pretende utilizar o AgriAngola?">
        <div className="grid gap-3 sm:grid-cols-2">
          {USER_INTENTS.filter((i) => i !== "ADMIN").map((i) => (
            <button
              key={i}
              onClick={() => setIntent(i)}
              className="rounded-2xl border border-forest-800/10 bg-white p-4 text-left hover:border-gold-500 hover:shadow-glow"
            >
              <p className="font-semibold text-forest-900">{USER_INTENT_LABELS[i]}</p>
              <p className="mt-1 text-sm text-forest-700/70">{USER_INTENT_DESCRIPTIONS[i]}</p>
            </button>
          ))}
        </div>
        <p className="mt-6 text-center text-sm">
          Já tem conta? <Link to="/entrar" className="font-semibold text-gold-600">Entrar</Link>
        </p>
      </AuthFrame>
    );
  }
  return <RegisterForm intent={intent} onBack={() => setIntent(null)} />;
}

function RegisterForm({ intent, onBack }: { intent: UserIntent; onBack: () => void }) {
  const nav = useNavigate();
  const { setSession } = useAuth();
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setPending(true);
    try {
      const res = await api.post<{ accessToken: string; user: { id: string; email: string; name: string; intent: string } }>(
        "/auth/register",
        {
          name: fd.get("name"),
          email: fd.get("email"),
          password: fd.get("password"),
          intent,
          province: fd.get("province") || undefined,
          organizationName: fd.get("organizationName") || undefined,
        },
      );
      setSession(res.accessToken, res.user);
      toast.success("Conta criada");
      nav("/app");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha no registo");
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthFrame title={USER_INTENT_LABELS[intent]} subtitle="Crie o seu perfil profissional">
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Nome">
          <Input name="name" required minLength={2} />
        </Field>
        <Field label="Email">
          <Input name="email" type="email" required />
        </Field>
        <Field label="Palavra-passe (mín. 8)">
          <Input name="password" type="password" required minLength={8} />
        </Field>
        <Field label="Província">
          <Select name="province" defaultValue="Luanda">
            {ANGOLA_PROVINCES.map((p) => (
              <option key={p.code}>{p.name}</option>
            ))}
          </Select>
        </Field>
        <Field label="Organização / fazenda (opcional)">
          <Input name="organizationName" />
        </Field>
        <div className="flex gap-3">
          <Button type="button" variant="ghost" onClick={onBack}>
            Voltar
          </Button>
          <Button type="submit" disabled={pending} className="flex-1">
            {pending ? "A criar…" : "Criar conta"}
          </Button>
        </div>
      </form>
    </AuthFrame>
  );
}

export function LoginPage() {
  const nav = useNavigate();
  const { setSession } = useAuth();
  const [pending, setPending] = useState(false);
  const demos = useMemo(
    () => [
      ["Produtora", "maria.nzinga@agriangola.ao"],
      ["Comprador", "super.kikolo@agriangola.ao"],
      ["Admin", "admin@agriangola.ao"],
    ],
    [],
  );

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setPending(true);
    try {
      const res = await api.post<{ accessToken: string; user: { id: string; email: string; name: string; intent: string } }>(
        "/auth/login",
        { email: fd.get("email"), password: fd.get("password") },
      );
      setSession(res.accessToken, res.user);
      toast.success("Sessão iniciada");
      nav("/app");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Credenciais inválidas");
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthFrame title="Entrar no AgriAngola OS" subtitle="Contas de demonstração: palavra-passe AgriDemo2026!">
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Email">
          <Input name="email" type="email" required defaultValue="maria.nzinga@agriangola.ao" />
        </Field>
        <Field label="Palavra-passe">
          <Input name="password" type="password" required defaultValue="AgriDemo2026!" />
        </Field>
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "A entrar…" : "Entrar"}
        </Button>
      </form>
      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        {demos.map(([label, email]) => (
          <span key={email} className="rounded-full bg-forest-100 px-2 py-1">
            {label}: {email}
          </span>
        ))}
      </div>
      <p className="mt-6 text-center text-sm">
        Novo? <Link to="/comecar" className="font-semibold text-gold-600">Criar conta</Link>
      </p>
    </AuthFrame>
  );
}

function AuthFrame({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <div className="pattern-strip h-1.5" />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Link to="/" className="font-display text-xl text-forest-900">
          AgriAngola OS
        </Link>
        <h1 className="mt-8 font-display text-4xl text-forest-950">{title}</h1>
        {subtitle ? <p className="mt-2 text-forest-700/70">{subtitle}</p> : null}
        <Card className="mt-8">{children}</Card>
      </div>
    </div>
  );
}
