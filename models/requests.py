from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class CampaignRequest(BaseModel):
    campaign_id: str
    name: str
    description: str
    target_audience: str
    platforms: List[str]
    budget: Optional[float] = None
    start_date: datetime
    end_date: datetime
    goals: List[str]
    content_themes: List[str]

class ContentGenerationRequest(BaseModel):
    content_type: str  # "post", "ad", "email", "blog"
    platform: str
    topic: str
    tone: str  # "professional", "casual", "horror", "mysterious"
    max_length: Optional[int] = None
    include_hashtags: bool = True
    target_audience: Optional[str] = None
    call_to_action: Optional[str] = None

class ImageGenerationRequest(BaseModel):
    prompt: str
    style: str  # "realistic", "artistic", "horror", "book_cover"
    size: str = "1024x1024"
    quality: str = "standard"  # "standard", "hd"

class TaskScheduleRequest(BaseModel):
    task_type: str  # "content_generation", "social_post", "analytics_report"
    schedule: str  # cron format or "daily", "weekly", "monthly"
    parameters: Dict[str, Any]
    enabled: bool = True

class APIConfigRequest(BaseModel):
    service: str
    api_key: str
    additional_config: Optional[Dict[str, Any]] = None

class SocialMediaPostRequest(BaseModel):
    platforms: List[str]
    content: str
    images: Optional[List[str]] = None
    schedule_time: Optional[datetime] = None
    hashtags: Optional[List[str]] = None