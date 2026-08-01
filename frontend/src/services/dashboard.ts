import { api } from "../lib/api";

// Tipagem baseada nos dados retornados pelo DashboardService do seu backend
export interface DashboardMetrics {
  revenue: {
    total: number;
    completedCount: number;
  };
  bookings: {
    pending: number;
    confirmed: number;
    total: number;
  };
  catalog: {
    services: number;
    courses: number;
  };
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const response = await api.get("/dashboard/metrics");
  return response.data;
}

export default getDashboardMetrics;