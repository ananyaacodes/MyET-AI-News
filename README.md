<div align="center">

# 📰 MyET AI News

### **Stay Updated with the World of Artificial Intelligence**

<p>
A personalized AI news platform — real headlines, real Gemini-powered Q&A, styled like a cut-and-taped newsroom zine.
</p>

<br>

<img src="https://readme-typing-svg.demolab.com?font=Poppins&weight=600&size=22&duration=3500&pause=1200&color=0EA5E9&center=true&vCenter=true&width=700&lines=Personalized+AI%2C+Finance+%26+Startup+News;Real+Gemini-Powered+Q%26A+on+Any+Article;5-Language+Live+Translation;Built+with+Node.js%2C+Express+%26+Gemini" />

<br><br>
![HTML](https://img.shields.io/badge/HTML-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github)
<br><br>
![Node](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini_API-4285F4?style=for-the-badge&logo=google&logoColor=white)
![NewsAPI](https://img.shields.io/badge/NewsAPI-FF6600?style=for-the-badge)
<br>

</div>

---

# 📖 About

**MyET AI News** delivers a personalized feed by profile (General / Student / Investor / Founder) and interest area, pulling live headlines from established outlets only — not GitHub READMEs or forum posts. Every article opens into a full newspaper-style detail view, and a real Gemini-powered assistant can answer questions about any story, in any of five supported languages.

The frontend and backend are fully separate — a static site talking to a JSON API over HTTP — so each can be run, deployed, or replaced independently.

---

# ✨ Features

- 📰 **Live news from quality outlets** — Forbes, Reuters, TechCrunch, BBC, CNBC, and more; a domain allowlist filters out low-quality/dev-forum noise
- 🎯 **Real profile personalization** — Student, Investor, and Founder each bias the query toward what that reader actually cares about (careers vs. earnings vs. funding), not just a cosmetic label
- 🔍 **Live search** over your loaded feed
- 📖 **Full article detail view** — headline, byline, sepia photo, expanded body text, and a link to the original story, all in one click with a smooth open/close animation
- 🤖 **Real Gemini Q&A** — ask about any article specifically, or ask general questions, with full conversation context
- 🌍 **5-language support** (English, Hindi, Spanish, French, German) — UI, article content, and AI answers all translate, with per-article translation caching so switching languages doesn't re-translate every time
- 🖼️ **Sepia photo treatment** that lifts to full color on hover, with a themed placeholder for articles without a photo
- ⭐ **Save articles** for later (persisted in browser storage)
- 🌗 **Light/dark theme** — a warm "day edition" and a navy "night edition"
- 📡 **Live scrolling headline ticker**
- 🛡️ **Graceful everywhere** — missing API keys, missing images, missing descriptions, or a failed request never break the UI; it degrades to sensible fallbacks instead

---

# 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js + Express (pure JSON API) |
| Frontend | Vanilla HTML, CSS, JavaScript (static, no build step) |
| News data | [NewsAPI](https://newsapi.org) |
| AI Q&A + Translation | [Gemini API](https://ai.google.dev) (`gemini-2.5-flash`) |

---

# 📂 Project Structure

```bash
MyET-AI-News/
├── backend/
│   ├── server.js              # Express entry point (API only)
│   ├── routes/
│   │   ├── news.js             # GET /api/news
│   │   ├── chat.js             # POST /api/chat
│   │   └── translate.js        # POST /api/translate
│   ├── services/
│   │   ├── newsService.js     # NewsAPI calls, domain filtering, mock fallback
│   │   └── geminiService.js   # Gemini chat + batch translation calls
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── index.html
│   ├── css/style.css           # Newsroom-zine collage design
│   └── js/
│       ├── i18n.js             # UI dictionary for all 5 languages
│       └── app.js              # Talks to backend over fetch()
│
└── README.md
```

---

# 🚀 Getting Started

### Clone the repository

```bash
git clone https://github.com/ananyaacodes/MyET-AI-News.git
cd MyET-AI-News
```

### Run the backend

```bash
cd backend
npm install
cp .env.example .env
```

Fill in `.env`:
- `NEWS_API_KEY` from [newsapi.org/register](https://newsapi.org/register)
- `GEMINI_API_KEY` from [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

```bash
npm start
```

This runs the API at **http://localhost:3000**. It works even without keys set — it'll serve mock articles and a clear "not connected yet" message instead of crashing.

### Run the frontend

In a **new terminal**, from the `frontend/` folder:

```bash
cd frontend
npx serve .
```

(Or just open `frontend/index.html` directly in a browser — it still works, since it talks to the backend over `http://localhost:3000`.)

> If you deploy the backend somewhere other than `localhost:3000`, update `API_BASE` at the top of `frontend/js/app.js`.

---

# 🎨 Design

The frontend leans into a torn-newsprint, cut-and-taped zine look — a halftone megaphone as the recurring "signal" motif, mustard sound-burst accents, typewriter body text, and a poster-style display face. Light mode is warm paper; dark mode swaps to a navy "night edition." Cards behave like pinned clippings: a slight tilt, a lift on hover, staggered fade-in on load. The article detail view borrows a pop-art starburst and speech-bubble accent from the same collage family, keeping the whole app feeling like one consistent scrapbook rather than a generic dashboard.

---

# 🌟 Future Improvements

- 📊 Sentiment analysis per article
- 🔔 Push notifications for breaking news
- 🗄️ Real database for saved articles instead of browser storage
- ☁️ Deploy backend + frontend separately (Render/Railway + Vercel/Netlify)
- 🌐 Additional languages beyond the current five

---

# 🤝 Contributing

Contributions are welcome!

1. Fork this repository
2. Create a new branch

```bash
git checkout -b feature-name
```

3. Commit your changes

```bash
git commit -m "Add new feature"
```

4. Push

```bash
git push origin feature-name
```

5. Create a Pull Request

---

# 📈 Project Status

🟢 **Active Development**

New features and improvements are continuously being added.

---

# 👩‍💻 Developer

<div align="center">

### **Ananya Raj**

<a href="https://github.com/ananyaacodes">
<img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github">
</a>

<a href="https://www.linkedin.com/in/ananya-raj-5008a4371/">
<img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin">
</a>

</div>

---

<div align="center">

### ⭐ If you found this project helpful, please consider giving it a Star!

Made with ❤️ by **Ananya Raj**

</div>