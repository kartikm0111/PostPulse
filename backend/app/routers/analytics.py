from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from app.database import db_manager
from app.models.schemas import DashboardStats, PostStatus, PostResponse
from app.routers.auth import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics & Dashboard"])

@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_analytics(current_user: dict = Depends(get_current_user)):
    posts_col = db_manager.get_collection("posts")
    accounts_col = db_manager.get_collection("accounts")

    user_posts = await posts_col.find({"user_id": current_user["id"]})
    user_accounts = await accounts_col.find({"user_id": current_user["id"]})

    total_posts = len(user_posts)
    scheduled_count = sum(1 for p in user_posts if p.get("status") == PostStatus.SCHEDULED.value)
    published_count = sum(1 for p in user_posts if p.get("status") == PostStatus.PUBLISHED.value)
    connected_acc_count = len(user_accounts)

    sorted_posts = sorted(user_posts, key=lambda x: x.get("created_at", ""), reverse=True)[:5]

    recent_post_responses = [
        PostResponse(
            id=p["id"],
            user_id=p["user_id"],
            content=p["content"],
            account_ids=p.get("account_ids", []),
            media_urls=p.get("media_urls", []),
            hashtags=p.get("hashtags", []),
            status=p["status"],
            scheduled_at=p.get("scheduled_at"),
            published_at=p.get("published_at"),
            meta_post_ids=p.get("meta_post_ids", {}),
            error_message=p.get("error_message"),
            created_at=p.get("created_at", "")
        )
        for p in sorted_posts
    ]

    return DashboardStats(
        total_posts=total_posts,
        scheduled_posts=scheduled_count,
        published_posts=published_count,
        connected_accounts=connected_acc_count,
        recent_posts=recent_post_responses
    )
