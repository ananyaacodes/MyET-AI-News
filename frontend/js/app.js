// Backend runs separately (see /backend). Change this if you deploy it elsewhere.
const API_BASE = "http://localhost:3000";

const PROFILE_KEYS = { General: "general", Student: "student", Investor: "investor", Founder: "founder" };
const CATEGORY_KEYS = { Technology: "technology", Finance: "finance", Startups: "startups", Politics: "politics" };

// ===== State =====
const state = {
  profile: "General",
  interests: ["Technology", "Finance", "Startups", "Politics"],
  articles: [],
  savedIds: new Set(JSON.parse(localStorage.getItem("myet_saved") || "[]")),
  activeChatContext: null, // ORIGINAL English text, so Gemini always gets clean source text
  activeChatArticleId: null,
  activeModalArticleId: null,
  searchTerm: "",
  language: localStorage.getItem("myet_lang") || "en",
  isTranslating: false,
  // Remembers the last fetch outcome so the source note can be re-translated
  // on a language switch without needing to refetch from NewsAPI.
  lastFetchOutcome: null, // { type: "mock" | "mock-fallback" | "profile-loosened" | "live", error }
};

// ===== Elements =====
const els = {
  profilePicker: document.getElementById("profilePicker"),
  profileLabel: document.getElementById("profileLabel"),
  interestChips: document.getElementById("interestChips"),
  refreshBtn: document.getElementById("refreshBtn"),
  newsGrid: document.getElementById("newsGrid"),
  sourceNote: document.getElementById("sourceNote"),
  tickerTrack: document.getElementById("tickerTrack"),
  clock: document.getElementById("clock"),
  themeToggle: document.getElementById("themeToggle"),
  languageSelect: document.getElementById("languageSelect"),
  chatToggle: document.getElementById("chatToggle"),
  chatDrawer: document.getElementById("chatDrawer"),
  chatClose: document.getElementById("chatClose"),
  chatContext: document.getElementById("chatContext"),
  chatMessages: document.getElementById("chatMessages"),
  chatForm: document.getElementById("chatForm"),
  chatInput: document.getElementById("chatInput"),
  searchInput: document.getElementById("searchInput"),
  articleModal: document.getElementById("articleModal"),
  articleModalBackdrop: document.getElementById("articleModalBackdrop"),
  articleModalClose: document.getElementById("articleModalClose"),
  modalCategory: document.getElementById("modalCategory"),
  modalSource: document.getElementById("modalSource"),
  modalDate: document.getElementById("modalDate"),
  modalHeadline: document.getElementById("modalHeadline"),
  modalDeck: document.getElementById("modalDeck"),
  modalImageWrap: document.getElementById("modalImageWrap"),
  modalImage: document.getElementById("modalImage"),
  modalImagePlaceholder: document.getElementById("modalImagePlaceholder"),
  modalCameraBadge: document.getElementById("modalCameraBadge"),
  modalBody: document.getElementById("modalBody"),
  modalReadMore: document.getElementById("modalReadMore"),
  modalAskAI: document.getElementById("modalAskAI"),
};

// ===== Clock =====
function tickClock() {
  const now = new Date();
  els.clock.textContent = now.toLocaleTimeString([], { hour12: false });
}
setInterval(tickClock, 1000);
tickClock();

// ===== Theme toggle (paper <-> navy, matching the reference collage variants) =====
els.themeToggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("myet_theme", next);
});
(function initTheme() {
  const saved = localStorage.getItem("myet_theme");
  if (saved) document.documentElement.setAttribute("data-theme", saved);
})();

// =========================================================
// i18n — static UI chrome (instant, no API call) + dynamic
// article content translation (real Gemini calls, cached per language)
// =========================================================

function applyStaticTranslations() {
  const lang = state.language;
  document.documentElement.lang = lang;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n, lang);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder, lang);
  });
}

function updateProfileLabel() {
  const key = PROFILE_KEYS[state.profile] || "general";
  els.profileLabel.textContent = t(key, state.language);
}

