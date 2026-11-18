"""Pydantic models for the AI-generated journal. Lenient on small gaps, strict on essentials."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from .design import Design
from .request import TripRequest


class _Lenient(BaseModel):
    model_config = ConfigDict(extra="ignore", str_strip_whitespace=True)

    @model_validator(mode="before")
    @classmethod
    def _drop_nulls(cls, data):
        if isinstance(data, dict):
            return {k: v for k, v in data.items() if v is not None}
        return data


def _clip_list(v, n):
    return v[:n] if isinstance(v, list) else v


class Place(_Lenient):
    name: str = Field(..., min_length=1, max_length=120)
    kind: str = "landmark"           # landmark|temple|museum|nature|market|neighbourhood|viewpoint|street|park|gallery|other
    area: str = ""
    description: str = ""
    note: str = ""                   # short handwritten-style annotation
    needs_verification: bool = False


class FoodItem(_Lenient):
    name: str = Field(..., min_length=1, max_length=120)
    category: str = "dish"           # dish|restaurant|cafe|experience
    area: str = ""
    description: str = ""
    note: str = ""
    needs_verification: bool = False


class StayArea(_Lenient):
    name: str = Field(..., min_length=1, max_length=120)
    vibe: str = ""
    why: str = ""
    best_for: str = ""


class Stay(_Lenient):
    name: str = Field(..., min_length=1, max_length=120)
    area: str = ""
    style: str = ""
    description: str = ""
    needs_verification: bool = True


class RouteCluster(_Lenient):
    name: str = Field(..., min_length=1, max_length=120)
    places: list[str] = Field(default_factory=list)
    note: str = ""

    _clip = field_validator("places", mode="before")(lambda cls, v: _clip_list(v, 8))


class Route(_Lenient):
    summary: str = ""
    order: list[str] = Field(default_factory=list)       # ordered stop names for the map page
    clusters: list[RouteCluster] = Field(default_factory=list)

    _clip_order = field_validator("order", mode="before")(lambda cls, v: _clip_list(v, 10))
    _clip_clusters = field_validator("clusters", mode="before")(lambda cls, v: _clip_list(v, 5))


class Stop(_Lenient):
    part: str = ""                   # Morning / Afternoon / Evening
    place: str = Field(..., min_length=1, max_length=120)
    activity: str = ""


class FoodStop(_Lenient):
    name: str = ""
    note: str = ""


class Day(_Lenient):
    day: int = Field(..., ge=1, le=30)
    title: str = Field(..., min_length=1, max_length=140)
    area: str = ""
    intro: str = ""
    stops: list[Stop] = Field(default_factory=list)
    food_stop: Optional[FoodStop] = None
    caption: str = ""

    _clip = field_validator("stops", mode="before")(lambda cls, v: _clip_list(v, 4))


class Journal(_Lenient):
    title: str = Field(..., min_length=1, max_length=160)
    destination: str = Field(..., min_length=1, max_length=120)
    country: str = ""
    subtitle: str = ""
    intro: str = ""
    editorial: str = ""
    facts: list[str] = Field(default_factory=list)
    places: list[Place] = Field(..., min_length=1)
    food: list[FoodItem] = Field(default_factory=list)
    stay_areas: list[StayArea] = Field(default_factory=list)
    stays: list[Stay] = Field(default_factory=list)
    stay_notes: str = ""
    route: Route = Field(default_factory=Route)
    days: list[Day] = Field(..., min_length=1)
    tips: list[str] = Field(default_factory=list)
    customs: list[str] = Field(default_factory=list)
    useful_info: list[str] = Field(default_factory=list)
    packing: list[str] = Field(default_factory=list)
    annotations: list[str] = Field(default_factory=list)
    design: Design = Field(default_factory=Design)
    disclaimer: str = (
        "Recommendations are AI-generated from general knowledge, without live data. "
        "Opening hours, prices, availability and travel times are not included — please verify before you travel."
    )

    _c_facts = field_validator("facts", mode="before")(lambda cls, v: _clip_list(v, 5))
    _c_places = field_validator("places", mode="before")(lambda cls, v: _clip_list(v, 12))
    _c_food = field_validator("food", mode="before")(lambda cls, v: _clip_list(v, 8))
    _c_areas = field_validator("stay_areas", mode="before")(lambda cls, v: _clip_list(v, 4))
    _c_stays = field_validator("stays", mode="before")(lambda cls, v: _clip_list(v, 4))
    _c_tips = field_validator("tips", mode="before")(lambda cls, v: _clip_list(v, 7))
    _c_customs = field_validator("customs", mode="before")(lambda cls, v: _clip_list(v, 5))
    _c_info = field_validator("useful_info", mode="before")(lambda cls, v: _clip_list(v, 5))
    _c_pack = field_validator("packing", mode="before")(lambda cls, v: _clip_list(v, 10))
    _c_ann = field_validator("annotations", mode="before")(lambda cls, v: _clip_list(v, 8))


class JournalMeta(BaseModel):
    model: str
    generated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class JournalResponse(BaseModel):
    journal: Journal
    trip: TripRequest
    meta: JournalMeta
