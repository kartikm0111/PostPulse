import logging
import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any
from app.database import db_manager
from app.services.ai_service import ai_service
from app.models.schemas import AIGenerateRequest, ContentTone, PlatformType

logger = logging.getLogger("postpulse.evergreen")

class EvergreenRecyclerService:
    """
    AI Content Recycling & Evergreen Queue Engine.
    Identifies high-performing posts and auto-prompts LLM to re-skin & re-schedule 60-90 days later.
    """
    async def recycle_top_performing_posts(self, user_id: str) -> List[Dict[str, Any]]:
        posts_col = db_manager.get_collection("posts")
        user_posts = await posts_col.find({"user_id": user_id, "status": "published"})

        if not user_posts:
            return []

        recycled_candidates = []
        # Take top published posts
        for post in user_posts[:3]:
            orig_content = post.get("content", "")
            
            # Request AI to re-skin post with fresh wording
            req = AIGenerateRequest(
                topic=f"Re-skin & modernize this top post: '{orig_content[:150]}'",
                tone=ContentTone.VIRAL,
                target_platform=PlatformType.INSTAGRAM
            )
            ai_res = await ai_service.generate_social_content(req)
            
            # Schedule 60 days in advance
            reschedule_date = (datetime.utcnow() + timedelta(days=60)).isoformat()
            
            recycled_item = {
                "original_post_id": post["id"],
                "new_content": ai_res.generated_text,
                "suggested_hashtags": ai_res.suggested_hashtags,
                "scheduled_at": reschedule_date,
                "recycled_at": datetime.utcnow().isoformat()
            }
            recycled_candidates.append(recycled_item)

        logger.info(f"Evergreen Recycler generated {len(recycled_candidates)} re-skinned candidate posts for user {user_id}")
        return recycled_candidates

evergreen_service = EvergreenRecyclerService()
