"""Request schemas with basic validation / sanitising."""
from __future__ import annotations

import re
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

INTERESTS = [
    "Architecture", "History", "Culture", "Food", "Cafés", "Shopping",
    "Nature", "Adventure", "Photography", "Art", "Hidden gems", "Local experiences",
]

_WS = re.compile(r"\s+")


def _clean(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None
    value = _WS.sub(" ", value).strip()
    return value or None


class TripRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")

    destination: str = Field(..., min_length=2, max_length=100)
    days: int = Field(..., ge=1, le=14)
    start_location: Optional[str] = Field(None, max_length=100)
    travel_dates: Optional[str] = Field(None, max_length=60, description="Month or dates, free text")
    travellers: Optional[int] = Field(None, ge=1, le=20)
    budget: Optional[str] = Field(None, max_length=40)
    interests: list[str] = Field(default_factory=list, max_length=12)
    accommodation: Optional[str] = Field(None, max_length=60)
    travel_style: Optional[str] = Field(None, max_length=60)
    notes: Optional[str] = Field(None, max_length=500)

    @field_validator("destination", mode="before")
    @classmethod
    def _dest(cls, v):
        return _clean(v) if isinstance(v, str) else v

    @field_validator("start_location", "travel_dates", "budget", "accommodation", "travel_style", "notes", mode="before")
    @classmethod
    def _opt(cls, v):
        return _clean(v) if isinstance(v, str) else v

    @field_validator("interests", mode="before")
    @classmethod
    def _interests(cls, v):
        if v is None:
            return []
        if isinstance(v, list):
            seen: list[str] = []
            for item in v:
                if isinstance(item, str):
                    c = _clean(item)
                    if c and len(c) <= 40 and c not in seen:
                        seen.append(c)
            return seen
        return v

    @field_validator("destination")
    @classmethod
    def _dest_has_letters(cls, v: str) -> str:
        if not re.search(r"[^\W\d_]", v):
            raise ValueError("Destination must contain letters")
        return v


class PhotoRequest(BaseModel):
    queries: list[str] = Field(..., min_length=1, max_length=16)
    context: Optional[str] = Field(None, max_length=100, description="Destination, used to disambiguate")

    @field_validator("queries")
    @classmethod
    def _q(cls, v: list[str]) -> list[str]:
        out = []
        for q in v:
            q = _WS.sub(" ", q).strip()
            if 2 <= len(q) <= 120 and q not in out:
                out.append(q)
        if not out:
            raise ValueError("No usable queries")
        return out
