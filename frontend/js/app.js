// Backend runs separately (see /backend). Change this if you deploy it elsewhere.
const API_BASE = "http://localhost:3000";

// ===== State =====
const state = {
  profile: "General",
  interests: ["Technology", "Finance", "Startups", "Politics"],
  articles: [],
  savedIds: new Set(JSON.parse(localStorage.getItem("myet_saved") || "[]")),
  activeChatContext: null,
  searchTerm: "",
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
  chatToggle: document.getElementById("chatToggle"),
  chatDrawer: document.getElementById("chatDrawer"),
  chatClose: document.getElementById("chatClose"),
  chatContext: document.getElementById("chatContext"),
  chatMessages: document.getElementById("chatMessages"),
  chatForm: document.getElementById("chatForm"),
  chatInput: document.getElementById("chatInput"),
  searchInput: document.getElementById("searchInput"),
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

// ===== Profile picker =====
els.profilePicker.addEventListener("click", (e) => {
  const btn = e.target.closest(".profile-btn");
  if (!btn) return;
  els.profilePicker.querySelectorAll(".profile-btn").forEach((b) => b.classList.remove("is-active"));
  btn.classList.add("is-active");
  state.profile = btn.dataset.profile;
  els.profileLabel.textContent = state.profile;
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

// ===== Search (client-side filter over loaded articles) =====
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
  els.newsGrid.innerHTML = `<p style="color:var(--ink-soft); font-family: var(--font-body);">Fetching signal…</p>`;

  try {
    const params = new URLSearchParams({
      interests: state.interests.join(","),
      profile: state.profile,
    });
    const res = await fetch(`${API_BASE}/api/news?${params}`);
    const data = await res.json();

    state.articles = data.articles || [];
    renderGrid();
    renderTicker();

    if (data.source === "mock") {
      els.sourceNote.textContent = "Showing demo clippings — add NEWS_API_KEY to backend/.env for live data.";
    } else if (data.source === "mock-fallback") {
      els.sourceNote.textContent = `Live fetch failed, showing demo data. (${data.error || "unknown error"})`;
    } else {
      els.sourceNote.textContent = "Live feed from NewsAPI.";
    }
  } catch (err) {
    els.newsGrid.innerHTML = `<p style="color:var(--red-burst);">Couldn't reach the backend at ${API_BASE}. Is it running?</p>`;
    console.error(err);
  }
}

function renderGrid() {
  const term = state.searchTerm;
  const visible = term
    ? state.articles.filter(
        (a) =>
          a.title.toLowerCase().includes(term) ||
          a.description.toLowerCase().includes(term)
      )
    : state.articles;

  if (visible.length === 0) {
    const msg = term
      ? `No clippings match "${escapeHtml(term)}".`
      : "No articles match your selected interests. Try adding one.";
    els.newsGrid.innerHTML = `<p style="color:var(--ink-soft);">${msg}</p>`;
    return;
  }

  els.newsGrid.innerHTML = visible
    .map((a, i) => {
      const isSaved = state.savedIds.has(a.id);
      const tilt = [-1, 1, -0.6, 0.8][i % 4];
      const delay = (i % 6) * 0.06;
      const imageBlock = a.image
        ? `<div class="card__image-wrap">
             <img class="card__image" src="${a.image}" alt="" loading="lazy"
               onerror="this.parentElement.remove()" />
           </div>`
        : "";
      return `
        <article class="card" data-id="${a.id}" style="--tilt:${tilt}deg; animation-delay:${delay}s;">
          ${imageBlock}
          <span class="card__meta">${a.category} · ${a.source}</span>
          <h3 class="card__title">${escapeHtml(a.title)}</h3>
          <p class="card__desc">${escapeHtml(a.description)}</p>
          <div class="card__actions">
            <button class="card__action save-btn ${isSaved ? "is-saved" : ""}" data-id="${a.id}">
              <svg width="14" height="14"><use href="#icon-star"/></svg> ${isSaved ? "Saved" : "Save"}
            </button>
            <button class="card__action ask-btn" data-id="${a.id}">
              <svg width="14" height="14"><use href="#icon-megaphone"/></svg> Ask AI
            </button>
          </div>
        </article>
      `;
    })
    .join("");

  els.newsGrid.querySelectorAll(".save-btn").forEach((btn) => {
    btn.addEventListener("click", () => toggleSave(btn.dataset.id, btn));
  });
  els.newsGrid.querySelectorAll(".ask-btn").forEach((btn) => {
    btn.addEventListener("click", () => openChatWithContext(btn.dataset.id));
  });
}

function renderTicker() {
  const titles = state.articles.map((a) => `▸ ${a.title}`).join("   ");
  els.tickerTrack.innerHTML = `<span class="ticker__item">${escapeHtml(titles || "No headlines yet.")}</span>`;
}

function toggleSave(id, btn) {
  if (state.savedIds.has(id)) {
    state.savedIds.delete(id);
    btn.classList.remove("is-saved");
    btn.innerHTML = `<svg width="14" height="14"><use href="#icon-star"/></svg> Save`;
  } else {
    state.savedIds.add(id);
    btn.classList.add("is-saved");
    btn.innerHTML = `<svg width="14" height="14"><use href="#icon-star"/></svg> Saved`;
  }
  localStorage.setItem("myet_saved", JSON.stringify([...state.savedIds]));
}

function escapeHtml(str = "") {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ===== Chat drawer =====
function openChat() { els.chatDrawer.classList.add("is-open"); }
function closeChat() { els.chatDrawer.classList.remove("is-open"); }

els.chatToggle.addEventListener("click", () => {
  state.activeChatContext = null;
  els.chatContext.textContent = "General question — not tied to a specific clipping.";
  openChat();
});
els.chatClose.addEventListener("click", closeChat);

function openChatWithContext(articleId) {
  const article = state.articles.find((a) => a.id === articleId);
  if (!article) return;
  state.activeChatContext = `${article.title}. ${article.description}`;
  els.chatContext.textContent = `Context: "${article.title}"`;
  openChat();
}

els.chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const question = els.chatInput.value.trim();
  if (!question) return;

  appendMessage(question, "user");
  els.chatInput.value = "";

  const thinkingEl = appendMessage("Thinking…", "ai");

  try {
    const res = await fetch(`${API_BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, articleContext: state.activeChatContext }),
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