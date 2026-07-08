// Using gemini-2.5-flash: fast, cheap, and on the free tier as of mid-2026.
// If you want a stronger model later, swap this for "gemini-3.5-flash" —
// check https://ai.google.dev/gemini-api/docs/models for current options.
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

/**
 * Sends a question + optional article context to Gemini and returns the
 * plain-text answer. Falls back to a clear error message (not fake data)
 * if no key is set or the call fails — unlike the old keyword-matching demo.
 */
async function askGemini(question, articleContext = "") {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "your_gemini_key_here") {
    return {
      ok: false,
      answer:
        "AI chat isn't connected yet — add GEMINI_API_KEY to your .env file to enable real answers.",
    };
  }

  const prompt = articleContext
    ? `You are a news assistant. Given this article context:\n"${articleContext}"\n\nAnswer the reader's question concisely (2-4 sentences): ${question}`
    : `You are a news assistant. Answer this question concisely (2-4 sentences): ${question}`;

  try {
    const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Gemini ${response.status}: ${body}`);
    }

    const data = await response.json();
    const answer =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      "Gemini returned an empty response. Try rephrasing your question.";

    return { ok: true, answer };
  } catch (err) {
    console.error("[geminiService] Request failed:", err.message);
    return {
      ok: false,
      answer: "Something went wrong reaching Gemini. Check your API key and try again.",
    };
  }
}

module.exports = { askGemini };