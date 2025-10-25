import os
import logging
from typing import Dict, Optional
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, constr, conlist, validator
from bson import ObjectId

from .db import get_db
from .services import UserService, CompatService
from .models import UserProfile

logger = logging.getLogger("compat_app")
logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"))

app = FastAPI(title="Compatibility API", version="1.0.0")

# --- CORS ---
origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "*").split(",")] if os.getenv("CORS_ORIGINS") else ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)


# --- Dependency wiring ---
def user_svc(db=Depends(get_db)) -> UserService:
    return UserService(db)


def compat_svc(db=Depends(get_db)) -> CompatService:
    return CompatService(db)


# --- Pydantic Schemas ---
InterestList = conlist(constr(strip_whitespace=True, min_length=1, max_length=120), max_items=100)


class UserIn(BaseModel):
    name: constr(strip_whitespace=True, min_length=1, max_length=120)
    handle: constr(strip_whitespace=True, min_length=1, max_length=64)
    uni: Optional[constr(strip_whitespace=True, max_length=160)] = None
    movie: Optional[InterestList] = Field(default_factory=list)
    tv: Optional[InterestList] = Field(default_factory=list)
    artist: Optional[InterestList] = Field(default_factory=list)
    hobby: Optional[InterestList] = Field(default_factory=list)

    @validator("handle")
    def handle_lower(cls, v):
        return v.lower()


class UserOut(BaseModel):
    id: str
    handle: Optional[str] = None


class UserPublic(BaseModel):
    name: str
    handle: Optional[str]
    uni: Optional[str] = None
    interests: Dict[str, list]


class WeightsIn(BaseModel):
    movie: Optional[float] = None
    tv: Optional[float] = None
    artist: Optional[float] = None
    hobby: Optional[float] = None


class CompatOut(BaseModel):
    score: int
    users: Dict[str, Dict[str, Optional[str]]]
    breakdown: Dict[str, dict]
    computed_at: str


# --- Routes ---
@app.get("/", tags=["meta"])
def health():
    return {"ok": True}


@app.post("/users", response_model=UserOut, tags=["users"])
def upsert_user(payload: UserIn, svc: UserService = Depends(user_svc)):
    try:
        doc = svc.upsert_user(UserProfile(**payload.dict()))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"id": str(doc["_id"]), "handle": doc.get("handle")}


@app.get("/users/{handle}", response_model=UserPublic, tags=["users"])
def get_user(handle: str, svc: UserService = Depends(user_svc)):
    u = svc.get_by_handle(handle)
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "name": u["name"],
        "handle": u.get("handle"),
        "uni": u.get("uni"),
        "interests": u.get("interests", {}),
    }


@app.get("/compat", response_model=CompatOut, tags=["compat"])
def get_compat_by_handle(
    me_handle: str = Query(..., description="Your handle"),
    other_handle: str = Query(..., description="The handle to compare with"),
    reweight_active: bool = Query(True, description="Redistribute weights across non-empty categories"),
    svc: CompatService = Depends(compat_svc),
):
    try:
        result = svc.compare_and_cache(
            {"handle": me_handle.strip().lower()},
            {"handle": other_handle.strip().lower()},
            weights=None,
            reweight_active=reweight_active,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.post("/compat", response_model=CompatOut, tags=["compat"])
def post_compat(
    me_id: Optional[str] = Body(None, embed=True),
    me_handle: Optional[str] = Body(None, embed=True),
    other_id: Optional[str] = Body(None, embed=True),
    other_handle: Optional[str] = Body(None, embed=True),
    weights: Optional[WeightsIn] = Body(None, embed=True),
    reweight_active: bool = Body(True, embed=True),
    svc: CompatService = Depends(compat_svc),
):
    """
    Compute & cache compatibility. Accepts either ids or handles for both users.
    Optional weight overrides in body.
    """
    if me_id:
        a_sel = {"_id": ObjectId(me_id)}
    elif me_handle:
        a_sel = {"handle": me_handle.strip().lower()}
    else:
        raise HTTPException(400, "Provide me_id or me_handle")

    if other_id:
        b_sel = {"_id": ObjectId(other_id)}
    elif other_handle:
        b_sel = {"handle": other_handle.strip().lower()}
    else:
        raise HTTPException(400, "Provide other_id or other_handle")

    try:
        result = svc.compare_and_cache(
            a_sel, b_sel, weights=weights and weights.dict(exclude_none=True), reweight_active=reweight_active
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
