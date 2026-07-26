from fastapi import APIRouter, Depends
from app.models.schemas import AIGenerateRequest, AIGenerateResponse
from app.routers.auth import get_current_user
from app.services.ai_service import ai_service

router = APIRouter(prefix="/ai", tags=["AI Studio Engine"])

@router.post("/generate", response_model=AIGenerateResponse)
async def generate_post_content(
    req: AIGenerateRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Generate tailored social post copy, hashtags, platform variants, and image prompts.
    """
    return await ai_service.generate_social_content(req)
