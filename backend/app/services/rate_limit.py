"""Tiny in-memory sliding-window limiter (cost control for a local MVP)."""
from __future__ import annotations

import time
from collections import defaultdict, deque

from fastapi import Request

from ..config import get_settings
from ..utils.errors import JournalError

_hits: dict[str, deque[float]] = defaultdict(deque)


def reset() -> None:
    _hits.clear()


async def limit_generation(request: Request) -> None:
    s = get_settings()
    key = request.client.host if request.client else "unknown"
    now = time.monotonic()
    q = _hits[key]
    while q and now - q[0] > s.rate_limit_window:
        q.popleft()
    if len(q) >= s.rate_limit_max:
        wait = int(s.rate_limit_window - (now - q[0])) + 1
        raise JournalError(
            429, "rate_limited",
            f"You've generated several journals recently. Please wait about {max(1, wait // 60)} minute(s) before creating another.",
        )
    q.append(now)
