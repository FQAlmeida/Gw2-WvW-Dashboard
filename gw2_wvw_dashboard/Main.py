from functools import reduce
import streamlit as st
from dacite import from_dict
from polars import DataFrame
from api_adapter import get_data
from models.MatchupOverview import MatchupOverview
from utils.nth import nth

data = [from_dict(MatchupOverview, d) for d in get_data()]

skirmishes = [d.skirmishes for d in data]
skirmishes = [
    DataFrame({
        "red": reduce(lambda old, new: [*old, nth(old, -1, 0) + new], [score.scores.red for score in d], []),
        "blue": reduce(lambda old, new: [*old, nth(old, -1, 0) + new], [score.scores.blue for score in d], []),
        "green": reduce(lambda old, new: [*old, nth(old, -1, 0) + new], [score.scores.green for score in d], [])
    })
    for d in skirmishes
]

index: int = st.slider('Data index', 0, len(skirmishes)-1, 0)
st.line_chart(skirmishes[index].to_pandas(), y=skirmishes[index].columns)
st.dataframe(skirmishes[index].to_pandas())
