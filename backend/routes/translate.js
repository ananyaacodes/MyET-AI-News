const express = require("express");
const { translateTexts } = require("../services/geminiService");

const router = express.Router();

// POST /api/translate  { texts: string[], targetLanguage: string }
router.post("/", async (req, res) => {
  const { texts, targetLanguage } = req.body || {};

  if (!Array.isArray(texts) || texts.length === 0) {
    return res.status(400).json({ ok: false, translations: [], error: "texts must be a non-empty array" });
  }
  if (!targetLanguage || typeof targetLanguage !== "string") {
    return res.status(400).json({ ok: false, translations: texts, error: "targetLanguage is required" });
  }

  const result = await translateTexts(texts, targetLanguage);
  res.json(result);
});

module.exports = router;