import logging
from typing import Dict, Optional
from bson import ObjectId
from pymongo.database import Database
from pymongo import ReturnDocument
from .models import UserProfile
from .interests import ensure_interest
from .config import ALLOWED_CATEGORIES
from .compat import compute_compatibility
from .utils import stable_pair_key
from .db import now_utc

logger = logging.getLogger(__name__)


class UserService:
    def __init__(self, db: Database):
        self.users = db.users
        self.interests = db.interests

    def upsert_user(self, profile: UserProfile) -> Dict:
        if not profile.name or not profile.name.strip():
            raise ValueError("User name is required.")
        if not profile.handle or not profile.handle.strip():
            raise ValueError("User handle is required and must be unique.")
        key = {"handle": profile.handle.strip().lower()}

        doc = profile.to_mongo()
        now = now_utc()
        doc.update({"updated_at": now, "created_at": doc.get("created_at") or now})

        # Ensure catalog entries exist for each interest
        for cat in ALLOWED_CATEGORIES:
            for v in doc["interests"].get(cat, []):
                try:
                    ensure_interest(self.interests, cat, v)
                except Exception as e:
                    logger.warning("ensure_interest failed for %s:%s - %s", cat, v, e)

        return self.users.find_one_and_update(
            key,
            {"$set": doc, "$setOnInsert": {"created_at": now}},
            upsert=True,
            return_document=ReturnDocument.AFTER,
        )

    def get_by_handle(self, handle: str) -> Optional[Dict]:
        if not handle:
            return None
        return self.users.find_one({"handle": (handle or "").strip().lower()})

    def get_by_id(self, user_id: str) -> Optional[Dict]:
        try:
            return self.users.find_one({"_id": ObjectId(user_id)})
        except Exception:
            return None


class CompatService:
    def __init__(self, db: Database):
        self.users = db.users
        self.compat = db.compatibilities

    def compare_and_cache(
        self,
        user_a_sel: Dict,
        user_b_sel: Dict,
        weights: Optional[Dict[str, float]] = None,
        reweight_active: bool = True,
    ) -> Dict:
        a = self.users.find_one(user_a_sel)
        b = self.users.find_one(user_b_sel)
        if not a or not b:
            raise ValueError("User A or User B not found.")

        score, details = compute_compatibility(a, b, weights, reweight_active=reweight_active)
        saved = self._store(a["_id"], b["_id"], score, details)

        return {
            "score": saved["score"],
            "breakdown": details,
            "users": {
                "a": {"_id": str(a["_id"]), "name": a["name"], "handle": a.get("handle")},
                "b": {"_id": str(b["_id"]), "name": b["name"], "handle": b.get("handle")},
            },
            "computed_at": saved["computed_at"].isoformat(),
        }

    def _store(self, a_id, b_id, score: int, details: Dict[str, dict]):
        a_str, b_str = str(a_id), str(b_id)
        pair_key = stable_pair_key(a_str, b_str)
        doc = {
            "user_a_id": ObjectId(a_str),
            "user_b_id": ObjectId(b_str),
            "pair_key": pair_key,
            "score": int(score),
            "details": details,
            "computed_at": now_utc(),
        }
        return self.compat.find_one_and_update(
            {"pair_key": pair_key},
            {"$set": doc},
            upsert=True,
            return_document=ReturnDocument.AFTER,
        )
