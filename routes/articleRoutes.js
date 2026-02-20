const express = require("express");
const router = express.Router();

const {
  createArticle,
  getArticles,
  updateArticle,
  deleteArticle,
  uploadFile,
  getUploads,
} = require("../controllers/articleController");

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// File upload routes (must be before /:id so "upload" is not treated as id)
router.get("/uploads", protect, getUploads);
router.post(
  "/upload",
  protect,
  (req, res, next) => {
    const mw = upload.array("files", 10);
    mw(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          message: err.code === "LIMIT_FILE_SIZE" ? "File too large (max 10MB)" : err.message || "Invalid file",
        });
      }
      next();
    });
  },
  uploadFile
);

// Protected article routes
router.post("/", protect, createArticle);
router.get("/", protect, getArticles);
router.put("/:id", protect, updateArticle);
router.delete("/:id", protect, deleteArticle);

module.exports = router;