// Re-renders the note under "Refresh feed" in the current language, using the
// last fetch's outcome rather than re-hitting the backend on every language switch.
function updateSourceNote() {
  const outcome = state.lastFetchOutcome;
  if (!outcome) return;
  const lang = state.language;

  if (outcome.type === "mock") {
    els.sourceNote.textContent = t("demoFeed", lang);
  } else if (outcome.type === "mock-fallback") {
    els.sourceNote.textContent = `${t("demoFeed", lang)} (${outcome.error || "unknown error"})`;
  } else if (outcome.type === "profile-loosened") {
    els.sourceNote.textContent = t("notEnoughProfileResults", lang);
  } else {
    els.sourceNote.textContent = t("liveFeed", lang);
  }
}

els.languageSelect.addEventListener("change", async () => {
  state.language = els.languageSelect.value;
  localStorage.setItem("myet_lang", state.language);

  applyStaticTranslations();
  updateProfileLabel();
  updateSourceNote();
  await translateArticlesToCurrentLanguage();
  renderGrid();
  renderTicker();
});

(function initLanguage() {
  els.languageSelect.value = state.language;
  applyStaticTranslations();
})();

/**
 * Returns { title, description } for an article in the currently active
 * language — the original English if language is "en" or no translation
 * exists yet, otherwise the cached translated version.
 */
function getDisplayText(article) {
  if (state.language === "en") {
    return { title: article.title, description: article.description, content: article.content };
  }
  const cached = article.translations && article.translations[state.language];
  return cached || { title: article.title, description: article.description, content: article.content };
}

/**
 * Translates every currently loaded article's title+description into the
 * active language via one batched backend call, caching results per-article
 * per-language so switching languages back and forth never re-translates.
 */
