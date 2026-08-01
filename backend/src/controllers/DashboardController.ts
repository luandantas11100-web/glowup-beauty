import type { Request, Response } from "express";
import { DashboardService } from "../services/DashboardService";

export class DashboardController {
  async index(req: Request, res: Response): Promise<Response> {
    try {
      const dashboardService = new DashboardService();
      const metrics = await dashboardService.getMetrics();
      return res.json(metrics);
    } catch (error) {
      console.error("Erro ao gerar métricas do dashboard:", error);
      return res.status(500).json({ error: "Erro ao buscar dados do dashboard." });
    }
  }
}