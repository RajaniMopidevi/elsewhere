"""Small art-direction hints returned with a plan journal (used to pick decorative motifs)."""
from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field, field_validator

REGIONS = (
    "east_asia", "southeast_asia", "south_asia", "mediterranean", "western_europe", "nordic", "alpine",
    "middle_east", "africa", "north_america", "latin_america", "oceania", "classic",
)

# Illustration vocabulary shared with the frontend (src/lib/art.ts -> IlloName).
MOTIFS = (
    "temple", "church", "tower", "museum", "castle", "market", "mountain", "tree", "houses", "boat", "bridge",
    "train", "sun", "palm", "pine", "windmill", "lantern", "dome", "lotus",
)


class Design(BaseModel):
    model_config = ConfigDict(extra="ignore", str_strip_whitespace=True)

    region: str = "classic"
    mood: str = Field("", max_length=40)
    motifs: list[str] = Field(default_factory=list)

    @field_validator("region", mode="before")
    @classmethod
    def _region(cls, v):
        v = str(v or "").strip().lower().replace(" ", "_").replace("-", "_")
        return v if v in REGIONS else "classic"

    @field_validator("mood", mode="before")
    @classmethod
    def _mood(cls, v):
        return str(v or "")[:40]

    @field_validator("motifs", mode="before")
    @classmethod
    def _motifs(cls, v):
        if not isinstance(v, list):
            return []
        out: list[str] = []
        for m in v:
            m = str(m).strip().lower()
            if m in MOTIFS and m not in out:
                out.append(m)
        return out[:5]
