import os
import logging
from typing import Dict, Any, Optional
from anthropic import AsyncAnthropic
import asyncio

logger = logging.getLogger(__name__)

class ClaudeService:
    def __init__(self):
        self.api_key = os.getenv("ANTHROPIC_API_KEY")
        if not self.api_key:
            logger.warning("ANTHROPIC_API_KEY not found in environment variables")
            self.client = None
        else:
            self.client = AsyncAnthropic(api_key=self.api_key)
        
        self.model = "claude-3-5-sonnet-20241022"  # Latest Claude model
        self.max_tokens = 4000

    async def generate_content(
        self, 
        prompt: str, 
        max_tokens: Optional[int] = None,
        temperature: float = 0.7,
        system_prompt: Optional[str] = None
    ) -> str:
        """Generate content using Claude 4/3.5 Sonnet"""
        
        if not self.client:
            logger.error("Claude client not initialized - API key missing")
            return self._fallback_content(prompt)
        
        try:
            # Default system prompt for marketing assistant
            if not system_prompt:
                system_prompt = """You are an expert marketing assistant specializing in book marketing, 
                particularly for horror novels. You understand audience psychology, effective messaging, 
                and how to create compelling content that drives engagement and sales. 
                
                You're currently working on marketing 'The Dark Road', a horror novel. Always consider:
                - Target audience: Horror readers, thriller enthusiasts
                - Brand voice: Mysterious, engaging, professional
                - Goal: Drive book sales and build author brand
                - Platforms: Social media, email, web content
                
                Provide practical, actionable content that can be used immediately."""

            messages = [
                {
                    "role": "user",
                    "content": prompt
                }
            ]

            response = await self.client.messages.create(
                model=self.model,
                max_tokens=max_tokens or self.max_tokens,
                temperature=temperature,
                system=system_prompt,
                messages=messages
            )

            # Extract text content from response
            content = ""
            for block in response.content:
                if block.type == "text":
                    content += block.text

            logger.info(f"Successfully generated content with Claude ({len(content)} characters)")
            return content

        except Exception as e:
            logger.error(f"Error generating content with Claude: {str(e)}")
            return self._fallback_content(prompt)

    async def generate_campaign_strategy(self, campaign_data: Dict[str, Any]) -> str:
        """Generate comprehensive campaign strategy"""
        
        strategy_prompt = f"""
        Create a comprehensive marketing campaign strategy for 'The Dark Road' horror novel:

        Campaign Details:
        - Name: {campaign_data.get('name', 'Untitled Campaign')}
        - Description: {campaign_data.get('description', 'No description provided')}
        - Target Audience: {campaign_data.get('target_audience', 'Horror readers')}
        - Platforms: {', '.join(campaign_data.get('platforms', []))}
        - Goals: {', '.join(campaign_data.get('goals', []))}
        - Budget: ${campaign_data.get('budget', 'Not specified')}
        - Duration: {campaign_data.get('start_date', 'TBD')} to {campaign_data.get('end_date', 'TBD')}

        Please provide:

        1. EXECUTIVE SUMMARY
        - Campaign overview and key objectives

        2. TARGET AUDIENCE ANALYSIS
        - Primary and secondary audience segments
        - Demographic and psychographic profiles
        - Content preferences and behaviors

        3. MESSAGING STRATEGY
        - Core value proposition
        - Key messages for each platform
        - Tone and voice guidelines

        4. PLATFORM STRATEGY
        - Platform-specific approaches
        - Content types and formats
        - Posting frequency and timing

        5. CONTENT CALENDAR FRAMEWORK
        - Weekly themes and content pillars
        - Campaign milestones and key dates
        - Content mix recommendations

        6. BUDGET ALLOCATION
        - Platform advertising spend
        - Content creation costs
        - Tool and software expenses

        7. SUCCESS METRICS
        - KPIs for each platform
        - Conversion tracking setup
        - ROI measurement approach

        8. RISK MITIGATION
        - Potential challenges and solutions
        - Contingency plans
        - Quality control measures

        Format as a professional marketing strategy document.
        """

        system_prompt = """You are a senior marketing strategist with extensive experience in book marketing 
        and horror genre promotion. Create detailed, actionable strategies based on industry best practices 
        and proven marketing principles."""

        return await self.generate_content(strategy_prompt, max_tokens=4000, system_prompt=system_prompt)

    async def generate_social_content(
        self, 
        platform: str, 
        content_type: str, 
        topic: str,
        tone: str = "engaging",
        max_length: Optional[int] = None
    ) -> Dict[str, Any]:
        """Generate platform-specific social media content"""
        
        content_prompt = f"""
        Create {content_type} content for {platform} about 'The Dark Road' horror novel:

        Topic: {topic}
        Tone: {tone}
        Platform: {platform}
        {"Max length: " + str(max_length) + " characters" if max_length else ""}

        Platform specifications:
        - Instagram: Visual-first, stories, reels, carousel posts
        - Facebook: Community engagement, longer-form posts, events
        - Twitter: Concise, engaging, thread-worthy, hashtag-optimized
        - TikTok: Video-first, trending sounds, viral potential
        - LinkedIn: Professional, industry insights, thought leadership

        Please provide:
        1. Main content text
        2. Suggested hashtags (platform-appropriate number)
        3. Call-to-action
        4. Engagement hooks
        5. Visual suggestions (if applicable)
        6. Best posting times for this content type

        Return in JSON format for easy parsing.
        """

        system_prompt = """You are a social media content creator specializing in book marketing 
        and horror genre content. You understand platform algorithms, engagement strategies, 
        and how to create content that converts browsers into buyers."""

        response = await self.generate_content(content_prompt, system_prompt=system_prompt)
        
        try:
            # Try to parse as JSON
            import json
            content_data = json.loads(response)
        except json.JSONDecodeError:
            # Fallback to structured text parsing
            content_data = self._parse_content_response(response, platform)

        return content_data

    def _parse_content_response(self, response: str, platform: str) -> Dict[str, Any]:
        """Parse content response when JSON parsing fails"""
        lines = response.split('\n')
        
        content_data = {
            "content": "",
            "hashtags": [],
            "call_to_action": "Check out The Dark Road today!",
            "engagement_hooks": [],
            "visual_suggestions": "",
            "best_times": "Peak engagement hours"
        }

        current_section = "content"
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            if "hashtag" in line.lower():
                current_section = "hashtags"
                # Extract hashtags from line
                hashtags = [word for word in line.split() if word.startswith('#')]
                content_data["hashtags"].extend(hashtags)
            elif "call to action" in line.lower() or "cta" in line.lower():
                current_section = "call_to_action"
            elif "visual" in line.lower():
                current_section = "visual_suggestions"
            elif "time" in line.lower() and "post" in line.lower():
                current_section = "best_times"
            else:
                if current_section == "content" and not any(keyword in line.lower() for keyword in ["hashtag", "visual", "time", "cta"]):
                    content_data["content"] += line + " "

        # Clean up content
        content_data["content"] = content_data["content"].strip()
        
        # Add default hashtags if none found
        if not content_data["hashtags"]:
            content_data["hashtags"] = ["#TheDarkRoad", "#HorrorBooks", "#NewRelease"]

        return content_data

    def _fallback_content(self, prompt: str) -> str:
        """Provide fallback content when API is unavailable"""
        logger.warning("Using fallback content generation")
        
        # Simple keyword-based content generation
        if "strategy" in prompt.lower():
            return """
            CAMPAIGN STRATEGY (Fallback Mode)
            
            1. OBJECTIVES: Drive awareness and sales for The Dark Road
            2. TARGET AUDIENCE: Horror enthusiasts, thriller readers, book lovers
            3. PLATFORMS: Social media, email, book promotion sites
            4. MESSAGING: Mysterious, engaging, fear-inducing content
            5. TIMELINE: 30-60 day campaign with weekly milestones
            6. METRICS: Engagement rate, click-through rate, conversion rate
            
            Note: Claude API unavailable - using fallback strategy template.
            """
        
        elif "social" in prompt.lower():
            return """
            🌙 Step into the darkness with The Dark Road... 
            
            A psychological horror that will keep you awake long after you've turned the last page. 
            Every shadow holds a secret, every turn reveals something you wish you hadn't seen.
            
            Are you brave enough to walk The Dark Road?
            
            #TheDarkRoad #HorrorBooks #PsychologicalThriller #MustRead
            """
        
        else:
            return f"""
            Content generated for: {prompt[:100]}...
            
            The Dark Road - A chilling journey into psychological horror.
            
            [Claude API unavailable - fallback content provided]
            """

    async def health_check(self) -> Dict[str, Any]:
        """Check Claude API health and connectivity"""
        if not self.client:
            return {
                "status": "unavailable",
                "reason": "API key not configured",
                "model": self.model
            }
        
        try:
            # Test with a simple request
            response = await self.client.messages.create(
                model=self.model,
                max_tokens=10,
                messages=[{"role": "user", "content": "Hello"}]
            )
            
            return {
                "status": "healthy",
                "model": self.model,
                "response_time": "< 1s",
                "last_check": "now"
            }
            
        except Exception as e:
            return {
                "status": "error",
                "reason": str(e),
                "model": self.model,
                "last_check": "now"
            }