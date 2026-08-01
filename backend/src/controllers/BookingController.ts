import type { Request, Response } from "express";
import { prisma } from "../utils/prisma";

export class BookingController {
  async create(req: Request, res: Response) {
    try {
      const { name, phone, item, kind, date, time, value, note } = req.body;

      if (!name || !phone || !item || !date || !time) {
        return res.status(400).json({ error: "Preencha todos os campos obrigatórios." });
      }

      const booking = await prisma.booking.create({
        data: {
          name,
          phone,
          item,
          kind: kind || "servico",
          date: new Date(date),
          time,
          value: Number(value) || 0,
          status: "pendente",
          note: note || "",
        },
      });

      return res.status(201).json(booking);
    } catch (error) {
      console.error("Erro ao criar agendamento:", error);
      return res.status(500).json({ error: "Erro interno ao processar agendamento." });
    }
  }

  async index(req: Request, res: Response) {
    try {
      const bookings = await prisma.booking.findMany({
        orderBy: { date: "desc" },
      });
      return res.json(bookings);
    } catch (error) {
      console.error("Erro ao listar agendamentos:", error);
      return res.status(500).json({ error: "Erro interno ao buscar agendamentos." });
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!["pendente", "confirmado", "concluido", "cancelado"].includes(status)) {
        return res.status(400).json({ error: "Status inválido." });
      }

      const booking = await prisma.booking.update({
        where: { id },
        data: { status },
      });

      return res.json(booking);
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      return res.status(500).json({ error: "Erro ao atualizar agendamento." });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.booking.delete({ where: { id } });
      return res.status(204).send();
    } catch (error) {
      console.error("Erro ao deletar agendamento:", error);
      return res.status(500).json({ error: "Erro ao remover agendamento." });
    }
  }
}