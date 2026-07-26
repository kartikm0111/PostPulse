import uuid
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends, Query
from app.database import db_manager
from app.models.schemas import PostCreate, PostUpdate, PostResponse, PostStatus, PlatformType
from app.routers.auth import get_current_user
from app.services.meta_service import meta_service

router = APIRouter(prefix="/posts", tags=["Social Posts"])

@router.get("", response_model=List[PostResponse])
async def get_posts(
    status: Optional[PostStatus] = None,
    current_user: dict = Depends(get_current_user)
):
    posts_col = db_manager.get_collection("posts")
    query = {"user_id": current_user["id"]}
    if status:
        query["status"] = status.value

    user_posts = await posts_col.find(query)
    # Sort posts by scheduled_at / created_at descending
    sorted_posts = sorted(user_posts, key=lambda x: x.get("created_at", ""), reverse=True)
    
    return [
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

@router.post("", response_model=PostResponse)
async def create_or_schedule_post(
    post_in: PostCreate,
    publish_now: bool = Query(False),
    current_user: dict = Depends(get_current_user)
):
    posts_col = db_manager.get_collection("posts")
    accounts_col = db_manager.get_collection("accounts")

    if not post_in.account_ids or len(post_in.account_ids) == 0:
        raise HTTPException(status_code=400, detail="Please select at least one social media account")

    post_id = f"post_{uuid.uuid4().hex[:10]}"
    now_str = datetime.utcnow().isoformat()

    init_status = PostStatus.DRAFT.value
    if publish_now:
        init_status = PostStatus.PUBLISHING.value
    elif post_in.scheduled_at:
        init_status = PostStatus.SCHEDULED.value

    new_post = {
        "id": post_id,
        "_id": post_id,
        "user_id": current_user["id"],
        "content": post_in.content,
        "account_ids": post_in.account_ids,
        "media_urls": post_in.media_urls or [],
        "hashtags": post_in.hashtags or [],
        "status": init_status,
        "scheduled_at": post_in.scheduled_at,
        "published_at": None,
        "meta_post_ids": {},
        "error_message": None,
        "created_at": now_str
    }

    await posts_col.insert_one(new_post)

    # If user selected publish_now, trigger immediate publishing logic
    if publish_now:
        meta_post_ids = {}
        failed_accounts = []

        for acc_id in post_in.account_ids:
            acc = await accounts_col.find_one({"id": acc_id, "user_id": current_user["id"]})
            if not acc:
                failed_accounts.append(f"Account {acc_id} not found")
                continue

            platform = acc.get("platform")
            token = acc.get("access_token", "mock_token")
            ext_id = acc.get("account_id", "mock_acc_id")

            if platform == PlatformType.FACEBOOK.value:
                res = await meta_service.publish_facebook_post(ext_id, token, post_in.content, post_in.media_urls)
                if res.success:
                    meta_post_ids[acc_id] = res.post_id
                else:
                    failed_accounts.append(f"FB ({acc_id}): {res.error}")

            elif platform == PlatformType.INSTAGRAM.value:
                res = await meta_service.publish_instagram_post(ext_id, token, post_in.content, post_in.media_urls)
                if res.success:
                    meta_post_ids[acc_id] = res.post_id
                else:
                    failed_accounts.append(f"IG ({acc_id}): {res.error}")

        if len(meta_post_ids) > 0 and len(failed_accounts) == 0:
            final_status = PostStatus.PUBLISHED.value
            pub_at = datetime.utcnow().isoformat()
            err_msg = None
        else:
            final_status = PostStatus.FAILED.value
            pub_at = None
            err_msg = "; ".join(failed_accounts) if failed_accounts else "Publishing failed"

        await posts_col.update_one({"id": post_id}, {"$set": {
            "status": final_status,
            "published_at": pub_at,
            "meta_post_ids": meta_post_ids,
            "error_message": err_msg
        }})
        new_post["status"] = final_status
        new_post["published_at"] = pub_at
        new_post["meta_post_ids"] = meta_post_ids
        new_post["error_message"] = err_msg

    return PostResponse(
        id=post_id,
        user_id=current_user["id"],
        content=new_post["content"],
        account_ids=new_post["account_ids"],
        media_urls=new_post["media_urls"],
        hashtags=new_post["hashtags"],
        status=new_post["status"],
        scheduled_at=new_post.get("scheduled_at"),
        published_at=new_post.get("published_at"),
        meta_post_ids=new_post.get("meta_post_ids", {}),
        error_message=new_post.get("error_message"),
        created_at=new_post["created_at"]
    )

@router.delete("/{post_id}")
async def delete_post(post_id: str, current_user: dict = Depends(get_current_user)):
    posts_col = db_manager.get_collection("posts")
    res = await posts_col.delete_one({"id": post_id, "user_id": current_user["id"]})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"message": "Post deleted successfully"}
