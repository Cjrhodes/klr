from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
import os
from dotenv import load_dotenv
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI(
    title="Marketing Assistant API",
    description="Multi-agent marketing automation system for The Dark Road",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simplified models for API requests
class APIConfigRequest(BaseModel):
    service: str
    api_key: str
    additional_config: Optional[Dict[str, Any]] = None

class ContentGenerationRequest(BaseModel):
    content_type: str
    platform: str
    topic: str
    tone: str = "engaging"
    max_length: Optional[int] = None
    include_hashtags: bool = True

class ImageGenerationRequest(BaseModel):
    prompt: str
    style: str = "horror"
    size: str = "1024x1024"
    quality: str = "standard"

# In-memory storage for demo purposes
api_configurations = {}
generated_content_cache = []

@app.get("/")
async def root():
    return {"message": "Marketing Assistant API is running", "status": "healthy"}

@app.get("/api/status")
async def get_api_status():
    """Get status of all configured APIs"""
    try:
        # Mock API status for demonstration
        status = {
            "ai_services": {
                "anthropic": {
                    "enabled": bool(os.getenv("ANTHROPIC_API_KEY")),
                    "configured": bool(os.getenv("ANTHROPIC_API_KEY")),
                    "status": "ready" if os.getenv("ANTHROPIC_API_KEY") else "not_configured"
                },
                "openai": {
                    "enabled": bool(os.getenv("OPENAI_API_KEY")),
                    "configured": bool(os.getenv("OPENAI_API_KEY")),
                    "status": "ready" if os.getenv("OPENAI_API_KEY") else "not_configured"
                }
            },
            "social_media": {
                "instagram": {
                    "enabled": bool(api_configurations.get("instagram", {}).get("api_key")),
                    "configured": bool(api_configurations.get("instagram", {}).get("api_key")),
                    "status": "ready" if api_configurations.get("instagram", {}).get("api_key") else "not_configured"
                },
                "facebook": {
                    "enabled": bool(api_configurations.get("facebook", {}).get("api_key")),
                    "configured": bool(api_configurations.get("facebook", {}).get("api_key")),
                    "status": "ready" if api_configurations.get("facebook", {}).get("api_key") else "not_configured"
                },
                "twitter": {
                    "enabled": bool(api_configurations.get("twitter", {}).get("api_key")),
                    "configured": bool(api_configurations.get("twitter", {}).get("api_key")),
                    "status": "ready" if api_configurations.get("twitter", {}).get("api_key") else "not_configured"
                },
                "tiktok": {
                    "enabled": False,
                    "configured": False,
                    "status": "not_configured"
                },
                "threads": {
                    "enabled": False,
                    "configured": False,
                    "status": "not_configured"
                },
                "bluesky": {
                    "enabled": False,
                    "configured": False,
                    "status": "not_configured"
                }
            },
            "analytics": {
                "google_analytics": {
                    "enabled": False,
                    "configured": False,
                    "status": "not_configured"
                },
                "facebook_pixel": {
                    "enabled": False,
                    "configured": False,
                    "status": "not_configured"
                }
            },
            "book_platforms": {
                "amazon_kdp": {
                    "enabled": False,
                    "configured": False,
                    "status": "not_configured"
                },
                "bookbub": {
                    "enabled": False,
                    "configured": False,
                    "status": "not_configured"
                }
            },
            "email_marketing": {
                "mailchimp": {
                    "enabled": False,
                    "configured": False,
                    "status": "not_configured"
                },
                "convertkit": {
                    "enabled": False,
                    "configured": False,
                    "status": "not_configured"
                }
            },
            "author_settings": {
                "author_email": {
                    "enabled": bool(api_configurations.get("author_email", {}).get("email")),
                    "configured": bool(api_configurations.get("author_email", {}).get("email")),
                    "status": "ready" if api_configurations.get("author_email", {}).get("email") else "not_configured"
                },
                "notification_preferences": {
                    "enabled": bool(api_configurations.get("notification_preferences")),
                    "configured": bool(api_configurations.get("notification_preferences")),
                    "status": "ready" if api_configurations.get("notification_preferences") else "not_configured"
                }
            }
        }
        
        return {"success": True, "data": status}
    except Exception as e:
        logger.error(f"Error getting API status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/configure")
async def configure_apis(request: APIConfigRequest):
    """Configure API keys and settings"""
    try:
        service = request.service
        api_key = request.api_key
        additional_config = request.additional_config or {}
        
        if not service or not api_key:
            raise HTTPException(status_code=400, detail="Service and API key are required")
        
        # Store configuration (in production, this should be encrypted)
        api_configurations[service] = {
            "api_key": api_key,  # In production: encrypt this
            "additional_config": additional_config,
            "configured_at": datetime.now().isoformat(),
            "enabled": True
        }
        
        # Set environment variable for immediate use
        if service == "anthropic":
            os.environ["ANTHROPIC_API_KEY"] = api_key
        elif service == "openai":
            os.environ["OPENAI_API_KEY"] = api_key
        elif service in ["instagram", "facebook", "twitter"]:
            os.environ[f"{service.upper()}_API_KEY"] = api_key
        elif service == "author_email":
            # Store author email for agent access
            os.environ["AUTHOR_EMAIL"] = additional_config.get("email", "")
            os.environ["AUTHOR_NAME"] = additional_config.get("name", "")
        
        logger.info(f"Configured {service} API")
        
        return {
            "success": True,
            "message": f"Configuration updated for {service}",
            "service": service,
            "updated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error configuring API: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/content/generate")
async def generate_content(request: ContentGenerationRequest):
    """Generate marketing content using AI"""
    try:
        # Check if Anthropic API is configured
        if not os.getenv("ANTHROPIC_API_KEY"):
            # Return mock content for demo
            mock_content = {
                "content": f"🌙 Step into the shadows with The Dark Road...\n\nA {request.tone} journey into psychological horror that will keep you turning pages late into the night. Every chapter reveals new mysteries, every character harbors dark secrets.\n\nAre you ready to walk The Dark Road?\n\n📖 Available now on all platforms",
                "hashtags": ["#TheDarkRoad", "#HorrorBooks", "#PsychologicalThriller", "#NewRelease", "#MustRead"],
                "platform": request.platform,
                "content_type": request.content_type,
                "generated_at": datetime.now().isoformat(),
                "note": "Demo content - Configure Anthropic API key for AI-generated content"
            }
        else:
            # Would use actual Anthropic API here
            from anthropic import AsyncAnthropic
            
            client = AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
            
            prompt = f"""Create {request.content_type} content for {request.platform} about 'The Dark Road' horror novel:

Topic: {request.topic}
Tone: {request.tone}
Platform: {request.platform}

Requirements:
- Engaging and suspenseful for horror audience
- Platform-optimized format
- Include compelling hook
- Drive book sales
- {'Include relevant hashtags' if request.include_hashtags else 'No hashtags needed'}

Return the content with suggested hashtags if requested."""

            response = await client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=1000,
                messages=[{"role": "user", "content": prompt}]
            )
            
            content_text = ""
            for block in response.content:
                if block.type == "text":
                    content_text += block.text
            
            mock_content = {
                "content": content_text,
                "hashtags": ["#TheDarkRoad", "#HorrorBooks", "#PsychologicalThriller"] if request.include_hashtags else [],
                "platform": request.platform,
                "content_type": request.content_type,
                "generated_at": datetime.now().isoformat(),
                "ai_generated": True
            }
        
        # Cache the generated content
        generated_content_cache.append(mock_content)
        
        return {"success": True, "data": mock_content}
        
    except Exception as e:
        logger.error(f"Error generating content: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/image/generate")
