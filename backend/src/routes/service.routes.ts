import { Router } from "express";
import multer from "multer";
import uploadConfig from "../config/upload";
import { ServiceController } from "../controllers/ServiceController";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";

const serviceRoutes = Router();
const serviceController = new ServiceController();
const upload = multer(uploadConfig);

serviceRoutes.get("/", (req, res) => {
  serviceController.index(req, res);
});

serviceRoutes.post("/", ensureAuthenticated, upload.single("image"), (req, res) => {
  serviceController.create(req, res);
});

serviceRoutes.delete("/:id", ensureAuthenticated, (req, res) => {
  serviceController.delete(req, res);
});

export { serviceRoutes };