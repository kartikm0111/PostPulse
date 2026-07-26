from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class PlatformType(str, Enum):
    FACEBOOK = "facebook"
    INSTAGRAM = "instagram"
    LINKEDIN = "linkedin"
    TWITTER = "twitter"

class PostStatus(str, Enum):
    DRAFT = "draft"
    SCHEDULED = "scheduled"
    PUBLISHING = "publishing"
    PUBLISHED = "published"
    FAILED = "failed"

class ContentTone(str, Enum):
    PROFESSIONAL = "professional"
    CASUAL = "casual"
    PUNCHY = "punchy"
    VIRAL = "viral"
    EDUCATIONAL = "educational"
    SALES = "sales"

# User Schemas
class UserRegister(BaseModel):
    email: EmailStr
    name: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Social Account Schemas
class SocialAccountCreate(BaseModel):
    platform: PlatformType
    account_name: str
    account_id: str # FB Page ID or IG Business ID
    access_token: str
    profile_picture: Optional[str] = None
    is_mock: bool = True

class SocialAccountResponse(BaseModel):
    id: str
    user_id: str
    platform: PlatformType
    account_name: str
    account_id: str
    profile_picture: Optional[str] = None
    status: str = "active"
    is_mock: bool = True
    connected_at: str

# Post Schemas
class PostCreate(BaseModel):
    content: str
    account_ids: List[str]
    media_urls: Optional[List[str]] = []
    scheduled_at: Optional[str] = None # ISO format timestamp string
    hashtags: Optional[List[str]] = []

class PostUpdate(BaseModel):
    content: Optional[str] = None
    account_ids: Optional[List[str]] = None
    media_urls: Optional[List[str]] = None
    scheduled_at: Optional[str] = None
    status: Optional[PostStatus] = None

class PostResponse(BaseModel):
    id: str
    user_id: str
    content: str
    account_ids: List[str]
    media_urls: List[str] = []
    hashtags: List[str] = []
    status: PostStatus
    scheduled_at: Optional[str] = None
    published_at: Optional[str] = None
    meta_post_ids: Dict[str, str] = {} # {account_id: external_post_id}
    error_message: Optional[str] = None
    created_at: str

# AI Studio Schemas
class AIGenerateRequest(BaseModel):
    topic: str
    tone: ContentTone = ContentTone.PROFESSIONAL
    target_platform: PlatformType = PlatformType.INSTAGRAM
    include_hashtags: bool = True
    include_emojis: bool = True
    call_to_action: Optional[str] = None

class AIGenerateResponse(BaseModel):
    generated_text: str
    suggested_hashtags: List[str]
    facebook_variant: str
    instagram_variant: str
    ai_image_prompt: str

# Dashboard Analytics
class DashboardStats(BaseModel):
    total_posts: int
    scheduled_posts: int
    published_posts: int
    connected_accounts: int
    recent_posts: List[PostResponse]
