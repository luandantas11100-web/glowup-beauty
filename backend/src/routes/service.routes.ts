import { Router } from "express";
import multer from "multer";
import uploadConfig from "../config/upload.js";
import { ServiceController } from "../controllers/ServiceController.js";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated.js";

const serviceRoutes = Router();
const serviceController = new ServiceController();
const upload = multer(uploadConfig);

// GET /api/services
serviceRoutes.get("/", (req, res) => {
  serviceController.index(req, res);
});

// POST /api/services
serviceRoutes.post("/", ensureAuthenticated, upload.single("image"), (req, res) => {
  serviceController.create(req, res);
});

// PUT /api/services/:id
serviceRoutes.put("/:id", ensureAuthenticated, upload.single("image"), (req, res) => {
  serviceController.update(req, res);
});

// DELETE /api/services/:id
serviceRoutes.delete("/:id", ensureAuthenticated, (req, res) => {
  serviceController.delete(req, res);
});

export { serviceRoutes };