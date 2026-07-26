import logging
from datetime import datetime
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.database import db_manager
from app.models.schemas import PostStatus, PlatformType
from app.services.meta_service import meta_service

logger = logging.getLogger("postpulse.scheduler")

class PostSchedulerService:
    def __init__(self):
        self.scheduler = AsyncIOScheduler()
        self.is_running = False

    def start(self):
        if not self.is_running:
            self.scheduler.add_job(
                self.check_and_publish_scheduled_posts,
                'interval',
                seconds=30, # Check every 30 seconds for scheduled posts
                id='postpulse_auto_publisher',
                replace_existing=True
            )
            self.scheduler.start()
            self.is_running = True
            logger.info("PostPulse Async Background Scheduler initialized and polling every 30s...")

    def stop(self):
        if self.is_running:
            self.scheduler.shutdown()
            self.is_running = False
            logger.info("PostPulse Background Scheduler stopped.")

    async def check_and_publish_scheduled_posts(self):
        """
        Polls database for posts with status='scheduled' and scheduled_at <= now
        Executes publication to linked social accounts.
        """
        posts_col = db_manager.get_collection("posts")
        accounts_col = db_manager.get_collection("accounts")
        
        all_posts = await posts_col.find({"status": PostStatus.SCHEDULED.value})
        now_iso = datetime.utcnow().isoformat()

        for post in all_posts:
            scheduled_at = post.get("scheduled_at")
            if not scheduled_at or scheduled_at <= now_iso:
                post_id = post["id"]
                logger.info(f"Triggering auto-publishing execution for Post ID: {post_id}")
                
                # Mark as publishing
                await posts_col.update_one({"id": post_id}, {"$set": {"status": PostStatus.PUBLISHING.value}})
                
                account_ids = post.get("account_ids", [])
                meta_post_ids = {}
                failed_accounts = []

                for acc_id in account_ids:
                    acc = await accounts_col.find_one({"id": acc_id})
                    if not acc:
                        failed_accounts.append(f"Account {acc_id} not found")
                        continue

                    platform = acc.get("platform")
                    token = acc.get("access_token", "mock_token")
                    ext_id = acc.get("account_id", "mock_acc_id")
                    content = post.get("content", "")
                    media = post.get("media_urls", [])

                    if platform == PlatformType.FACEBOOK.value:
                        res = await meta_service.publish_facebook_post(ext_id, token, content, media)
                        if res.success:
                            meta_post_ids[acc_id] = res.post_id
                        else:
                            failed_accounts.append(f"FB ({acc_id}): {res.error}")
                    
                    elif platform == PlatformType.INSTAGRAM.value:
                        res = await meta_service.publish_instagram_post(ext_id, token, content, media)
                        if res.success:
                            meta_post_ids[acc_id] = res.post_id
                        else:
                            failed_accounts.append(f"IG ({acc_id}): {res.error}")

                if len(meta_post_ids) > 0 and len(failed_accounts) == 0:
                    await posts_col.update_one({"id": post_id}, {"$set": {
                        "status": PostStatus.PUBLISHED.value,
                        "published_at": datetime.utcnow().isoformat(),
                        "meta_post_ids": meta_post_ids
                    }})
                    logger.info(f"Post ID {post_id} published successfully across accounts!")
                else:
                    err_summary = "; ".join(failed_accounts) if failed_accounts else "Partial failure"
                    await posts_col.update_one({"id": post_id}, {"$set": {
                        "status": PostStatus.FAILED.value,
                        "error_message": err_summary,
                        "meta_post_ids": meta_post_ids
                    }})
                    logger.error(f"Post ID {post_id} publishing encountered errors: {err_summary}")

scheduler_service = PostSchedulerService()
