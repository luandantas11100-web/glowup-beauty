import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, Clock, Users, Check, ArrowRight, Loader2 } from "lucide-react";
import { api, getImageUrl } from "@/lib/api";

export const Route = createFileRoute("/cursos")({
  head: () => ({
    meta: [
      { title: "Cursos — Helena Gabriela" },
      { name: "description", content: "Cursos de automaquiagem, profissionalizante de maquiagem e curso de unhas." },
      { property: "og:title", content: "Cursos — Helena Gabriela" },
      { property: "og:description", content: "Automaquiagem, profissionalizante de maquiagem e unhas." },
    ],
  }),
  component: CursosPage,
});

interface Course {
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

function CursosPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Course[]>("/courses")
      .then((res) => {
        setCourses(res.data.filter((c) => c.active));
      })
      .catch((err) => {
        console.error("Erro ao carregar cursos da API:", err);
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
          <div className="text-xs uppercase tracking-[0.3em] text-primary">Cursos</div>
          <h1 className="mt-4 max-w-3xl font-display text-5xl text-foreground md:text-6xl">
            Aprenda com quem vive a beleza como profissão.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Formações práticas, turmas pequenas e acompanhamento próximo — para quem quer aprender por prazer ou construir uma carreira.
          </p>
          <div className="mt-10 flex flex-wrap gap-6">
            {[
              { icon: Award, t: "Certificação" },
              { icon: Users, t: "Até 8 alunas por turma" },
              { icon: Clock, t: "Horários flexíveis" },
            ].map((b) => (
              <div key={b.t} className="flex items-center gap-3 text-sm text-foreground/80">
                <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <b.icon className="size-4" />
                </span>
                {b.t}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        {courses.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            Nenhum curso disponível no momento.
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            {courses.map((c) => (
              <article
                key={c.id}
                id={c.id}
                className="flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-soft)]"
              >
                <div className="relative">
                  <img
                    src={getImageUrl(c.image)}
                    alt={c.title}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover"
                  />
                  <span className="absolute left-5 top-5 rounded-full bg-background/90 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-primary backdrop-blur">
                    {c.tag}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-8">
                  <h2 className="font-display text-3xl text-foreground">{c.title}</h2>
                  <div className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">{c.duration}</div>
                  <p className="mt-4 text-sm text-muted-foreground">{c.desc}</p>
                  <ul className="mt-6 space-y-2.5">
                    {(Array.isArray(c.items) ? c.items : []).map((p) => (
                      <li key={p} className="flex items-start gap-3 text-sm text-foreground/80">
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                        {p}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 flex items-end justify-between border-t border-border/70 pt-6">
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Investimento</div>
                      <div className="mt-1 font-display text-3xl text-primary">
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(c.price)}
                      </div>
                    </div>
                    <Link
                      to="/agendamentos"
                      className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs uppercase tracking-[0.2em] text-primary-foreground transition-transform hover:-translate-y-0.5"
                    >
                      Inscrever <ArrowRight className="size-4" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="border-t border-border/60 bg-secondary/40">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-primary">Dúvidas?</div>
          <h2 className="mt-4 font-display text-4xl text-foreground md:text-5xl">
            Fale comigo e descubra o curso ideal para você.
          </h2>
          <Link
            to="/agendamentos"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm uppercase tracking-[0.2em] text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            Falar sobre os cursos <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </>
  );
}