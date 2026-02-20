const Article = require("../models/Article");
const fs = require("fs");
const path = require("path");

/* =========================
   CREATE ARTICLE
========================= */
const createArticle = async (req, res) => {
  try {
    const { title, content, subject, files } = req.body;

    if (!title || !subject) {
      return res.status(400).json({
        message: "Title and subject are required",
      });
    }

    const article = await Article.create({
      title,
      content: content || "",
      subject,
      files: files || [],
      favorite: false,
      pinned: false,
      user: req.user._id,
    });

    res.status(201).json(article);

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/* =========================
   GET ARTICLES
========================= */
const getArticles = async (req, res) => {
  try {
    const articles = await Article.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(articles);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* =========================
   UPDATE ARTICLE
========================= */
const updateArticle = async (req, res) => {
  try {
    const { files, favorite, pinned, ...otherFields } = req.body;
    const updateData = { ...otherFields };
    if (files !== undefined) {
      updateData.files = files;
    }
    if (favorite !== undefined) {
      updateData.favorite = !!favorite;
    }
    if (pinned !== undefined) {
      updateData.pinned = !!pinned;
    }
    const article = await Article.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updateData,
      { new: true }
    );

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    res.json(article);

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/* =========================
   DELETE ARTICLE
========================= */
const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    res.json({ message: "Article deleted successfully" });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/* =========================
   UPLOAD FILE
========================= */
const uploadFile = async (req, res) => {
  try {
    if (!req.file && (!req.files || req.files.length === 0)) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const files = req.file ? [req.file] : req.files;
    const filenames = files.map((f) => f.filename);
    res.status(201).json({ message: "Upload successful", files: filenames });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* =========================
   LIST UPLOADS
========================= */
const uploadsDir = path.join(__dirname, "..", "uploads");

const getUploads = async (req, res) => {
  try {
    if (!fs.existsSync(uploadsDir)) {
      return res.json({ files: [] });
    }
    const files = fs.readdirSync(uploadsDir);
    res.json({ files });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createArticle,
  getArticles,
  updateArticle,
  deleteArticle,
  uploadFile,
  getUploads,
};