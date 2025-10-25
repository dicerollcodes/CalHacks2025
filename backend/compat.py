from typing import Dict, List, Set, Tuple
from .config import ALLOWED_CATEGORIES
from .utils import to_lower_set, normalized_weights


def compute_compatibility(
    user_a: Dict,
    user_b: Dict,
    weights: Dict[str, float] | None = None,
    reweight_active: bool = True,
) -> Tuple[int, Dict[str, dict]]:
    """
    Weighted Jaccard per category, scaled to 0–100. Returns (score, breakdown).

    - reweight_active=True: redistributes weights across only categories
      where at least one user has interests, so empty-on-both-sides
      categories don't dampen the score.
    """
    base_weights = normalized_weights(weights)

    # Determine active categories (non-empty union)
    active: List[str] = []
    a_sets: Dict[str, Set[str]] = {}
    b_sets: Dict[str, Set[str]] = {}
    for cat in ALLOWED_CATEGORIES:
        a_set = to_lower_set(user_a.get("interests", {}).get(cat, []))
        b_set = to_lower_set(user_b.get("interests", {}).get(cat, []))
        a_sets[cat], b_sets[cat] = a_set, b_set
        if a_set or b_set:
            active.append(cat)

    # Reweight if needed
    if reweight_active and active:
        w = {k: v for k, v in base_weights.items() if k in active}
        s = sum(w.values()) or 1.0
        weights_eff = {k: v / s for k, v in w.items()}
    else:
        weights_eff = base_weights

    total = 0.0
    breakdown: Dict[str, dict] = {}

    for cat in ALLOWED_CATEGORIES:
        a_set = a_sets[cat]
        b_set = b_sets[cat]
        inter = a_set & b_set
        union = a_set | b_set
        jaccard = (len(inter) / len(union)) if union else 0.0
        total += (weights_eff.get(cat, 0.0)) * jaccard * 100.0
        breakdown[cat] = {
            "common": _display_common(user_a, user_b, cat, inter),
            "jaccard": jaccard,
            "a_count": len(a_set),
            "b_count": len(b_set),
        }

    score = int(round(min(max(total, 0.0), 100.0)))
    return score, breakdown


def _display_common(user_a: Dict, user_b: Dict, cat: str, inter_set: Set[str]) -> List[str]:
    a_map = {v.strip().lower(): v for v in (user_a.get("interests", {}).get(cat) or [])}
    b_map = {v.strip().lower(): v for v in (user_b.get("interests", {}).get(cat) or [])}
    return [a_map.get(k) or b_map.get(k) or k for k in sorted(inter_set)]
