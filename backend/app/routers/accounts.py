import uuid
from typing import List
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from app.database import db_manager
from app.models.schemas import SocialAccountCreate, SocialAccountResponse, PlatformType
from app.routers.auth import get_current_user

router = APIRouter(prefix="/accounts", tags=["Social Accounts"])

@router.get("", response_model=List[SocialAccountResponse])
async def list_accounts(current_user: dict = Depends(get_current_user)):
    accounts_col = db_manager.get_collection("accounts")
    user_accounts = await accounts_col.find({"user_id": current_user["id"]})
    return [
        SocialAccountResponse(
            id=acc["id"],
            user_id=acc["user_id"],
            platform=acc["platform"],
            account_name=acc["account_name"],
            account_id=acc["account_id"],
            profile_picture=acc.get("profile_picture"),
            status=acc.get("status", "active"),
            is_mock=acc.get("is_mock", True),
            connected_at=acc.get("connected_at", "")
        )
        for acc in user_accounts
    ]

@router.post("/connect", response_model=SocialAccountResponse)
async def connect_account(acc_in: SocialAccountCreate, current_user: dict = Depends(get_current_user)):
    accounts_col = db_manager.get_collection("accounts")
    
    # Default avatar based on platform if none provided
    avatar = acc_in.profile_picture
    if not avatar:
        if acc_in.platform == PlatformType.FACEBOOK:
            avatar = "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=150"
        elif acc_in.platform == PlatformType.INSTAGRAM:
            avatar = "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=150"
        else:
            avatar = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150"

    acc_id = f"acc_{uuid.uuid4().hex[:10]}"
    now_str = datetime.utcnow().isoformat()

    new_acc = {
        "id": acc_id,
        "_id": acc_id,
        "user_id": current_user["id"],
        "platform": acc_in.platform.value,
        "account_name": acc_in.account_name,
        "account_id": acc_in.account_id,
        "access_token": acc_in.access_token,
        "profile_picture": avatar,
        "status": "active",
        "is_mock": acc_in.is_mock,
        "connected_at": now_str
    }
    await accounts_col.insert_one(new_acc)

    return SocialAccountResponse(
        id=acc_id,
        user_id=current_user["id"],
        platform=acc_in.platform,
        account_name=acc_in.account_name,
        account_id=acc_in.account_id,
        profile_picture=avatar,
        status="active",
        is_mock=acc_in.is_mock,
        connected_at=now_str
    )

@router.delete("/{account_id}")
async def disconnect_account(account_id: str, current_user: dict = Depends(get_current_user)):
    accounts_col = db_manager.get_collection("accounts")
    res = await accounts_col.delete_one({"id": account_id, "user_id": current_user["id"]})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Account not found")
    return {"message": "Social account disconnected successfully"}
