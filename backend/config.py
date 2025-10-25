from typing import Dict, Tuple

# Whitelisted interest buckets
ALLOWED_CATEGORIES: Tuple[str, ...] = ("movie", "tv", "artist", "hobby")

# Default category weights (will be normalized)
DEFAULT_WEIGHTS: Dict[str, float] = {
    "movie": 0.35,
    "tv": 0.25,
    "artist": 0.25,
    "hobby": 0.15,
}

# TTL for cached compat results in seconds (set 0 or None to disable TTL)
COMPAT_TTL_SECONDS: int | None = 7 * 24 * 3600  # 7 days
