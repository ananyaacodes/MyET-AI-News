const express = require("express");
const { askGemini } = require("../services/geminiService");

const router = express.Router();

// POST /api/chat  { question: string, articleContext?: string, language?: string }
router.post("/", async (req, res) => {
  const { question, articleContext, language } = req.body || {};

  if (!question || typeof question !== "string" || !question.trim()) {
    return res.status(400).json({ ok: false, answer: "Please enter a question." });
  }

  const result = await askGemini(question.trim(), articleContext || "", language || "English");
  res.json(result);
});

module.exports = router;