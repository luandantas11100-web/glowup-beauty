import { Router } from "express";
import { BookingController } from "../controllers/BookingController";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";

const bookingRoutes = Router();
const bookingController = new BookingController();

// Pública (Clientes agendam no site)
bookingRoutes.post("/", (req, res) => bookingController.create(req, res));

// Protegidas (Apenas a dona acessa via painel)
bookingRoutes.get("/", ensureAuthenticated, (req, res) => bookingController.index(req, res));
bookingRoutes.patch("/:id/status", ensureAuthenticated, (req, res) => bookingController.updateStatus(req, res));
bookingRoutes.delete("/:id", ensureAuthenticated, (req, res) => bookingController.delete(req, res));

export { bookingRoutes };