async function translateArticlesToCurrentLanguage() {
  if (state.language === "en") return;

  const needsTranslation = state.articles.filter(
    (a) => !(a.translations && a.translations[state.language])
  );
  if (needsTranslation.length === 0) return;

  state.isTranslating = true;
  renderGrid(); // shows the "Translating…" state immediately

  const texts = [];
  needsTranslation.forEach((a) => texts.push(a.title, a.description || "", a.content || a.description || ""));

  try {
    const res = await fetch(`${API_BASE}/api/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts, targetLanguage: LANGUAGE_NAMES[state.language] }),
    });
    const data = await res.json();

    if (data.ok && Array.isArray(data.translations)) {
      needsTranslation.forEach((a, i) => {
        a.translations = a.translations || {};
        a.translations[state.language] = {
          title: data.translations[i * 3] || a.title,
          description: data.translations[i * 3 + 1] || a.description,
          content: data.translations[i * 3 + 2] || a.content,
        };
      });
    }
    // If translation failed, getDisplayText() just falls back to English —
    // no error state needed, the feed stays fully usable either way.
  } catch (err) {
    console.error("[translate] Request failed, showing original text:", err);
  } finally {
    state.isTranslating = false;
  }
}

// ===== Profile picker =====
els.profilePicker.addEventListener("click", (e) => {
  const btn = e.target.closest(".profile-btn");
  if (!btn) return;
  els.profilePicker.querySelectorAll(".profile-btn").forEach((b) => b.classList.remove("is-active"));
  btn.classList.add("is-active");
  state.profile = btn.dataset.profile;
  updateProfileLabel();
  loadNews(); // profile changes the query, so the feed needs to actually refetch
});

// ===== Interest chips =====
els.interestChips.addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  chip.classList.toggle("is-active");
  const interest = chip.dataset.interest;
  if (chip.classList.contains("is-active")) {
    if (!state.interests.includes(interest)) state.interests.push(interest);
  } else {
    state.interests = state.interests.filter((i) => i !== interest);
  }
});

els.refreshBtn.addEventListener("click", loadNews);

// ===== Search (client-side filter over loaded articles, searches displayed-language text) =====
let searchDebounce;
els.searchInput.addEventListener("input", () => {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    state.searchTerm = els.searchInput.value.trim().toLowerCase();
    renderGrid();
  }, 150);
});

// ===== Load news =====
async function loadNews() {
  els.newsGrid.innerHTML = `<p style="color:var(--ink-soft); font-family: var(--font-body);">${t("fetchingSignal", state.language)}</p>`;

  try {
    const params = new URLSearchParams({
      interests: state.interests.join(","),
      profile: state.profile,
    });
    const res = await fetch(`${API_BASE}/api/news?${params}`);
    const data = await res.json();

    state.articles = data.articles || [];

    if (data.source === "mock") {
      state.lastFetchOutcome = { type: "mock" };
    } else if (data.source === "mock-fallback") {
      state.lastFetchOutcome = { type: "mock-fallback", error: data.error };
    } else if (state.profile !== "General" && data.profileApplied === false) {
      state.lastFetchOutcome = { type: "profile-loosened" };
    } else {
      state.lastFetchOutcome = { type: "live" };
    }
    updateSourceNote();

    await translateArticlesToCurrentLanguage();
    renderGrid();
    renderTicker();
  } catch (err) {
    els.newsGrid.innerHTML = `<p style="color:var(--red-burst);">Couldn't reach the backend at ${API_BASE}. Is it running?</p>`;
    console.error(err);
  }
}

function renderGrid() {
  const lang = state.language;

  if (state.isTranslating) {
    els.newsGrid.innerHTML = `<p style="color:var(--ink-soft); font-family: var(--font-body);">${t("translating", lang)}</p>`;
    return;
  }

  const term = state.searchTerm;
  const withDisplayText = state.articles.map((a) => ({ article: a, display: getDisplayText(a) }));
  const visible = term
    ? withDisplayText.filter(
        ({ display }) =>
          display.title.toLowerCase().includes(term) || (display.description || "").toLowerCase().includes(term)
      )
    : withDisplayText;

  if (visible.length === 0) {
    const msg = term
      ? `${t("noSearchMatch", lang)} "${escapeHtml(term)}"`
      : t("noArticlesMatch", lang);
    els.newsGrid.innerHTML = `<p style="color:var(--ink-soft);">${msg}</p>`;
    return;
  }

  els.newsGrid.innerHTML = visible
    .map(({ article: a, display }, i) => {
      const isSaved = state.savedIds.has(a.id);
      const tilt = [-1, 1, -0.6, 0.8][i % 4];
      const delay = (i % 6) * 0.06;
      const imageBlock = a.image
        ? `<div class="card__image-wrap">
             <img class="card__image" src="${a.image}" alt="" loading="lazy"
               onerror="this.parentElement.remove()" />
           </div>`
        : "";
      const categoryLabel = t(CATEGORY_KEYS[a.category] || a.category, lang);
      const cardDescText = display.description || display.content || "";
      const descBlock = cardDescText
        ? `<p class="card__desc">${escapeHtml(cardDescText)}</p>`
        : "";
      return `
        <article class="card" data-id="${a.id}" style="--tilt:${tilt}deg; animation-delay:${delay}s;">
          ${imageBlock}
          <span class="card__meta">${escapeHtml(categoryLabel)} · ${escapeHtml(a.source)}</span>
          <h3 class="card__title">${escapeHtml(display.title)}</h3>
          ${descBlock}
          <div class="card__actions">
            <button class="card__action save-btn ${isSaved ? "is-saved" : ""}" data-id="${a.id}">
              <svg width="14" height="14"><use href="#icon-star"/></svg> ${isSaved ? t("saved", lang) : t("save", lang)}
            </button>
            <button class="card__action ask-btn" data-id="${a.id}">
              <svg width="14" height="14"><use href="#icon-megaphone"/></svg> ${t("askAI", lang)}
            </button>
          </div>
        </article>
      `;
    })
    .join("");

  els.newsGrid.querySelectorAll(".save-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleSave(btn.dataset.id, btn);
    });
  });
  els.newsGrid.querySelectorAll(".ask-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      openChatWithContext(btn.dataset.id);
    });
  });
  els.newsGrid.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("click", () => openArticleDetail(card.dataset.id));
  });
}

function renderTicker() {
  const lang = state.language;
  const titles = state.articles.map((a) => `▸ ${getDisplayText(a).title}`).join("   ");
  els.tickerTrack.innerHTML = `<span class="ticker__item">${escapeHtml(titles || t("loadingTicker", lang))}</span>`;
}

function toggleSave(id, btn) {
  const lang = state.language;
  if (state.savedIds.has(id)) {
    state.savedIds.delete(id);
    btn.classList.remove("is-saved");
    btn.innerHTML = `<svg width="14" height="14"><use href="#icon-star"/></svg> ${t("save", lang)}`;
  } else {
    state.savedIds.add(id);
    btn.classList.add("is-saved");
    btn.innerHTML = `<svg width="14" height="14"><use href="#icon-star"/></svg> ${t("saved", lang)}`;
  }
  localStorage.setItem("myet_saved", JSON.stringify([...state.savedIds]));
}

