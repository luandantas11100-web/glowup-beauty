import makeupImg from "@/assets/makeup.jpg";
import lashesImg from "@/assets/lashes.jpg";
import skinImg from "@/assets/skin.jpg";
import nailsImg from "@/assets/nails.jpg";
import courseImg from "@/assets/course.jpg";

export type Listing = {
  id: string;
  title: string;
  tag: string;
  duration: string;
  price: number;
  desc: string;
  image: string;
  items: string[];
  active: boolean;
  availableDays?: number[]; // 0 = Dom, 1 = Seg, ..., 6 = Sáb
  availableSlots?: string[]; // Ex: ["09:00", "10:30"]
};

export type Booking = {
  id: string;
  name: string;
  phone: string;
  item: string;
  kind: "servico" | "curso";
  date: string; // ISO yyyy-mm-dd
  time: string;
  value: number;
  status: "pendente" | "confirmado" | "concluido" | "cancelado";
  note?: string;
};

const DEFAULT_SLOTS = ["09:00", "10:30", "13:00", "14:30", "16:00", "17:30"];
const DEFAULT_DAYS = [1, 2, 3, 4, 5, 6]; // Segunda a Sábado

export const DEFAULT_SERVICES: Listing[] = [
  {
    id: "maquiagem",
    title: "Maquiagem",
    tag: "Social & Noivas",
    duration: "1h30",
    price: 250,
    desc: "Maquiagem sob medida para eventos, noivas e ensaios, com produtos de alta fixação.",
    image: String(makeupImg),
    items: ["Preparação de pele", "Maquiagem social", "Noivas e madrinhas", "Teste de make"],
    active: true,
    availableDays: DEFAULT_DAYS,
    availableSlots: DEFAULT_SLOTS,
  },
  {
    id: "cilios",
    title: "Cílios",
    tag: "Extensão & Lifting",
    duration: "2h",
    price: 220,
    desc: "Extensão fio a fio, volume brasileiro e lifting para um olhar marcante e natural.",
    image: String(lashesImg),
    items: ["Fio a fio clássico", "Volume brasileiro", "Lash lifting", "Manutenção"],
    active: true,
    availableDays: DEFAULT_DAYS,
    availableSlots: DEFAULT_SLOTS,
  },
  {
    id: "limpeza-de-pele",
    title: "Limpeza de Pele",
    tag: "Skincare",
    duration: "1h20",
    price: 190,
    desc: "Protocolo completo de higienização, extração e hidratação para uma pele saudável.",
    image: String(skinImg),
    items: ["Higienização profunda", "Extração", "Alta frequência", "Máscara calmante"],
    active: true,
    availableDays: DEFAULT_DAYS,
    availableSlots: DEFAULT_SLOTS,
  },
  {
    id: "unhas",
    title: "Unhas",
    tag: "Manicure & Gel",
    duration: "1h",
    price: 120,
    desc: "Manicure, esmaltação em gel e alongamentos com acabamento impecável.",
    image: String(nailsImg),
    items: ["Manicure clássica", "Esmaltação em gel", "Alongamento em fibra", "Nail art"],
    active: true,
    availableDays: DEFAULT_DAYS,
    availableSlots: DEFAULT_SLOTS,
  },
];

export const DEFAULT_COURSES: Listing[] = [
  {
    id: "automaquiagem",
    title: "Automaquiagem",
    tag: "Iniciante",
    duration: "8 horas · 2 encontros",
    price: 450,
    desc: "Aprenda técnicas para se maquiar todos os dias, valorizando seus traços.",
    image: String(courseImg),
    items: ["Preparação de pele", "Base e contorno", "Olhos e cílios", "Boca"],
    active: true,
    availableDays: DEFAULT_DAYS,
    availableSlots: DEFAULT_SLOTS,
  },
  {
    id: "profissionalizante",
    title: "Profissionalizante de Maquiagem",
    tag: "Profissional",
    duration: "60 horas · 8 semanas",
    price: 2400,
    desc: "Formação completa para atuar como maquiadora profissional, com prática em modelos.",
    image: String(makeupImg),
    items: ["Fundamentos", "Noivas e formaturas", "Editorial", "Empreendedorismo", "Certificado"],
    active: true,
    availableDays: DEFAULT_DAYS,
    availableSlots: DEFAULT_SLOTS,
  },
  {
    id: "curso-unhas",
    title: "Curso de Unhas",
    tag: "Profissional",
    duration: "40 horas · 6 semanas",
    price: 1600,
    desc: "Da manicure tradicional ao alongamento e esmaltação em gel.",
    image: String(nailsImg),
    items: ["Biossegurança", "Manicure clássica", "Gel", "Alongamento", "Nail art"],
    active: true,
    availableDays: DEFAULT_DAYS,
    availableSlots: DEFAULT_SLOTS,
  },
];

