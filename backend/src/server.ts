import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { routes } from "./routes/index.js";

dotenv.config();

// Definição correta do __dirname no ambiente ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors());
app.use(express.json());

// Servir fotos da pasta public/uploads estaticamente
app.use("/uploads", express.static(path.resolve(__dirname, "..", "public", "uploads")));

// Rotas da API (/api/services, /api/courses, etc.)
app.use("/api", routes);

// Rota de Teste de Saúde
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Servidor rodando perfeitamente!" });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend rodando em http://localhost:${PORT}`);
});