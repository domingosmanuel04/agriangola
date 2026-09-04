import { Link } from "react-router-dom";
import { ArrowRight, Leaf, MapPinned, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { PublicHeader } from "../components/layout";
import { Button, Card } from "../components/ui";

const pillars = [
  { icon: Leaf, title: "Produzir melhor", text: "Farm Manager, calendário, diário e stock — a fazenda no bolso." },
  { icon: Sparkles, title: "Encontrar quem compra", text: "Matching entre oferta e procura com índice de compatibilidade." },
  { icon: ShieldCheck, title: "Vender com confiança", text: "Negociação, contrato digital, reputação e AgriTrust Score." },
  { icon: Truck, title: "Organizar a logística", text: "Transporte, armazéns e tracking do campo ao destino." },
  { icon: MapPinned, title: "Crescer com dados", text: "Preços, clima, mapas e AgriAI como consultor do agronegócio." },
];

export function LandingPage() {
  return (
    <div className="min-h-screen">
      <div className="pattern-strip h-1.5 w-full" />
      <PublicHeader />
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 lg:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">Infraestrutura nacional</p>
          <h1 className="mt-3 font-display text-5xl leading-tight text-forest-950 md:text-6xl">
            Do campo ao mercado. Tudo num só lugar.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-forest-800/80">
            Produza melhor. Encontre compradores. Venda com confiança. Organize a logística. Cresça com dados.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/comecar">
              <Button variant="gold" className="px-6 py-3">
                Começar agora <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/marketplace">
              <Button variant="outline">Encontrar produtos</Button>
            </Link>
            <Link to="/procuras">
              <Button variant="ghost">Encontrar compradores</Button>
            </Link>
            <Link to="/comecar?intent=PRODUCER">
              <Button variant="ghost">Sou produtor</Button>
            </Link>
          </div>
        </div>
        <Card className="relative overflow-hidden bg-forest-900 p-0 text-cream-50">
          <div className="p-8">
            <p className="text-sm text-gold-400">Passaporte digital do lote</p>
            <p className="mt-2 font-display text-3xl">AGRI-MILHO-2026-000001</p>
            <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-cream-100/50">Produto</dt>
                <dd>Milho · Classe A</dd>
              </div>
              <div>
                <dt className="text-cream-100/50">Origem</dt>
                <dd>Malanje · Fazenda Nzinga</dd>
              </div>
              <div>
                <dt className="text-cream-100/50">Disponível</dt>
                <dd>320 toneladas</dd>
              </div>
              <div>
                <dt className="text-cream-100/50">Preço indicativo</dt>
                <dd>275 Kz/kg</dd>
              </div>
            </dl>
            <p className="mt-6 text-xs text-cream-100/50">Semente → campo → colheita → oferta → contrato → entrega</p>
          </div>
        </Card>
      </section>
      <section className="mx-auto grid max-w-6xl gap-4 px-6 pb-20 md:grid-cols-2 lg:grid-cols-5">
        {pillars.map((p) => (
          <Card key={p.title} className="bg-white/90">
            <p.icon className="h-5 w-5 text-gold-600" />
            <h3 className="mt-3 font-display text-lg">{p.title}</h3>
            <p className="mt-2 text-sm text-forest-700/75">{p.text}</p>
          </Card>
        ))}
      </section>
      <footer className="border-t border-forest-800/10 px-6 py-8 text-center text-sm text-forest-700/60">
        AgriAngola OS — A infraestrutura digital do agronegócio angolano. Dados de demonstração identificados como tal.
      </footer>
    </div>
  );
}
