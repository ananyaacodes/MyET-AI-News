<div align="center">

# 📰 MyET AI News

### **Stay Updated with the World of Artificial Intelligence**

<p>
A personalized AI news platform — real headlines, real Gemini-powered Q&A, styled like a cut-and-taped newsroom zine.
</p>

<br>

<img src="https://readme-typing-svg.demolab.com?font=Poppins&weight=600&size=22&duration=3500&pause=1200&color=0EA5E9&center=true&vCenter=true&width=700&lines=Latest+AI+News+at+Your+Fingertips;Responsive+Modern+UI;Powered+by+News+API;Built+with+HTML+CSS+JavaScript" />

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

**MyET AI News** delivers a personalized feed by profile (Student / Investor / Founder) and interest, with a real Gemini-powered assistant you can ask about any article. The frontend and backend are fully separate — a static site talking to an API over HTTP — so each can be run, deployed, or replaced independently.

It fetches real-time news using a news API and presents articles through a clean, intuitive interface designed for a seamless reading experience across desktop and mobile devices.

---

# ✨ Features

- 📰 Real-time AI & Technology News
- 🔍 Search Articles
- 📂 Category-wise Browsing
- 📱 Fully Responsive Design
- ⚡ Fast API Integration
- 🎨 Modern User Interface
- 🚀 Lightweight & Fast
- 🌐 Easy to Customize

---

# 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js + Express (pure JSON API) |
| Frontend | Vanilla HTML, CSS, JavaScript (static, no build step) |
| News data | [NewsAPI](https://newsapi.org) |
| AI Q&A | [Gemini API](https://ai.google.dev) (`gemini-2.5-flash`) |

---

# 📂 Project Structure

```bash

MyET-AI-News/
├── backend/
│   ├── server.js            # Express entry point (API only)
│   ├── routes/
│   │   ├── news.js           # GET /api/news
│   │   └── chat.js            # POST /api/chat
│   ├── services/
│   │   ├── newsService.js    # NewsAPI calls + mock fallback
│   │   └── geminiService.js  # Gemini API calls
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── index.html
│   ├── css/style.css         # Newsroom-zine collage design
│   └── js/app.js             # Talks to backend over fetch()
│
└── README.md

```

---

# 🚀 Getting Started

### Clone Repository

```bash
git clone https://github.com/ananyaacodes/MyET-AI-News.git
```

### Go into the project

```bash
cd MyET-AI-News
```

### 2. Run the backend
 
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
 
This runs the API at **http://localhost:3000**.
 
### 3. Run the frontend
 
In a **new terminal**, from the `frontend/` folder:
 
```bash
cd frontend
npx serve .
```
(Or just open `frontend/index.html` directly in a browser — it'll still work since it talks to the backend over `http://localhost:3000`.)
 
> If you deploy the backend somewhere other than `localhost:3000`, update `API_BASE` at the top of `frontend/js/app.js`.

---

# 🎨 Design
 
The frontend leans into a torn-newsprint, cut-and-taped zine look — halftone megaphone as the recurring "signal" motif, mustard sound-burst accents, typewriter body text, and a poster-style display face. Light mode is warm paper; dark mode swaps to a navy "night edition." Cards behave like pinned clippings: a slight tilt, a lift on hover, staggered fade-in on load.

---

# 🌟 Future Improvements
 
- 📊 Sentiment analysis per article
- 🔔 Push notifications for breaking news
- 🌍 Multi-language support
- 🗄️ Real database for saved articles instead of browser storage
- ☁️ Deploy backend + frontend separately (Render/Railway + Vercel/Netlify)

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