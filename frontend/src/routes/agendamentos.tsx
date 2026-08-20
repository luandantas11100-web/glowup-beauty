import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Calendar as CalendarIcon, Clock, Check, MessageCircle, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { createBooking } from "@/services/booking";
import api from "@/lib/api";

export const Route = createFileRoute("/agendamentos")({
  head: () => ({
    meta: [
      { title: "Agendamentos — Helena Gabriela" },
      { name: "description", content: "Agende seu horário no estúdio Helena Gabriela." },
      { property: "og:title", content: "Agendamentos — Helena Gabriela" },
      { property: "og:description", content: "Escolha o serviço, a data e o horário." },
    ],
  }),
  component: AgendamentosPage,
});

interface BookingOption {
  id: string;
  name: string;
  price?: number;
  duration?: string;
  kind: "servico" | "curso";
  availableDays?: number[];
  availableSlots?: string[];
}

const DEFAULT_SLOTS = ["09:00", "10:30", "13:00", "14:30", "16:00", "17:30"];
const DEFAULT_DAYS = [1, 2, 3, 4, 5, 6]; // Seg a Sáb

const FALLBACK_SERVICES: BookingOption[] = [
  { id: "f1", name: "Maquiagem social", price: 80, kind: "servico", availableDays: DEFAULT_DAYS, availableSlots: DEFAULT_SLOTS },
  { id: "f2", name: "Maquiagem noiva", price: 150, kind: "servico", availableDays: DEFAULT_DAYS, availableSlots: DEFAULT_SLOTS },
  { id: "f3", name: "Cílios — fio a fio", price: 90, kind: "servico", availableDays: DEFAULT_DAYS, availableSlots: DEFAULT_SLOTS },
  { id: "f4", name: "Cílios — volume", price: 110, kind: "servico", availableDays: DEFAULT_DAYS, availableSlots: DEFAULT_SLOTS },
  { id: "f5", name: "Limpeza de pele", price: 100, kind: "servico", availableDays: DEFAULT_DAYS, availableSlots: DEFAULT_SLOTS },
  { id: "f6", name: "Manicure / esmaltação em gel", price: 50, kind: "servico", availableDays: DEFAULT_DAYS, availableSlots: DEFAULT_SLOTS },
  { id: "f7", name: "Consulta sobre cursos", price: 0, kind: "curso", availableDays: DEFAULT_DAYS, availableSlots: DEFAULT_SLOTS },
];