function escapeHtml(str = "") {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ===== Article detail modal =====
function openArticleDetail(articleId) {
  const article = state.articles.find((a) => a.id === articleId);
  if (!article) return;

  state.activeModalArticleId = articleId;
  const lang = state.language;
  const display = getDisplayText(article);

  els.modalCategory.textContent = t(CATEGORY_KEYS[article.category] || article.category, lang);
  els.modalSource.textContent = article.source;
  els.modalDate.textContent = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString(LOCALE_CODES[lang] || "en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  els.modalHeadline.textContent = display.title;

  // Only show the deck line when there's a real description — previously this
  // displayed the literal fallback sentence "No description available." styled
  // like an actual editorial pull-quote, which read as if it were real content.
  if (display.description) {
    els.modalDeck.textContent = display.description;
    els.modalDeck.style.display = "";
  } else {
    els.modalDeck.style.display = "none";
  }

  if (article.image) {
    els.modalImage.style.display = "";
    els.modalImage.src = article.image;
    els.modalImage.alt = display.title;
    els.modalImagePlaceholder.style.display = "none";
    els.modalCameraBadge.style.display = "";
  } else {
    els.modalImage.style.display = "none";
    els.modalImagePlaceholder.style.display = "flex";
    els.modalCameraBadge.style.display = "none";
  }

  // Body: prefer NewsAPI's longer "content" field, then the description, and
  // only fall back to a generic message if NewsAPI genuinely gave us neither.
  els.modalBody.textContent = display.content || display.description || t("noSummary", lang);

  els.modalReadMore.href = article.url || "#";
  els.modalAskAI.onclick = () => {
    closeArticleDetail();
    openChatWithContext(articleId);
  };

  document.body.style.overflow = "hidden";
  els.articleModal.classList.add("is-open");
  els.articleModal.setAttribute("aria-hidden", "false");
}

function closeArticleDetail() {
  els.articleModal.classList.remove("is-open");
  els.articleModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  state.activeModalArticleId = null;
}

els.articleModalClose.addEventListener("click", closeArticleDetail);
els.articleModalBackdrop.addEventListener("click", closeArticleDetail);
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (els.articleModal.classList.contains("is-open")) closeArticleDetail();
  else if (els.chatDrawer.classList.contains("is-open")) closeChat();
});

// ===== Chat drawer =====
function openChat() { els.chatDrawer.classList.add("is-open"); }
function closeChat() { els.chatDrawer.classList.remove("is-open"); }

els.chatToggle.addEventListener("click", () => {
  state.activeChatContext = null;
  state.activeChatArticleId = null;
  els.chatContext.textContent = t("chatContextGeneral", state.language);
  openChat();
});
els.chatClose.addEventListener("click", closeChat);

function openChatWithContext(articleId) {
  const article = state.articles.find((a) => a.id === articleId);
  if (!article) return;
  // Always send Gemini the ORIGINAL English text as context, regardless of
  // display language — translating the context twice (display + chat) would
  // compound errors. The chat *response* is what gets localized instead.
  const summary = article.description || article.content || "";
  state.activeChatContext = summary ? `${article.title}. ${summary}` : article.title;
  state.activeChatArticleId = articleId;
  const display = getDisplayText(article);
  els.chatContext.textContent = `Context: "${display.title}"`;
  openChat();
}

els.chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const question = els.chatInput.value.trim();
  if (!question) return;

  appendMessage(question, "user");
  els.chatInput.value = "";

  const thinkingEl = appendMessage(t("thinking", state.language), "ai");

  try {
    const res = await fetch(`${API_BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question,
        articleContext: state.activeChatContext,
        language: LANGUAGE_NAMES[state.language],
      }),
    });
    const data = await res.json();
    thinkingEl.textContent = data.answer;
  } catch (err) {
    thinkingEl.textContent = `Couldn't reach the backend at ${API_BASE}. Check it's running.`;
    console.error(err);
  }
});

function appendMessage(text, role) {
  const div = document.createElement("div");
  div.className = `msg msg--${role}`;
  div.textContent = text;
  els.chatMessages.appendChild(div);
  els.chatMessages.scrollTop = els.chatMessages.scrollHeight;
  return div;
}

// ===== Init =====
loadNews();