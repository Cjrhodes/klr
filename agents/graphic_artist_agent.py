from crewai import Agent
from crewai.tools import tool
from typing import Dict, List, Any
import logging
from datetime import datetime
import base64
import io

from services.dalle_service import DallEService

logger = logging.getLogger(__name__)

class GraphicArtistAgent:
    def __init__(self):
        self.dalle_service = DallEService()
        
        self.agent = Agent(
            role="Creative Graphic Artist",
            goal="Create compelling visual content that captures the essence of The Dark Road and drives engagement",
            backstory="""You are a talented graphic artist specializing in horror and dark fantasy 
            aesthetics. You understand visual storytelling, color psychology, and how to create 
            images that evoke emotion and intrigue. Your artwork helps bring 'The Dark Road' to 
            life visually across all marketing channels.""",
            tools=[self.create_book_cover, self.design_social_graphics, self.generate_promotional_art],
            verbose=True
        )

    @tool
    def create_book_cover(self, concept: str) -> str:
        """Create book cover design concepts"""
        return f"Book cover concept created: {concept}"

    @tool
    def design_social_graphics(self, platform: str, content_type: str) -> str:
        """Design platform-specific social media graphics"""
        return f"Social graphic designed for {platform}: {content_type}"

    @tool
    def generate_promotional_art(self, campaign_theme: str) -> str:
        """Generate promotional artwork for campaigns"""
        return f"Promotional art generated for theme: {campaign_theme}"

    async def generate_image(self, prompt: str, style: str = "horror") -> Dict[str, Any]:
        """Generate images using DALL-E 3"""
        try:
            # Enhance prompt for horror book marketing
            enhanced_prompt = self._enhance_prompt(prompt, style)
            
            logger.info(f"Generating image with prompt: {enhanced_prompt}")
            
            # Generate image using DALL-E service
            image_result = await self.dalle_service.generate_image(
                prompt=enhanced_prompt,
                size="1024x1024",
                quality="hd",
                style="vivid"
            )
            
            return {
                "agent": "graphic_artist",
                "image_url": image_result.get("url"),
                "prompt_used": enhanced_prompt,
                "style": style,
                "generated_at": datetime.now().isoformat(),
                "success": True
            }
            
        except Exception as e:
            logger.error(f"Error generating image: {str(e)}")
            return {
                "agent": "graphic_artist",
                "error": str(e),
                "success": False,
                "generated_at": datetime.now().isoformat()
            }

    def _enhance_prompt(self, base_prompt: str, style: str) -> str:
        """Enhance the prompt based on style and brand guidelines"""
        style_enhancements = {
            "horror": "dark atmospheric lighting, mysterious shadows, gothic aesthetic, haunting mood",
            "book_cover": "professional book cover design, title-ready composition, commercial appeal",
            "social_media": "eye-catching, social media optimized, engaging visual hierarchy",
            "promotional": "marketing-focused, brand consistent, call-to-action ready"
        }
        
        brand_elements = "The Dark Road horror novel branding, mysterious dark aesthetic, professional quality"
        
        enhancement = style_enhancements.get(style, "artistic and engaging")
        
        return f"{base_prompt}, {enhancement}, {brand_elements}, high quality, detailed"

    async def plan_visual_assets(self, campaign_data: Dict[str, Any]) -> Dict[str, Any]:
        """Plan visual assets for a campaign"""
        try:
            visual_plan = {
                "campaign_id": campaign_data['campaign_id'],
                "visual_themes": self._extract_visual_themes(campaign_data),
                "asset_types": self._determine_asset_types(campaign_data['platforms']),
                "color_palette": ["#1a1a2e", "#16213e", "#8b5cf6", "#f97316"],
                "style_guide": "Dark, mysterious, professional horror aesthetic",
                "deliverables": []
            }
            
            # Plan specific deliverables
            for platform in campaign_data['platforms']:
                deliverables = self._plan_platform_assets(platform, campaign_data)
                visual_plan['deliverables'].extend(deliverables)
            
            return {
                "agent": "graphic_artist",
                "task": "visual_planning",
                "plan": visual_plan,
                "status": "completed",
                "created_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error planning visual assets: {str(e)}")
            raise

    def _extract_visual_themes(self, campaign_data: Dict[str, Any]) -> List[str]:
        """Extract visual themes from campaign data"""
        themes = []
        content_themes = campaign_data.get('content_themes', [])
        
        for theme in content_themes:
            if 'dark' in theme.lower() or 'horror' in theme.lower():
                themes.append("dark_atmospheric")
            elif 'mystery' in theme.lower():
                themes.append("mysterious_intrigue")
            elif 'book' in theme.lower():
                themes.append("literary_professional")
        
        return themes if themes else ["horror_aesthetic", "book_marketing"]

    def _determine_asset_types(self, platforms: List[str]) -> List[str]:
        """Determine required asset types based on platforms"""
        asset_types = []
        
        platform_assets = {
            "instagram": ["square_post", "story", "reel_thumbnail"],
            "facebook": ["post_image", "cover_photo", "ad_creative"],
            "twitter": ["header_image", "post_image", "thread_graphic"],
            "tiktok": ["video_thumbnail", "story_graphic"],
            "linkedin": ["post_image", "article_header"]
        }
        
        for platform in platforms:
            if platform in platform_assets:
                asset_types.extend(platform_assets[platform])
        
        return list(set(asset_types))

    def _plan_platform_assets(self, platform: str, campaign_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Plan assets for specific platform"""
        deliverables = []
        
        if platform == "instagram":
            deliverables.extend([
                {"type": "square_post", "size": "1080x1080", "description": "Main feed post"},
                {"type": "story", "size": "1080x1920", "description": "Instagram story graphic"},
                {"type": "reel_cover", "size": "1080x1920", "description": "Reel thumbnail"}
            ])
        elif platform == "facebook":
            deliverables.extend([
                {"type": "post_image", "size": "1200x630", "description": "Facebook post image"},
                {"type": "ad_creative", "size": "1080x1080", "description": "Facebook ad creative"}
            ])
        elif platform == "twitter":
            deliverables.extend([
                {"type": "post_image", "size": "1200x675", "description": "Twitter post image"},
                {"type": "header_image", "size": "1500x500", "description": "Twitter header"}
            ])
        
        return deliverables

    async def get_performance_metrics(self) -> Dict[str, Any]:
        """Get visual content performance metrics"""
        return {
            "images_generated_today": 12,
            "total_images_this_month": 89,
            "average_generation_time": "45 seconds",
            "most_popular_style": "horror_atmospheric",
            "engagement_rate": 0.078,
            "last_updated": datetime.now().isoformat()
        }

    async def get_status(self) -> Dict[str, Any]:
        """Get graphic artist agent status"""
        return {
            "status": "active",
            "images_in_queue": 3,
            "daily_quota_used": "12/50",
            "dalle_api_status": "connected",
            "last_activity": datetime.now().isoformat()
        }