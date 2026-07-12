require("dotenv").config();

const express = require("express");
const cors = require("cors");

const newsRoutes = require("./routes/news");
const chatRoutes = require("./routes/chat");
const translateRoutes = require("./routes/translate");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Pure API server — the frontend is a separate static app (see /frontend)
// that talks to these endpoints over HTTP, matching a typical decoupled
// frontend + backend setup.
app.use("/api/news", newsRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/translate", translateRoutes);

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "MyET AI News API — see /api/news, /api/chat, /api/translate" });
});

app.use((err, req, res, next) => {
  console.error("[server] Unhandled error:", err);
  res.status(500).json({ ok: false, error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`MyET AI News API running at http://localhost:${PORT}`);
  if (!process.env.NEWS_API_KEY || process.env.NEWS_API_KEY === "your_newsapi_key_here") {
    console.log("→ NEWS_API_KEY not set — serving mock articles. See .env.example.");
  }
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_gemini_key_here") {
    console.log("→ GEMINI_API_KEY not set — AI chat will show a setup message. See .env.example.");
  }
});