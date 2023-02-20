from typing import List
from dataclasses import dataclass


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
class MatchupOverview:
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
