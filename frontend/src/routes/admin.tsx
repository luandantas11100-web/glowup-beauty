import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays, LogOut, Lock, TrendingUp, Wallet, Clock, Users,
  Pencil, Check, X, Trash2, Plus, Upload, Loader2,
} from "lucide-react";
import { loginRequest } from "@/services/auth";
import { getBookings, updateBookingStatus, type Booking } from "@/services/booking";
import { getDashboardMetrics, type DashboardMetrics } from "@/services/dashboard";
import { getServices, createService, updateService, deleteService } from "@/services/service";
import { getCourses, createCourse, updateCourse, deleteCourse } from "@/services/course";
import { type Listing, brl } from "@/lib/admin-data";

const TOKEN_KEY = "hg-admin-token";
const FALLBACK_TOKEN_KEY = "@glowup:token";
const API_BASE_URL = "http://localhost:3333";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Painel da Proprietária — Helena Gabriela" },
      { name: "description", content: "Área restrita de gerenciamento do estúdio Helena Gabriela." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

function resolveImageUrl(url: string) {
  if (!url) return "/placeholder.jpg";
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  return `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

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
      if (data.token) {
        sessionStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(FALLBACK_TOKEN_KEY, data.token);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || "E-mail ou senha incorretos.");
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
          placeholder="admin@helenagabriela.com.br"
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
  pendente: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30",
  confirmado: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30",
  concluido: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30",
  cancelado: "bg-rose-500/15 text-rose-700 dark:text-rose-400 line-through border border-rose-500/30",
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
  onStatus: (id: string, status: Booking["status"]) => Promise<void>;
}) {
  const [filter, setFilter] = useState<"todos" | Booking["status"]>("todos");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const list = useMemo(
    () =>
      [...bookings]
        .filter((b) => filter === "todos" || b.status === filter)
        .sort((a, b) => (a.date < b.date ? 1 : -1)),
    [bookings, filter],
  );

  const handleStatusSelect = async (id: string, newStatus: Booking["status"]) => {
    setUpdatingId(id);
    try {
      await onStatus(id, newStatus);
    } finally {
      setUpdatingId(null);
    }
  };

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
              <div className="text-foreground font-medium">{b.name}</div>
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
            <div className="text-foreground font-semibold">{brl(b.value ?? 0)}</div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex items-center">
                <select
                  disabled={updatingId === b.id}
                  value={b.status}
                  onChange={(e) => handleStatusSelect(b.id, e.target.value as Booking["status"])}
                  className={`rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] outline-none cursor-pointer transition-all ${
                    STATUS_STYLES[b.status]
                  } ${updatingId === b.id ? "opacity-50 pointer-events-none" : ""}`}
                >
                  {(["pendente", "confirmado", "concluido", "cancelado"] as const).map((s) => (
                    <option key={s} value={s} className="bg-background text-foreground">
                      {STATUS_LABEL[s]}
                    </option>
                  ))}
                </select>
                {updatingId === b.id && (
                  <Loader2 className="ml-2 size-3 animate-spin text-primary" />
                )}
              </div>
              <a
                href={`https://wa.me/55${b.phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-primary hover:underline ml-1"
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
}: {
  item: Listing;
  onSave: (l: Listing, file?: File) => Promise<void>;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<Listing>(item);
  const [previewImage, setPreviewImage] = useState<string>(resolveImageUrl(item.image));
  const [selectedFile, setSelectedFile] = useState<File | undefined>();
  const [rawItems, setRawItems] = useState(item.items ? item.items.join("\n") : "");
  const [saving, setSaving] = useState(false);

  function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => setPreviewImage(String(reader.result));
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    if (!draft.title || !draft.price) {
      alert("Título e Preço são obrigatórios.");
      return;
    }
    if (!item.id && !selectedFile) {
      alert("Selecione uma imagem de capa.");
      return;
    }

    setSaving(true);
    try {
      const parsedItems = rawItems
        .split("\n")
        .map((i) => i.trim())
        .filter(Boolean);

      await onSave({ ...draft, items: parsedItems }, selectedFile);
    } catch (err: any) {
      alert(err.response?.data?.error || "Erro ao salvar alterações.");
    } finally {
      setSaving(false);
    }
  }

  const field = "mt-2 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary";
  const label = "text-[10px] uppercase tracking-[0.2em] text-muted-foreground";

  return (
    <div className="rounded-2xl border border-primary/40 bg-card p-6">
      <div className="grid gap-5 md:grid-cols-[220px_1fr]">
        <div>
          <img src={previewImage} alt={draft.title} className="aspect-[4/3] w-full rounded-xl object-cover bg-secondary" />
          <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-full border border-border px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-foreground/80 hover:text-foreground">
            <Upload className="size-3.5" /> Enviar foto
            <input type="file" accept="image/*" className="hidden" onChange={pickFile} />
          </label>
        </div>

        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <span className={label}>Título</span>
              <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className={field} required />
            </div>
            <div>
              <span className={label}>Etiqueta</span>
              <input value={draft.tag} onChange={(e) => setDraft({ ...draft, tag: e.target.value })} className={field} />
            </div>
            <div>
              <span className={label}>Duração</span>
              <input value={draft.duration} onChange={(e) => setDraft({ ...draft, duration: e.target.value })} className={field} placeholder="Ex: 1h30" />
            </div>
            <div>
              <span className={label}>Valor (R$)</span>
              <input
                type="number"
                value={draft.price}
                onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })}
                className={field}
                required
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
              value={rawItems}
              onChange={(e) => setRawItems(e.target.value)}
              className={field}
            />
          </div>
          {item.id && (
            <label className="flex items-center gap-3 text-sm text-foreground/80">
              <input
                type="checkbox"
                checked={draft.active}
                onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
                className="size-4 accent-[hsl(var(--primary))]"
              />
              Visível no site
            </label>
          )}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-[11px] uppercase tracking-[0.2em] text-primary-foreground disabled:opacity-50"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />} Salvar
            </button>
            <button
              onClick={onCancel}
              disabled={saving}
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
  title, items, onSave, onDelete,
}: {
  title: string;
  items: Listing[];
  onSave: (item: Listing, file?: File) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const newItemTemplate: Listing = {
    id: "",
    title: "",
    tag: "",
    duration: "",
    price: 0,
    desc: "",
    image: "",
    items: [],
    active: true,
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-2xl text-foreground">{title}</h2>
        {!creating && (
          <button
            onClick={() => { setCreating(true); setEditingId(null); }}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-[11px] uppercase tracking-[0.2em] text-primary-foreground"
          >
            <Plus className="size-4" /> Adicionar
          </button>
        )}
      </div>

      <div className="mt-6 space-y-4">
        {creating && (
          <ListingEditor
            item={newItemTemplate}
            onCancel={() => setCreating(false)}
            onSave={async (draft, file) => {
              await onSave(draft, file);
              setCreating(false);
            }}
          />
        )}

        {items.map((item) =>
          editingId === item.id ? (
            <ListingEditor
              key={item.id}
              item={item}
              onCancel={() => setEditingId(null)}
              onSave={async (draft, file) => {
                await onSave(draft, file);
                setEditingId(null);
              }}
            />
          ) : (
            <div key={item.id} className="flex flex-wrap items-center gap-5 rounded-2xl border border-border bg-card p-5">
              <img src={resolveImageUrl(item.image)} alt={item.title} className="size-20 shrink-0 rounded-xl object-cover bg-secondary" />
              <div className="min-w-[200px] flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-display text-xl text-foreground">{item.title}</span>
                  {item.tag && (
                    <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                      {item.tag}
                    </span>
                  )}
                  {!item.active && (
                    <span className="rounded-full bg-muted px-[10px] py-0.5 text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                      Oculto
                    </span>
                  )}
                </div>
                <p className="mt-1 max-w-xl text-sm text-muted-foreground">{item.desc}</p>
                <div className="mt-1 text-xs text-muted-foreground">{item.duration} · {item.items?.length || 0} itens</div>
              </div>
              <div className="font-display text-2xl text-primary">{brl(item.price)}</div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setEditingId(item.id); setCreating(false); }}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-foreground/80 hover:text-foreground"
                >
                  <Pencil className="size-3.5" /> Editar
                </button>
                <button
                  onClick={async () => {
                    if (confirm(`Deseja remover "${item.title}"?`)) {
                      await onDelete(item.id);
                    }
                  }}
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
  const [services, setServices] = useState<Listing[]>([]);
  const [courses, setCourses] = useState<Listing[]>([]);

  // Recalculo dos dados no próprio frontend se as métricas da API falharem/estiverem vazias
  const derivedMetrics = useMemo(() => {
    const completedBookings = bookings.filter((b) => b.status === "concluido");
    const pendingBookings = bookings.filter((b) => b.status === "pendente");
    const confirmedBookings = bookings.filter((b) => b.status === "confirmado");

    const calculatedRevenue = completedBookings.reduce(
      (acc, curr) => acc + (curr.value ?? 0),
      0
    );

    return {
      revenueTotal: metrics?.revenue?.total ?? calculatedRevenue,
      completedCount: metrics?.revenue?.completedCount ?? completedBookings.length,
      pendingCount: metrics?.bookings?.pending ?? pendingBookings.length,
      totalCount: metrics?.bookings?.total ?? bookings.length,
      confirmedCount: metrics?.bookings?.confirmed ?? confirmedBookings.length,
    };
  }, [bookings, metrics]);

  async function loadData() {
    try {
      const [mRes, bRes, sRes, cRes] = await Promise.allSettled([
        getDashboardMetrics(),
        getBookings(),
        getServices(),
        getCourses(),
      ]);

      if (mRes.status === "fulfilled") setMetrics(mRes.value);
      else console.warn("Erro ao carregar métricas do backend:", mRes.reason);

      if (bRes.status === "fulfilled") setBookings(bRes.value);
      else console.warn("Erro ao carregar agendamentos:", bRes.reason);

      if (sRes.status === "fulfilled") setServices(sRes.value);
      else console.error("Erro ao carregar serviços:", sRes.reason);

      if (cRes.status === "fulfilled") setCourses(cRes.value);
      else console.error("Erro ao carregar cursos:", cRes.reason);
    } catch (err) {
      console.error("Erro geral no loadData:", err);
    }
  }

  useEffect(() => {
    const token = sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(FALLBACK_TOKEN_KEY);
    if (token) {
      setAuthed(true);
      loadData();
    }
    setReady(true);
  }, [authed]);

  async function handleStatusChange(id: string, status: Booking["status"]) {
    // 1. Atualização Otimista no estado local (troca na hora a cor, status e os cards de faturamento/métricas)
    setBookings((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );

    try {
      // 2. Persiste a alteração no banco de dados via API
      await updateBookingStatus(id, status);
      
      // 3. Tenta recarregar as métricas do backend em segundo plano
      try {
        const updatedMetrics = await getDashboardMetrics();
        setMetrics(updatedMetrics);
      } catch (metricErr) {
        console.warn("Status atualizado no banco, mas a rota de métricas falhou. Usando cálculo local.", metricErr);
      }
    } catch (err) {
      alert("Não foi possível atualizar o status do agendamento no banco de dados.");
      await loadData(); // Reverte alterações locais APENAS se a chamada principal de atualização falhar
    }
  }

  /* ---------------- Service Handlers ---------------- */

  async function handleSaveService(item: Listing, file?: File) {
    if (item.id) {
      await updateService(item.id, item, file);
    } else {
      if (!file) throw new Error("Imagem obrigatória.");
      await createService(item, file);
    }
    await loadData();
  }

  async function handleDeleteService(id: string) {
    await deleteService(id);
    await loadData();
  }

  /* ---------------- Course Handlers ---------------- */

  async function handleSaveCourse(item: Listing, file?: File) {
    if (item.id) {
      await updateCourse(item.id, item, file);
    } else {
      if (!file) throw new Error("Imagem obrigatória.");
      await createCourse(item, file);
    }
    await loadData();
  }

  async function handleDeleteCourse(id: string) {
    await deleteCourse(id);
    await loadData();
  }

  function handleLogout() {
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(FALLBACK_TOKEN_KEY);
    setAuthed(false);
  }

  if (!ready) return null;
  if (!authed) return <LoginScreen onSuccess={() => setAuthed(true)} />;

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-primary">Estúdio Helena Gabriela</span>
          <h1 className="font-display text-4xl text-foreground">Painel da Proprietária</h1>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
        >
          <LogOut className="size-4" /> Sair
        </button>
      </div>

      {/* Navegação de Abas */}
      <div className="mt-8 flex border-b border-border">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`border-b-2 px-6 py-3 text-xs uppercase tracking-[0.2em] transition-colors ${
              tab === t
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === "Visão geral" && (
          <div className="space-y-8">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard
                icon={Wallet}
                label="Faturamento Realizado"
                value={brl(derivedMetrics.revenueTotal)}
                hint={`${derivedMetrics.completedCount} agendamentos concluídos`}
              />
              <StatCard
                icon={Clock}
                label="Agendamentos Pendentes"
                value={String(derivedMetrics.pendingCount)}
                hint="Aguardando confirmação ou atendimento"
              />
              <StatCard
                icon={Users}
                label="Total de Solicitações"
                value={String(derivedMetrics.totalCount)}
                hint={`${derivedMetrics.confirmedCount} confirmados`}
              />
            </div>

            <div>
              <h2 className="mb-4 font-display text-2xl text-foreground">Últimos Agendamentos</h2>
              <BookingsPanel bookings={bookings.slice(0, 5)} onStatus={handleStatusChange} />
            </div>
          </div>
        )}

        {tab === "Agendamentos" && (
          <BookingsPanel bookings={bookings} onStatus={handleStatusChange} />
        )}

        {tab === "Serviços" && (
          <ListingsPanel
            title="Catálogo de Serviços"
            items={services}
            onSave={handleSaveService}
            onDelete={handleDeleteService}
          />
        )}

        {tab === "Cursos" && (
          <ListingsPanel
            title="Catálogo de Cursos"
            items={courses}
            onSave={handleSaveCourse}
            onDelete={handleDeleteCourse}
          />
        )}
      </div>
    </div>
  );
}