from crewai import Agent
from crewai.tools import tool
from typing import Dict, List, Any
import logging
from datetime import datetime
import json

from services.claude_service import ClaudeService

logger = logging.getLogger(__name__)

class MarketingLeadAgent:
    def __init__(self):
        self.claude_service = ClaudeService()
        
        self.agent = Agent(
            role="Marketing Strategy Lead",
            goal="Develop and execute comprehensive marketing strategies for The Dark Road horror novel",
            backstory="""You are an expert marketing strategist specializing in book marketing, 
            particularly in the horror genre. You understand audience psychology, market trends, 
            and effective promotional tactics. You create compelling campaigns that drive book sales 
            and build author brand recognition.""",
            tools=[self.create_campaign_strategy, self.analyze_market_trends, self.optimize_messaging],
            verbose=True
        )

    @tool
    def create_campaign_strategy(self, campaign_brief: str) -> str:
        """Create comprehensive marketing campaign strategy"""
        return f"Campaign strategy created for: {campaign_brief}"

    @tool
    def analyze_market_trends(self, genre: str) -> str:
        """Analyze current market trends for specific genre"""
        return f"Market analysis completed for {genre} genre"

    @tool
    def optimize_messaging(self, message: str, audience: str) -> str:
        """Optimize marketing message for target audience"""
        return f"Message optimized for {audience}: {message[:50]}..."

    async def create_campaign_plan(self, campaign_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create detailed campaign plan"""
        try:
            campaign_prompt = f"""
            As a Marketing Lead, create a comprehensive campaign plan for 'The Dark Road' horror novel:
            
            Campaign Details:
            - Name: {campaign_data['name']}
            - Target Audience: {campaign_data['target_audience']}
            - Platforms: {', '.join(campaign_data['platforms'])}
            - Goals: {', '.join(campaign_data['goals'])}
            - Budget: {campaign_data.get('budget', 'Not specified')}
            
            Create a detailed plan including:
            1. Audience segmentation and targeting
            2. Key messaging pillars
            3. Content calendar (weekly breakdown)
            4. Platform-specific strategies
            5. Budget allocation recommendations
            6. Success metrics and KPIs
            7. Risk mitigation strategies
            
            Focus on horror genre best practices and book marketing expertise.
            """
            
            plan = await self.claude_service.generate_content(campaign_prompt)
            
            return {
                "agent": "marketing_lead",
                "task": "campaign_planning",
                "plan": plan,
                "status": "completed",
                "created_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error creating campaign plan: {str(e)}")
            raise

    async def generate_content(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Generate marketing content"""
        try:
            content_prompt = f"""
            Create compelling marketing content for 'The Dark Road' horror novel:
            
            Content Type: {request['content_type']}
            Platform: {request['platform']}
            Topic: {request['topic']}
            Tone: {request['tone']}
            Target Audience: {request.get('target_audience', 'Horror readers')}
            Max Length: {request.get('max_length', 'No limit specified')}
            Include Hashtags: {request.get('include_hashtags', True)}
            Call to Action: {request.get('call_to_action', 'Buy the book')}
            
            Requirements:
            - Engaging and suspenseful for horror audience
            - Platform-optimized format
            - Include compelling hook
            - Drive book sales
            - Maintain consistent brand voice
            
            Return the content in JSON format with fields: content, hashtags, engagement_tips
            """
            
            response = await self.claude_service.generate_content(content_prompt)
            
            try:
                content_data = json.loads(response)
            except json.JSONDecodeError:
                content_data = {
                    "content": response,
                    "hashtags": ["#TheDarkRoad", "#HorrorBooks", "#NewRelease"],
                    "engagement_tips": "Post during peak engagement hours"
                }
            
            return {
                "agent": "marketing_lead",
                "content_data": content_data,
                "platform": request['platform'],
                "generated_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error generating content: {str(e)}")
            raise

    async def get_campaign_metrics(self) -> Dict[str, Any]:
        """Get campaign performance metrics"""
        return {
            "active_campaigns": 3,
            "total_reach": 45000,
            "engagement_rate": 0.065,
            "conversion_rate": 0.023,
            "roi": 2.4,
            "top_performing_content": "Behind-the-scenes writing posts",
            "last_updated": datetime.now().isoformat()
        }

    async def get_status(self) -> Dict[str, Any]:
        """Get marketing lead agent status"""
        return {
            "status": "active",
            "active_campaigns": 3,
            "content_generated_today": 8,
            "next_scheduled_task": "Weekly performance review",
            "last_activity": datetime.now().isoformat()
        }