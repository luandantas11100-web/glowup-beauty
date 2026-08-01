import { Router } from "express";
import multer from "multer";
import uploadConfig from "../config/upload";
import { CourseController } from "../controllers/CourseController";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";

const courseRoutes = Router();
const courseController = new CourseController();
const upload = multer(uploadConfig);

courseRoutes.get("/", (req, res) => {
  courseController.index(req, res);
});

courseRoutes.post("/", ensureAuthenticated, upload.single("image"), (req, res) => {
  courseController.create(req, res);
});

courseRoutes.delete("/:id", ensureAuthenticated, (req, res) => {
  courseController.delete(req, res);
});

export { courseRoutes };