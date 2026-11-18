"""Gemini integration. Single structured request, validated with Pydantic."""
from __future__ import annotations

import asyncio
import logging
from typing import Any, Optional

from pydantic import ValidationError

from ..config import Settings, get_settings
from ..models.journal import Journal, JournalMeta, JournalResponse
from ..models.memory import MemoryJournal, MemoryMeta, MemoryRequest, MemoryResponse
from ..models.request import TripRequest
from ..utils.errors import (
    ConfigError,
    JournalError,
    MalformedResponseError,
    QuotaError,
    TimeoutErr,
    UpstreamError,
)
from ..utils.json_utils import extract_json
from .memory_prompt import MEMORY_SYSTEM, build_memory_prompt
from .memory_guard import sanitise_memory
from .prompt import SYSTEM_INSTRUCTION, build_prompt

log = logging.getLogger("journal.gemini")

MAX_ATTEMPTS = 2  # one retry, only when the output is malformed / fails validation


class GeminiService:
    def __init__(self, settings: Optional[Settings] = None, client: Any = None):
        self.settings = settings or get_settings()
        self._client = client

    # ---- client -----------------------------------------------------------------
    def _get_client(self):
        if self._client is None:
            if not self.settings.has_api_key:
                raise ConfigError(
                    "GEMINI_API_KEY is not set. Create backend/.env from .env.example, paste your key, and restart the backend."
                )
            from google import genai  # imported lazily so the app boots without the SDK for /health

            self._client = genai.Client(api_key=self.settings.gemini_api_key)
        return self._client

    # ---- raw call (overridable in tests) ------------------------------------------
    async def _call_model(self, prompt: str, system: Optional[str] = None) -> str:
        client = self._get_client()  # raises ConfigError first if the key is missing
        from google.genai import types

        config = types.GenerateContentConfig(
            system_instruction=system or SYSTEM_INSTRUCTION,
            response_mime_type="application/json",
            temperature=0.8,
            max_output_tokens=16000,
        )
        try:
            resp = await asyncio.wait_for(
                client.aio.models.generate_content(model=self.settings.gemini_model, contents=prompt, config=config),
                timeout=self.settings.timeout_seconds,
            )
        except asyncio.TimeoutError as exc:
            raise TimeoutErr() from exc
        except JournalError:
            raise
        except Exception as exc:  # noqa: BLE001 - mapped below
            raise self._map_exception(exc) from exc

        text = getattr(resp, "text", None)
        if not text:
            raise MalformedResponseError(
                "Gemini returned no text (the response may have been blocked). Try rephrasing the destination or notes."
            )
        return text

    @staticmethod
    def _map_exception(exc: Exception) -> JournalError:
        code = getattr(exc, "code", None) or getattr(exc, "status_code", None)
        status = str(getattr(exc, "status", "") or "").upper()
        message = str(getattr(exc, "message", "") or exc).lower()
        log.warning("Gemini call failed: %s (code=%s status=%s)", type(exc).__name__, code, status)

        if code == 429 or "RESOURCE_EXHAUSTED" in status or "quota" in message or "rate limit" in message:
            return QuotaError()
        if code in (401, 403) or "api key" in message or "permission" in status or "UNAUTHENTICATED" in status:
            return ConfigError("Gemini rejected the API key. Check GEMINI_API_KEY in backend/.env and restart the backend.")
        if code == 404 or "not found" in message:
            return UpstreamError("Gemini could not find the configured model. Check GEMINI_MODEL in backend/.env.")
        if code == 400:
            return UpstreamError("Gemini rejected the request. Try simpler trip details.")
        if isinstance(exc, (TimeoutError, asyncio.TimeoutError)) or code == 504 or "deadline" in message:
            return TimeoutErr()
        return UpstreamError()

    # ---- public API -------------------------------------------------------------
    async def generate(self, trip: TripRequest) -> JournalResponse:
        prompt = build_prompt(trip)
        last_error: JournalError = MalformedResponseError()
        for attempt in range(1, MAX_ATTEMPTS + 1):
            text = await self._call_model(prompt)
            try:
                journal = self._parse(text, trip)
                return JournalResponse(journal=journal, trip=trip, meta=JournalMeta(model=self.settings.gemini_model))
            except MalformedResponseError as exc:
                log.warning("Malformed AI output on attempt %s/%s", attempt, MAX_ATTEMPTS)
                last_error = exc
        raise last_error

    async def generate_memory(self, req: MemoryRequest) -> MemoryResponse:
        """Completed-trip book: one request; the model only rewrites what the traveller supplied."""
        prompt = build_memory_prompt(req)
        last_error: JournalError = MalformedResponseError()
        for attempt in range(1, MAX_ATTEMPTS + 1):
            text = await self._call_model(prompt, MEMORY_SYSTEM)
            try:
                data = extract_json(text)
                if not isinstance(data, dict):
                    raise MalformedResponseError()
                try:
                    mem = MemoryJournal.model_validate(data)
                except ValidationError as exc:
                    log.warning("Memory validation failed: %s", exc.errors()[:3])
                    raise MalformedResponseError() from exc
                mem = sanitise_memory(mem, req)
                return MemoryResponse(memory=mem, trip=req, meta=MemoryMeta(model=self.settings.gemini_model))
            except MalformedResponseError as exc:
                log.warning("Malformed memory output on attempt %s/%s", attempt, MAX_ATTEMPTS)
                last_error = exc
        raise last_error

    @staticmethod
    def _parse(text: str, trip: TripRequest) -> Journal:
        data = extract_json(text)
        if not isinstance(data, dict):
            raise MalformedResponseError()
        try:
            journal = Journal.model_validate(data)
        except ValidationError as exc:
            log.warning("Journal validation failed: %s", exc.errors()[:3])
            raise MalformedResponseError() from exc
        return GeminiService._normalise_days(journal, trip.days)

    @staticmethod
    def _normalise_days(journal: Journal, wanted: int) -> Journal:
        """Make sure the day list is 1..N even if the model miscounted."""
        days = journal.days[:wanted]
        if len(days) < max(1, wanted // 2):
            raise MalformedResponseError("The AI returned too few itinerary days. Please try again.")
        for i, d in enumerate(days, start=1):
            d.day = i
        journal.days = days
        return journal
