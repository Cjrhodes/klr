from crewai import Agent
from crewai.tools import tool
from typing import Dict, List, Any
import logging
from datetime import datetime, timedelta
import json

from services.claude_service import ClaudeService

logger = logging.getLogger(__name__)

class SocialMediaAgent:
    def __init__(self):
        self.claude_service = ClaudeService()
        
        self.agent = Agent(
            role="AI/Social Media Specialist",
            goal="Automate social media content creation, posting, and engagement for The Dark Road marketing",
            backstory="""You are a social media expert who understands platform algorithms, 
            engagement strategies, and horror genre audiences. You create compelling content 
            that drives engagement and book sales across all social media platforms.""",
            tools=[self.create_social_content, self.schedule_posts, self.analyze_engagement],
            verbose=True
        )

    @tool
    def create_social_content(self, platform: str, content_type: str) -> str:
        """Create platform-specific social media content"""
        return f"Social content created for {platform}: {content_type}"

    @tool
    def schedule_posts(self, posts: str, schedule: str) -> str:
        """Schedule social media posts"""
        return f"Posts scheduled: {schedule}"

    @tool
    def analyze_engagement(self, platform: str, timeframe: str) -> str:
        """Analyze social media engagement metrics"""
        return f"Engagement analysis completed for {platform} - {timeframe}"

    async def setup_campaign_channels(self, campaign_data: Dict[str, Any]) -> Dict[str, Any]:
        """Set up social media channels for campaign"""
        try:
            channel_setup = {
                "campaign_id": campaign_data['campaign_id'],
                "platforms": {},
                "content_calendar": {},
                "hashtag_strategy": {},
                "engagement_targets": {}
            }
            
            # Set up each platform
            for platform in campaign_data['platforms']:
                if platform in ['instagram', 'facebook', 'twitter', 'tiktok', 'threads', 'bluesky']:
                    platform_config = await self._setup_platform_strategy(platform, campaign_data)
                    channel_setup['platforms'][platform] = platform_config
            
            # Create content calendar
            content_calendar = await self._create_content_calendar(campaign_data)
            channel_setup['content_calendar'] = content_calendar
            
            # Develop hashtag strategy
            hashtag_strategy = await self._develop_hashtag_strategy(campaign_data)
            channel_setup['hashtag_strategy'] = hashtag_strategy
            
            return {
                "agent": "social_media",
                "task": "channel_setup",
                "setup": channel_setup,
                "status": "completed",
                "created_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error setting up campaign channels: {str(e)}")
            raise

    async def _setup_platform_strategy(self, platform: str, campaign_data: Dict[str, Any]) -> Dict[str, Any]:
        """Set up strategy for specific platform"""
        
        platform_strategies = {
            "instagram": {
                "content_types": ["carousel", "reels", "stories", "igtv"],
                "posting_frequency": "daily",
                "optimal_times": ["6-9 AM", "12-3 PM", "7-9 PM"],
                "hashtag_limit": 30,
                "focus": "visual storytelling, behind-the-scenes",
                "features": ["polls", "questions", "countdown_stickers"]
            },
            "facebook": {
                "content_types": ["posts", "videos", "events", "live"],
                "posting_frequency": "5-7 per week", 
                "optimal_times": ["1-3 PM", "3-4 PM"],
                "hashtag_limit": 5,
                "focus": "community building, book discussions",
                "features": ["groups", "events", "facebook_ads"]
            },
            "twitter": {
                "content_types": ["tweets", "threads", "spaces"],
                "posting_frequency": "3-5 daily",
                "optimal_times": ["8-10 AM", "7-9 PM"],
                "hashtag_limit": 3,
                "focus": "horror community engagement, writing insights",
                "features": ["threads", "polls", "twitter_spaces"]
            },
            "tiktok": {
                "content_types": ["short_videos", "trends", "challenges"],
                "posting_frequency": "daily",
                "optimal_times": ["6-10 AM", "7-9 PM"],
                "hashtag_limit": 5,
                "focus": "viral content, book trailers, writing process",
                "features": ["duets", "stitches", "live_streams"]
            },
            "threads": {
                "content_types": ["text_posts", "image_posts", "polls"],
                "posting_frequency": "2-3 daily",
                "optimal_times": ["9-11 AM", "2-4 PM"],
                "hashtag_limit": 5,
                "focus": "conversations, author insights",
                "features": ["replies", "reposts", "quotes"]
            },
            "bluesky": {
                "content_types": ["posts", "images", "links"],
                "posting_frequency": "1-2 daily",
                "optimal_times": ["10 AM-2 PM"],
                "hashtag_limit": 10,
                "focus": "literary community, horror discussions",
                "features": ["custom_feeds", "moderation"]
            }
        }
        
        return platform_strategies.get(platform, {
            "content_types": ["posts"],
            "posting_frequency": "daily",
            "optimal_times": ["12-2 PM"],
            "hashtag_limit": 10,
            "focus": "general marketing",
            "features": []
        })

    async def _create_content_calendar(self, campaign_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create content calendar for campaign"""
        calendar_prompt = f"""
        Create a 30-day social media content calendar for 'The Dark Road' horror novel campaign:
        
        Campaign: {campaign_data['name']}
        Platforms: {', '.join(campaign_data['platforms'])}
        Content Themes: {', '.join(campaign_data.get('content_themes', []))}
        Goals: {', '.join(campaign_data['goals'])}
        
        Include:
        - Daily content themes (Monday: Behind the scenes, Tuesday: Quotes, etc.)
        - Platform-specific content
        - Engagement-focused posts
        - Book promotion balance
        - Horror community engagement
        - Seasonal/trending opportunities
        
        Return as JSON with date, platform, content_type, theme, and suggested_time fields.
        """
        
        try:
            calendar_response = await self.claude_service.generate_content(calendar_prompt)
            calendar_data = json.loads(calendar_response)
        except (json.JSONDecodeError, Exception):
            # Fallback calendar structure
            calendar_data = self._create_default_calendar()
        
        return calendar_data

    async def _develop_hashtag_strategy(self, campaign_data: Dict[str, Any]) -> Dict[str, Any]:
        """Develop hashtag strategy for platforms"""
        hashtag_prompt = f"""
        Create a comprehensive hashtag strategy for 'The Dark Road' horror novel:
        
        Campaign Focus: {campaign_data.get('description', '')}
        Target Audience: {campaign_data.get('target_audience', 'Horror readers')}
        
        Create hashtag sets for:
        1. Brand hashtags (book-specific)
        2. Genre hashtags (horror, thriller, etc.)
        3. Community hashtags (reading community)
        4. Trending hashtags (seasonal, popular)
        5. Niche hashtags (specific horror subgenres)
        
        Return as JSON with category, hashtags, and usage_guidelines.
        """
        
        try:
            hashtag_response = await self.claude_service.generate_content(hashtag_prompt)
            hashtag_data = json.loads(hashtag_response)
        except (json.JSONDecodeError, Exception):
            # Fallback hashtag strategy
            hashtag_data = self._create_default_hashtags()
        
        return hashtag_data

    def _create_default_calendar(self) -> Dict[str, Any]:
        """Create default content calendar"""
        return {
            "weekly_themes": {
                "Monday": "Motivational Monday - Writing inspiration",
                "Tuesday": "Teaser Tuesday - Book excerpts",
                "Wednesday": "WIP Wednesday - Behind the scenes",
                "Thursday": "Throwback Thursday - Writing journey",
                "Friday": "Friday Frights - Horror discussions",
                "Saturday": "Saturday Spotlight - Reviews/testimonials",
                "Sunday": "Sunday Stories - Reader engagement"
            },
            "content_mix": {
                "promotional": "30%",
                "educational": "25%", 
                "entertainment": "25%",
                "community": "20%"
            },
            "post_frequency": {
                "instagram": "1-2 daily",
                "facebook": "5-7 weekly",
                "twitter": "3-5 daily",
                "tiktok": "1 daily"
            }
        }

    def _create_default_hashtags(self) -> Dict[str, Any]:
        """Create default hashtag strategy"""
        return {
            "brand_hashtags": ["#TheDarkRoad", "#BonnieAuthor", "#NewHorrorRelease"],
            "genre_hashtags": ["#HorrorBooks", "#PsychologicalHorror", "#DarkFiction", "#HorrorNovel"],
            "community_hashtags": ["#BookLovers", "#HorrorCommunity", "#IndieAuthor", "#BookstagramHorror"],
            "trending_hashtags": ["#BookTok", "#HorrorReads", "#MustRead", "#ScaryBooks"],
            "niche_hashtags": ["#GothicHorror", "#SupernaturalThriller", "#HorrorFiction", "#DarkTales"],
            "engagement_hashtags": ["#BookRecommendations", "#WhatAreYouReading", "#HorrorBookClub"]
        }

    async def optimize_for_platform(self, content: str, platform: str) -> Dict[str, Any]:
        """Optimize content for specific platform"""
        try:
            optimization_prompt = f"""
            Optimize this marketing content for {platform}:
            
            Original Content: {content}
            
            Platform: {platform}
            
            Consider:
            - Platform character limits
            - Audience behavior on {platform}
            - Platform-specific features
            - Engagement optimization
            - Horror genre best practices
            
            Return optimized content with platform-specific suggestions.
            """
            
            optimized = await self.claude_service.generate_content(optimization_prompt)
            
            return {
                "platform": platform,
                "optimized_content": optimized,
                "original_length": len(content),
                "optimized_length": len(optimized),
                "optimization_applied": True,
                "suggestions": self._get_platform_suggestions(platform)
            }
            
        except Exception as e:
            logger.error(f"Error optimizing content for {platform}: {str(e)}")
            return {
                "platform": platform,
                "optimized_content": content,
                "optimization_applied": False,
                "error": str(e)
            }

    def _get_platform_suggestions(self, platform: str) -> List[str]:
        """Get platform-specific suggestions"""
        suggestions = {
            "instagram": [
                "Add visual storytelling elements",
                "Use Instagram Stories features",
                "Include call-to-action in bio link"
            ],
            "facebook": [
                "Encourage comments and shares",
                "Use Facebook's native video features",
                "Create events for book launches"
            ],
            "twitter": [
                "Break into thread for more context",
                "Use trending hashtags appropriately",
                "Engage with horror community"
            ],
            "tiktok": [
                "Create video content",
                "Use trending sounds",
                "Keep hook in first 3 seconds"
            ]
        }
        
        return suggestions.get(platform, ["Optimize for platform audience"])

    async def post_content(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Post content to social media platforms"""
        try:
            results = {}
            
            for platform in request.get('platforms', []):
                # Mock posting - would integrate with real APIs
                post_result = {
                    "platform": platform,
                    "status": "posted",
                    "post_id": f"{platform}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                    "scheduled_time": request.get('schedule_time'),
                    "content": request.get('content'),
                    "hashtags": request.get('hashtags', []),
                    "posted_at": datetime.now().isoformat()
                }
                results[platform] = post_result
            
            return {
                "agent": "social_media",
                "results": results,
                "total_platforms": len(request.get('platforms', [])),
                "success": True
            }
            
        except Exception as e:
            logger.error(f"Error posting content: {str(e)}")
            return {
                "agent": "social_media",
                "error": str(e),
                "success": False
            }

    async def get_analytics(self) -> Dict[str, Any]:
        """Get social media analytics"""
        return {
            "total_followers": 8450,
            "engagement_rate": 0.067,
            "reach": 125000,
            "impressions": 340000,
            "clicks": 2890,
            "saves": 456,
            "shares": 234,
            "platform_breakdown": {
                "instagram": {"followers": 3200, "engagement": 0.078},
                "facebook": {"followers": 2100, "engagement": 0.045}, 
                "twitter": {"followers": 1800, "engagement": 0.089},
                "tiktok": {"followers": 1350, "engagement": 0.123}
            },
            "top_performing_posts": [
                "Behind-the-scenes writing setup",
                "Book excerpt teaser",
                "Horror writing tips"
            ],
            "last_updated": datetime.now().isoformat()
        }

    async def get_status(self) -> Dict[str, Any]:
        """Get social media agent status"""
        return {
            "status": "active",
            "posts_scheduled": 15,
            "platforms_connected": 6,
            "daily_engagement": 89,
            "content_queue": 12,
            "last_activity": datetime.now().isoformat()
        }