import os
import logging
from datetime import datetime, timezone
from pymongo import MongoClient, ASCENDING
from pymongo.errors import ServerSelectionTimeoutError
from .config import COMPAT_TTL_SECONDS

logger = logging.getLogger(__name__)

MONGODB_URI = os.getenv("MONGODB_URI", "")
DB_NAME = os.getenv("DB_NAME", "")

_client: MongoClient | None = None


def get_db():
    """Return DB instance and ensure indexes exist."""
    global _client
    if not MONGODB_URI or not DB_NAME:
        raise RuntimeError("MONGODB_URI and DB_NAME must be set in the environment.")
    if _client is None:
        _client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=8000)
        # Touch the server once to fail fast if bad URI
        try:
            _client.admin.command("ping")
        except ServerSelectionTimeoutError as e:
            raise RuntimeError(f"Cannot connect to MongoDB: {e}") from e
    db = _client[DB_NAME]
    _ensure_indexes(db)
    return db


def _ensure_indexes(db):
    # Users
    db.users.create_index([("handle", ASCENDING)], unique=True, sparse=True)
    db.users.create_index([("name", ASCENDING)], sparse=True)

    # Interests registry (normalized catalog)
    db.interests.create_index([("category", ASCENDING), ("name_lc", ASCENDING)], unique=True)

    # Cached compatibility results
    db.compatibilities.create_index([("pair_key", ASCENDING)], unique=True)
    if COMPAT_TTL_SECONDS and COMPAT_TTL_SECONDS > 0:
        # TTL on computed_at; re-compute after expiry
        db.compatibilities.create_index(
            [("computed_at", ASCENDING)],
            expireAfterSeconds=COMPAT_TTL_SECONDS,
            name="compat_ttl",
        )


def now_utc():
    return datetime.now(timezone.utc)
