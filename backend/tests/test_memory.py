"""Completed-trip memory book: request validation, prompt rules, and the anti-invention guard."""
import asyncio
import json
import sys
import types as _types

try:
    import httpx  # noqa: F401
except ModuleNotFoundError:  # this sandbox lacks httpx; real installs have it
    _m = _types.ModuleType("httpx")
    _m.HTTPError = Exception
    _m.AsyncClient = object
    sys.modules["httpx"] = _m

import pytest
from pydantic import ValidationError

from app.config import Settings
from app.models.memory import MemoryRequest
from app.services.gemini_service import GeminiService
from app.services.memory_prompt import MEMORY_SYSTEM, build_memory_prompt
from app.utils.errors import MalformedResponseError


class Fake(GeminiService):
    def __init__(self, outputs):
        super().__init__(settings=Settings(gemini_api_key="k"))
        self.outputs, self.calls, self.last_system = list(outputs), 0, None

    async def _call_model(self, prompt, system=None):
        self.calls += 1
        self.last_system = system
        return self.outputs.pop(0)


def run(c):
    return asyncio.run(c)


REQ = MemoryRequest(
    destination="Lisbon", dates="June 2025", days=3, companions=["Asha", "Ravi"],
    places=[{"name": "Alfama", "day": 1, "note": "lost in the lanes, found a tiny fado bar"}, {"name": "Belém"}, {"name": "LX Factory", "day": 2}],
    activities=[{"text": "rode tram 28", "day": 1}],
    food=[{"name": "Pastéis de Belém", "note": "still warm"}, {"name": "A Cevicheria"}],
    moments=["sunset at Miradouro"], experiences=[], notes="",
    photos=[{"id": "p1", "caption": "Alfama lanes", "section": "auto"}, {"id": "p2", "section": "cover"}, {"id": "p3", "caption": "day 3 beach", "section": "auto"},
            {"id": "p4", "section": "auto", "caption": "Pastéis de Belém"}],
)


def test_request_validation():
    for bad in ({"destination": "L", "places": [{"name": "x"}]}, {"destination": "Lisbon", "places": []},
                {"destination": "Lisbon", "places": [{"name": "x"}], "photos": [{"id": "../evil"}]},
                {"destination": "Lisbon", "places": [{"name": "x", "day": 0}]}):
        with pytest.raises(ValidationError):
            MemoryRequest(**bad)
    assert REQ.companions == ["Asha", "Ravi"] and REQ.photos[0].section == "auto"


def test_system_prompt_forbids_invention_and_prompt_has_counts():
    assert "NEVER add places" in MEMORY_SYSTEM and "Never suggest or recommend" in MEMORY_SYSTEM
    p = build_memory_prompt(REQ)
    assert "exactly 3 entries" in p and "[1, 2]" in p and "Alfama" in p and "base64" not in p


def hostile_output():
    return json.dumps({
        "title": "Lisbon, Slowly", "intro": "We wandered Lisbon.", "why_memorable": "It was magical and life-changing.",
        "places": [{"name": "Alfama", "caption": "We got lost and found fado."}, {"name": "Belém", "caption": "A gorgeous monument!"},
                   {"name": "Sintra Palace", "caption": "invented"}],
        "food": [{"name": "Pastéis de Belém", "caption": "Still warm."}, {"name": "Time Out Market", "caption": "invented"}, {"name": "A Cevicheria", "caption": "made up praise"}],
        "days": [{"day": 1, "title": "Alfama day"}, {"day": 2, "title": "LX day"}, {"day": 3, "title": "Invented beach day"}, {"day": 9, "title": "x"}],
        "highlights": ["Sunset at Miradouro", "Invented dolphin sighting", "Another invention"],
        "closing_note": "Thanks, Lisbon.", "annotations": ["fado!"],
        "photo_plan": {"cover": ["p1", "p2"], "journey": ["nope"], "keep": ["p3"], "places": {"Alfama": ["p1"], "Sintra Palace": ["p3"]}, "days": {"1": ["p3"], "7": ["p4"]}, "food": ["p4"]},
    })


def test_guard_blocks_invention():
    r = run(Fake([hostile_output()]).generate_memory(REQ))
    m = r.memory
    assert [p.name for p in m.places] == ["Alfama", "Belém", "LX Factory"]                # unknown 'Sintra Palace' dropped, order kept
    assert m.places[1].caption == "" and m.places[2].caption == ""                          # no user note -> no caption
    assert [f.name for f in m.food] == ["Pastéis de Belém", "A Cevicheria"]                 # unknown food dropped
    assert m.food[1].caption == ""                                                          # no note -> no caption
    assert [d.day for d in m.days] == [1, 2]                                                # only tagged days (3 and 9 never supplied)
    assert m.highlights == ["Sunset at Miradouro"]                                          # capped to supplied count
    assert m.why_memorable                                                                  # moments exist -> allowed
    pp = m.photo_plan
    assert "p2" not in pp.cover and "p2" not in sum(pp.places.values(), [])                  # user's explicit 'cover' photo is never moved by AI
    assert pp.cover == ["p1"] and pp.places == {} and pp.keep == ["p3"] and pp.days == {} and pp.food == ["p4"]  # each photo used once; unknown ids/days dropped


def test_no_feelings_without_source_material():
    req = MemoryRequest(destination="Goa", places=[{"name": "Anjuna"}])
    out = json.dumps({"title": "Goa", "why_memorable": "Life-changing!", "highlights": ["invented"], "places": [{"name": "Anjuna", "caption": "invented"}], "days": [{"day": 1, "title": "x"}]})
    m = run(Fake([out]).generate_memory(req)).memory
    assert m.why_memorable == "" and m.highlights == [] and m.places[0].caption == "" and m.days == []


def test_retry_and_system_prompt_used():
    f = Fake(["garbage", hostile_output()])
    run(f.generate_memory(REQ))
    assert f.calls == 2 and f.last_system == MEMORY_SYSTEM
    with pytest.raises(MalformedResponseError):
        run(Fake(["garbage", "{}"]).generate_memory(REQ))


def test_route_if_fastapi_available():
    pytest.importorskip("fastapi")
    pytest.importorskip("httpx")
    from fastapi.testclient import TestClient

    from app.main import app
    from app.routes.memories import get_service

    c = TestClient(app)
    assert c.post("/api/memories/generate", json={"destination": "Lisbon", "places": []}).status_code == 422
    app.dependency_overrides[get_service] = lambda: Fake([hostile_output()])
    assert c.post("/api/memories/generate", json=json.loads(REQ.model_dump_json())).status_code == 200
