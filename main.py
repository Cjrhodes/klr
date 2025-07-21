from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
import os
from dotenv import load_dotenv

from agents.project_lead_agent import ProjectLeadAgent
from agents.marketing_lead_agent import MarketingLeadAgent
from agents.graphic_artist_agent import GraphicArtistAgent
from agents.web_it_agent import WebITAgent
from agents.social_media_agent import SocialMediaAgent
from services.api_manager import APIManager
from services.task_scheduler import TaskScheduler
from models.requests import (
    CampaignRequest,
    ContentGenerationRequest,
    ImageGenerationRequest,
    TaskScheduleRequest,
    APIConfigRequest
)

load_dotenv()

app = FastAPI(
    title="Marketing Assistant API",
    description="Multi-agent marketing automation system for The Dark Road",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

project_lead = ProjectLeadAgent()
api_manager = APIManager()
task_scheduler = TaskScheduler()

@app.get("/")
async def root():
    return {"message": "Marketing Assistant API is running", "status": "healthy"}

@app.get("/agents/status")
async def get_agents_status():
    """Get status of all agents"""
    try:
        agents_status = await project_lead.get_all_agents_status()
        return {"success": True, "data": agents_status}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/campaign/create")
async def create_campaign(request: CampaignRequest, background_tasks: BackgroundTasks):
    """Create a new marketing campaign"""
    try:
        background_tasks.add_task(project_lead.create_campaign, request.dict())
        return {"success": True, "message": "Campaign creation started", "campaign_id": request.campaign_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/content/generate")
async def generate_content(request: ContentGenerationRequest):
    """Generate marketing content using AI agents"""
    try:
        result = await project_lead.coordinate_content_generation(request.dict())
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/image/generate")
async def generate_image(request: ImageGenerationRequest):
    """Generate images using DALL-E 3"""
    try:
        graphic_artist = GraphicArtistAgent()
        result = await graphic_artist.generate_image(request.prompt, request.style)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/schedule/task")
async def schedule_task(request: TaskScheduleRequest):
    """Schedule automated marketing tasks"""
    try:
        result = task_scheduler.schedule_task(
            request.task_type,
            request.schedule,
            request.parameters
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/schedule/tasks")
async def get_scheduled_tasks():
    """Get all scheduled tasks"""
    try:
        tasks = task_scheduler.get_all_tasks()
        return {"success": True, "data": tasks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/configure")
async def configure_apis(request: APIConfigRequest):
    """Configure API keys and settings"""
    try:
        result = api_manager.update_configuration(request.dict())
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/status")
async def get_api_status():
    """Get status of all configured APIs"""
    try:
        status = api_manager.get_api_status()
        return {"success": True, "data": status}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analytics/performance")
async def get_performance_analytics():
    """Get marketing performance analytics"""
    try:
        analytics = await project_lead.get_performance_analytics()
        return {"success": True, "data": analytics}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/social/post")
async def post_to_social_media(request: dict):
    """Post content to social media platforms"""
    try:
        social_agent = SocialMediaAgent()
        result = await social_agent.post_content(request)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )