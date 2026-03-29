import streamlit as st

# Page Config
st.set_page_config(page_title="MyET AI News", layout="centered")

# Title
st.title("🧠 MyET – AI News Experience")
st.markdown("Transforming news into personalized intelligence")

# ------------------ BREAKING NEWS ------------------
st.markdown("## 🚨 Breaking News")
st.warning("Global markets react to new economic policies announced today.")

# ------------------ TRENDING ------------------
st.markdown("## 📈 Trending Topics")

col1, col2 = st.columns(2)

with col1:
    st.info("💡 AI Revolution in 2026")
    st.info("🚀 Startup Funding Boom")

with col2:
    st.info("📊 Stock Market Trends")
    st.info("🌍 Global Policy Changes")

# ------------------ SIDEBAR ------------------
st.sidebar.header("⚙️ Settings")

theme = st.sidebar.selectbox("Select Theme", ["Light", "Dark"])

interest = st.sidebar.multiselect(
    "Select Interests",
    ["Technology", "Finance", "Startups", "Politics"]
)

# ------------------ PROFILE ------------------
profile = st.selectbox(
    "👤 Select your profile",
    ["Student", "Investor", "Founder"]
)

st.write(f"### 📰 News for: {profile}")

# ------------------ NEWS SECTION ------------------
st.subheader("Top News")

st.info("📌 Government announces new startup policy to boost innovation.")
st.info("📌 AI adoption increases across industries globally.")
st.info("📌 New investment opportunities emerging in tech sector.")

# ------------------ SAVE BUTTON ------------------
if st.button("⭐ Save this news"):
    st.success("Saved to your reading list!")

# ------------------ AI CHAT ------------------
st.subheader("💬 Ask AI about this news")

query = st.text_input("Enter your question:")

if query:
    st.success("🤖 AI Response:")

    if "startup" in query.lower():
        response = "This policy reduces compliance burden and improves funding access for startups."
    elif "invest" in query.lower():
        response = "This creates new investment opportunities in emerging sectors."
    elif "student" in query.lower():
        response = "Students can benefit by exploring new opportunities in AI and startups."
    else:
        response = "This news has significant impact depending on your profile and interests."

    st.write(response)

# ------------------ FEEDBACK ------------------
st.subheader("👍 Feedback")

feedback = st.radio("Was this helpful?", ["Yes", "No"])

# ------------------ FOOTER ------------------
st.markdown("---")
st.caption("Built for ET GenAI Hackathon 🚀")
