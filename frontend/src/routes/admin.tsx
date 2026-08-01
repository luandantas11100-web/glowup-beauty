import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays, LogOut, Lock, TrendingUp, Wallet, Clock, Users,
  Pencil, Check, X, Trash2, Plus, Upload,
} from "lucide-react";
import { loginRequest } from "@/services/auth";
import { getBookings, updateBookingStatus, type Booking } from "@/services/booking";
import { getDashboardMetrics, type DashboardMetrics } from "@/services/dashboard";
import {
  type Listing, DEFAULT_STATE, brl, loadState, saveState,
} from "@/lib/admin-data";

const TOKEN_KEY = "@glowup:token";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Painel da Proprietária — Helena Gabriela" },
      { name: "description", content: "Área restrita de gerenciamento do estúdio Helena Gabriela." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Painel da Proprietária — Helena Gabriela" },
      { property: "og:description", content: "Área restrita de gerenciamento." },
    ],
  }),
  component: AdminPage,
});

/* ---------------------------------- Login --------------------------------- */

function LoginScreen({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginRequest({ email, password });
      localStorage.setItem(TOKEN_KEY, data.token);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || "E-mail ou senha incorretos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-6 py-20">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-3xl border border-border bg-card p-10 shadow-[var(--shadow-soft)]"
      >
        <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Lock className="size-5" />
        </span>
        <h1 className="mt-6 font-display text-3xl text-foreground">Área restrita</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Acesso exclusivo da proprietária do estúdio.
        </p>

        <label className="mt-8 block text-xs uppercase tracking-[0.2em] text-muted-foreground">E-mail</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
          required
          className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
          placeholder="seu@email.com"
        />

        <label className="mt-5 block text-xs uppercase tracking-[0.2em] text-muted-foreground">Senha</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
          className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
          placeholder="••••••••"
        />

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-8 w-full rounded-full bg-primary px-6 py-3.5 text-xs uppercase tracking-[0.2em] text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-50"
        >
          {loading ? "Entrando..." : "Entrar no painel"}
        </button>
      </form>
    </div>
  );
}

/* ------------------------------- Small pieces ------------------------------ */

function StatCard({
  icon: Icon, label, value, hint,
}: { icon: typeof Wallet; label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">{label}</span>
        <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon className="size-4" />
        </span>
      </div>
      <div className="mt-4 font-display text-3xl text-foreground">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
    </div>
  );
}

const STATUS_STYLES: Record<Booking["status"], string> = {
  pendente: "bg-primary/15 text-primary",
  confirmado: "bg-secondary text-foreground",
  concluido: "bg-primary text-primary-foreground",
  cancelado: "bg-muted text-muted-foreground line-through",
};

