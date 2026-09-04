import { FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ANGOLA_PROVINCES } from "@agriangola/shared";
import { api } from "../../lib/api";
import { Button, Card, Field, Input, PageHeader, Select, Spinner, Textarea } from "../../components/ui";
import { toast } from "sonner";

type Farm = {
  id: string;
  name: string;
  province: string;
  areaHa: number;
  soilType: string | null;
  fields: { id: string; name: string; areaHa: number; crop: string | null }[];
  diary: { id: string; kind: string; body: string; createdAt: string }[];
};

export function FarmsPage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["farms"], queryFn: () => api.get<Farm[]>("/farms") });
  const cal = useQuery({ queryKey: ["cal"], queryFn: () => api.get<{ month: number; activity: string }[]>("/farms/calendar?crop=milho") });
  const weather = useQuery({
    queryKey: ["weather"],
    queryFn: () => api.get<{ latest: { temperature: number; rainMm: number; condition: string }; alerts: string[] }>("/weather?province=Malanje"),
  });
  const create = useMutation({
    mutationFn: (body: unknown) => api.post("/farms", body),
    onSuccess: () => {
      toast.success("Fazenda registada");
      void qc.invalidateQueries({ queryKey: ["farms"] });
    },
  });
  const diary = useMutation({
    mutationFn: (body: unknown) => api.post("/farms/diary", body),
    onSuccess: () => {
      toast.success("Diário actualizado");
      void qc.invalidateQueries({ queryKey: ["farms"] });
    },
  });

  if (q.isLoading) return <Spinner />;
  const farm = q.data?.[0];

  function onFarm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    create.mutate({
      name: fd.get("name"),
      province: fd.get("province"),
      areaHa: Number(fd.get("areaHa")),
      soilType: fd.get("soilType"),
    });
  }

  return (
    <div>
      <PageHeader title="Farm Manager" subtitle="Talhões, calendário, diário e clima." />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          {farm ? (
            <div>
              <h2 className="font-display text-2xl">{farm.name}</h2>
              <p className="text-sm">{farm.areaHa} ha · {farm.province} · {farm.soilType}</p>
              <ul className="mt-4 grid gap-2 md:grid-cols-2">
                {farm.fields.map((f) => (
                  <li key={f.id} className="rounded-xl bg-cream-100 p-3 text-sm">{f.name} · {f.areaHa} ha · {f.crop ?? "—"}</li>
                ))}
              </ul>
              <h3 className="mt-6 font-display text-xl">Diário</h3>
              <ul className="mt-2 space-y-2 text-sm">
                {farm.diary.map((d) => (
                  <li key={d.id}><span className="text-gold-600">{d.kind}</span> — {d.body}</li>
                ))}
              </ul>
              <form
                className="mt-4 space-y-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  diary.mutate({ farmId: farm.id, kind: fd.get("kind"), body: fd.get("body") });
                  e.currentTarget.reset();
                }}
              >
                <Select name="kind">
                  <option>PLANTIO</option>
                  <option>CHUVA</option>
                  <option>PRAGA</option>
                  <option>CUSTO</option>
                  <option>COLHEITA</option>
                </Select>
                <Textarea name="body" required placeholder="Registo (texto; voz no telemóvel via teclado do SO)" />
                <Button type="submit">Guardar no diário</Button>
              </form>
            </div>
          ) : (
            <form onSubmit={onFarm} className="grid gap-3 md:grid-cols-2">
              <Field label="Nome"><Input name="name" required /></Field>
              <Field label="Área (ha)"><Input name="areaHa" type="number" required min="0.1" step="0.1" /></Field>
              <Field label="Província"><Select name="province">{ANGOLA_PROVINCES.map((p) => <option key={p.code}>{p.name}</option>)}</Select></Field>
              <Field label="Solo"><Input name="soilType" /></Field>
              <Button type="submit">Criar fazenda</Button>
            </form>
          )}
        </Card>
        <div className="space-y-4">
          <Card>
            <h3 className="font-display text-xl">Agri Weather</h3>
            <p className="mt-2">{weather.data?.latest?.condition} · {weather.data?.latest?.temperature}°C</p>
            <ul className="mt-2 text-sm">{weather.data?.alerts.map((a) => <li key={a}>{a}</li>)}</ul>
          </Card>
          <Card>
            <h3 className="font-display text-xl">Calendário milho</h3>
            <ul className="mt-2 space-y-1 text-sm">
              {cal.data?.map((c) => (
                <li key={c.month}><strong>{c.month}</strong> · {c.activity}</li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
