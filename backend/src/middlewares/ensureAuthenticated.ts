import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface TokenPayload {
  iat: number;
  exp: number;
  sub: string;
}

export function ensureAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ error: "JWT token não fornecido." });
    return;
  }

  const [, token] = authHeader.split(" ");

  try {
    const secret = process.env.JWT_SECRET || "default_secret";
    const decoded = jwt.verify(token, secret) as TokenPayload;

    req.user = {
      id: decoded.sub,
    };

    return next();
  } catch {
    res.status(401).json({ error: "JWT token inválido ou expirado." });
    return;
  }
}