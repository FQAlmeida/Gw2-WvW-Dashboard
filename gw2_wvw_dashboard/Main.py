from functools import reduce
import streamlit as st
import requests as req
from typing import List
from dacite import from_dict
from dataclasses import dataclass
from polars import DataFrame


@dataclass
class Score:
    red: int
    blue: int
    green: int


@dataclass
class AllWorlds:
    red: List[int]
    blue: List[int]
    green: List[int]


@dataclass
class Skirmish:
    id: int
    scores: Score
    # map_scores: List


@dataclass
class Data:
    id: str
    start_time: str
    end_time: str
    # scores: Score
    # worlds: Score
    # all_worlds: AllWorlds
    # deaths: Score
    # kills: Score
    # victory_points: Score
    skirmishes: List[Skirmish]
    # "maps": List[Map]


data: List[Data] = [from_dict(Data, d) for d in req.get(
    "http://192.168.0.11:8000/2022-1-1-0-0-0/2023-4-1-0-0-0").json()]

skirmishes = [d.skirmishes for d in data]
skirmishes = [DataFrame({"red": reduce(lambda old, new: [*old, old[-1] + new], [score.scores.red for score in d], [0]), "blue": reduce(lambda old, new: [*old, old[-1] + new],
                        [score.scores.blue for score in d], [0]), "green": reduce(lambda old, new: [*old, old[-1] + new], [score.scores.green for score in d], [0])}) for d in skirmishes]

index = st.slider('Data index', 0, len(skirmishes), 0)
st.line_chart(skirmishes[index].to_pandas(), y=skirmishes[index].columns)
st.dataframe(skirmishes[index].to_pandas())
