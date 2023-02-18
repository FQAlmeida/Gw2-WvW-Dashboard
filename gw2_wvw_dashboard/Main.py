import streamlit as st
import requests as  req

from polars import DataFrame

data = req.get("http://192.168.0.11:8000/2022-1-1-0-0-0/2023-4-1-0-0-0").json()

st.json(data, expanded=False)

df = DataFrame(data)

st.dataframe(df.to_pandas())

