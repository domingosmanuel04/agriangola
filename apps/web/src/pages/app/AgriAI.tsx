import { FormEvent, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { Button, Card, PageHeader, Textarea } from "../../components/ui";

type Reply = {
  answer: string;
  confidence: number;
  agent: string;
  disclaimer: string;
  actions: { type: string; payload?: Record<string, unknown> }[];
};

const SUGGESTIONS = [
  "Quanto devo plantar para produzir 100 toneladas de milho?",
  "Qual cultura é mais adequada para Malanje?",
  "Tenho 20 toneladas de tomate, onde posso vender?",
  "Quanto devo cobrar pelo milho?",
  "Como reduzir minhas perdas?",
  "Crie um plano agrícola para os próximos 12 meses.",
  "Prepare um relatório para o banco.",
  "Quero vender 50 toneladas de milho em Luanda.",
];

export function AgriAiPage() {
  const nav = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [thread, setThread] = useState<{ role: "user" | "ai"; text: string; meta?: Reply }[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const mut = useMutation({
    mutationFn: (body: { prompt: string; imageHint?: string }) => api.post<Reply>("/ai/ask", body),
    onSuccess: (res, vars) => {
      setThread((t) => [...t, { role: "user", text: vars.prompt }, { role: "ai", text: res.answer, meta: res }]);
      const a = res.actions[0];
      if (a?.type === "OPEN_LISTING") nav("/app/marketplace/nova");
      if (a?.type === "OPEN_LOGISTICS") nav("/app/logistica");
    },
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;
    mut.mutate({ prompt });
    setPrompt("");
  }

  return (
    <div>
      <PageHeader title="AgriAI" subtitle="Consultor agrícola e empresarial. Operações críticas pedem a sua confirmação." />
      <div className="mb-4 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button key={s} className="rounded-full bg-white px-3 py-1 text-xs hover:bg-gold-200" onClick={() => mut.mutate({ prompt: s })}>
            {s}
          </button>
        ))}
      </div>
      <Card className="min-h-[320px] space-y-4">
        {thread.length === 0 && <p className="text-sm text-forest-700/60">Pergunte em português. O AgriAI usa dados da plataforma e regras agronómicas — não substitui um técnico presencial.</p>}
        {thread.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : ""}>
            <div className={`inline-block max-w-[90%] rounded-2xl px-4 py-3 text-sm ${m.role === "user" ? "bg-forest-800 text-cream-50" : "bg-cream-100"}`}>
              {m.role === "ai" && m.meta && (
                <p className="mb-1 text-[10px] uppercase tracking-wide text-gold-600">{m.meta.agent} · confiança {Math.round(m.meta.confidence * 100)}%</p>
              )}
              <p className="whitespace-pre-wrap">{m.text}</p>
              {m.meta?.disclaimer && <p className="mt-2 text-[11px] opacity-70">{m.meta.disclaimer}</p>}
            </div>
          </div>
        ))}
      </Card>
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={3} placeholder="Escreva ou use o microfone no telemóvel…" />
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={mut.isPending}>{mut.isPending ? "A pensar…" : "Perguntar"}</Button>
          <Button type="button" variant="outline" onClick={() => fileRef.current?.click()}>AgriScan / visão</Button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              mut.mutate({ prompt: "Analisar fotografia agrícola", imageHint: f.name + " mancha folha" });
            }}
          />
        </div>
      </form>
    </div>
  );
}
