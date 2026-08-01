import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../utils/prisma";

export class AuthController {
  async login(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "E-mail e senha são obrigatórios." });
      }

      // 1. Busca o usuário pelo e-mail
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(401).json({ error: "Credenciais inválidas." });
      }

      // 2. Compara a senha informada com o hash salvo no banco
      const passwordMatched = await bcrypt.compare(password, user.password);

      if (!passwordMatched) {
        return res.status(401).json({ error: "Credenciais inválidas." });
      }

      // 3. Gera o Token JWT com validade de 1 dia
      const secret = process.env.JWT_SECRET || "default_secret";
      const token = jwt.sign({}, secret, {
        subject: user.id,
        expiresIn: "1d",
      });

      return res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        token,
      });
    } catch (error) {
      console.error("Erro no login:", error);
      return res.status(500).json({ error: "Erro interno no servidor." });
    }
  }
}