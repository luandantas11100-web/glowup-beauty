import { prisma } from "../utils/prisma";

export class DashboardService {
  async getMetrics() {
    // 1. Todos os agendamentos concluídos
    const completedBookings = await prisma.booking.findMany({
      where: { status: "concluido" },
    });

    // 2. Agendamentos pendentes / confirmados
    const pendingBookingsCount = await prisma.booking.count({
      where: { status: "pendente" },
    });

    const confirmedBookingsCount = await prisma.booking.count({
      where: { status: "confirmado" },
    });

    // 3. Faturamento Total Acumulado
    const totalRevenue = completedBookings.reduce((sum, b) => sum + b.value, 0);

    // 4. Totais ativos de Serviços e Cursos
    const activeServices = await prisma.service.count({ where: { active: true } });
    const activeCourses = await prisma.course.count({ where: { active: true } });

    return {
      revenue: {
        total: totalRevenue,
        completedCount: completedBookings.length,
      },
      bookings: {
        pending: pendingBookingsCount,
        confirmed: confirmedBookingsCount,
        total: completedBookings.length + pendingBookingsCount + confirmedBookingsCount,
      },
      catalog: {
        services: activeServices,
        courses: activeCourses,
      },
    };
  }
}