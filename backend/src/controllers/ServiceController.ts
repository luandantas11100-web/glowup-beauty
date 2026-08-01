import type { Request, Response } from "express";
import { prisma } from "../utils/prisma";

export class ServiceController {
  // Listar todos os serviços
  async index(req: Request, res: Response) {
    try {
      const services = await prisma.service.findMany({
        orderBy: { createdAt: "desc" },
      });
      return res.json(services);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao buscar serviços." });
    }
  }

  // Criar novo serviço com foto
  async create(req: Request, res: Response) {
    try {
      const { title, tag, duration, price, desc, items } = req.body;
      const file = req.file;

      if (!title || !price || !file) {
        return res.status(400).json({ error: "Título, preço e imagem são obrigatórios." });
      }

      const itemsArray = typeof items === "string" 
        ? items.split(",").map((item) => item.trim()) 
        : items || [];

      const imagePath = `/uploads/${file.filename}`;

      const service = await prisma.service.create({
        data: {
          title,
          tag: tag || "",
          duration: duration || "",
          price: Number(price),
          desc: desc || "",
          image: imagePath,
          items: itemsArray,
          active: true,
        },
      });

      return res.status(201).json(service);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao criar serviço." });
    }
  }

  // Excluir serviço
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.service.delete({ where: { id } });
      return res.status(204).send();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao deletar serviço." });
    }
  }
}