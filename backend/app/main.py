"""FastAPI entry point:  uvicorn app.main:app --reload --port 8000"""
from __future__ import annotations

import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import get_settings
from .routes import health, journal, memories, photos
from .utils.errors import JournalError

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title="Travel Scrapbook API", version="1.0.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=list(settings.cors_origins),
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["Content-Type"],
    )

    @app.exception_handler(JournalError)
    async def journal_error_handler(_: Request, exc: JournalError):
        return JSONResponse(status_code=exc.status_code, content=exc.to_payload())

    @app.exception_handler(RequestValidationError)
    async def validation_handler(_: Request, exc: RequestValidationError):
        fields = {}
        for err in exc.errors():
            loc = [str(p) for p in err.get("loc", []) if p != "body"]
            fields[".".join(loc) or "body"] = err.get("msg", "Invalid value")
        return JSONResponse(
            status_code=422,
            content={"error": {"code": "validation", "message": "Please check your trip details.", "fields": fields}},
        )

    @app.exception_handler(Exception)
    async def unhandled(_: Request, exc: Exception):
        logging.getLogger("journal").exception("Unhandled error", exc_info=exc)
        return JSONResponse(
            status_code=500,
            content={"error": {"code": "internal", "message": "Something went wrong on our side. Please try again."}},
        )

    app.include_router(health.router, prefix="/api")
    app.include_router(journal.router, prefix="/api")
    app.include_router(memories.router, prefix="/api")
    app.include_router(photos.router, prefix="/api")
    return app


app = create_app()
