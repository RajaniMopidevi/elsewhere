import asyncio
import json
import sys
import types as _types

try:  # this sandbox lacks httpx; real installs have it (see requirements.txt)
    import httpx  # noqa: F401
except ModuleNotFoundError:
    _m = _types.ModuleType("httpx")
    _m.HTTPError = Exception
    _m.AsyncClient = object
    sys.modules["httpx"] = _m

import pytest
from pydantic import ValidationError

from app.config import Settings
from app.models.request import TripRequest
from app.services.gemini_service import GeminiService
from app.services.prompt import build_prompt
from app.utils.errors import ConfigError, MalformedResponseError, QuotaError, TimeoutErr, UpstreamError
from app.utils.json_utils import extract_json


def good_payload(days=3):
    return {
        "title": "Slow Mornings in Kyoto", "destination": "Kyoto", "country": "Japan",
        "places": [{"name": "Fushimi Inari", "kind": "temple", "note": None}],
        "days": [{"day": i, "title": f"Day {i}", "stops": [{"place": "X", "activity": "walk"}]} for i in range(1, days + 1)],
        "food": [{"name": "Ramen", "category": "dish"}],
    }


class Fake(GeminiService):
    def __init__(self, outputs):
        super().__init__(settings=Settings(gemini_api_key="k"))
        self.outputs, self.calls = list(outputs), 0

    async def _call_model(self, prompt, system=None):
        self.calls += 1
        self.last_system = system
        out = self.outputs.pop(0)
        if isinstance(out, Exception):
            raise out
        return out


def run(coro):
    return asyncio.run(coro)


TRIP = TripRequest(destination="  Kyoto ", days=3, interests=["Food", "Food", "Art"])


def test_request_validation():
    assert TRIP.destination == "Kyoto" and TRIP.interests == ["Food", "Art"]
    for bad in ({"destination": "K", "days": 3}, {"destination": "Kyoto", "days": 0}, {"destination": "Kyoto", "days": 15},
                {"destination": "1234", "days": 2}, {"destination": "Kyoto", "days": 2, "notes": "x" * 501}):
        with pytest.raises(ValidationError):
            TripRequest(**bad)


def test_prompt_contains_rules_and_counts():
    p = build_prompt(TRIP)
    assert "EXACTLY 3 entries" in p and "Kyoto" in p and "NEVER" not in p  # rules live in system instruction
    assert "empty list" in p  # no accommodation requested
    assert "ALL with needs_verification true" in build_prompt(TripRequest(destination="Rome", days=2, accommodation="Boutique"))


def test_extract_json_variants():
    assert extract_json('```json\n{"a": 1,}\n```') == {"a": 1}
    assert extract_json('Sure! {"a": [1,2,]} done') == {"a": [1, 2]}
    for bad in ("", None, "no json", "{broken"):
        with pytest.raises(MalformedResponseError):
            extract_json(bad)


def test_generate_ok_and_normalises_days():
    f = Fake([json.dumps(good_payload(5))])
    r = run(f.generate(TRIP))
    assert len(r.journal.days) == 3 and [d.day for d in r.journal.days] == [1, 2, 3]
    assert r.journal.places[0].note == "" and f.calls == 1


def test_retry_once_on_malformed_then_ok():
    f = Fake(["garbage", json.dumps(good_payload())])
    assert run(f.generate(TRIP)).journal.title.startswith("Slow")
    assert f.calls == 2


def test_gives_up_after_two_malformed():
    f = Fake(["garbage", '{"title": "x"}'])
    with pytest.raises(MalformedResponseError):
        run(f.generate(TRIP))
    assert f.calls == 2


def test_upstream_errors_not_retried():
    f = Fake([QuotaError()])
    with pytest.raises(QuotaError):
        run(f.generate(TRIP))
    assert f.calls == 1


def test_missing_key_is_config_error():
    svc = GeminiService(settings=Settings(gemini_api_key="your_gemini_api_key_here"))
    with pytest.raises(ConfigError):
        run(svc.generate(TRIP))


class FakeAPIError(Exception):
    def __init__(self, code, status="", message=""):
        self.code, self.status, self.message = code, status, message


@pytest.mark.parametrize("exc,expected", [
    (FakeAPIError(429, "RESOURCE_EXHAUSTED"), QuotaError),
    (FakeAPIError(403, "PERMISSION_DENIED"), ConfigError),
    (FakeAPIError(400, "INVALID_ARGUMENT", "API key not valid"), ConfigError),
    (FakeAPIError(404, "NOT_FOUND"), UpstreamError),
    (FakeAPIError(504, "DEADLINE_EXCEEDED"), TimeoutErr),
    (FakeAPIError(500, "INTERNAL"), UpstreamError),
    (RuntimeError("boom"), UpstreamError),
])
def test_exception_mapping(exc, expected):
    assert isinstance(GeminiService._map_exception(exc), expected)


def test_photo_service_caches_and_survives_errors():
    from app.services.photo_service import Photo, PhotoService

    class P:
        n = 0
        async def find(self, q, ctx):
            P.n += 1
            if q == "bad":
                raise RuntimeError("x")
            return Photo(url="u", page_url="p", title=q)

    svc = PhotoService(P())
    out = run(svc.lookup(["good", "bad"], "Kyoto"))
    run(svc.lookup(["good"], "Kyoto"))
    assert out["good"]["url"] == "u" and out["bad"] is None and P.n == 2


def test_routes_if_fastapi_available():
    pytest.importorskip("fastapi")
    pytest.importorskip("httpx")
    from fastapi.testclient import TestClient

    from app.main import app
    from app.routes.journal import get_service

    c = TestClient(app)
    assert c.get("/api/health").json()["status"] == "ok"
    r = c.post("/api/journal/generate", json={"destination": "K", "days": 99})
    assert r.status_code == 422 and r.json()["error"]["code"] == "validation"
    app.dependency_overrides[get_service] = lambda: Fake([json.dumps(good_payload())])
    assert c.post("/api/journal/generate", json={"destination": "Kyoto", "days": 3}).status_code == 200
