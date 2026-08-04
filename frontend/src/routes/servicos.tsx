import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Clock, ArrowRight, Loader2 } from "lucide-react";
import { api, getImageUrl } from "@/lib/api";

export const Route = createFileRoute("/servicos")({
  head: () => ({
    meta: [
      { title: "Serviços — Helena Gabriela" },
      { name: "description", content: "Maquiagem, cílios, limpeza de pele e unhas no estúdio Helena Gabriela." },
      { property: "og:title", content: "Serviços — Helena Gabriela" },
      { property: "og:description", content: "Maquiagem, cílios, limpeza de pele e unhas." },
    ],
  }),
  component: ServicosPage,
});

interface Service {
  id: string;
  title: string;
  tag: string;
  duration: string;
  price: number;
  desc: string;
  image: string;
  items: string[];
  active: boolean;
}

function ServicosPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Service[]>("/services")
      .then((res) => {
        setServices(res.data.filter((s) => s.active));
      })
      .catch((err) => {
        console.error("Erro ao carregar serviços do banco de dados:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <section className="border-b border-border/60 bg-secondary/40">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="text-xs uppercase tracking-[0.3em] text-primary">Serviços</div>
          <h1 className="mt-4 max-w-3xl font-display text-5xl text-foreground md:text-6xl">
            Cuidados pensados para você, do primeiro toque ao acabamento final.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Cada procedimento é feito com produtos selecionados, técnica atualizada e um ambiente pensado para o seu conforto.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        {services.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            Nenhum serviço disponível no momento.
          </div>
        ) : (
          <div className="flex flex-col gap-20">
            {services.map((s, i) => (
              <article
                key={s.id}
                id={s.id}
                className={`grid gap-10 md:grid-cols-2 md:items-center md:gap-16 ${
                  i % 2 === 1 ? "md:[&>div:first-child]:order-2" : ""
                }`}
              >
                <div className="relative">
                  <div className="absolute -inset-3 rounded-[1.75rem] bg-gradient-to-br from-primary/15 to-accent/10 blur-xl" />
                  <img
                    src={getImageUrl(s.image)}
                    alt={s.title}
                    loading="lazy"
                    className="relative aspect-[4/5] w-full rounded-[1.75rem] object-cover shadow-[var(--shadow-soft)]"
                  />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.3em] text-primary">{s.tag}</div>
                  <h2 className="mt-3 font-display text-4xl text-foreground md:text-5xl">{s.title}</h2>
                  <p className="mt-5 max-w-lg text-muted-foreground">{s.desc}</p>
                  <ul className="mt-8 grid gap-3">
                    {s.items && s.items.map((it) => (
                      <li key={it} className="flex items-center gap-3 text-sm text-foreground/80">
                        <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Check className="size-3.5" />
                        </span>
                        {it}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 flex flex-wrap items-center gap-6 border-t border-border/70 pt-6">
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Investimento</div>
                      <div className="mt-1 font-display text-2xl text-primary">
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(s.price)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="size-4" /> {s.duration}
                    </div>
                    <Link
                      to="/agendamentos"
                      className="ml-auto inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-xs uppercase tracking-[0.2em] text-primary-foreground transition-transform hover:-translate-y-0.5"
                    >
                      Agendar <ArrowRight className="size-4" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}