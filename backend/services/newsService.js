const NEWS_API_BASE = "https://newsapi.org/v2/everything";

// Maps our profile/interest categories to search queries NewsAPI understands well.
// "everything" endpoint (not "top-headlines") is used because it supports free-text
// queries, which lets us target "AI" + interest combos precisely.
const INTEREST_QUERIES = {
  Technology: "technology OR software OR AI",
  Finance: "finance OR markets OR economy",
  Startups: "startup OR \"venture capital\" OR funding",
  Politics: "policy OR government OR regulation",
};

// Restricts results to established news outlets. Without this, NewsAPI's "everything"
// endpoint happily matches GitHub repo READMEs, PyPI package pages, and Hacker News
// threads whenever they contain the query keywords — technically relevant, but not
// what "news" should mean here. This trades a bit of coverage for outlets that are
// actually reporting on a story rather than just mentioning the keyword.
const NEWS_DOMAINS = [
  "techcrunch.com",
  "theverge.com",
  "wired.com",
  "arstechnica.com",
  "engadget.com",
  "reuters.com",
  "apnews.com",
  "bloomberg.com",
  "cnbc.com",
  "forbes.com",
  "businessinsider.com",
  "nytimes.com",
  "bbc.co.uk",
  "axios.com",
  "venturebeat.com",
].join(",");

// Used when NEWS_API_KEY is missing, or the API call fails, so the app is always
// runnable and demoable without hard-crashing on a missing key.
const MOCK_ARTICLES = [
  {
    id: "mock-1",
    title: "Global Markets React to New Economic Policy Announcements",
    description:
      "Central banks signal a coordinated response to inflation data as markets price in policy shifts.",
    url: "https://example.com/markets-react",
    source: "Mock Wire",
    category: "Finance",
    publishedAt: new Date().toISOString(),
  },
  {
    id: "mock-2",
    title: "AI Adoption Accelerates Across Enterprise Software",
    description:
      "Enterprises report faster rollout of generative AI features inside existing SaaS products.",
    url: "https://example.com/ai-adoption",
    source: "Mock Wire",
    category: "Technology",
    publishedAt: new Date().toISOString(),
  },
  {
    id: "mock-3",
    title: "Startup Funding Rebounds in Early-Stage Rounds",
    description:
      "Seed and Series A activity picks up as investors return to earlier-stage bets.",
    url: "https://example.com/startup-funding",
    source: "Mock Wire",
    category: "Startups",
    publishedAt: new Date().toISOString(),
  },
  {
    id: "mock-4",
    title: "Governments Weigh New Rules for Frontier AI Models",
    description:
      "Regulators in several countries propose disclosure requirements for large-scale AI systems.",
    url: "https://example.com/ai-policy",
    source: "Mock Wire",
    category: "Politics",
    publishedAt: new Date().toISOString(),
  },
  {
    id: "mock-5",
    title: "Cloud Providers Expand AI Infrastructure Offerings",
    description:
      "Major cloud vendors announce new GPU capacity and pricing tiers for AI workloads.",
    url: "https://example.com/cloud-ai",
    source: "Mock Wire",
    category: "Technology",
    publishedAt: new Date().toISOString(),
  },
  {
    id: "mock-6",
    title: "Venture Capital Sees Surge in AI-Native Company Bets",
    description:
      "Investors funnel capital into companies building products designed around AI from day one.",
    url: "https://example.com/vc-ai",
    source: "Mock Wire",
    category: "Startups",
    publishedAt: new Date().toISOString(),
  },
];

/**
 * Fetches news for a given interest category. Falls back to mock data if
 * no API key is configured or the request fails, so the app never hard-crashes.
 */
async function getNews(interests = []) {
  const apiKey = process.env.NEWS_API_KEY;
  const activeInterests = interests.length > 0 ? interests : Object.keys(INTEREST_QUERIES);

  if (!apiKey || apiKey === "your_newsapi_key_here") {
    return {
      source: "mock",
      articles: MOCK_ARTICLES.filter((a) => activeInterests.includes(a.category)),
    };
  }

  try {
    const queries = activeInterests
      .map((i) => INTEREST_QUERIES[i])
      .filter(Boolean);
    const combinedQuery = queries.join(" OR ");

    const url = new URL(NEWS_API_BASE);
    url.searchParams.set("q", combinedQuery || "AI");
    url.searchParams.set("domains", NEWS_DOMAINS);
    url.searchParams.set("language", "en");
    url.searchParams.set("sortBy", "publishedAt");
    url.searchParams.set("pageSize", "12");
    url.searchParams.set("apiKey", apiKey);

    const response = await fetch(url.toString());

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`NewsAPI ${response.status}: ${body}`);
    }

    let data = await response.json();

    // The domain allowlist occasionally starves narrower queries (e.g. a single
    // niche interest). If so, retry once without it rather than showing nothing —
    // better a slightly noisier feed than an empty one.
    if (!data.articles || data.articles.length === 0) {
      url.searchParams.delete("domains");
      const retryResponse = await fetch(url.toString());
      if (retryResponse.ok) {
        data = await retryResponse.json();
      }
    }

    const articles = (data.articles || []).map((a, idx) => ({
      id: `live-${idx}-${Date.now()}`,
      title: a.title,
      description: a.description || "No description available.",
      url: a.url,
      source: a.source?.name || "Unknown source",
      category: activeInterests[idx % activeInterests.length],
      publishedAt: a.publishedAt,
    }));

    return { source: "live", articles };
  } catch (err) {
    console.error("[newsService] Falling back to mock data:", err.message);
    return {
      source: "mock-fallback",
      articles: MOCK_ARTICLES.filter((a) => activeInterests.includes(a.category)),
      error: err.message,
    };
  }
}

module.exports = { getNews, INTEREST_QUERIES };