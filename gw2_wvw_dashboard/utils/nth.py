from typing import List, TypeVar
from itertools import islice

T = TypeVar('T')
def nth(iterable: List[T], n: int, default: T) -> T:
    if len(iterable) == 0 and n <= 0:
        return default
    n = n if n >= 0 else len(iterable) + n
    return next(islice(iterable, n, None), default)