const STATUS_LABEL: Record<Booking["status"], string> = {
  pendente: "Pendente",
  confirmado: "Confirmado",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

function fmtDate(d: string) {
  if (!d) return "";
  const dateObj = new Date(d.includes("T") ? d : d + "T00:00:00");
  return isNaN(dateObj.getTime()) ? d : dateObj.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

/* -------------------------------- Bookings -------------------------------- */

function BookingsPanel({
  bookings, onStatus,
}: {
  bookings: Booking[];
  onStatus: (id: string, status: Booking["status"]) => void;
}) {
  const [filter, setFilter] = useState<"todos" | Booking["status"]>("todos");
  const list = useMemo(
    () =>
      [...bookings]
        .filter((b) => filter === "todos" || b.status === filter)
        .sort((a, b) => (a.date < b.date ? 1 : -1)),
    [bookings, filter],
  );

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {(["todos", "pendente", "confirmado", "concluido", "cancelado"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.2em] transition-colors ${
              filter === f
                ? "bg-primary text-primary-foreground"
                : "border border-border text-foreground/70 hover:text-foreground"
            }`}
          >
            {f === "todos" ? "Todos" : STATUS_LABEL[f]}
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="hidden grid-cols-[1.4fr_1fr_1.4fr_0.9fr_0.8fr_1.4fr] gap-4 border-b border-border bg-secondary/40 px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground md:grid">
          <span>Cliente</span><span>Contato</span><span>Serviço / Curso</span>
          <span>Data</span><span>Valor</span><span>Status</span>
        </div>
        {list.length === 0 && (
          <p className="px-6 py-10 text-center text-sm text-muted-foreground">Nenhuma solicitação nesse filtro.</p>
        )}
        {list.map((b) => (
          <div
            key={b.id}
            className="grid gap-2 border-b border-border/60 px-6 py-5 text-sm last:border-0 md:grid-cols-[1.4fr_1fr_1.4fr_0.9fr_0.8fr_1.4fr] md:items-center md:gap-4"
          >
            <div>
              <div className="text-foreground">{b.name}</div>
              {b.note && <div className="text-xs text-muted-foreground">{b.note}</div>}
            </div>
            <div className="text-muted-foreground">{b.phone}</div>
            <div className="text-foreground/80">
              {b.item}
              <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                {b.kind || "servico"}
              </span>
            </div>
            <div className="text-muted-foreground">{fmtDate(b.date)} · {b.time}</div>
           <div className="text-foreground">{brl(b.value ?? 0)}</div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={b.status}
                onChange={(e) => onStatus(b.id, e.target.value as Booking["status"])}
                className={`rounded-full px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] outline-none ${STATUS_STYLES[b.status]}`}
              >
                {(["pendente", "confirmado", "concluido", "cancelado"] as const).map((s) => (
                  <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                ))}
              </select>
              <a
                href={`https://wa.me/55${b.phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-primary hover:underline"
              >
                WhatsApp
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------- Listings -------------------------------- */

function ListingEditor({
  item, onSave, onCancel,
}: { item: Listing; onSave: (l: Listing) => void; onCancel: () => void }) {
  const [draft, setDraft] = useState<Listing>(item);

  function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setDraft({ ...draft, image: String(reader.result) });
    reader.readAsDataURL(file);
  }

  const field = "mt-2 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary";
  const label = "text-[10px] uppercase tracking-[0.2em] text-muted-foreground";

  return (
    <div className="rounded-2xl border border-primary/40 bg-card p-6">
      <div className="grid gap-5 md:grid-cols-[220px_1fr]">
        <div>
          <img src={draft.image} alt={draft.title} className="aspect-[4/3] w-full rounded-xl object-cover" />
          <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-full border border-border px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-foreground/80 hover:text-foreground">
            <Upload className="size-3.5" /> Trocar foto
            <input type="file" accept="image/*" className="hidden" onChange={pickFile} />
          </label>
          <input
            value={draft.image.startsWith("data:") ? "" : draft.image}
            onChange={(e) => setDraft({ ...draft, image: e.target.value })}
            placeholder="ou cole a URL da imagem"
            className={field}
          />
        </div>

        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <span className={label}>Título</span>
              <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className={field} />
            </div>
            <div>
              <span className={label}>Etiqueta</span>
              <input value={draft.tag} onChange={(e) => setDraft({ ...draft, tag: e.target.value })} className={field} />
            </div>
            <div>
              <span className={label}>Duração</span>
              <input value={draft.duration} onChange={(e) => setDraft({ ...draft, duration: e.target.value })} className={field} />
            </div>
            <div>
              <span className={label}>Valor (R$)</span>
              <input
                type="number"
                value={draft.price}
                onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })}
                className={field}
              />
            </div>
          </div>
          <div>
            <span className={label}>Descrição</span>
            <textarea
              rows={3}
              value={draft.desc}
              onChange={(e) => setDraft({ ...draft, desc: e.target.value })}
              className={field}
            />
          </div>
          <div>
            <span className={label}>Itens do anúncio (um por linha)</span>
            <textarea
              rows={4}
              value={draft.items.join("\n")}
              onChange={(e) => setDraft({ ...draft, items: e.target.value.split("\n") })}
              className={field}
            />
          </div>
          <label className="flex items-center gap-3 text-sm text-foreground/80">
            <input
              type="checkbox"
              checked={draft.active}
              onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
              className="size-4 accent-[hsl(var(--primary))]"
            />
            Visível no site
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => onSave({ ...draft, items: draft.items.filter((i) => i.trim()) })}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-[11px] uppercase tracking-[0.2em] text-primary-foreground"
            >
              <Check className="size-4" /> Salvar
            </button>
            <button
              onClick={onCancel}
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-[11px] uppercase tracking-[0.2em] text-foreground/80"
            >
              <X className="size-4" /> Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ListingsPanel({
  title, items, onChange,
}: { title: string; items: Listing[]; onChange: (next: Listing[]) => void }) {
  const [editing, setEditing] = useState<string | null>(null);

  function addNew() {
    const id = `novo-${Date.now()}`;
    onChange([
      ...items,
      {
        id, title: "Novo item", tag: "Novo", duration: "1h", price: 0,
        desc: "Descreva aqui o que está incluso.", image: items[0]?.image ?? "",
        items: ["Item 1"], active: false,
      },
    ]);
    setEditing(id);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-2xl text-foreground">{title}</h2>
        <button
          onClick={addNew}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-[11px] uppercase tracking-[0.2em] text-primary-foreground"
        >
          <Plus className="size-4" /> Adicionar
        </button>
      </div>

      <div className="mt-6 space-y-4">
        {items.map((item) =>
          editing === item.id ? (
            <ListingEditor
              key={item.id}
              item={item}
              onCancel={() => setEditing(null)}
              onSave={(next) => {
                onChange(items.map((i) => (i.id === item.id ? next : i)));
                setEditing(null);
              }}
            />
          ) : (
            <div key={item.id} className="flex flex-wrap items-center gap-5 rounded-2xl border border-border bg-card p-5">
              <img src={item.image} alt={item.title} className="size-20 shrink-0 rounded-xl object-cover" />
              <div className="min-w-[200px] flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-display text-xl text-foreground">{item.title}</span>
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                    {item.tag}
                  </span>
                  {!item.active && (
                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                      Oculto
                    </span>
                  )}
                </div>
                <p className="mt-1 max-w-xl text-sm text-muted-foreground">{item.desc}</p>
                <div className="mt-1 text-xs text-muted-foreground">{item.duration} · {item.items.length} itens</div>
              </div>
              <div className="font-display text-2xl text-primary">{brl(item.price)}</div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(item.id)}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-foreground/80 hover:text-foreground"
                >
                  <Pencil className="size-3.5" /> Editar
                </button>
                <button
                  onClick={() => onChange(items.filter((i) => i.id !== item.id))}
                  aria-label="Remover"
                  className="rounded-full border border-border px-3 py-2 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}

/* ---------------------------------- Page ---------------------------------- */

const TABS = ["Visão geral", "Agendamentos", "Serviços", "Cursos"] as const;

function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Visão geral");
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Estado local para Serviços e Cursos cadastráveis
  const [listingsState, setListingsState] = useState(() => loadState());

  // Salva no localStorage quando o catálogo de serviços/cursos for editado
  useEffect(() => {
    if (ready) saveState(listingsState);
  }, [listingsState, ready]);

  // Carregar dados da API ao estar autenticado
  async function loadData() {
    try {
      const [m, b] = await Promise.all([
        getDashboardMetrics(),
        getBookings(),
      ]);
      setMetrics(m);
      setBookings(b);
    } catch (err) {
      console.error("Erro ao carregar dados do backend:", err);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      setAuthed(true);
      loadData();
    }
    setReady(true);
  }, [authed]);

  async function handleStatusChange(id: string, status: Booking["status"]) {
    try {
      await updateBookingStatus(id, status);
      await loadData();
    } catch (err) {
      alert("Não foi possível atualizar o status do agendamento.");
    }
  }

  if (!ready) return <div className="min-h-[60vh]" />;
  if (!authed) return <LoginScreen onSuccess={() => setAuthed(true)} />;

  return (
    <div className="mx-auto max-w-7xl px-6 py-14">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-primary">Painel privado</div>
          <h1 className="mt-3 font-display text-4xl text-foreground md:text-5xl">Gerenciamento do estúdio</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Solicitações de agendamento, faturamento e catálogo.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { localStorage.removeItem(TOKEN_KEY); setAuthed(false); }}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-[11px] uppercase tracking-[0.2em] text-primary-foreground"
          >
            <LogOut className="size-4" /> Sair
          </button>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap gap-2 border-b border-border pb-4">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-5 py-2.5 text-[11px] uppercase tracking-[0.2em] transition-colors ${
              tab === t ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-10">
        {tab === "Visão geral" && (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon={Wallet}
                label="Faturamento Total"
                value={brl(metrics?.revenue.total || 0)}
                hint={`${metrics?.revenue.completedCount || 0} atendimentos concluídos`}
              />
              <StatCard
                icon={Clock}
                label="Agendamentos Pendentes"
                value={String(metrics?.bookings.pending || 0)}
                hint="Aguardando confirmação"
              />
              <StatCard
                icon={CalendarDays}
                label="Confirmados"
                value={String(metrics?.bookings.confirmed || 0)}
                hint="Agendamentos ativos"
              />
              <StatCard
                icon={TrendingUp}
                label="Total de Solicitações"
                value={String(metrics?.bookings.total || 0)}
                hint="Histórico do estúdio"
              />
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
              <div className="rounded-2xl border border-border bg-card p-7">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                  <Users className="size-4 text-primary" /> Próximas solicitações
                </div>
                <div className="mt-6 space-y-4">
                  {bookings
                    .filter((b) => b.status === "pendente" || b.status === "confirmado")
                    .sort((a, b) => (a.date > b.date ? 1 : -1))
                    .slice(0, 5)
                    .map((b) => (
                      <div key={b.id} className="flex items-center justify-between gap-3 border-b border-border/60 pb-3 last:border-0">
                        <div>
                          <div className="text-sm text-foreground">{b.name}</div>
                          <div className="text-xs text-muted-foreground">{b.item} · {fmtDate(b.date)} {b.time}</div>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.15em] ${STATUS_STYLES[b.status]}`}>
                          {STATUS_LABEL[b.status]}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </>
        )}

        {tab === "Agendamentos" && (
          <BookingsPanel
            bookings={bookings}
            onStatus={handleStatusChange}
          />
        )}

        {tab === "Serviços" && (
          <ListingsPanel
            title="Serviços do estúdio"
            items={listingsState.services}
            onChange={(services) => setListingsState((s) => ({ ...s, services }))}
          />
        )}

        {tab === "Cursos" && (
          <ListingsPanel
            title="Cursos"
            items={listingsState.courses}
            onChange={(courses) => setListingsState((s) => ({ ...s, courses }))}
          />
        )}
      </div>
    </div>
  );
}