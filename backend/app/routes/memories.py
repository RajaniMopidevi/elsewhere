from fastapi import APIRouter, Depends

from ..models.memory import MemoryRequest, MemoryResponse
from ..services.gemini_service import GeminiService
from ..services.rate_limit import limit_generation

router = APIRouter()


def get_service() -> GeminiService:
    return GeminiService()


@router.post("/memories/generate", response_model=MemoryResponse, dependencies=[Depends(limit_generation)])
async def generate_memory(req: MemoryRequest, service: GeminiService = Depends(get_service)):
    return await service.generate_memory(req)
