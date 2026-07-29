import logging
from typing import Dict, Any
from fastapi import APIRouter, Request, Response, Query, HTTPException
from app.database import db_manager

logger = logging.getLogger("postpulse.webhooks")
router = APIRouter(prefix="/webhooks", tags=["Meta Real-Time Webhooks Engine"])

VERIFY_TOKEN = "postpulse_meta_webhook_token_2026"

@router.get("/meta")
async def verify_meta_webhook(
    hub_mode: str = Query(..., alias="hub.mode"),
    hub_verify_token: str = Query(..., alias="hub.verify_token"),
    hub_challenge: str = Query(..., alias="hub.challenge")
):
    """
    Verifies Meta Webhook Challenge handshake
    """
    if hub_mode == "subscribe" and hub_verify_token == VERIFY_TOKEN:
        logger.info("Meta Webhook Verification Challenge Passed!")
        return Response(content=hub_challenge, media_type="text/plain")
    else:
        logger.error("Meta Webhook Verification Failed: Invalid verify token")
        raise HTTPException(status_code=403, detail="Verification token mismatch")

@router.post("/meta")
async def process_meta_webhook_event(request: Request):
    """
    Real-time HTTP webhook receiver for Meta Graph API engagement events & post callbacks
    """
    try:
        body = await request.json()
        logger.info(f"[Meta Webhook Event Received]: {body}")

        # Store incoming webhook payload in analytics database
        analytics_col = db_manager.get_collection("analytics")
        await analytics_col.insert_one({
            "type": "meta_webhook",
            "payload": body,
            "received_at": request.headers.get("x-request-time") or "now"
        })

        return {"status": "event_received"}
    except Exception as e:
        logger.error(f"Error processing Meta Webhook payload: {e}")
        return {"status": "error", "detail": str(e)}
