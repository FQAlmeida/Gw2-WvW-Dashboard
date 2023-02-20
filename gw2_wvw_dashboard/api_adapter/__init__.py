import streamlit as st
import requests as req


@st.cache_data
def get_data():
    return req.get(
        "http://192.168.0.11:8000/2022-1-1-0-0-0/2023-4-1-0-0-0").json()
