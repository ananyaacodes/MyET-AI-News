const express = require("express");
const { askGemini } = require("../services/geminiService");

const router = express.Router();

// POST /api/chat  { question: string, articleContext?: string }
router.post("/", async (req, res) => {
  const { question, articleContext } = req.body || {};

  if (!question || typeof question !== "string" || !question.trim()) {
    return res.status(400).json({ ok: false, answer: "Please enter a question." });
  }

  const result = await askGemini(question.trim(), articleContext || "");
  res.json(result);
});

module.exports = router;