async def generate_image(request: ImageGenerationRequest):
    """Generate images using DALL-E 3"""
    try:
        # Check if OpenAI API is configured
        if not os.getenv("OPENAI_API_KEY"):
            # Return mock image for demo
            mock_image = {
                "success": True,
                "url": f"https://via.placeholder.com/{request.size.replace('x', 'x')}/1a1a2e/8b5cf6?text=The+Dark+Road+{request.style.title()}+Image",
                "prompt": request.prompt,
                "style": request.style,
                "size": request.size,
                "generated_at": datetime.now().isoformat(),
                "note": "Demo image - Configure OpenAI API key for AI-generated images"
            }
        else:
            # Would use actual OpenAI API here
            from openai import AsyncOpenAI
            
            client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
            
            enhanced_prompt = f"{request.prompt}, {request.style} style, horror book marketing image, dark atmospheric mood, professional quality"
            
            response = await client.images.generate(
                model="dall-e-3",
                prompt=enhanced_prompt,
                size=request.size,
                quality=request.quality,
                style="vivid",
                n=1
            )
            
            image_data = response.data[0]
            
            mock_image = {
                "success": True,
                "url": image_data.url,
                "prompt": request.prompt,
                "enhanced_prompt": enhanced_prompt,
                "revised_prompt": image_data.revised_prompt,
                "style": request.style,
                "size": request.size,
                "generated_at": datetime.now().isoformat(),
                "ai_generated": True
            }
        
        return {"success": True, "data": mock_image}
        
    except Exception as e:
        logger.error(f"Error generating image: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/agents/status")
