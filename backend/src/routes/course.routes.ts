import { Router } from "express";
import multer from "multer";
import uploadConfig from "../config/upload.js";
import { CourseController } from "../controllers/CourseController.js";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated.js";

const courseRoutes = Router();
const courseController = new CourseController();
const upload = multer(uploadConfig);

courseRoutes.get("/", (req, res) => {
  courseController.index(req, res);
});

courseRoutes.post("/", ensureAuthenticated, upload.single("image"), (req, res) => {
  courseController.create(req, res);
});

courseRoutes.put("/:id", ensureAuthenticated, upload.single("image"), (req, res) => {
  courseController.update(req, res);
});

courseRoutes.delete("/:id", ensureAuthenticated, (req, res) => {
  courseController.delete(req, res);
});

export { courseRoutes };