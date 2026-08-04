import { Router } from "express";
import { DashboardController } from "../controllers/DashboardController.js";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated.js";

const dashboardRoutes = Router();
const dashboardController = new DashboardController();

dashboardRoutes.get("/", ensureAuthenticated, (req, res, next) => {
  dashboardController.index(req, res).catch(next);
});

export { dashboardRoutes };