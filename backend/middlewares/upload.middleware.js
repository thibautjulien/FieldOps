import fs from "fs";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    const base = path.basename(file.originalname || "photo", ext);
    cb(null, `${Date.now()}-${base}${ext || ".jpg"}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const isImage = file.mimetype?.startsWith("image/");
  if (!isImage) {
    return cb(new Error("BAD_REQUEST: Only image files are allowed"));
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter });
export default upload;
