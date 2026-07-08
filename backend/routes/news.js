const express = require("express");
const { getNews } = require("../services/newsService");

const router = express.Router();

// GET /api/news?interests=Technology,Startups
router.get("/", async (req, res) => {
  const interestsParam = req.query.interests;
  const interests = interestsParam
    ? interestsParam.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const result = await getNews(interests);
  res.json(result);
});

module.exports = router;