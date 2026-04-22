const express = require("express");
const router = express.Router();
const Article = require("../models/Article");
router.get("/", async (req, res) => {
  try {
    const articles = await Article.find().sort({ date: -1 });
    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: "Chyba serveru" });
  }
});
router.get("/:id", async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ error: "Článek nenalezen" });
    res.json(article);
  } catch (err) {
    res.status(500).json({ error: "Chyba serveru" });
  }
});
router.post("/", async (req, res) => {
  try {
    const article = new Article(req.body);
    await article.save();
    res.json(article);
  } catch (err) {
    res.status(500).json({ error: "Chyba serveru" });
  }
});
router.put("/:id", async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!article) return res.status(404).json({ error: "Článek nenalezen" });
    res.json(article);
  } catch (err) {
    res.status(500).json({ error: "Chyba serveru" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Article.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Chyba serveru" });
  }
});
module.exports = router;
