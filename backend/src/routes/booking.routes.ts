import { Router } from "express";
import { BookingController } from "../controllers/BookingController";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";

const bookingRoutes = Router();
const bookingController = new BookingController();

// Rota pública para criar o agendamento
bookingRoutes.post("/", (req, res) => {
  bookingController.create(req, res);
});

// Rotas protegidas (exigem autenticação)
bookingRoutes.get("/", ensureAuthenticated, (req, res) => {
  bookingController.index(req, res);
});

bookingRoutes.patch("/:id/status", ensureAuthenticated, (req, res) => {
  bookingController.updateStatus(req, res);
});

bookingRoutes.delete("/:id", ensureAuthenticated, (req, res) => {
  bookingController.delete(req, res);
});

export { bookingRoutes };