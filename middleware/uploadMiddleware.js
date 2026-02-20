const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safe = Date.now() + "-" + (file.originalname || "file").replace(/[^a-zA-Z0-9.-]/g, "_");
    cb(null, safe);
  },
});

const fileFilter = (req, file, cb) => {
  const name = file.originalname || "";
  const allowedExt = /\.(pdf|jpe?g|png|gif|webp)$/i.test(name);
  const allowedMime = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ].includes(file.mimetype);
  if (allowedExt || allowedMime || !name) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
}); // 10MB

module.exports = upload;
