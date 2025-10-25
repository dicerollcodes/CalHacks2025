from __future__ import annotations
from dataclasses import dataclass, field
from typing import List, Optional, Dict
from .utils import norm_list


@dataclass
class UserProfile:
    name: str
    handle: Optional[str] = None
    uni: Optional[str] = None
    movie: List[str] = field(default_factory=list)
    tv: List[str] = field(default_factory=list)
    artist: List[str] = field(default_factory=list)
    hobby: List[str] = field(default_factory=list)

    def to_mongo(self) -> Dict:
        return {
            "name": (self.name or "").strip(),
            "handle": (self.handle or None) and self.handle.strip().lower(),
            "uni": (self.uni or "").strip() or None,
            "interests": {
                "movie": norm_list(self.movie),
                "tv": norm_list(self.tv),
                "artist": norm_list(self.artist),
                "hobby": norm_list(self.hobby),
            },
        }
