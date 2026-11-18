"""Environment-driven settings. The API key lives ONLY here (backend)."""
from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BACKEND_DIR / ".env")

PLACEHOLDER_KEYS = {"", "your_gemini_api_key_here", "paste_your_key_here"}


def _int(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, default))
    except ValueError:
        return default


@dataclass(frozen=True)
class Settings:
    gemini_api_key: str = field(default_factory=lambda: os.getenv("GEMINI_API_KEY", "").strip(), repr=False)
    gemini_model: str = field(default_factory=lambda: os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite").strip())
    timeout_seconds: int = field(default_factory=lambda: _int("GEMINI_TIMEOUT_SECONDS", 120))
    cors_origins: tuple[str, ...] = field(
        default_factory=lambda: tuple(
            o.strip()
            for o in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
            if o.strip()
        )
    )
    rate_limit_max: int = field(default_factory=lambda: _int("RATE_LIMIT_MAX", 6))
    rate_limit_window: int = field(default_factory=lambda: _int("RATE_LIMIT_WINDOW_SECONDS", 600))

    @property
    def has_api_key(self) -> bool:
        return self.gemini_api_key not in PLACEHOLDER_KEYS


def get_settings() -> Settings:
    # Re-read on each call so tests / a restarted server pick up changes.
    return Settings()
