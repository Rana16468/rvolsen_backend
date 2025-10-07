import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import status from "http-status";
import AppError from "../errors/AppError";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folderPath = "./src/public";
    const mimetype = file.mimetype.toLowerCase();

    if (mimetype.startsWith("image")) {
      folderPath = "./src/public/images";
    } else if (mimetype === "application/pdf") {
      folderPath = "./src/public/pdf";
    } else if (mimetype.startsWith("video")) {
      folderPath = "./src/public/videos";
    } else if (mimetype.startsWith("audio")) {
      folderPath = "./src/public/audios";
    } else {
      // ✅ Pass second argument as empty string to satisfy type
      return cb(
        new AppError(
          status.BAD_REQUEST,
          "Only images, PDFs, videos, and audios are allowed"
        ),
        ""
      );
    }

    if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

    cb(null, folderPath);
  },

  filename(_req, file, cb) {
    const fileExt = path.extname(file.originalname);
    const fileName = `${file.originalname
      .replace(fileExt, "")
      .toLowerCase()
      .split(" ")
      .join("-")}-${uuidv4()}`;
    cb(null, fileName + fileExt);
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const mimetype = file.mimetype.toLowerCase();

  const allowedMimeTypes = [
    // Images
    "image/jpeg", "image/png", "image/gif", "image/webp", "image/bmp",
    "image/tiff", "image/svg+xml", "image/heic", "image/heif",
    "image/x-icon", "image/vnd.microsoft.icon",

    // PDF
    "application/pdf",

    // Video
    "video/mp4", "video/mpeg", "video/quicktime", "video/webm",
  ];

  // Allow all audio types dynamically
  if (mimetype.startsWith("audio") || allowedMimeTypes.includes(mimetype)) {
    return cb(null, true);
  }

  cb(
    new AppError(
      status.BAD_REQUEST,
      "Only images, PDFs, videos, and audios are allowed"
    )
  );
};

const upload = multer({
  storage,
  limits: { fileSize: 300 * 1024 * 1024 }, // 300 MB
  fileFilter,
});

export default upload;
