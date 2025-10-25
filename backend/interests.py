from typing import Optional, Dict
from pymongo.collection import Collection
from pymongo import ReturnDocument
from .utils import assert_category
from .db import now_utc


def ensure_interest(
    interests: Collection,
    category: str,
    name: str,
    image_url: Optional[str] = None,
) -> Dict:
    """
    Ensure an interest (category/name) exists in the registry; create if missing.
    Only updates image_url when a non-empty value is provided to avoid erasing existing.
    """
    assert_category(category)
    name_clean = (name or "").strip()
    if not name_clean:
        raise ValueError("Interest name cannot be empty.")

    base_doc = {
        "category": category,
        "name": name_clean,
        "name_lc": name_clean.lower(),
        "created_at": now_utc(),
        "updated_at": now_utc(),
    }

    update = {
        "$setOnInsert": base_doc,
        "$set": {"updated_at": now_utc()},
    }
    if image_url and image_url.strip():
        update["$set"]["image_url"] = image_url.strip()

    return interests.find_one_and_update(
        {"category": category, "name_lc": base_doc["name_lc"]},
        update,
        upsert=True,
        return_document=ReturnDocument.AFTER,
    )
