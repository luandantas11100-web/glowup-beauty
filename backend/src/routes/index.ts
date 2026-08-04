import { Router } from "express";
import { authRoutes } from "./auth.routes.js";
import { serviceRoutes } from "./service.routes.js";
import { courseRoutes } from "./course.routes.js";
import { bookingRoutes } from "./booking.routes.js";
import { dashboardRoutes } from "./dashboard.routes.js";

const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/services", serviceRoutes);
routes.use("/courses", courseRoutes);
routes.use("/bookings", bookingRoutes);
routes.use("/admin/dashboard", dashboardRoutes);

export { routes };