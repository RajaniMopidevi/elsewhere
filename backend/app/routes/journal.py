from fastapi import APIRouter, Depends

from ..models.journal import JournalResponse
from ..models.request import TripRequest
from ..services.gemini_service import GeminiService
from ..services.rate_limit import limit_generation

router = APIRouter()


def get_service() -> GeminiService:
    return GeminiService()


@router.post("/journal/generate", response_model=JournalResponse, dependencies=[Depends(limit_generation)])
async def generate_journal(trip: TripRequest, service: GeminiService = Depends(get_service)):
    return await service.generate(trip)
