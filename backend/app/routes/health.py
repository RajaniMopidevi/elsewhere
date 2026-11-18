from fastapi import APIRouter

from ..config import get_settings

router = APIRouter()


@router.get("/health")
async def health():
    s = get_settings()
    return {"status": "ok", "model": s.gemini_model, "gemini_key_configured": s.has_api_key}
