"""Schemas for the completed-trip 'memory book'.

Only TEXT and photo METADATA (id / caption / where the user put it) ever reach the backend.
The photographs themselves stay in the browser (IndexedDB) and are never sent to Gemini.
"""
from __future__ import annotations

import re
from datetime import datetime, timezone
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

from .design import Design
from .journal import _Lenient, _clip_list

_WS = re.compile(r"\s+")
SECTIONS = ("auto", "cover", "journey", "place", "food", "day", "keep")
_ID = re.compile(r"^[A-Za-z0-9_-]{1,64}$")


def _clean(v):
    if isinstance(v, str):
        v = _WS.sub(" ", v).strip()
        return v or None
    return v


def _clean_list(v, max_len: int, max_items: int):
    if not isinstance(v, list):
        return []
    out: list[str] = []
    for item in v:
        c = _clean(item) if isinstance(item, str) else None
        if c and c not in out:
            out.append(c[:max_len])
    return out[:max_items]


class MemoryPlaceIn(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str = Field(..., min_length=1, max_length=80)
    day: Optional[int] = Field(None, ge=1, le=60)
    note: Optional[str] = Field(None, max_length=400)

    @field_validator("name", "note", mode="before")
    @classmethod
    def _c(cls, v):
        return _clean(v)


class MemoryActivityIn(BaseModel):
    model_config = ConfigDict(extra="ignore")
    text: str = Field(..., min_length=1, max_length=300)
    day: Optional[int] = Field(None, ge=1, le=60)

    @field_validator("text", mode="before")
    @classmethod
    def _c(cls, v):
        return _clean(v)


class MemoryFoodIn(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str = Field(..., min_length=1, max_length=80)
    note: Optional[str] = Field(None, max_length=300)

    @field_validator("name", "note", mode="before")
    @classmethod
    def _c(cls, v):
        return _clean(v)


class MemoryPhotoIn(BaseModel):
    """Metadata about one uploaded photo. NO image data."""
    model_config = ConfigDict(extra="ignore")
    id: str
    caption: Optional[str] = Field(None, max_length=200)
    section: Literal["auto", "cover", "journey", "place", "food", "day", "keep"] = "auto"
    place: Optional[str] = Field(None, max_length=80)
    day: Optional[int] = Field(None, ge=1, le=60)

    @field_validator("id")
    @classmethod
    def _id(cls, v: str) -> str:
        if not _ID.match(v):
            raise ValueError("invalid photo id")
        return v

    @field_validator("caption", "place", mode="before")
    @classmethod
    def _c(cls, v):
        return _clean(v)


class MemoryRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")

    destination: str = Field(..., min_length=2, max_length=100)
    dates: Optional[str] = Field(None, max_length=60)
    days: Optional[int] = Field(None, ge=1, le=60)
    companions: list[str] = Field(default_factory=list, max_length=10)
    places: list[MemoryPlaceIn] = Field(..., min_length=1, max_length=25)
    activities: list[MemoryActivityIn] = Field(default_factory=list, max_length=40)
    food: list[MemoryFoodIn] = Field(default_factory=list, max_length=25)
    moments: list[str] = Field(default_factory=list, max_length=12)
    experiences: list[str] = Field(default_factory=list, max_length=12)
    notes: Optional[str] = Field(None, max_length=1000)
    photos: list[MemoryPhotoIn] = Field(default_factory=list, max_length=80)

    @field_validator("destination", "dates", "notes", mode="before")
    @classmethod
    def _opt(cls, v):
        return _clean(v)

    @field_validator("companions", mode="before")
    @classmethod
    def _comp(cls, v):
        return _clean_list(v, 40, 10)

    @field_validator("moments", "experiences", mode="before")
    @classmethod
    def _lists(cls, v):
        return _clean_list(v, 400, 12)

    @field_validator("destination")
    @classmethod
    def _letters(cls, v: str) -> str:
        if not re.search(r"[^\W\d_]", v):
            raise ValueError("Destination must contain letters")
        return v


# ----------------------------------------------------------------------------------- AI output
class MemPlaceOut(_Lenient):
    name: str = Field(..., min_length=1, max_length=120)
    caption: str = ""
    annotation: str = ""


class MemFoodOut(_Lenient):
    name: str = Field(..., min_length=1, max_length=120)
    caption: str = ""


class MemDayOut(_Lenient):
    day: int = Field(..., ge=1, le=60)
    title: str = ""
    summary: str = ""


class PhotoPlan(_Lenient):
    cover: list[str] = Field(default_factory=list)
    journey: list[str] = Field(default_factory=list)
    food: list[str] = Field(default_factory=list)
    keep: list[str] = Field(default_factory=list)
    places: dict[str, list[str]] = Field(default_factory=dict)
    days: dict[str, list[str]] = Field(default_factory=dict)


class MemoryJournal(_Lenient):
    title: str = Field(..., min_length=1, max_length=160)
    subtitle: str = ""
    intro: str = ""
    why_memorable: str = ""
    places: list[MemPlaceOut] = Field(default_factory=list)
    food: list[MemFoodOut] = Field(default_factory=list)
    days: list[MemDayOut] = Field(default_factory=list)
    highlights: list[str] = Field(default_factory=list)
    closing_note: str = ""
    annotations: list[str] = Field(default_factory=list)
    design: Design = Field(default_factory=Design)
    photo_plan: PhotoPlan = Field(default_factory=PhotoPlan)

    _c_h = field_validator("highlights", mode="before")(lambda cls, v: _clip_list(v, 12))
    _c_a = field_validator("annotations", mode="before")(lambda cls, v: _clip_list(v, 8))


class MemoryMeta(BaseModel):
    model: str
    generated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class MemoryResponse(BaseModel):
    memory: MemoryJournal
    trip: MemoryRequest
    meta: MemoryMeta
