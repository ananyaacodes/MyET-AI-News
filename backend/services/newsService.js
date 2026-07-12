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

// Biases results toward what each profile actually cares about. Without this,
// "Student", "Investor", and "Founder" were purely cosmetic labels — the query
// sent to NewsAPI never changed, so all three showed identical results.
// "General" applies no bias at all — just the raw interest categories.
const PROFILE_QUERIES = {
  Student: "\"career advice\" OR internship OR scholarship OR \"student loan\" OR \"college graduate\"",
  Investor: "earnings OR IPO OR valuation OR \"stock market\" OR shareholders",
  Founder: "\"product launch\" OR \"venture capital\" OR bootstrapped OR \"seed funding\"",
  General: "",
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
 * Fetches news for a given interest set + profile. Falls back to mock data if
 * no API key is configured or the request fails, so the app never hard-crashes.
 */
async function getNews(interests = [], profile = "General") {
  const apiKey = process.env.NEWS_API_KEY;
  const activeInterests = interests.length > 0 ? interests : Object.keys(INTEREST_QUERIES);
  const profileModifier = PROFILE_QUERIES[profile] || "";

  if (!apiKey || apiKey === "your_newsapi_key_here") {
    return {
      source: "mock",
      articles: MOCK_ARTICLES.filter((a) => activeInterests.includes(a.category)),
    };
  }

  const interestQuery = activeInterests
    .map((i) => INTEREST_QUERIES[i])
    .filter(Boolean)
    .join(" OR ");

  // With a profile modifier: "(interest terms) AND (profile terms)" — NewsAPI's
  // "everything" endpoint supports this boolean syntax directly in q.
  const fullQuery = profileModifier
    ? `(${interestQuery || "AI"}) AND (${profileModifier})`
    : interestQuery || "AI";

  function buildUrl(query, useDomains) {
    const url = new URL(NEWS_API_BASE);
    url.searchParams.set("q", query);
    if (useDomains) url.searchParams.set("domains", NEWS_DOMAINS);
    url.searchParams.set("language", "en");
    url.searchParams.set("sortBy", "publishedAt");
    url.searchParams.set("pageSize", "12");
    url.searchParams.set("apiKey", apiKey);
    return url;
  }

  try {
    let response = await fetch(buildUrl(fullQuery, true).toString());
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`NewsAPI ${response.status}: ${body}`);
    }
    let data = await response.json();
    let profileApplied = Boolean(profileModifier);
    console.log(`[newsService] tier 1 (domains+profile): ${data.totalResults ?? 0} results`);

    // Loosen progressively, but keep source quality (domains) for as long as
    // possible — drop the profile bias first, and only give up on outlet
    // quality as a last resort. Previously this dropped domains first, which
    // let low-quality sources back in before the profile bias was even gone.
    if (!data.articles || data.articles.length === 0) {
      response = await fetch(buildUrl(interestQuery || "AI", true).toString());
      if (response.ok) {
        data = await response.json();
        profileApplied = false;
        console.log(`[newsService] tier 2 (domains, no profile): ${data.totalResults ?? 0} results`);
      }
    }
    if (!data.articles || data.articles.length === 0) {
      response = await fetch(buildUrl(interestQuery || "AI", false).toString());
      if (response.ok) {
        data = await response.json();
        profileApplied = false;
        console.log(`[newsService] tier 3 (no domains, no profile): ${data.totalResults ?? 0} results`);
      }
    }

    /**
 * NewsAPI's "content" field is scraped from the source page, and for some
 * outlets that scrape carries real cruft: leftover HTML tags, a sentence
 * repeated twice, or a truncated byline glued onto the end (e.g. "...law.
 * by Terrence O'BrienClo"). This cleans the common cases so the detail view
 * shows readable prose instead of visible markup and garbage fragments.
 */
function cleanArticleContent(raw) {
  if (!raw) return null;

  const wasTruncated = /\[\+\d+\s*chars\]/i.test(raw) || /(\.{3}|…)\s*$/.test(raw);

  let text = raw
    .replace(/\s*\[\+\d+\s*chars\]\s*$/i, "") // NewsAPI's truncation marker
    .replace(/<[^>]+>/g, " ") // any leftover HTML tags from the scrape
    .replace(/(\.{3}|…)\s*$/, "") // trailing ellipsis — re-added at the end if still truncated
    .replace(/\s+/g, " ")
    .trim();

  if (!text) return null;

  // Drop consecutive duplicate sentences (a real artifact from some sources)
  const sentences = text.split(/(?<=[.!?])\s+/);
  const deduped = sentences.filter((s, i) => s !== sentences[i - 1]);
  text = deduped.join(" ");

  // A truncated, glued-on byline at the very end looks like "by First Last"
  // with no closing punctuation (a genuine sentence ending in "by Judge Smith."
  // would still have its period, so this only catches the cut-off case).
  if (!/[.!?]$/.test(text)) {
    text = text.replace(/\s+by\s+[A-Z][A-Za-z'.]*(?:\s+[A-Z][A-Za-z'.]*){0,3}$/, "").trim();
  }

  if (wasTruncated && text && !text.endsWith("…")) text += "…";

  return text || null;
}

const articles = (data.articles || []).map((a, idx) => ({
      id: `live-${idx}-${Date.now()}`,
      title: a.title,
      description: a.description || "No description available.",
      content: cleanArticleContent(a.content),
      url: a.url,
      image: a.urlToImage || null,
      source: a.source?.name || "Unknown source",
      category: activeInterests[idx % activeInterests.length],
      publishedAt: a.publishedAt,
    }));

    return { source: "live", profileApplied, articles };
  } catch (err) {
    console.error("[newsService] Falling back to mock data:", err.message);
    return {
      source: "mock-fallback",
      articles: MOCK_ARTICLES.filter((a) => activeInterests.includes(a.category)),
      error: err.message,
    };
  }
}

module.exports = { getNews, INTEREST_QUERIES, PROFILE_QUERIES };