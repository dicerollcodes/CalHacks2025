from typing import List, Optional, Dict, Set
from .config import ALLOWED_CATEGORIES, DEFAULT_WEIGHTS


def norm_list(items: Optional[List[str]]) -> List[str]:
    if not items:
        return []
    seen, out = set(), []
    for raw in items:
        val = (raw or "").strip()
        if not val:
            continue
        key = val.lower()
        if key not in seen:
            seen.add(key)
            out.append(val)
    return out


def to_lower_set(values: List[str]) -> Set[str]:
    return {v.strip().lower() for v in (values or []) if v and v.strip()}


def normalized_weights(raw: Optional[Dict[str, float]]) -> Dict[str, float]:
    raw = raw or DEFAULT_WEIGHTS
    filtered = {k: float(v) for k, v in raw.items() if k in ALLOWED_CATEGORIES and float(v) >= 0.0}
    if not filtered:
        filtered = DEFAULT_WEIGHTS
    s = sum(filtered.values()) or 1.0
    return {k: v / s for k, v in filtered.items()}


def assert_category(cat: str):
    if cat not in ALLOWED_CATEGORIES:
        raise ValueError(f"Unsupported category '{cat}'. Use one of {ALLOWED_CATEGORIES}.")


def stable_pair_key(a: str, b: str) -> str:
    return ":".join(sorted([str(a), str(b)]))