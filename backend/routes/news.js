const express = require("express");
const { getNews } = require("../services/newsService");

const router = express.Router();

// GET /api/news?interests=Technology,Startups&profile=Investor
router.get("/", async (req, res) => {
  const interestsParam = req.query.interests;
  const interests = interestsParam
    ? interestsParam.split(",").map((s) => s.trim()).filter(Boolean)
    : [];
  const profile = req.query.profile || "General";

  const result = await getNews(interests, profile);
  res.json(result);
});

module.exports = router;