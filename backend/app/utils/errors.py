"""Application errors that map cleanly to friendly HTTP responses."""
from __future__ import annotations


class JournalError(Exception):
    def __init__(self, status_code: int, code: str, message: str):
        super().__init__(message)
        self.status_code = status_code
        self.code = code
        self.message = message

    def to_payload(self) -> dict:
        return {"error": {"code": self.code, "message": self.message}}


class ConfigError(JournalError):
    def __init__(self, message: str):
        super().__init__(503, "config", message)


class QuotaError(JournalError):
    def __init__(self, message: str = "The Gemini free-tier quota or rate limit has been reached. Please wait a minute and try again."):
        super().__init__(429, "quota", message)


class TimeoutErr(JournalError):
    def __init__(self, message: str = "Gemini took too long to respond. Please try again, or try fewer days."):
        super().__init__(504, "timeout", message)


class UpstreamError(JournalError):
    def __init__(self, message: str = "Gemini returned an error. Please try again in a moment."):
        super().__init__(502, "upstream", message)


class MalformedResponseError(JournalError):
    def __init__(self, message: str = "The AI returned a journal we could not read. Please try again."):
        super().__init__(502, "malformed", message)
