// backend/src/controllers/ServiceController.ts
import type { Request, Response } from "express";
import { prisma } from "../utils/prisma";

export class ServiceController {
  async index(req: Request, res: Response) {
    try {
      const services = await prisma.service.findMany({
        orderBy: { createdAt: "desc" },
      });
      return res.json(services);
    } catch (error) {
      console.error("Erro index services:", error);
      return res.status(500).json({ error: "Erro ao buscar serviços." });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { title, tag, duration, price, desc, items } = req.body;
      const file = req.file;

      if (!title || !price || !file) {
        return res.status(400).json({ error: "Título, preço e imagem são obrigatórios." });
      }

      const itemsArray = typeof items === "string"
        ? items.split(",").map((item) => item.trim()).filter(Boolean)
        : Array.isArray(items) ? items : [];

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
      console.error("Erro create service:", error);
      return res.status(500).json({ error: "Erro ao criar serviço." });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { title, tag, duration, price, desc, items, active } = req.body;
      const file = req.file;

      const existing = await prisma.service.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ error: "Serviço não encontrado no banco de dados." });
      }

      let itemsArray = existing.items;
      if (items !== undefined) {
        itemsArray = typeof items === "string"
          ? items.split(",").map((item) => item.trim()).filter(Boolean)
          : Array.isArray(items) ? items : [];
      }

      const dataToUpdate: any = {
        title: title !== undefined ? title : existing.title,
        tag: tag !== undefined ? tag : existing.tag,
        duration: duration !== undefined ? duration : existing.duration,
        price: price !== undefined && price !== "" ? Number(price) : existing.price,
        desc: desc !== undefined ? desc : existing.desc,
        items: itemsArray,
        active: active !== undefined ? String(active) === "true" || active === true : existing.active,
      };

      if (file) {
        dataToUpdate.image = `/uploads/${file.filename}`;
      }

      const updated = await prisma.service.update({
        where: { id },
        data: dataToUpdate,
      });

      return res.json(updated);
    } catch (error) {
      console.error("Erro update service:", error);
      return res.status(500).json({ error: "Erro ao atualizar serviço." });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.service.delete({ where: { id } });
      return res.status(204).send();
    } catch (error) {
      console.error("Erro delete service:", error);
      return res.status(500).json({ error: "Erro ao deletar serviço." });
    }
  }
}