from crewai import Agent
from crewai.tools import tool
from typing import Dict, List, Any
import logging
from datetime import datetime
import httpx
import asyncio

logger = logging.getLogger(__name__)

class WebITAgent:
    def __init__(self):
        self.agent = Agent(
            role="Web/IT Integration Specialist",
            goal="Manage technical integrations, analytics tracking, and platform connections for marketing campaigns",
            backstory="""You are a technical specialist who ensures all marketing efforts are properly 
            tracked, integrated, and optimized from a technical perspective. You handle API integrations, 
            set up analytics tracking, manage platform connections, and ensure data flows correctly 
            between systems.""",
            tools=[self.setup_tracking, self.manage_integrations, self.monitor_performance],
            verbose=True
        )

    @tool
    def setup_tracking(self, platform: str, campaign_id: str) -> str:
        """Set up tracking and analytics for campaigns"""
        return f"Tracking set up for {platform} campaign: {campaign_id}"

    @tool
    def manage_integrations(self, service: str, action: str) -> str:
        """Manage API integrations with external services"""
        return f"Integration {action} completed for service: {service}"

    @tool
    def monitor_performance(self, metrics_type: str) -> str:
        """Monitor system and campaign performance"""
        return f"Performance monitoring active for: {metrics_type}"

    async def setup_campaign_tracking(self, campaign_data: Dict[str, Any]) -> Dict[str, Any]:
        """Set up technical tracking for a campaign"""
        try:
            tracking_setup = {
                "campaign_id": campaign_data['campaign_id'],
                "tracking_urls": {},
                "analytics_setup": {},
                "platform_integrations": {},
                "monitoring_dashboards": []
            }
            
            # Set up tracking for each platform
            for platform in campaign_data['platforms']:
                tracking_config = await self._setup_platform_tracking(platform, campaign_data)
                tracking_setup['tracking_urls'][platform] = tracking_config['urls']
                tracking_setup['analytics_setup'][platform] = tracking_config['analytics']
            
            # Set up Google Analytics goals
            if 'google_analytics' in campaign_data.get('integrations', []):
                ga_setup = await self._setup_google_analytics(campaign_data)
                tracking_setup['analytics_setup']['google_analytics'] = ga_setup
            
            # Set up Amazon KDP integration
            if 'amazon_kdp' in campaign_data.get('integrations', []):
                kdp_setup = await self._setup_amazon_kdp_tracking(campaign_data)
                tracking_setup['platform_integrations']['amazon_kdp'] = kdp_setup
            
            return {
                "agent": "web_it",
                "task": "campaign_tracking_setup",
                "setup": tracking_setup,
                "status": "completed",
                "created_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error setting up campaign tracking: {str(e)}")
            raise

    async def _setup_platform_tracking(self, platform: str, campaign_data: Dict[str, Any]) -> Dict[str, Any]:
        """Set up tracking for specific platform"""
        campaign_id = campaign_data['campaign_id']
        
        tracking_config = {
            "urls": {},
            "analytics": {},
            "pixels": {}
        }
        
        if platform == "facebook":
            tracking_config.update({
                "urls": {
                    "utm_source": "facebook",
                    "utm_medium": "social",
                    "utm_campaign": campaign_id
                },
                "analytics": {
                    "facebook_pixel": True,
                    "conversion_tracking": True
                },
                "pixels": ["facebook_pixel", "conversions_api"]
            })
        
        elif platform == "instagram":
            tracking_config.update({
                "urls": {
                    "utm_source": "instagram", 
                    "utm_medium": "social",
                    "utm_campaign": campaign_id
                },
                "analytics": {
                    "instagram_insights": True,
                    "story_tracking": True
                }
            })
        
        elif platform == "twitter":
            tracking_config.update({
                "urls": {
                    "utm_source": "twitter",
                    "utm_medium": "social", 
                    "utm_campaign": campaign_id
                },
                "analytics": {
                    "twitter_analytics": True,
                    "engagement_tracking": True
                }
            })
        
        elif platform == "amazon":
            tracking_config.update({
                "urls": {
                    "utm_source": "amazon",
                    "utm_medium": "marketplace",
                    "utm_campaign": campaign_id
                },
                "analytics": {
                    "sales_tracking": True,
                    "rank_monitoring": True
                }
            })
        
        return tracking_config

    async def _setup_google_analytics(self, campaign_data: Dict[str, Any]) -> Dict[str, Any]:
        """Set up Google Analytics goals and events"""
        return {
            "property_id": "GA4-PROPERTY-ID",
            "goals": [
                {
                    "name": "Book Purchase",
                    "type": "conversion",
                    "value": 9.99
                },
                {
                    "name": "Email Signup", 
                    "type": "engagement",
                    "value": 1.0
                },
                {
                    "name": "Social Share",
                    "type": "engagement", 
                    "value": 0.5
                }
            ],
            "custom_events": [
                "book_page_view",
                "trailer_view",
                "sample_download"
            ],
            "audiences": [
                "horror_book_readers",
                "engaged_visitors",
                "potential_customers"
            ]
        }

    async def _setup_amazon_kdp_tracking(self, campaign_data: Dict[str, Any]) -> Dict[str, Any]:
        """Set up Amazon KDP sales tracking"""
        return {
            "asin": "B0XXXXXX",  # The Dark Road ASIN
            "tracking_metrics": [
                "sales_rank",
                "daily_sales",
                "reviews_count",
                "rating_average"
            ],
            "reporting_frequency": "daily",
            "alerts": [
                {
                    "metric": "sales_rank",
                    "threshold": 1000,
                    "condition": "below"
                },
                {
                    "metric": "reviews_count", 
                    "threshold": 1,
                    "condition": "new"
                }
            ]
        }

    async def get_analytics(self) -> Dict[str, Any]:
        """Get comprehensive web and platform analytics"""
        try:
            # Mock analytics data - would integrate with real APIs
            return {
                "website_metrics": {
                    "unique_visitors": 2450,
                    "page_views": 8920,
                    "bounce_rate": 0.45,
                    "avg_session_duration": "2:34",
                    "conversion_rate": 0.023
                },
                "social_referrals": {
                    "facebook": 1230,
                    "instagram": 890,
                    "twitter": 567,
                    "tiktok": 234
                },
                "sales_funnel": {
                    "awareness": 10000,
                    "interest": 3500,
                    "consideration": 800,
                    "purchase": 156
                },
                "technical_performance": {
                    "page_load_time": "1.2s",
                    "api_response_time": "250ms",
                    "uptime": "99.9%",
                    "error_rate": "0.1%"
                },
                "last_updated": datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Error getting analytics: {str(e)}")
            raise

    async def monitor_integrations(self) -> Dict[str, Any]:
        """Monitor status of all integrations"""
        try:
            integrations_status = {}
            
            # Check API endpoints
            endpoints_to_check = [
                ("google_analytics", "https://www.googleapis.com/analytics/v3/management/accounts"),
                ("facebook_graph", "https://graph.facebook.com/v18.0/me"),
                ("twitter_api", "https://api.twitter.com/2/tweets"),
                ("amazon_advertising", "https://advertising-api.amazon.com/v2/profiles")
            ]
            
            for service, url in endpoints_to_check:
                try:
                    async with httpx.AsyncClient() as client:
                        response = await client.get(url, timeout=5.0)
                        integrations_status[service] = {
                            "status": "connected" if response.status_code < 500 else "degraded",
                            "response_time": "< 1s",
                            "last_check": datetime.now().isoformat()
                        }
                except Exception as e:
                    integrations_status[service] = {
                        "status": "disconnected",
                        "error": str(e),
                        "last_check": datetime.now().isoformat()
                    }
            
            return integrations_status
            
        except Exception as e:
            logger.error(f"Error monitoring integrations: {str(e)}")
            raise

    async def get_status(self) -> Dict[str, Any]:
        """Get Web/IT agent status"""
        return {
            "status": "active",
            "active_integrations": 8,
            "monitoring_campaigns": 3,
            "api_calls_today": 1247,
            "system_health": "optimal",
            "last_activity": datetime.now().isoformat()
        }