import { Router } from "express";
import { DashboardController } from "../controllers/DashboardController";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";

const dashboardRoutes = Router();
const dashboardController = new DashboardController();

dashboardRoutes.get("/", ensureAuthenticated, (req, res) => {
  dashboardController.index(req, res);
});

export { dashboardRoutes };