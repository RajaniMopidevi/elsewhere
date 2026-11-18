from fastapi import APIRouter

from ..models.request import PhotoRequest
from ..services.photo_service import photo_service

router = APIRouter()


@router.post("/photos")
async def photos(req: PhotoRequest):
    """Optional destination photos. Always 200: missing photos are simply null."""
    return {"photos": await photo_service.lookup(req.queries, req.context)}
