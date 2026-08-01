import multer from "multer";
import path from "node:path";
import crypto from "node:crypto";

const tmpFolder = path.resolve(__dirname, "..", "..", "public", "uploads");

const uploadConfig = {
  directory: tmpFolder,
  storage: multer.diskStorage({
    destination: tmpFolder,
    filename(request, file, callback) {
      const fileHash = crypto.randomBytes(10).toString("hex");
      const fileName = `${fileHash}-${file.originalname}`;

      return callback(null, fileName);
    },
  }),
};

export default uploadConfig;