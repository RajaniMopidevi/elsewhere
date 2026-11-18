"""Tolerant JSON extraction for LLM output."""
from __future__ import annotations

import json
import re
from typing import Any

from .errors import MalformedResponseError

_FENCE = re.compile(r"^```(?:json)?\s*|\s*```$", re.IGNORECASE)
_TRAILING_COMMA = re.compile(r",\s*([}\]])")


def extract_json(text: str | None) -> Any:
    """Parse a JSON object from model text (handles code fences / stray prose / trailing commas)."""
    if not text or not text.strip():
        raise MalformedResponseError("The AI returned an empty response. Please try again.")
    cleaned = _FENCE.sub("", text.strip()).strip()
    start, end = cleaned.find("{"), cleaned.rfind("}")
    if start == -1 or end == -1 or end <= start:
        raise MalformedResponseError()
    candidate = cleaned[start : end + 1]
    for attempt in (candidate, _TRAILING_COMMA.sub(r"\1", candidate)):
        try:
            return json.loads(attempt)
        except json.JSONDecodeError:
            continue
    raise MalformedResponseError()
