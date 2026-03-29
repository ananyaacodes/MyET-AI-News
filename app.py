import streamlit as st

st.set_page_config(page_title="MyET AI News", layout="centered")

st.title("🧠 MyET – AI News Experience")
st.markdown("Transforming news into personalized intelligence")

profile = st.selectbox(
    "👤 Select your profile",
    ["Student", "Investor", "Founder"]
)

st.write(f"### 📰 News for: {profile}")

st.info("Government announces new startup policy to boost innovation.")

st.subheader("💬 Ask AI about this news")

query = st.text_input("Enter your question:")

if query:
    st.success("🤖 AI Response:")
    st.write(
        "This policy helps startups by reducing compliance burden and improving funding access."
    )