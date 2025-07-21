import os
import logging
from typing import Dict, Any, Optional, List
from openai import AsyncOpenAI
import base64
import io
from PIL import Image
import httpx

logger = logging.getLogger(__name__)

class DallEService:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            logger.warning("OPENAI_API_KEY not found in environment variables")
            self.client = None
        else:
            self.client = AsyncOpenAI(api_key=self.api_key)
        
        # DALL-E 3 specifications
        self.model = "dall-e-3"
        self.supported_sizes = ["1024x1024", "1792x1024", "1024x1792"]
        self.supported_qualities = ["standard", "hd"]
        self.supported_styles = ["vivid", "natural"]

    async def generate_image(
        self,
        prompt: str,
        size: str = "1024x1024",
        quality: str = "standard",
        style: str = "vivid",
        n: int = 1
    ) -> Dict[str, Any]:
        """Generate image using DALL-E 3"""
        
        if not self.client:
            logger.error("DALL-E client not initialized - API key missing")
            return self._fallback_image_response()
        
        try:
            # Enhance prompt for horror book marketing
            enhanced_prompt = self._enhance_prompt(prompt)
            
            logger.info(f"Generating image with DALL-E 3: {enhanced_prompt[:100]}...")
            
            # Validate parameters
            if size not in self.supported_sizes:
                size = "1024x1024"
            if quality not in self.supported_qualities:
                quality = "standard"
            if style not in self.supported_styles:
                style = "vivid"
            
            response = await self.client.images.generate(
                model=self.model,
                prompt=enhanced_prompt,
                size=size,
                quality=quality,
                style=style,
                n=1  # DALL-E 3 only supports n=1
            )
            
            image_data = response.data[0]
            
            result = {
                "success": True,
                "url": image_data.url,
                "revised_prompt": image_data.revised_prompt,
                "original_prompt": prompt,
                "enhanced_prompt": enhanced_prompt,
                "size": size,
                "quality": quality,
                "style": style,
                "model": self.model,
                "generated_at": "now"
            }
            
            logger.info("Successfully generated image with DALL-E 3")
            return result
            
        except Exception as e:
            logger.error(f"Error generating image with DALL-E 3: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "fallback_used": True,
                **self._fallback_image_response()
            }

    def _enhance_prompt(self, base_prompt: str) -> str:
        """Enhance prompt for better horror book marketing images"""
        
        # Brand-specific enhancements
        brand_elements = [
            "professional book marketing quality",
            "dark atmospheric mood",
            "mysterious and intriguing",
            "high contrast lighting"
        ]
        
        # Horror genre enhancements
        horror_elements = [
            "gothic aesthetic",
            "shadowy atmosphere", 
            "dramatic composition",
            "cinematic quality"
        ]
        
        # Avoid unwanted elements
        safety_constraints = [
            "no graphic violence",
            "no explicit content", 
            "suitable for book marketing",
            "professional appearance"
        ]
        
        # Combine elements
        enhancements = brand_elements + horror_elements + safety_constraints
        enhancement_text = ", ".join(enhancements)
        
        enhanced = f"{base_prompt}, {enhancement_text}"
        
        # Ensure prompt isn't too long (DALL-E 3 has limits)
        if len(enhanced) > 1000:
            enhanced = f"{base_prompt}, dark atmospheric horror book marketing image, professional quality, gothic aesthetic"
        
        return enhanced

    async def generate_book_cover_concept(
        self,
        title: str,
        genre_elements: List[str],
        mood: str = "mysterious",
        style: str = "professional"
    ) -> Dict[str, Any]:
        """Generate book cover concept image"""
        
        prompt = f"""
        Book cover design concept for '{title}':
        Genre: Horror with elements of {', '.join(genre_elements)}
        Mood: {mood}
        Style: {style} book cover design
        
        Design should be:
        - Title-ready composition with space for text
        - Commercial book cover aesthetic
        - Eye-catching for online bookstores
        - Atmospheric and genre-appropriate
        - Print-ready quality
        """
        
        return await self.generate_image(
            prompt=prompt,
            size="1024x1792",  # Tall format for book covers
            quality="hd",
            style="natural"
        )

    async def generate_social_media_graphic(
        self,
        platform: str,
        content_theme: str,
        book_title: str = "The Dark Road"
    ) -> Dict[str, Any]:
        """Generate social media graphics for specific platforms"""
        
        # Platform-specific dimensions and requirements
        platform_specs = {
            "instagram": {
                "size": "1024x1024",
                "description": "Instagram post graphic, square format, mobile-optimized"
            },
            "facebook": {
                "size": "1024x1024", 
                "description": "Facebook post image, engaging and shareable"
            },
            "twitter": {
                "size": "1792x1024",
                "description": "Twitter post image, landscape format"
            },
            "pinterest": {
                "size": "1024x1792",
                "description": "Pinterest pin, vertical format, text-overlay ready"
            },
            "linkedin": {
                "size": "1792x1024",
                "description": "LinkedIn post image, professional appearance"
            }
        }
        
        spec = platform_specs.get(platform, platform_specs["instagram"])
        
        prompt = f"""
        Social media graphic for {platform}:
        Book: {book_title}
        Theme: {content_theme}
        Format: {spec['description']}
        
        Create an engaging, brand-consistent image for horror book marketing.
        Should be optimized for {platform} audience and algorithms.
        Include space for text overlay if needed.
        Dark, mysterious aesthetic matching 'The Dark Road' branding.
        """
        
        return await self.generate_image(
            prompt=prompt,
            size=spec["size"],
            quality="standard",
            style="vivid"
        )

    async def generate_promotional_image(
        self,
        campaign_theme: str,
        target_audience: str,
        call_to_action: str
    ) -> Dict[str, Any]:
        """Generate promotional images for marketing campaigns"""
        
        prompt = f"""
        Marketing promotional image:
        Campaign Theme: {campaign_theme}
        Target Audience: {target_audience}
        Call to Action: {call_to_action}
        
        For 'The Dark Road' horror novel promotion.
        Create compelling visual that drives book sales.
        Professional marketing quality.
        Dark, atmospheric horror aesthetic.
        Should motivate viewers to purchase or learn more.
        """
        
        return await self.generate_image(
            prompt=prompt,
            size="1024x1024",
            quality="hd", 
            style="vivid"
        )

    def _fallback_image_response(self) -> Dict[str, Any]:
        """Provide fallback response when DALL-E is unavailable"""
        logger.warning("Using fallback image response")
        
        return {
            "success": False,
            "url": "https://via.placeholder.com/1024x1024/1a1a2e/8b5cf6?text=The+Dark+Road+Marketing+Image",
            "message": "DALL-E 3 unavailable - placeholder image provided",
            "fallback": True,
            "placeholder_suggestions": [
                "Use Canva for quick graphics",
                "Commission custom artwork",
                "Use stock photography with dark themes",
                "Create text-based graphics with brand colors"
            ]
        }

    async def health_check(self) -> Dict[str, Any]:
        """Check DALL-E API health and connectivity"""
        if not self.client:
            return {
                "status": "unavailable", 
                "reason": "API key not configured",
                "model": self.model
            }
        
        try:
            # Test with minimal request to check connectivity
            # Note: This will use API credits, so implement carefully
            response = await self.client.images.generate(
                model=self.model,
                prompt="simple test image",
                size="1024x1024",
                quality="standard",
                style="natural",
                n=1
            )
            
            return {
                "status": "healthy",
                "model": self.model,
                "supported_sizes": self.supported_sizes,
                "supported_qualities": self.supported_qualities,
                "supported_styles": self.supported_styles,
                "last_check": "now"
            }
            
        except Exception as e:
            return {
                "status": "error",
                "reason": str(e),
                "model": self.model,
                "last_check": "now"
            }

    async def download_and_process_image(self, image_url: str, output_path: str) -> Dict[str, Any]:
        """Download and process generated image"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(image_url)
                response.raise_for_status()
                
                # Save original image
                with open(output_path, "wb") as f:
                    f.write(response.content)
                
                # Process with PIL for additional formats/sizes
                with Image.open(io.BytesIO(response.content)) as img:
                    # Create thumbnail
                    thumbnail_path = output_path.replace('.png', '_thumb.png')
                    img.thumbnail((300, 300))
                    img.save(thumbnail_path)
                    
                    # Get image info
                    info = {
                        "original_path": output_path,
                        "thumbnail_path": thumbnail_path,
                        "size": img.size,
                        "format": img.format,
                        "mode": img.mode
                    }
                
                return {
                    "success": True,
                    "info": info,
                    "message": "Image downloaded and processed successfully"
                }
                
        except Exception as e:
            logger.error(f"Error downloading/processing image: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }