import streamlit as st
from agents.parent import run_tourism_agent

st.set_page_config(page_title="Tourism Multi-Agent", layout="centered")
st.title("Tourism Multi-Agent")
text = st.text_input("Enter your query", "I'm going to go to Bangalore, let's plan my trip.")
if st.button("Run"):
    out = run_tourism_agent(text)
    st.write(out)

st.divider()
col1, col2, col3 = st.columns(3)
with col1:
    if st.button("Mumbai places"):
        st.write(run_tourism_agent("What places can I visit in Mumbai?"))
with col2:
    if st.button("Mysore places"):
        st.write(run_tourism_agent("what places can i visit in mysore"))
with col3:
    if st.button("Bangalore weather+places"):
        st.write(run_tourism_agent("I'm going to go to Bangalore, what is the temperature there? And what are the places I can visit?"))