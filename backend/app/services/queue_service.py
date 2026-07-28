import logging
import asyncio
import random
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from app.database import db_manager
from app.models.schemas import PostStatus, PlatformType
from app.services.meta_service import meta_service
from app.services.token_encryption import decrypt_token

logger = logging.getLogger("postpulse.queue")

class RedisExponentialBackoffQueue:
    """
    Redis / Async Task Queue with Exponential Backoff for Meta API Rate Limits.
    Implements retry strategy: delay = base_seconds * (2 ** attempt) + jitter
    """
    def __init__(self, base_delay_seconds: int = 5, max_retries: int = 5):
        self.base_delay = base_delay_seconds
        self.max_retries = max_retries
        self.active_jobs: Dict[str, Dict[str, Any]] = {}

    def calculate_backoff(self, attempt: int) -> float:
        """
        Calculates exponential backoff delay with random jitter to avoid thundering herd.
        """
        exponential = self.base_delay * (2 ** (attempt - 1))
        jitter = random.uniform(0.5, 1.5)
        return min(exponential * jitter, 300.0) # Cap at 5 minutes

    async def enqueue_post_job(self, post_id: str, attempt: int = 1):
        """
        Enqueues a post for automated publishing with exponential retry count tracking.
        """
        posts_col = db_manager.get_collection("posts")
        accounts_col = db_manager.get_collection("accounts")

        post = await posts_col.find_one({"id": post_id})
        if not post:
            logger.error(f"Queue Error: Post ID {post_id} not found")
            return

        logger.info(f"[Queue Worker] Processing Post ID {post_id} (Attempt {attempt}/{self.max_retries})")
        await posts_col.update_one({"id": post_id}, {"$set": {"status": PostStatus.PUBLISHING.value}})

        account_ids = post.get("account_ids", [])
        meta_post_ids = {}
        failed_accounts = []
        rate_limited = False

        for acc_id in account_ids:
            acc = await accounts_col.find_one({"id": acc_id})
            if not acc:
                failed_accounts.append(f"Account {acc_id} missing")
                continue

            platform = acc.get("platform")
            raw_token = acc.get("access_token", "mock_token")
            # Decrypt access token at runtime
            decrypted_token = decrypt_token(raw_token)
            ext_id = acc.get("account_id", "mock_acc_id")
            content = post.get("content", "")
            media = post.get("media_urls", [])

            if platform == PlatformType.FACEBOOK.value:
                res = await meta_service.publish_facebook_post(ext_id, decrypted_token, content, media)
                if res.success:
                    meta_post_ids[acc_id] = res.post_id
                else:
                    failed_accounts.append(f"FB: {res.error}")
                    if "rate limit" in (res.error or "").lower() or "too many requests" in (res.error or "").lower():
                        rate_limited = True

            elif platform == PlatformType.INSTAGRAM.value:
                res = await meta_service.publish_instagram_post(ext_id, decrypted_token, content, media)
                if res.success:
                    meta_post_ids[acc_id] = res.post_id
                else:
                    failed_accounts.append(f"IG: {res.error}")
                    if "rate limit" in (res.error or "").lower() or "too many requests" in (res.error or "").lower():
                        rate_limited = True

        # Successful publishing
        if len(meta_post_ids) > 0 and len(failed_accounts) == 0:
            await posts_col.update_one({"id": post_id}, {"$set": {
                "status": PostStatus.PUBLISHED.value,
                "published_at": datetime.utcnow().isoformat(),
                "meta_post_ids": meta_post_ids
            }})
            logger.info(f"[Queue Worker SUCCESS] Post {post_id} published!")
            return

        # Rate Limit Encountered -> Trigger Exponential Backoff Retry
        if rate_limited and attempt < self.max_retries:
            next_delay = self.calculate_backoff(attempt)
            logger.warning(f"[Rate Limit Hit] Rescheduling Post {post_id} in {next_delay:.1f}s (Retry {attempt}/{self.max_retries})")
            
            await posts_col.update_one({"id": post_id}, {"$set": {
                "status": PostStatus.PENDING.value,
                "error_message": f"Rate limited. Retrying in {int(next_delay)}s..."
            }})
            
            # Schedule delayed re-execution
            await asyncio.sleep(next_delay)
            await self.enqueue_post_job(post_id, attempt=attempt + 1)
        else:
            err_msg = "; ".join(failed_accounts) if failed_accounts else "Execution failed"
            await posts_col.update_one({"id": post_id}, {"$set": {
                "status": PostStatus.FAILED.value,
                "error_message": err_msg,
                "meta_post_ids": meta_post_ids
            }})
            logger.error(f"[Queue Worker FAILED] Post {post_id}: {err_msg}")

queue_service = RedisExponentialBackoffQueue()
