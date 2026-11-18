"""Destination photo lookup, isolated behind PhotoProvider so it can be swapped later.

Default provider: Wikipedia's public page-image API (free, no key). Images come from Wikipedia/Wikimedia Commons;
licences vary per image, so every result carries a link to its source page for attribution.
The app works without it: the frontend falls back to hand-drawn illustrations.
"""
from __future__ import annotations

import asyncio
import re
from dataclasses import dataclass, asdict
from typing import Optional, Protocol

import httpx

USER_AGENT = "ElsewhereTravelScrapbook/1.0 (local hobby app; Wikipedia API client)"
API = "https://en.wikipedia.org/w/api.php"


@dataclass
class Photo:
    url: str
    page_url: str
    title: str
    credit: str = "Wikipedia / Wikimedia Commons"

    def to_dict(self) -> dict:
        return asdict(self)


class PhotoProvider(Protocol):
    async def find(self, query: str, context: Optional[str]) -> Optional[Photo]: ...


def _tokens(s: str) -> set[str]:
    return {t for t in re.findall(r"[^\W_]{3,}", s.lower())}


class WikipediaPhotoProvider:
    def __init__(self, client: Optional[httpx.AsyncClient] = None):
        self._client = client

    async def find(self, query: str, context: Optional[str]) -> Optional[Photo]:
        search = f"{query} {context}".strip() if context else query
        params = {
            "action": "query", "format": "json", "generator": "search", "gsrsearch": search, "gsrlimit": 3,
            "prop": "pageimages|info", "piprop": "thumbnail", "pithumbsize": 700, "inprop": "url", "redirects": 1,
        }
        client = self._client or httpx.AsyncClient(timeout=6.0, headers={"User-Agent": USER_AGENT})
        try:
            r = await client.get(API, params=params, headers={"User-Agent": USER_AGENT})
            r.raise_for_status()
            pages = list((r.json().get("query") or {}).get("pages", {}).values())
        except (httpx.HTTPError, ValueError):
            return None
        finally:
            if self._client is None:
                await client.aclose()

        want = _tokens(query)
        pages.sort(key=lambda p: p.get("index", 99))
        for p in pages:
            thumb = (p.get("thumbnail") or {}).get("source")
            title = p.get("title", "")
            if not thumb or not _tokens(title) & want:
                continue  # require the title to share a word with the place name, to avoid wrong photos
            return Photo(url=thumb, page_url=p.get("fullurl", ""), title=title)
        return None


class PhotoService:
    def __init__(self, provider: Optional[PhotoProvider] = None):
        self.provider = provider or WikipediaPhotoProvider()
        self._cache: dict[str, Optional[Photo]] = {}

    async def lookup(self, queries: list[str], context: Optional[str]) -> dict[str, Optional[dict]]:
        async def one(q: str):
            key = f"{q}|{context or ''}".lower()
            if key not in self._cache:
                try:
                    self._cache[key] = await self.provider.find(q, context)
                except Exception:  # noqa: BLE001 - photos are optional, never fail the request
                    self._cache[key] = None
            p = self._cache[key]
            return q, (p.to_dict() if p else None)

        return dict(await asyncio.gather(*(one(q) for q in queries)))


photo_service = PhotoService()
