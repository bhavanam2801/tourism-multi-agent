import streamlit as st
import subprocess
import time
import requests
import os

# ---------------------------
# Start Node.js server
# ---------------------------

st.write("Starting Node.js backend...")

# Start the backend ONCE using a global flag
if "server_started" not in st.session_state:
    st.session_state.server_started = True
    backend = subprocess.Popen(["node", "src/server.js"])
    time.sleep(3)  # wait for server to start

BASE_URL = "http://localhost:3000"

# ---------------------------
# Streamlit UI
# ---------------------------

st.title("🌍 Tourism Multi-Agent App (Node + Streamlit)")

st.subheader("Ask the Tourism Agent:")
query = st.text_input("Example: I'm going to go to Bangalore, plan my trip.")

if st.button("Run Agent"):
    try:
        r = requests.get(f"{BASE_URL}/query", params={"text": query})
        st.success(r.text)
    except:
        st.error("Backend is not reachable.")

st.subheader("Find Top Places:")
place = st.text_input("Enter a place to explore (e.g., Mumbai)")

if st.button("Find Places"):
    try:
        r = requests.get(f"{BASE_URL}/places", params={"place": place})
        st.info(r.text)
    except:
        st.error("Backend is not reachable.")

st.subheader("Weather in a City:")
city = st.text_input("Enter a city (e.g., Bangalore)")

if st.button("Get Weather"):
    try:
        r = requests.get(f"{BASE_URL}/weather", params={"place": city})
        st.success(r.text)
    except:
        st.error("Backend is not reachable.")