function iso(offsetDays: number) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export const DEFAULT_BOOKINGS: Booking[] = [
  { id: "b1", name: "Camila Ribeiro", phone: "(11) 98812-4410", item: "Maquiagem", kind: "servico", date: iso(1), time: "10:00", value: 250, status: "pendente", note: "Casamento à noite" },
  { id: "b2", name: "Juliana Alves", phone: "(11) 99640-2288", item: "Cílios", kind: "servico", date: iso(2), time: "14:00", value: 220, status: "pendente" },
  { id: "b3", name: "Marina Costa", phone: "(11) 97733-1090", item: "Curso de Unhas", kind: "curso", date: iso(4), time: "09:00", value: 1600, status: "confirmado" },
  { id: "b4", name: "Beatriz Lima", phone: "(11) 98123-7745", item: "Limpeza de Pele", kind: "servico", date: iso(-1), time: "16:00", value: 190, status: "concluido" },
  { id: "b5", name: "Fernanda Souza", phone: "(11) 99001-3321", item: "Unhas", kind: "servico", date: iso(-3), time: "11:00", value: 120, status: "concluido" },
  { id: "b6", name: "Larissa Prado", phone: "(11) 98555-6612", item: "Automaquiagem", kind: "curso", date: iso(-6), time: "13:00", value: 450, status: "concluido" },
  { id: "b7", name: "Patrícia Nunes", phone: "(11) 97444-0098", item: "Maquiagem", kind: "servico", date: iso(-12), time: "15:00", value: 250, status: "concluido" },
  { id: "b8", name: "Aline Martins", phone: "(11) 96888-2211", item: "Cílios", kind: "servico", date: iso(-20), time: "10:30", value: 220, status: "concluido" },
  { id: "b9", name: "Renata Dias", phone: "(11) 98222-9087", item: "Profissionalizante de Maquiagem", kind: "curso", date: iso(-45), time: "09:00", value: 2400, status: "concluido" },
  { id: "b10", name: "Sofia Andrade", phone: "(11) 99777-4512", item: "Limpeza de Pele", kind: "servico", date: iso(-70), time: "17:00", value: 190, status: "concluido" },
  { id: "b11", name: "Helo Vieira", phone: "(11) 98311-7766", item: "Unhas", kind: "servico", date: iso(-120), time: "12:00", value: 120, status: "concluido" },
  { id: "b12", name: "Tatiane Rocha", phone: "(11) 97155-3344", item: "Maquiagem", kind: "servico", date: iso(-200), time: "18:00", value: 250, status: "cancelado" },
];

const KEY = "hg-admin-state-v1";

export type AdminState = {
  services: Listing[];
  courses: Listing[];
  bookings: Booking[];
};

export const DEFAULT_STATE: AdminState = {
  services: DEFAULT_SERVICES,
  courses: DEFAULT_COURSES,
  bookings: DEFAULT_BOOKINGS,
};

export function loadState(): AdminState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<AdminState>;
    return {
      services: parsed.services ?? DEFAULT_SERVICES,
      courses: parsed.courses ?? DEFAULT_COURSES,
      bookings: parsed.bookings ?? DEFAULT_BOOKINGS,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveState(state: AdminState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(state));
}

export function clearState() {
  if (typeof window !== "undefined") window.localStorage.removeItem(KEY);
}

export const brl = (v: number) =>
  (v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

function daysAgo(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return (Date.now() - d.getTime()) / 86400000;
}

export function revenue(bookings: Booking[]) {
  const paid = bookings.filter((b) => b.status === "concluido");
  const within = (n: number) => paid.filter((b) => daysAgo(b.date) >= 0 && daysAgo(b.date) <= n);
  const sum = (list: Booking[]) => list.reduce((t, b) => t + b.value, 0);
  return {
    week: sum(within(7)),
    month: sum(within(30)),
    year: sum(within(365)),
    weekCount: within(7).length,
    monthCount: within(30).length,
    yearCount: within(365).length,
    pending: bookings.filter((b) => b.status === "pendente").length,
    upcoming: sum(bookings.filter((b) => b.status !== "cancelado" && daysAgo(b.date) < 0)),
  };
}

export function monthlySeries(bookings: Booking[]) {
  const now = new Date();
  const out: { label: string; total: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const ref = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const total = bookings
      .filter((b) => b.status === "concluido")
      .filter((b) => {
        const d = new Date(b.date + "T00:00:00");
        return d.getMonth() === ref.getMonth() && d.getFullYear() === ref.getFullYear();
      })
      .reduce((t, b) => t + b.value, 0);
    out.push({ label: ref.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""), total });
  }
  return out;
}