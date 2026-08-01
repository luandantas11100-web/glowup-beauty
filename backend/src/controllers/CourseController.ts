import type { Request, Response } from "express";
import { prisma } from "../utils/prisma.js";

export class CourseController {
  async index(req: Request, res: Response) {
    try {
      const courses = await prisma.course.findMany({
        orderBy: { createdAt: "desc" },
      });
      return res.json(courses);
    } catch (error) {
      console.error("Erro index courses:", error);
      return res.status(500).json({ error: "Erro ao buscar cursos." });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { title, tag, duration, price, desc, items } = req.body;
      const file = req.file;

      if (!title || !price || !file) {
        return res.status(400).json({ error: "Título, preço e imagem são obrigatórios." });
      }

      let itemsArray: string[] = [];
      if (typeof items === "string") {
        try {
          const parsed = JSON.parse(items);
          itemsArray = Array.isArray(parsed) ? parsed : items.split(",").map((i) => i.trim()).filter(Boolean);
        } catch {
          itemsArray = items.split(",").map((i) => i.trim()).filter(Boolean);
        }
      } else if (Array.isArray(items)) {
        itemsArray = items;
      }

      const imagePath = `/uploads/${file.filename}`;

      const course = await prisma.course.create({
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

      return res.status(201).json(course);
    } catch (error) {
      console.error("Erro create course:", error);
      return res.status(500).json({ error: "Erro ao criar curso." });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { title, tag, duration, price, desc, items, active } = req.body;
      const file = req.file;

      const existing = await prisma.course.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ error: "Curso não encontrado no banco de dados." });
      }

      let itemsArray = existing.items;
      if (items !== undefined && items !== null) {
        if (typeof items === "string") {
          try {
            const parsed = JSON.parse(items);
            itemsArray = Array.isArray(parsed) ? parsed : items.split(",").map((i) => i.trim()).filter(Boolean);
          } catch {
            itemsArray = items.split(",").map((i) => i.trim()).filter(Boolean);
          }
        } else if (Array.isArray(items)) {
          itemsArray = items;
        }
      }

      const parsedPrice = price !== undefined && price !== "" && !isNaN(Number(price))
        ? Number(price)
        : existing.price;

      const parsedActive = active !== undefined
        ? String(active) === "true" || active === true
        : existing.active;

      const dataToUpdate: any = {
        title: title !== undefined ? title : existing.title,
        tag: tag !== undefined ? tag : existing.tag,
        duration: duration !== undefined ? duration : existing.duration,
        price: parsedPrice,
        desc: desc !== undefined ? desc : existing.desc,
        items: itemsArray,
        active: parsedActive,
      };

      if (file) {
        dataToUpdate.image = `/uploads/${file.filename}`;
      }

      const updated = await prisma.course.update({
        where: { id },
        data: dataToUpdate,
      });

      return res.json(updated);
    } catch (error) {
      console.error("Erro update course:", error);
      return res.status(500).json({ error: "Erro ao atualizar curso." });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.course.delete({ where: { id } });
      return res.status(204).send();
    } catch (error) {
      console.error("Erro delete course:", error);
      return res.status(500).json({ error: "Erro ao deletar curso." });
    }
  }
}