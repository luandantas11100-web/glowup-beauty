import { Router } from "express";
import { authRoutes } from "./auth.routes";
import { serviceRoutes } from "./service.routes";
import { courseRoutes } from "./course.routes";
import { bookingRoutes } from "./booking.routes";
import { dashboardRoutes } from "./dashboard.routes";

const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/services", serviceRoutes);
routes.use("/courses", courseRoutes);
routes.use("/bookings", bookingRoutes);
routes.use("/admin/dashboard", dashboardRoutes);

export { routes };