function parseJSONField<T>(val: any, fallback: T): T {
  if (!val) return fallback;
  if (Array.isArray(val)) return val as unknown as T;
  if (typeof val === "string") {
    try {
      return JSON.parse(val) as T;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

function AgendamentosPage() {
  const search = Route.useSearch<{ item?: string; kind?: string }>();

  const [itemsList, setItemsList] = useState<BookingOption[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);

  const [service, setService] = useState<string>("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [slot, setSlot] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchServicesAndCourses() {
      try {
        setLoadingItems(true);

        const [servicesRes, coursesRes] = await Promise.all([
          api.get("/services").catch(() => ({ data: [] })),
          api.get("/courses").catch(() => ({ data: [] })),
        ]);

        const servicesData = Array.isArray(servicesRes.data) ? servicesRes.data : [];
        const coursesData = Array.isArray(coursesRes.data) ? coursesRes.data : [];

        const mappedServices: BookingOption[] = servicesData.map((s: any) => ({
          id: s.id,
          name: s.name || s.title || "Serviço sem nome",
          price: s.price ?? 80,
          duration: s.duration,
          kind: "servico",
          availableDays: parseJSONField<number[]>(s.availableDays, DEFAULT_DAYS),
          availableSlots: parseJSONField<string[]>(s.availableHours || s.availableSlots, DEFAULT_SLOTS),
        }));

        const mappedCourses: BookingOption[] = coursesData.map((c: any) => ({
          id: c.id,
          name: c.name || c.title || "Curso sem nome",
          price: c.price ?? 100,
          duration: c.duration,
          kind: "curso",
          availableDays: parseJSONField<number[]>(c.availableDays, DEFAULT_DAYS),
          availableSlots: parseJSONField<string[]>(c.availableHours || c.availableSlots, DEFAULT_SLOTS),
        }));

        const combinedList = [...mappedServices, ...mappedCourses];

        if (combinedList.length > 0) {
          setItemsList(combinedList);

          const matchedItem = search?.item
            ? combinedList.find((i) => i.name.toLowerCase() === search.item?.toLowerCase())
            : undefined;

          setService(matchedItem ? matchedItem.name : combinedList[0].name);
        } else {
          setItemsList(FALLBACK_SERVICES);
          setService(FALLBACK_SERVICES[0].name);
        }
      } catch (error) {
        console.error("Erro ao carregar dados do banco:", error);
        setItemsList(FALLBACK_SERVICES);
        setService(FALLBACK_SERVICES[0].name);
      } finally {
        setLoadingItems(false);
      }
    }

    fetchServicesAndCourses();
  }, [search?.item]);

  // Item selecionado
  const selectedItemObj = useMemo(() => {
    return itemsList.find((s) => s.name === service);
  }, [itemsList, service]);

  // Lista de horários disponíveis para o serviço selecionado
  const availableSlots = useMemo(() => {
    return selectedItemObj?.availableSlots?.length
      ? selectedItemObj.availableSlots
      : DEFAULT_SLOTS;
  }, [selectedItemObj]);

  // Quando trocar o serviço, desmarca o slot e valida se a data atual ainda é permitida
  const handleSelectService = (newServiceName: string) => {
    setService(newServiceName);
    setSlot(null);

    const newObj = itemsList.find((s) => s.name === newServiceName);
    const allowedDays = newObj?.availableDays?.length ? newObj.availableDays : DEFAULT_DAYS;

    if (date && !allowedDays.includes(date.getDay())) {
      setDate(undefined);
    }
  };

  const dateLabel = useMemo(
    () => date?.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" }),
    [date],
  );

  const formattedDateForBackend = useMemo(() => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, [date]);

  const canSubmit = service && date && slot && name && phone && !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || !date || !slot) return;

    setLoading(true);

    try {
      await createBooking({
        name,
        phone,
        item: service,
        kind: selectedItemObj?.kind || (service.toLowerCase().includes("curso") ? "curso" : "servico"),
        date: formattedDateForBackend,
        time: slot,
        value: selectedItemObj?.price ?? 80,
        note: notes,
      });

      const messageText = `Olá Helena! Gostaria de agendar:

• Opção: ${service}
• Data: ${dateLabel}
• Horário: ${slot}
• Nome: ${name}
• Telefone: ${phone}${notes ? `\n• Observações: ${notes}` : ""}`;

const encodedMsg = encodeURIComponent(messageText);
const phoneNum = "557998580613";

// Detecta se é um dispositivo móvel (iOS / Android)
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

if (isMobile) {
  // Redireciona na mesma aba em dispositivos móveis (evita bloqueio de pop-up no Safari iOS)
  window.location.href = `https://api.whatsapp.com/send?phone=${phoneNum}&text=${encodedMsg}`;
} else {
  // Em computadores, abre em uma nova aba
  window.open(`https://web.whatsapp.com/send?phone=${phoneNum}&text=${encodedMsg}`, "_blank");
}
      setSent(true);
    } catch (error) {
      console.error("Erro ao registrar agendamento:", error);
      alert("Houve um erro ao enviar seu agendamento. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  // Função para determinar se uma data deve estar desabilitada no calendário
  const isDateDisabled = (d: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Datas passadas
    if (d < today) return true;

    // Filtro por dias de funcionamento configurados para o serviço/curso
    const allowedDays = selectedItemObj?.availableDays?.length
      ? selectedItemObj.availableDays
      : DEFAULT_DAYS;

    return !allowedDays.includes(d.getDay());
  };

  return (
    <>
      <section className="border-b border-border/60 bg-secondary/40">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
          <div className="text-xs uppercase tracking-[0.3em] text-primary">Agendamentos</div>
          <h1 className="mt-4 max-w-3xl font-display text-5xl text-foreground md:text-6xl">
            Reserve o seu momento.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Escolha o serviço ou curso, a data e o horário. A confirmação é feita rapidinho pelo WhatsApp.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        {sent ? (
          <div className="mx-auto max-w-2xl rounded-3xl border border-border bg-card p-12 text-center shadow-[var(--shadow-soft)]">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Check className="size-8" />
            </div>
            <h2 className="mt-6 font-display text-3xl text-foreground">Solicitação enviada!</h2>
            <p className="mt-3 text-muted-foreground">
              Sua solicitação foi gravada e abrimos o WhatsApp com todos os detalhes. Assim que eu responder, seu horário estará confirmado.
            </p>
            <button
              onClick={() => {
                setSent(false);
                setSlot(null);
                setName("");
                setPhone("");
                setNotes("");
              }}
              className="mt-8 inline-flex items-center rounded-full border border-primary/30 px-6 py-3 text-xs uppercase tracking-[0.2em] text-foreground transition-colors hover:bg-primary/5"
            >
              Fazer novo agendamento
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
            <div className="space-y-8">
              <div className="rounded-3xl border border-border bg-card p-8 shadow-[var(--shadow-soft)]">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-primary">
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary/10">1</span>
                  Serviço ou Curso
                </div>

                {loadingItems ? (
                  <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin text-primary" /> Carregando opções...
                  </div>
                ) : (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {itemsList.map((item) => (
                      <button
                        key={item.id || item.name}
                        type="button"
                        onClick={() => handleSelectService(item.name)}
                        className={cn(
                          "rounded-full border px-4 py-2 text-sm transition-colors",
                          service === item.name
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-foreground/80 hover:border-primary/40",
                        )}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-border bg-card p-8 shadow-[var(--shadow-soft)]">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-primary">
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary/10">2</span>
                  Data
                </div>
                <div className="mt-5 flex justify-center">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={isDateDisabled}
                    className={cn("rounded-md pointer-events-auto")}
                  />
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-card p-8 shadow-[var(--shadow-soft)]">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-primary">
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary/10">3</span>
                  Horário
                </div>
                {!date ? (
                  <p className="mt-5 text-sm text-muted-foreground">Selecione uma data para ver os horários disponíveis.</p>
                ) : availableSlots.length === 0 ? (
                  <p className="mt-5 text-sm text-muted-foreground">Não há horários disponíveis para este serviço nesta data.</p>
                ) : (
                  <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-6">
                    {availableSlots.map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setSlot(h)}
                        className={cn(
                          "rounded-xl border py-3 text-sm transition-colors",
                          slot === h
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-foreground/80 hover:border-primary/40",
                        )}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <aside className="lg:sticky lg:top-28 lg:h-fit">
              <div className="rounded-3xl border border-border bg-gradient-to-br from-background to-secondary/50 p-8 shadow-[var(--shadow-elegant)]">
                <div className="text-xs uppercase tracking-[0.3em] text-primary">Resumo</div>
                <h3 className="mt-3 font-display text-3xl text-foreground">Seu agendamento</h3>

                <dl className="mt-6 space-y-4 border-y border-border/70 py-6 text-sm">
                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-muted-foreground">Opção</dt>
                    <dd className="text-right font-medium text-foreground">{service || "Nenhuma selecionada"}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt className="flex items-center gap-2 text-muted-foreground"><CalendarIcon className="size-3.5" /> Data</dt>
                    <dd className="text-right font-medium text-foreground">
                      {dateLabel ?? <span className="text-muted-foreground">—</span>}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt className="flex items-center gap-2 text-muted-foreground"><Clock className="size-3.5" /> Horário</dt>
                    <dd className="text-right font-medium text-foreground">
                      {slot ?? <span className="text-muted-foreground">—</span>}
                    </dd>
                  </div>
                </dl>

                <div className="mt-6 space-y-4">
                  <div>
                    <label className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Nome</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
                      placeholder="Como posso te chamar?"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">WhatsApp</label>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
                      placeholder="(11) 90000-0000"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Observações</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="mt-2 w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
                      placeholder="Alguma preferência ou detalhe?"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 text-xs uppercase tracking-[0.25em] text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-40"
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Enviando...
                    </>
                  ) : (
                    <>
                      <MessageCircle className="size-4" /> Confirmar pelo WhatsApp
                    </>
                  )}
                </button>
                <p className="mt-4 text-center text-xs text-muted-foreground">
                  Sua reserva é gravada e confirmada assim que eu responder no WhatsApp.
                </p>
              </div>
            </aside>
          </form>
        )}
      </section>
    </>
  );
}