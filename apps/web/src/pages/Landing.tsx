import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  CloudSun,
  Handshake,
  MapPin,
  ShieldCheck,
  Sprout,
  Truck,
} from "lucide-react";
import { PublicHeader } from "../components/layout";
import { Button, Card } from "../components/ui";

const categories = [
  ["Cereais", "128 produtos", "🌾"],
  ["Frutas", "96 produtos", "🍊"],
  ["Hortícolas", "84 produtos", "🥬"],
  ["Café", "32 produtos", "☕"],
  ["Leguminosas", "61 produtos", "🫘"],
  ["Pecuária", "45 produtos", "🐄"],
];
const products = [
  {
    name: "Milho amarelo classe A",
    place: "Malanje",
    producer: "Cooperativa Nzinga",
    price: "275 Kz / kg",
    amount: "320 toneladas",
    image:
      "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=85",
  },
  {
    name: "Café Arábica premium",
    place: "Uíge",
    producer: "Fazenda Kiculungo",
    price: "4.800 Kz / kg",
    amount: "8,5 toneladas",
    image:
      "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=800&q=85",
  },
  {
    name: "Tomate fresco selecionado",
    place: "Huambo",
    producer: "Agro Horizonte",
    price: "1.150 Kz / kg",
    amount: "12 toneladas",
    image:
      "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=800&q=85",
  },
];
const steps = [
  [
    "01",
    "Publique",
    "Apresente os seus produtos, disponibilidade e condições de fornecimento.",
  ],
  [
    "02",
    "Encontre",
    "Compradores encontram produtos e fornecedores em diferentes regiões.",
  ],
  [
    "03",
    "Negocie",
    "Combine quantidade, preço e condições com mais transparência.",
  ],
  ["04", "Conclua", "Prepare a operação para pedido, logística e entrega."],
];

const heroSlides = [
  {
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2200&q=90",
    alt: "Campo agrícola ao nascer do sol",
    eyebrow: "Infraestrutura digital para Angola",
    title: "Conectamos quem produz a quem compra.",
    copy: "A plataforma que aproxima produtores, empresas e oportunidades agrícolas em Angola.",
    primary: "Explorar produtos",
    secondary: "Quero vender",
    badges: ["Produtores verificados", "Mercado B2B", "Feito para Angola"],
  },
  {
    image:
      "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=2200&q=90",
    alt: "Produtora a cuidar de uma plantação",
    eyebrow: "Mais alcance para quem produz",
    title: "A sua produção merece chegar mais longe.",
    copy: "Apresente a sua oferta, encontre compradores e transforme disponibilidade em negócio.",
    primary: "Publicar uma oferta",
    secondary: "Conhecer produtores",
    badges: ["Mais visibilidade", "Novos compradores", "Dados da sua operação"],
  },
  {
    image:
      "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=2200&q=90",
    alt: "Camponês a trabalhar numa plantação agrícola",
    eyebrow: "Do campo ao mercado",
    title: "Decisões melhores começam com informação.",
    copy: "Compare ofertas, acompanhe o mercado e encontre fornecedores para a próxima operação.",
    primary: "Encontrar fornecedores",
    secondary: "Ver inteligência de mercado",
    badges: [
      "Pesquisa inteligente",
      "Preços de referência",
      "Logística integrada",
    ],
  },
];

