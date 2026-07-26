import logging
import httpx
import uuid
from typing import Dict, Any, List
from datetime import datetime
from app.config import settings
from app.models.schemas import PlatformType

logger = logging.getLogger("postpulse.meta_service")

class MetaPublishResult:
    def __init__(self, success: bool, post_id: str = None, error: str = None, preview_url: str = None):
        self.success = success
        self.post_id = post_id
        self.error = error
        self.preview_url = preview_url

class MetaService:
    def __init__(self):
        self.api_version = settings.META_API_VERSION
        self.base_url = f"https://graph.facebook.com/{self.api_version}"

    async def publish_facebook_post(self, page_id: str, access_token: str, message: str, media_urls: List[str] = None) -> MetaPublishResult:
        """
        Publishes a post to a Facebook Page via Meta Graph API v19.0+
        """
        if settings.USE_MOCK_META or access_token.startswith("mock_"):
            logger.info(f"[MOCK META] Simulated Facebook Page publish for Page ID: {page_id}")
            mock_id = f"fb_post_{uuid.uuid4().hex[:10]}"
            return MetaPublishResult(
                success=True,
                post_id=mock_id,
                preview_url=f"https://facebook.com/{page_id}/posts/{mock_id}"
            )

        try:
            async with httpx.AsyncClient() as client:
                if media_urls and len(media_urls) > 0:
                    # Publish photo post
                    url = f"{self.base_url}/{page_id}/photos"
                    payload = {
                        "url": media_urls[0],
                        "caption": message,
                        "access_token": access_token
                    }
                else:
                    # Publish text feed post
                    url = f"{self.base_url}/{page_id}/feed"
                    payload = {
                        "message": message,
                        "access_token": access_token
                    }

                response = await client.post(url, data=payload, timeout=15.0)
                data = response.json()

                if response.status_code == 200 and "id" in data:
                    res_id = data["id"]
                    return MetaPublishResult(
                        success=True,
                        post_id=res_id,
                        preview_url=f"https://facebook.com/{res_id}"
                    )
                else:
                    error_msg = data.get("error", {}).get("message", "Unknown Meta API error")
                    logger.error(f"Facebook Graph API Error: {error_msg}")
                    return MetaPublishResult(success=False, error=error_msg)

        except Exception as e:
            logger.exception(f"Failed to publish to Facebook Page {page_id}: {e}")
            return MetaPublishResult(success=False, error=str(e))

    async def publish_instagram_post(self, ig_user_id: str, access_token: str, caption: str, media_urls: List[str] = None) -> MetaPublishResult:
        """
        Publishes a post to an Instagram Business Account via Meta Graph API v19.0+
        Step 1: Create Container
        Step 2: Publish Media Container
        """
        if settings.USE_MOCK_META or access_token.startswith("mock_"):
            logger.info(f"[MOCK META] Simulated Instagram Business publish for IG User: {ig_user_id}")
            mock_id = f"ig_post_{uuid.uuid4().hex[:10]}"
            return MetaPublishResult(
                success=True,
                post_id=mock_id,
                preview_url=f"https://instagram.com/p/{mock_id}"
            )

        if not media_urls or len(media_urls) == 0:
            return MetaPublishResult(
                success=False,
                error="Instagram Graph API requires an image/video URL for publishing posts."
            )

        try:
            async with httpx.AsyncClient() as client:
                # Step 1: Create IG Container
                create_url = f"{self.base_url}/{ig_user_id}/media"
                create_payload = {
                    "image_url": media_urls[0],
                    "caption": caption,
                    "access_token": access_token
                }
                
                res1 = await client.post(create_url, data=create_payload, timeout=15.0)
                data1 = res1.json()

                if res1.status_code != 200 or "id" not in data1:
                    error_msg = data1.get("error", {}).get("message", "Failed to create Instagram media container")
                    return MetaPublishResult(success=False, error=error_msg)

                creation_id = data1["id"]

                # Step 2: Publish Container
                publish_url = f"{self.base_url}/{ig_user_id}/media_publish"
                publish_payload = {
                    "creation_id": creation_id,
                    "access_token": access_token
                }

                res2 = await client.post(publish_url, data=publish_payload, timeout=15.0)
                data2 = res2.json()

                if res2.status_code == 200 and "id" in data2:
                    pub_id = data2["id"]
                    return MetaPublishResult(
                        success=True,
                        post_id=pub_id,
                        preview_url=f"https://instagram.com/p/{pub_id}"
                    )
                else:
                    error_msg = data2.get("error", {}).get("message", "Failed to publish Instagram media container")
                    return MetaPublishResult(success=False, error=error_msg)

        except Exception as e:
            logger.exception(f"Failed to publish to Instagram Account {ig_user_id}: {e}")
            return MetaPublishResult(success=False, error=str(e))

meta_service = MetaService()
