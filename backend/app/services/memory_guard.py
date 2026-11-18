"""Deterministic guard rails applied to the model's memory-book output, so it can never add to what the traveller supplied."""
from __future__ import annotations

from ..models.memory import MemDayOut, MemFoodOut, MemoryJournal, MemoryRequest, MemPlaceOut, PhotoPlan


def _key(s: str) -> str:
    return " ".join((s or "").lower().split())


def sanitise_memory(mem: MemoryJournal, req: MemoryRequest) -> MemoryJournal:
    # ---- places: exactly the supplied ones, in the supplied order; unknown names dropped ----
    ai_places = {_key(p.name): p for p in mem.places}
    mem.places = [
        MemPlaceOut(name=p.name, caption=(ai_places[_key(p.name)].caption[:300] if _key(p.name) in ai_places and p.note else ""),
                    annotation=(ai_places[_key(p.name)].annotation[:60] if _key(p.name) in ai_places and p.note else ""))
        for p in req.places
    ]
    # ---- food ----
    ai_food = {_key(f.name): f for f in mem.food}
    mem.food = [
        MemFoodOut(name=f.name, caption=(ai_food[_key(f.name)].caption[:240] if _key(f.name) in ai_food and f.note else ""))
        for f in req.food
    ]
    # ---- days: only days the traveller actually tagged something with ----
    allowed = sorted({p.day for p in req.places if p.day} | {a.day for a in req.activities if a.day} | {p.day for p in req.photos if p.day})
    by_day = {d.day: d for d in mem.days}
    mem.days = [MemDayOut(day=d, title=by_day[d].title[:60] if d in by_day else "", summary=by_day[d].summary[:420] if d in by_day else "") for d in allowed]
    # ---- sentimental sections only if the traveller gave us something to base them on ----
    n_feel = len(req.moments) + len(req.experiences)
    if not n_feel and not req.notes:
        mem.why_memorable = ""
    if not n_feel:
        mem.highlights = []
    else:
        mem.highlights = [h[:300] for h in mem.highlights][:n_feel]
    mem.annotations = [a[:60] for a in mem.annotations][:6]
    # ---- photo plan: only known ids, only 'auto' photos, each at most once ----
    auto = {p.id for p in req.photos if p.section == "auto"}
    used: set[str] = set()

    def ok(ids: list[str]) -> list[str]:
        out = []
        for i in ids:
            if i in auto and i not in used:
                used.add(i)
                out.append(i)
        return out

    place_names = {_key(p.name): p.name for p in req.places}
    plan = PhotoPlan(
        cover=ok(mem.photo_plan.cover), journey=ok(mem.photo_plan.journey), food=ok(mem.photo_plan.food), keep=ok(mem.photo_plan.keep),
        places={place_names[_key(k)]: ids for k, v in mem.photo_plan.places.items() if _key(k) in place_names and (ids := ok(v))},
        days={str(k): ids for k, v in mem.photo_plan.days.items() if str(k).isdigit() and int(k) in allowed and (ids := ok(v))},
    )
    mem.photo_plan = plan
    mem.title = mem.title.strip() or f"{req.destination}, remembered"
    return mem