function SectionTitle({
  eyebrow,
  title,
  copy,
  action,
}: {
  eyebrow: string;
  title: string;
  copy?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-primary-800">
          {eyebrow}
        </p>
        <h2 className="font-display text-3xl font-extrabold leading-tight text-ink sm:text-4xl">
          {title}
        </h2>
        {copy && (
          <p className="mt-4 max-w-xl text-base leading-7 text-muted">{copy}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function LandingPage() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const slide = heroSlides[activeSlide];

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [paused]);

  function changeSlide(index: number) {
    setActiveSlide((index + heroSlides.length) % heroSlides.length);
  }

  return (
    <div className="min-h-screen overflow-hidden bg-canvas pt-[72px]">
      <PublicHeader />
      <main>
        <section
          className="relative isolate min-h-[640px] overflow-hidden text-white sm:min-h-[700px]"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget))
              setPaused(false);
          }}
        >
          <img
            key={slide.image}
            src={slide.image}
            alt={slide.alt}
            className="absolute inset-0 h-full w-full animate-rise-in object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-950/95 via-primary-950/75 to-primary-950/20" />
          <div className="hero-grid absolute inset-0 opacity-30" />
          <div className="grain absolute inset-0" />
          <div className="relative mx-auto flex min-h-[640px] max-w-7xl items-center px-4 pb-20 pt-16 sm:min-h-[700px] sm:px-6 lg:pb-24 lg:pt-24">
            <div
              key={slide.title}
              className="animate-rise-in"
              aria-live="polite"
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-primary-100">
                <span className="h-2 w-2 rounded-full bg-primary-500" />{" "}
                {slide.eyebrow}
              </div>
              <h1 className="max-w-2xl font-display text-4xl font-extrabold leading-[1.08] sm:text-6xl lg:text-[4.5rem]">
                {slide.title}
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-primary-100/80">
                {slide.copy}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to={
                    activeSlide === 1
                      ? "/comecar?intent=PRODUCER"
                      : "/marketplace"
                  }
                >
                  <Button
                    variant="gold"
                    className="w-full rounded-lg px-6 py-3 sm:w-auto"
                  >
                    {slide.primary} <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link
                  to={
                    activeSlide === 2
                      ? "/#mercado"
                      : activeSlide === 1
                        ? "/marketplace"
                        : "/comecar?intent=PRODUCER"
                  }
                >
                  <Button className="w-full rounded-lg border border-white/20 bg-white/10 text-white shadow-none hover:bg-white/15 sm:w-auto">
                    {slide.secondary}
                  </Button>
                </Link>
              </div>
              <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-primary-100/75">
                {slide.badges.map((badge, index) => (
                  <span key={badge} className="flex items-center gap-2">
                    <>
                      {index === 0 ? (
                        <ShieldCheck className="h-4 w-4 text-primary-500" />
                      ) : index === 1 ? (
                        <Handshake className="h-4 w-4 text-primary-500" />
                      ) : (
                        <MapPin className="h-4 w-4 text-primary-500" />
                      )}
                    </>{" "}
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="absolute bottom-7 left-1/2 flex -translate-x-1/2 items-center gap-3 sm:bottom-9">
            <button
              type="button"
              onClick={() => changeSlide(activeSlide - 1)}
              className="grid h-9 w-9 place-items-center rounded-full border border-white/25 bg-black/15 text-white transition hover:bg-white/20"
              aria-label="Slide anterior"
              title="Slide anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div
              className="flex items-center gap-2"
              role="tablist"
              aria-label="Slides do hero"
            >
              {heroSlides.map((item, index) => (
                <button
                  key={item.title}
                  type="button"
                  role="tab"
                  aria-selected={index === activeSlide}
                  onClick={() => changeSlide(index)}
                  className={`h-2 rounded-full transition-all ${index === activeSlide ? "w-8 bg-primary-400" : "w-2 bg-white/50 hover:bg-white"}`}
                  aria-label={`Ir para slide ${index + 1}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => changeSlide(activeSlide + 1)}
              className="grid h-9 w-9 place-items-center rounded-full border border-white/25 bg-black/15 text-white transition hover:bg-white/20"
              aria-label="Próximo slide"
              title="Próximo slide"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </section>
        <section className="border-b border-line bg-white">
          <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-line sm:grid-cols-4">
            {[
              ["1.000+", "Produtores"],
              ["500+", "Produtos"],
              ["100+", "Compradores"],
              ["24/7", "Mercado digital"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="border-t border-line p-6 first:border-t-0 sm:border-t-0 sm:p-8"
              >
                <b className="font-display text-3xl text-ink">{value}</b>
                <p className="mt-1 text-sm text-muted">{label}</p>
              </div>
            ))}
          </div>
        </section>
        <section
          id="como-funciona"
          className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28"
        >
          <SectionTitle
            eyebrow="Simples por natureza"
            title="Da produção à oportunidade."
            copy="Uma experiência construída para tornar o comércio agrícola mais direto, transparente e acessível."
          />
          <div className="grid gap-4 md:grid-cols-4">
            {steps.map(([number, title, copy]) => (
              <Card
                key={number}
                className="group rounded-xl border-line bg-white p-6 shadow-soft transition hover:-translate-y-1"
              >
                <span className="font-mono text-xs font-bold text-primary-800">
                  {number}
                </span>
                <div className="my-8 grid h-11 w-11 place-items-center rounded-lg bg-primary-100 text-primary-800">
                  {number === "01" ? (
                    <Sprout className="h-5 w-5" />
                  ) : number === "02" ? (
                    <MapPin className="h-5 w-5" />
                  ) : number === "03" ? (
                    <Handshake className="h-5 w-5" />
                  ) : (
                    <Truck className="h-5 w-5" />
                  )}
                </div>
                <h3 className="font-display text-xl font-bold text-ink">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-muted">{copy}</p>
              </Card>
            ))}
          </div>
        </section>
        <section className="bg-white py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <SectionTitle
              eyebrow="O que se cultiva aqui"
              title="Explore por categoria"
              action={
                <Link
                  to="/marketplace"
                  className="inline-flex items-center gap-1 text-sm font-bold text-primary-800"
                >
                  Ver tudo <ChevronRight className="h-4 w-4" />
                </Link>
              }
            />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {categories.map(([name, count, icon]) => (
                <Link
                  to="/marketplace"
                  key={name}
                  className="group rounded-xl border border-line bg-canvas p-4 transition hover:border-primary-500 hover:bg-primary-100"
                >
                  <span className="text-3xl">{icon}</span>
                  <h3 className="mt-5 font-semibold text-ink">{name}</h3>
                  <p className="mt-1 text-xs text-muted">{count}</p>
                  <ArrowUpRight className="mt-4 h-4 w-4 text-primary-800 opacity-0 transition group-hover:opacity-100" />
                </Link>
              ))}
            </div>
          </div>
        </section>
        <section
          id="mercado"
          className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28"
        >
          <SectionTitle
            eyebrow="O mercado em movimento"
            title="Produtos com origem. Oportunidades com destino."
            copy="Conheça ofertas de produtores e cooperativas que já estão a construir a próxima cadeia de valor agrícola."
            action={
              <Link to="/marketplace">
                <Button variant="outline" className="rounded-lg">
                  Explorar produtos <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            }
          />
          <div className="grid gap-5 md:grid-cols-3">
            {products.map((product) => (
              <Card
                key={product.name}
                className="group overflow-hidden rounded-xl border-line bg-white p-0 shadow-soft"
              >
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-primary-800">
                    Verificado
                  </span>
                </div>
                <div className="p-5">
                  <p className="text-xs font-semibold text-muted">
                    {product.place} · {product.producer}
                  </p>
                  <h3 className="mt-2 font-display text-lg font-bold text-ink">
                    {product.name}
                  </h3>
                  <div className="mt-5 flex items-end justify-between">
                    <div>
                      <p className="text-xs text-muted">Preço indicativo</p>
                      <p className="mt-1 font-bold text-primary-800">
                        {product.price}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted">Disponível</p>
                      <p className="mt-1 text-sm font-semibold text-ink">
                        {product.amount}
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/marketplace"
                    className="mt-5 flex items-center justify-between border-t border-line pt-4 text-sm font-bold text-ink"
                  >
                    Ver produto{" "}
                    <ArrowUpRight className="h-4 w-4 text-primary-800" />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </section>
        <section id="produtores" className="bg-primary-100/60">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-28">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-primary-800">
                Para produtores
              </p>
              <h2 className="font-display text-3xl font-extrabold leading-tight text-ink sm:text-4xl">
                Transforme a sua produção em novas oportunidades.
              </h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-muted">
                Apresente os seus produtos, encontre compradores e acompanhe as
                suas oportunidades comerciais numa única plataforma.
              </p>
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {[
                  "Mais visibilidade",
                  "Novos compradores",
                  "Gestão de produtos",
                  "Pedidos e cotações",
                ].map((item) => (
                  <span
                    key={item}
                    className="flex items-center gap-2 text-sm font-semibold text-ink"
                  >
                    <Check className="h-4 w-4 text-primary-800" /> {item}
                  </span>
                ))}
              </div>
              <Link to="/comecar?intent=PRODUCER" className="mt-8 inline-block">
                <Button className="rounded-lg">
                  Quero vender no AgriAngola <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="relative overflow-hidden rounded-2xl">
              <img
                src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1000&q=85"
                alt="Produtor a trabalhar numa plantação"
                className="h-[360px] w-full object-cover"
              />
              <div className="absolute bottom-5 left-5 rounded-xl bg-white p-4 shadow-lift">
                <p className="text-xs text-muted">Produtores verificados</p>
                <p className="mt-1 font-display text-2xl font-extrabold text-primary-800">
                  1.000+
                </p>
              </div>
            </div>
          </div>
        </section>
        <section id="compradores" className="bg-white">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:py-28">
            <div className="order-2 grid grid-cols-2 gap-3 lg:order-1">
              <div className="rounded-xl green-gradient-deep p-5 text-white">
                <BarChart3 className="h-6 w-6 text-primary-500" />
                <p className="mt-12 font-display text-xl font-bold">
                  Procura inteligente
                </p>
                <p className="mt-2 text-sm text-primary-100/65">
                  Encontre o que precisa, onde precisa.
                </p>
              </div>
              <div className="mt-8 rounded-xl border border-line bg-canvas p-5">
                <CircleDollarSign className="h-6 w-6 text-primary-800" />
                <p className="mt-12 font-display text-xl font-bold text-ink">
                  Ofertas reais
                </p>
                <p className="mt-2 text-sm text-muted">
                  Compare e negocie com confiança.
                </p>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-primary-800">
                Para compradores
              </p>
              <h2 className="font-display text-3xl font-extrabold leading-tight text-ink sm:text-4xl">
                Encontre produtos agrícolas com mais facilidade.
              </h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-muted">
                Descubra produtores, compare ofertas e encontre oportunidades de
                fornecimento em diferentes regiões de Angola.
              </p>
              <Link to="/marketplace" className="mt-8 inline-block">
                <Button variant="outline" className="rounded-lg">
                  Quero comprar <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
          <div className="overflow-hidden rounded-2xl green-gradient-deep text-white">
            <div className="grid gap-10 p-8 sm:p-12 lg:grid-cols-[.9fr_1.1fr] lg:p-16">
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-primary-500">
                  Inteligência de mercado
                </p>
                <h2 className="font-display text-3xl font-extrabold leading-tight sm:text-4xl">
                  Dados que ajudam a tomar melhores decisões.
                </h2>
                <p className="mt-5 max-w-md leading-7 text-primary-100/70">
                  O AgriAngola vai transformar sinais do mercado em decisões
                  mais claras para quem produz e para quem compra.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <CloudSun className="h-5 w-5 text-primary-500" />
                  <p className="mt-8 text-sm font-semibold">
                    Clima e colheitas
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <BarChart3 className="h-5 w-5 text-primary-500" />
                  <p className="mt-8 text-sm font-semibold">
                    Tendências de procura
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <CircleDollarSign className="h-5 w-5 text-primary-500" />
                  <p className="mt-8 text-sm font-semibold">
                    Preços de referência
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="border-y border-line bg-white">
          <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-primary-800">
              Do campo ao mercado
            </p>
            <h2 className="font-display text-3xl font-extrabold text-ink sm:text-4xl">
              Produção, transporte e compra. Mais próximos.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted">
              O AgriAngola pretende aproximar produção, mercado e logística numa
              experiência digital integrada.
            </p>
            <div className="mx-auto mt-10 flex max-w-2xl flex-col items-center justify-between gap-5 sm:flex-row">
              <span className="flex items-center gap-3 font-bold text-ink">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-primary-100 text-primary-800">
                  <Sprout className="h-5 w-5" />
                </span>
                Produtor
              </span>
              <ArrowRight className="hidden h-5 w-5 text-primary-800 sm:block" />
              <span className="flex items-center gap-3 font-bold text-ink">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-primary-100 text-primary-800">
                  <Truck className="h-5 w-5" />
                </span>
                Transporte
              </span>
              <ArrowRight className="hidden h-5 w-5 text-primary-800 sm:block" />
              <span className="flex items-center gap-3 font-bold text-ink">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-primary-100 text-primary-800">
                  <Handshake className="h-5 w-5" />
                </span>
                Comprador
              </span>
            </div>
          </div>
        </section>
        <section className="bg-canvas px-4 py-16 sm:px-6 sm:py-20">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl text-white shadow-lift">
            <img
              src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1800&q=85"
              alt="Plantação agrícola ao fim da tarde"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 green-gradient-deep opacity-90" />
            <div className="grain absolute inset-0" />
            <div className="relative mx-auto max-w-3xl px-6 py-14 text-center sm:px-12 sm:py-16">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-100">
                Uma nova forma de crescer
              </p>
              <h2 className="mx-auto mt-4 max-w-2xl font-display text-3xl font-extrabold leading-tight sm:text-5xl">
                O futuro do agronegócio angolano começa com conexão.
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-primary-100/80">
                Faça parte de uma nova forma de produzir, negociar e crescer.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link to="/marketplace">
                  <Button
                    variant="gold"
                    className="w-full rounded-lg sm:w-auto"
                  >
                    Explorar o AgriAngola <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/comecar">
                  <Button className="w-full rounded-lg border border-white/25 bg-white/10 text-white shadow-none hover:bg-white/15 sm:w-auto">
                    Começar agora
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="green-gradient-deep text-primary-100/70">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2 font-display text-xl font-extrabold text-white">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary-800 text-sm">
                A
              </span>
              Agri<span className="text-primary-500">Angola</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-6">
              A infraestrutura digital do agronegócio angolano.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">AgriAngola</h3>
            <div className="mt-4 grid gap-3 text-sm">
              <a href="#como-funciona" className="hover:text-white">
                Como funciona
              </a>
              <a href="#produtores" className="hover:text-white">
                Para produtores
              </a>
              <a href="#compradores" className="hover:text-white">
                Para compradores
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Plataforma</h3>
            <div className="mt-4 grid gap-3 text-sm">
              <Link to="/marketplace" className="hover:text-white">
                Explorar produtos
              </Link>
              <Link to="/procuras" className="hover:text-white">
                Encontrar compradores
              </Link>
              <a href="#mercado" className="hover:text-white">
                Mercado
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Recursos</h3>
            <div className="mt-4 grid gap-3 text-sm">
              <a href="#mercado" className="hover:text-white">
                Inteligência de mercado
              </a>
              <a href="#" className="hover:text-white">
                Ajuda
              </a>
              <a href="#" className="hover:text-white">
                Contactos
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <span>© 2026 AgriAngola. Todos os direitos reservados.</span>
            <span>Dados de demonstração identificados como tal.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
