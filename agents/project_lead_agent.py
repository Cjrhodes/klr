from crewai import Agent, Task, Crew
from crewai.tools import tool
import asyncio
from typing import Dict, List, Any
import logging
from datetime import datetime

from .marketing_lead_agent import MarketingLeadAgent
from .graphic_artist_agent import GraphicArtistAgent
from .web_it_agent import WebITAgent
from .social_media_agent import SocialMediaAgent
from services.claude_service import ClaudeService

logger = logging.getLogger(__name__)

class ProjectLeadAgent:
    def __init__(self):
        self.claude_service = ClaudeService()
        self.marketing_lead = MarketingLeadAgent()
        self.graphic_artist = GraphicArtistAgent()
        self.web_it = WebITAgent()
        self.social_media = SocialMediaAgent()
        
        self.agent = Agent(
            role="Project Lead and Coordinator",
            goal="Coordinate marketing efforts across all agents to drive sales growth for The Dark Road",
            backstory="""You are the central coordinator for a sophisticated marketing team focused on 
            promoting 'The Dark Road' horror novel. You understand the horror genre market, coordinate 
            between specialists, and ensure all marketing efforts align with business goals. You make 
            strategic decisions and delegate tasks effectively.""",
            tools=[self.coordinate_team, self.analyze_performance, self.create_strategy],
            verbose=True,
            allow_delegation=True
        )

    @tool
    def coordinate_team(self, task_description: str) -> str:
        """Coordinate tasks across different marketing agents"""
        return f"Task coordinated: {task_description}"

    @tool 
    def analyze_performance(self, metrics: dict) -> str:
        """Analyze marketing performance metrics"""
        return f"Performance analysis completed for metrics: {list(metrics.keys())}"

    @tool
    def create_strategy(self, campaign_goals: list) -> str:
        """Create comprehensive marketing strategy"""
        return f"Strategy created for goals: {', '.join(campaign_goals)}"

    async def create_campaign(self, campaign_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create and coordinate a marketing campaign"""
        try:
            logger.info(f"Creating campaign: {campaign_data['name']}")
            
            # Create campaign strategy using Claude
            strategy_prompt = f"""
            As the Project Lead for marketing 'The Dark Road' horror novel, create a comprehensive 
            marketing campaign strategy for:
            
            Campaign: {campaign_data['name']}
            Description: {campaign_data['description']}
            Target Audience: {campaign_data['target_audience']}
            Platforms: {', '.join(campaign_data['platforms'])}
            Goals: {', '.join(campaign_data['goals'])}
            Content Themes: {', '.join(campaign_data['content_themes'])}
            
            Provide a detailed strategy including:
            1. Campaign timeline and milestones
            2. Content calendar
            3. Platform-specific approaches
            4. KPIs and success metrics
            5. Team coordination plan
            """
            
            strategy = await self.claude_service.generate_content(strategy_prompt)
            
            # Delegate tasks to specialized agents
            tasks = []
            
            # Marketing Lead: Campaign planning
            marketing_task = await self.marketing_lead.create_campaign_plan(campaign_data)
            tasks.append(marketing_task)
            
            # Graphic Artist: Visual assets
            if "visual_content" in campaign_data.get('content_themes', []):
                graphic_task = await self.graphic_artist.plan_visual_assets(campaign_data)
                tasks.append(graphic_task)
            
            # Web/IT: Technical setup
            web_task = await self.web_it.setup_campaign_tracking(campaign_data)
            tasks.append(web_task)
            
            # Social Media: Platform setup
            social_task = await self.social_media.setup_campaign_channels(campaign_data)
            tasks.append(social_task)
            
            return {
                "campaign_id": campaign_data['campaign_id'],
                "strategy": strategy,
                "tasks": tasks,
                "status": "initiated",
                "created_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error creating campaign: {str(e)}")
            raise

    async def coordinate_content_generation(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Coordinate content generation across agents"""
        try:
            content_type = request.get('content_type')
            platform = request.get('platform')
            
            results = {}
            
            # Generate text content
            if content_type in ['post', 'ad', 'email']:
                marketing_content = await self.marketing_lead.generate_content(request)
                results['text_content'] = marketing_content
            
            # Generate visual content if needed
            if request.get('include_images', True):
                image_prompt = f"Horror book marketing image for {request.get('topic', 'The Dark Road')}"
                image_result = await self.graphic_artist.generate_image(image_prompt)
                results['image_content'] = image_result
            
            # Platform-specific optimization
            if platform in ['instagram', 'facebook', 'twitter', 'tiktok']:
                optimized_content = await self.social_media.optimize_for_platform(
                    results.get('text_content', ''), platform
                )
                results['optimized_content'] = optimized_content
            
            return results
            
        except Exception as e:
            logger.error(f"Error coordinating content generation: {str(e)}")
            raise

    async def get_all_agents_status(self) -> Dict[str, Any]:
        """Get status of all marketing agents"""
        try:
            status = {
                "project_lead": {"status": "active", "last_activity": datetime.now().isoformat()},
                "marketing_lead": await self.marketing_lead.get_status(),
                "graphic_artist": await self.graphic_artist.get_status(),
                "web_it": await self.web_it.get_status(),
                "social_media": await self.social_media.get_status()
            }
            return status
        except Exception as e:
            logger.error(f"Error getting agents status: {str(e)}")
            raise

    async def get_performance_analytics(self) -> Dict[str, Any]:
        """Get comprehensive performance analytics"""
        try:
            analytics = {
                "social_media_metrics": await self.social_media.get_analytics(),
                "web_metrics": await self.web_it.get_analytics(),
                "campaign_performance": await self.marketing_lead.get_campaign_metrics(),
                "visual_content_performance": await self.graphic_artist.get_performance_metrics(),
                "generated_at": datetime.now().isoformat()
            }
            return analytics
        except Exception as e:
            logger.error(f"Error getting performance analytics: {str(e)}")
            raise