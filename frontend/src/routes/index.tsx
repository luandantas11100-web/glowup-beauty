import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Heart, Award } from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import makeupImg from "@/assets/makeup.jpg";
import lashesImg from "@/assets/lashes.jpg";
import skinImg from "@/assets/skin.jpg";

export const Route = createFileRoute("/")({
  component: Home,
});

const highlights = [
  { img: makeupImg, title: "Maquiagem", href: "/servicos" },
  { img: lashesImg, title: "Cílios", href: "/servicos" },
  { img: skinImg, title: "Pele", href: "/servicos" },
];

function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
        <div className="mx-auto grid max-w-7xl gap-16 px-6 py-20 md:grid-cols-[1.1fr_1fr] md:py-32">
          <div className="flex flex-col justify-center">
            <span className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-background/60 px-4 py-1.5 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              <Sparkles className="size-3 text-primary" /> Estúdio de estética
            </span>
            <h1 className="font-display text-5xl leading-[1.05] text-foreground md:text-7xl">
              Beleza que revela<br />
              <em className="text-primary not-italic font-normal">sua essência</em>.
            </h1>
            <p className="mt-6 max-w-lg text-lg text-muted-foreground">
              Um espaço dedicado à sua autoestima. Maquiagem, cílios, pele e unhas — além de cursos para quem quer transformar a beleza em profissão.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/agendamentos"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm uppercase tracking-[0.2em] text-primary-foreground shadow-[var(--shadow-elegant)] transition-transform hover:-translate-y-0.5"
              >
                Agendar horário <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/servicos"
                className="inline-flex items-center gap-2 rounded-full border border-primary/30 px-7 py-3.5 text-sm uppercase tracking-[0.2em] text-foreground transition-colors hover:bg-primary/5"
              >
                Ver serviços
              </Link>
            </div>
            <div className="mt-14 grid grid-cols-3 gap-6 border-t border-border/70 pt-8">
              {[
                { n: "+8", l: "anos de experiência" },
                { n: "+2k", l: "clientes atendidas" },
                { n: "+300", l: "alunas formadas" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="font-display text-3xl text-primary">{s.n}</div>
                  <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-primary/20 to-accent/10 blur-2xl" />
            <img
              src={heroImg}
              alt="Estúdio de estética Helena Gabriela"
              width={1600}
              height={1600}
              className="relative aspect-[4/5] w-full rounded-[2rem] object-cover shadow-[var(--shadow-elegant)]"
            />
            <div className="absolute -bottom-6 -left-6 hidden max-w-[220px] rounded-2xl border border-border bg-background/95 p-5 shadow-[var(--shadow-soft)] backdrop-blur md:block">
              <Heart className="size-5 text-primary" />
              <p className="mt-2 font-display text-lg leading-snug text-foreground">
                "Cuidar de você é uma arte."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-14 flex items-end justify-between gap-6">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-primary">O que faço</div>
            <h2 className="mt-3 max-w-xl font-display text-4xl text-foreground md:text-5xl">
              Um cuidado feito à mão, do começo ao fim.
            </h2>
          </div>
          <Link to="/servicos" className="hidden shrink-0 text-sm text-primary underline underline-offset-4 md:inline">
            Ver todos os serviços →
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {highlights.map((h) => (
            <Link key={h.title} to={h.href} className="group relative block overflow-hidden rounded-2xl">
              <img
                src={h.img}
                alt={h.title}
                loading="lazy"
                className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 flex w-full items-end justify-between p-6">
                <h3 className="font-display text-2xl text-background">{h.title}</h3>
                <ArrowRight className="size-5 text-background transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* About / CTA cursos */}
      <section className="bg-secondary/40">
        <div className="mx-auto grid max-w-7xl gap-14 px-6 py-24 md:grid-cols-2 md:items-center">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-primary">Cursos</div>
            <h2 className="mt-3 font-display text-4xl text-foreground md:text-5xl">
              Transforme sua paixão em profissão.
            </h2>
            <p className="mt-5 max-w-md text-muted-foreground">
              Automaquiagem, profissionalizante de maquiagem e curso de unhas. Turmas reduzidas, material incluso e acompanhamento pós-formação.
            </p>
            <Link
              to="/cursos"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm uppercase tracking-[0.2em] text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              Conhecer cursos <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="grid gap-4">
            {[
              { icon: Award, t: "Certificação", d: "Formação reconhecida ao final do curso." },
              { icon: Heart, t: "Turmas reduzidas", d: "Máximo de 8 alunas por turma." },
              { icon: Sparkles, t: "Kit profissional", d: "Materiais inclusos para você começar." },
            ].map((f) => (
              <div key={f.t} className="flex gap-5 rounded-2xl border border-border bg-background p-6">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <f.icon className="size-5" />
                </div>
                <div>
                  <div className="font-display text-xl text-foreground">{f.t}</div>
                  <p className="mt-1 text-sm text-muted-foreground">{f.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-14 text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-primary">Depoimentos</div>
          <h2 className="mt-3 font-display text-4xl text-foreground md:text-5xl">Palavras de quem confia.</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { n: "Marina S.", t: "Fiz a make do meu casamento com a Helena. Ficou perfeita, delicada e durou o dia todo." },
            { n: "Camila R.", t: "Amei a limpeza de pele! Ambiente lindo, atendimento acolhedor e resultado incrível." },
            { n: "Beatriz M.", t: "O curso profissionalizante mudou minha vida. Hoje trabalho com o que amo." },
          ].map((d) => (
            <blockquote key={d.n} className="rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-soft)]">
              <div className="mb-4 text-primary">★★★★★</div>
              <p className="font-display text-xl leading-snug text-foreground">"{d.t}"</p>
              <footer className="mt-6 text-xs uppercase tracking-[0.25em] text-muted-foreground">— {d.n}</footer>
            </blockquote>
          ))}
        </div>
      </section>
    </>
  );
}
