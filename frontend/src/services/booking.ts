import { api } from "../lib/api";

export interface CreateBookingData {
  name: string;
  phone: string;
  item: string;
  kind?: "servico" | "curso";
  date: string;
  time: string;
  value?: number;
  note?: string;
}

export async function createBooking(data: CreateBookingData) {
  const response = await api.post("/bookings", data);
  return response.data;
}

export async function getBookings() {
  const response = await api.get("/bookings");
  return response.data;
}

export async function updateBookingStatus(id: string, status: string) {
  const response = await api.patch(`/bookings/${id}/status`, { status });
  return response.data;
}