const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const uploadsDir = path.join(__dirname, "..", "uploads");

router.post(
  "/",
  protect,
  (req, res, next) => {
    const mw = upload.array("files", 10);
    mw(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          message:
            err.code === "LIMIT_FILE_SIZE"
              ? "File too large (max 10MB)"
              : err.message || "Invalid file",
        });
      }
      next();
    });
  },
  (req, res) => {
    if (!req.file && (!req.files || req.files.length === 0)) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const files = req.file ? [req.file] : req.files;
    const filenames = files.map((f) => f.filename);
    res.status(201).json({ message: "Upload successful", files: filenames });
  }
);

router.get("/uploads", protect, (req, res) => {
  try {
    if (!fs.existsSync(uploadsDir)) {
      return res.json({ files: [] });
    }
    res.json({ files: fs.readdirSync(uploadsDir) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve one file (for previews / viewing) — protect and prevent path traversal
router.get("/file/:filename", protect, (req, res) => {
  const filename = path.basename(req.params.filename);
  if (!filename) return res.status(400).send("Bad request");
  const filePath = path.join(uploadsDir, filename);
  if (!fs.existsSync(filePath) || !path.resolve(filePath).startsWith(path.resolve(uploadsDir))) {
    return res.status(404).send("Not found");
  }
  res.sendFile(filePath);
});

// Delete file
router.delete("/file/:filename", protect, (req, res) => {
  const filename = path.basename(req.params.filename);
  if (!filename) return res.status(400).json({ message: "Bad request" });
  const filePath = path.join(uploadsDir, filename);
  if (!path.resolve(filePath).startsWith(path.resolve(uploadsDir))) {
    return res.status(400).json({ message: "Invalid filename" });
  }
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ message: "File deleted successfully" });
    } else {
      res.status(404).json({ message: "File not found" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
