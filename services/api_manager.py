import os
import json
import logging
from typing import Dict, Any, List
from datetime import datetime
from cryptography.fernet import Fernet
import base64

from .claude_service import ClaudeService
from .dalle_service import DallEService

logger = logging.getLogger(__name__)

class APIManager:
    def __init__(self):
        self.config_file = "config/api_config.json"
        self.encryption_key = self._get_or_create_encryption_key()
        self.cipher_suite = Fernet(self.encryption_key)
        
        # Initialize services
        self.claude_service = ClaudeService()
        self.dalle_service = DallEService()
        
        # Load existing configuration
        self.config = self._load_config()

    def _get_or_create_encryption_key(self) -> bytes:
        """Get or create encryption key for API keys"""
        key_file = "config/encryption.key"
        
        # Create config directory if it doesn't exist
        os.makedirs("config", exist_ok=True)
        
        if os.path.exists(key_file):
            with open(key_file, "rb") as f:
                return f.read()
        else:
            # Generate new key
            key = Fernet.generate_key()
            with open(key_file, "wb") as f:
                f.write(key)
            return key

    def _encrypt_value(self, value: str) -> str:
        """Encrypt sensitive values"""
        if not value:
            return ""
        encrypted = self.cipher_suite.encrypt(value.encode())
        return base64.b64encode(encrypted).decode()

    def _decrypt_value(self, encrypted_value: str) -> str:
        """Decrypt sensitive values"""
        if not encrypted_value:
            return ""
        try:
            encrypted_bytes = base64.b64decode(encrypted_value.encode())
            decrypted = self.cipher_suite.decrypt(encrypted_bytes)
            return decrypted.decode()
        except Exception as e:
            logger.error(f"Error decrypting value: {str(e)}")
            return ""

    def _load_config(self) -> Dict[str, Any]:
        """Load API configuration from file"""
        if not os.path.exists(self.config_file):
            return self._create_default_config()
        
        try:
            with open(self.config_file, "r") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error loading config: {str(e)}")
            return self._create_default_config()

    def _create_default_config(self) -> Dict[str, Any]:
        """Create default API configuration"""
        default_config = {
            "ai_services": {
                "anthropic": {
                    "api_key": "",
                    "model": "claude-3-5-sonnet-20241022",
                    "max_tokens": 4000,
                    "enabled": True
                },
                "openai": {
                    "api_key": "",
                    "model": "dall-e-3",
                    "enabled": True
                }
            },
            "social_media": {
                "instagram": {
                    "access_token": "",
                    "business_account_id": "",
                    "enabled": False
                },
                "facebook": {
                    "access_token": "",
                    "page_id": "",
                    "enabled": False
                },
                "twitter": {
                    "api_key": "",
                    "api_secret": "",
                    "access_token": "",
                    "access_secret": "",
                    "enabled": False
                },
                "tiktok": {
                    "api_key": "",
                    "enabled": False
                },
                "threads": {
                    "access_token": "",
                    "enabled": False
                },
                "bluesky": {
                    "identifier": "",
                    "password": "",
                    "enabled": False
                }
            },
            "analytics": {
                "google_analytics": {
                    "measurement_id": "",
                    "enabled": False
                },
                "facebook_pixel": {
                    "pixel_id": "",
                    "enabled": False
                }
            },
            "book_platforms": {
                "amazon_kdp": {
                    "api_key": "",
                    "asin": "",
                    "enabled": False
                },
                "bookbub": {
                    "api_key": "",
                    "enabled": False
                }
            },
            "email_marketing": {
                "mailchimp": {
                    "api_key": "",
                    "audience_id": "",
                    "enabled": False
                },
                "convertkit": {
                    "api_key": "",
                    "enabled": False
                }
            },
            "created_at": datetime.now().isoformat(),
            "last_updated": datetime.now().isoformat()
        }
        
        self._save_config(default_config)
        return default_config

    def _save_config(self, config: Dict[str, Any]):
        """Save configuration to file"""
        try:
            os.makedirs("config", exist_ok=True)
            config["last_updated"] = datetime.now().isoformat()
            
            with open(self.config_file, "w") as f:
                json.dump(config, f, indent=2)
                
        except Exception as e:
            logger.error(f"Error saving config: {str(e)}")

    def update_configuration(self, updates: Dict[str, Any]) -> Dict[str, Any]:
        """Update API configuration with new settings"""
        try:
            service = updates.get("service")
            api_key = updates.get("api_key")
            additional_config = updates.get("additional_config", {})
            
            if not service or not api_key:
                return {"success": False, "error": "Service and API key are required"}
            
            # Encrypt the API key
            encrypted_key = self._encrypt_value(api_key)
            
            # Update configuration based on service type
            if service == "anthropic":
                self.config["ai_services"]["anthropic"]["api_key"] = encrypted_key
                self.config["ai_services"]["anthropic"]["enabled"] = True
                self.config["ai_services"]["anthropic"].update(additional_config)
                
            elif service == "openai":
                self.config["ai_services"]["openai"]["api_key"] = encrypted_key
                self.config["ai_services"]["openai"]["enabled"] = True
                self.config["ai_services"]["openai"].update(additional_config)
                
            elif service in self.config.get("social_media", {}):
                self.config["social_media"][service]["api_key"] = encrypted_key
                self.config["social_media"][service]["enabled"] = True
                self.config["social_media"][service].update(additional_config)
                
            elif service in self.config.get("analytics", {}):
                self.config["analytics"][service]["api_key"] = encrypted_key
                self.config["analytics"][service]["enabled"] = True
                self.config["analytics"][service].update(additional_config)
                
            elif service in self.config.get("book_platforms", {}):
                self.config["book_platforms"][service]["api_key"] = encrypted_key
                self.config["book_platforms"][service]["enabled"] = True
                self.config["book_platforms"][service].update(additional_config)
                
            elif service in self.config.get("email_marketing", {}):
                self.config["email_marketing"][service]["api_key"] = encrypted_key
                self.config["email_marketing"][service]["enabled"] = True
                self.config["email_marketing"][service].update(additional_config)
            
            else:
                return {"success": False, "error": f"Unknown service: {service}"}
            
            # Save updated configuration
            self._save_config(self.config)
            
            # Update environment variables for immediate use
            self._update_environment_variables()
            
            return {
                "success": True,
                "message": f"Configuration updated for {service}",
                "service": service,
                "updated_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error updating configuration: {str(e)}")
            return {"success": False, "error": str(e)}

    def _update_environment_variables(self):
        """Update environment variables with decrypted API keys"""
        try:
            # AI Services
            anthropic_key = self.config["ai_services"]["anthropic"].get("api_key", "")
            if anthropic_key:
                os.environ["ANTHROPIC_API_KEY"] = self._decrypt_value(anthropic_key)
            
            openai_key = self.config["ai_services"]["openai"].get("api_key", "")
            if openai_key:
                os.environ["OPENAI_API_KEY"] = self._decrypt_value(openai_key)
            
            # Social Media
            for platform, config in self.config.get("social_media", {}).items():
                api_key = config.get("api_key", "")
                if api_key:
                    env_var = f"{platform.upper()}_API_KEY"
                    os.environ[env_var] = self._decrypt_value(api_key)
            
            logger.info("Environment variables updated")
            
        except Exception as e:
            logger.error(f"Error updating environment variables: {str(e)}")

    def get_api_status(self) -> Dict[str, Any]:
        """Get status of all configured APIs"""
        try:
            status = {
                "ai_services": {},
                "social_media": {},
                "analytics": {},
                "book_platforms": {},
                "email_marketing": {},
                "overall_health": "healthy",
                "last_checked": datetime.now().isoformat()
            }
            
            # Check AI services
            for service, config in self.config.get("ai_services", {}).items():
                enabled = config.get("enabled", False)
                has_key = bool(config.get("api_key", ""))
                
                status["ai_services"][service] = {
                    "enabled": enabled,
                    "configured": has_key,
                    "status": "ready" if enabled and has_key else "not_configured"
                }
            
            # Check other services
            for category in ["social_media", "analytics", "book_platforms", "email_marketing"]:
                for service, config in self.config.get(category, {}).items():
                    enabled = config.get("enabled", False)
                    has_key = bool(config.get("api_key", ""))
                    
                    status[category][service] = {
                        "enabled": enabled,
                        "configured": has_key,
                        "status": "ready" if enabled and has_key else "not_configured"
                    }
            
            # Determine overall health
            total_services = sum(len(category) for category in [
                status["ai_services"],
                status["social_media"], 
                status["analytics"],
                status["book_platforms"],
                status["email_marketing"]
            ])
            
            ready_services = sum(
                1 for category in [
                    status["ai_services"],
                    status["social_media"],
                    status["analytics"], 
                    status["book_platforms"],
                    status["email_marketing"]
                ]
                for service in category.values()
                if service["status"] == "ready"
            )
            
            if ready_services == 0:
                status["overall_health"] = "critical"
            elif ready_services < total_services * 0.5:
                status["overall_health"] = "degraded"
            else:
                status["overall_health"] = "healthy"
            
            status["configured_services"] = ready_services
            status["total_services"] = total_services
            
            return status
            
        except Exception as e:
            logger.error(f"Error getting API status: {str(e)}")
            return {
                "overall_health": "error",
                "error": str(e),
                "last_checked": datetime.now().isoformat()
            }

    def get_service_configuration(self, service: str, decrypt: bool = False) -> Dict[str, Any]:
        """Get configuration for a specific service"""
        try:
            # Find service in configuration
            for category in ["ai_services", "social_media", "analytics", "book_platforms", "email_marketing"]:
                if service in self.config.get(category, {}):
                    config = self.config[category][service].copy()
                    
                    if decrypt and "api_key" in config:
                        config["api_key"] = self._decrypt_value(config["api_key"])
                    elif not decrypt and "api_key" in config:
                        # Mask the API key for security
                        config["api_key"] = "*" * 20 if config["api_key"] else ""
                    
                    return {
                        "success": True,
                        "service": service,
                        "category": category,
                        "config": config
                    }
            
            return {"success": False, "error": f"Service '{service}' not found"}
            
        except Exception as e:
            logger.error(f"Error getting service configuration: {str(e)}")
            return {"success": False, "error": str(e)}

    def remove_service(self, service: str) -> Dict[str, Any]:
        """Remove a service configuration"""
        try:
            removed = False
            
            for category in ["ai_services", "social_media", "analytics", "book_platforms", "email_marketing"]:
                if service in self.config.get(category, {}):
                    self.config[category][service]["api_key"] = ""
                    self.config[category][service]["enabled"] = False
                    removed = True
                    break
            
            if removed:
                self._save_config(self.config)
                self._update_environment_variables()
                
                return {
                    "success": True,
                    "message": f"Service '{service}' removed successfully",
                    "service": service
                }
            else:
                return {"success": False, "error": f"Service '{service}' not found"}
                
        except Exception as e:
            logger.error(f"Error removing service: {str(e)}")
            return {"success": False, "error": str(e)}

    def list_available_services(self) -> Dict[str, Any]:
        """List all available services and their categories"""
        return {
            "ai_services": {
                "anthropic": "Claude AI for content generation",
                "openai": "DALL-E 3 for image generation"
            },
            "social_media": {
                "instagram": "Instagram Business API",
                "facebook": "Facebook Graph API",
                "twitter": "Twitter API v2",
                "tiktok": "TikTok for Business API",
                "threads": "Threads API",
                "bluesky": "Bluesky API"
            },
            "analytics": {
                "google_analytics": "Google Analytics 4",
                "facebook_pixel": "Facebook Pixel tracking"
            },
            "book_platforms": {
                "amazon_kdp": "Amazon KDP sales tracking",
                "bookbub": "BookBub advertising API"
            },
            "email_marketing": {
                "mailchimp": "Mailchimp email campaigns",
                "convertkit": "ConvertKit email automation"
            }
        }