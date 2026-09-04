import { useMemo, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, Circle } from "react-leaflet";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { Card, PageHeader, Select } from "../../components/ui";
import "leaflet/dist/leaflet.css";

type Heat = { name: string; lat: number; lng: number; production: number; demand: number; avgPrice: number; value: number };
type Poi = { id: string; kind: string; name: string; lat: number; lng: number; province: string };

export function MapPage() {
  const [metric, setMetric] = useState("production");
  const heat = useQuery({ queryKey: ["heat", metric], queryFn: () => api.get<Heat[]>(`/maps/heatmap?metric=${metric}`) });
  const pois = useQuery({ queryKey: ["pois"], queryFn: () => api.get<Poi[]>("/maps/pois") });
  const max = useMemo(() => Math.max(1, ...(heat.data ?? []).map((h) => h.value)), [heat.data]);

  return (
    <div>
      <PageHeader title="Mapa agrícola de Angola" subtitle="Produção, procura, preços e pontos da rede." />
      <Card className="mb-4 flex flex-wrap gap-3">
        <Select value={metric} onChange={(e) => setMetric(e.target.value)}>
          <option value="production">Produção</option>
          <option value="demand">Procura</option>
          <option value="prices">Preços</option>
          <option value="opportunity">Oportunidades</option>
        </Select>
      </Card>
      <div className="overflow-hidden rounded-2xl border border-forest-800/10" style={{ height: 560 }}>
        <MapContainer center={[-12.3, 17.8]} zoom={5.4} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
          <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {(heat.data ?? []).map((h) => (
            <Circle
              key={h.name}
              center={[h.lat, h.lng]}
              radius={20_000 + (h.value / max) * 80_000}
              pathOptions={{ color: "#c9a227", fillColor: "#2d6a4f", fillOpacity: 0.25 }}
            >
              <Popup>
                <strong>{h.name}</strong>
                <br />Produção: {h.production}
                <br />Procura: {h.demand}
                <br />Preço médio: {Math.round(h.avgPrice)}
              </Popup>
            </Circle>
          ))}
          {(pois.data ?? []).map((p) => (
            <CircleMarker key={p.id} center={[p.lat, p.lng]} radius={7} pathOptions={{ color: "#bc6c25" }}>
              <Popup>
                {p.name} ({p.kind})
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