async def get_agents_status():
    """Get status of all agents"""
    try:
        status = {
            "project_lead": {
                "status": "active",
                "last_activity": datetime.now().isoformat(),
                "description": "Central coordinator managing all marketing efforts"
            },
            "marketing_lead": {
                "status": "active", 
                "last_activity": datetime.now().isoformat(),
                "description": "Campaign strategy and content planning"
            },
            "graphic_artist": {
                "status": "active",
                "last_activity": datetime.now().isoformat(),
                "description": "DALL-E 3 image generation and visual content"
            },
            "web_it": {
                "status": "active",
                "last_activity": datetime.now().isoformat(),
                "description": "Analytics tracking and platform integrations"
            },
            "social_media": {
                "status": "active",
                "last_activity": datetime.now().isoformat(),
                "description": "Content automation across all platforms"
            }
        }
        return {"success": True, "data": status}
    except Exception as e:
        logger.error(f"Error getting agents status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analytics/performance")
async def get_performance_analytics():
    """Get marketing performance analytics"""
    try:
        analytics = {
            "social_media_metrics": {
                "total_followers": 8450,
                "engagement_rate": 0.067,
                "reach": 125000,
                "impressions": 340000,
                "clicks": 2890
            },
            "web_metrics": {
                "unique_visitors": 2450,
                "page_views": 8920,
                "bounce_rate": 0.45,
                "conversion_rate": 0.023
            },
            "campaign_performance": {
                "active_campaigns": 3,
                "total_reach": 45000,
                "roi": 2.4
            },
            "generated_at": datetime.now().isoformat()
        }
        return {"success": True, "data": analytics}
    except Exception as e:
        logger.error(f"Error getting performance analytics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/schedule/tasks")
async def get_scheduled_tasks():
    """Get all scheduled tasks"""
    return {
        "success": True, 
        "data": [
            {
                "task_id": "content_gen_daily",
                "name": "Daily Content Generation",
                "status": "scheduled",
                "next_run": "2024-01-22T09:00:00",
                "enabled": True
            }
        ]
    }

@app.post("/social/post")
async def post_to_social_media(request: dict):
    """Post content to social media platforms"""
    try:
        results = {}
        
        for platform in request.get('platforms', []):
            # Mock posting result
            post_result = {
                "platform": platform,
                "status": "posted",
                "post_id": f"{platform}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                "content": request.get('content'),
                "posted_at": datetime.now().isoformat(),
                "note": f"Demo mode - {platform} API not configured for actual posting"
            }
            results[platform] = post_result
        
        return {
            "success": True,
            "results": results,
            "total_platforms": len(request.get('platforms', []))
        }
        
    except Exception as e:
        logger.error(f"Error posting content: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(
        "main_simple:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )