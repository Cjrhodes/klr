from http.server import BaseHTTPRequestHandler
import json
import os
from datetime import datetime

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/api/status':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            # Mock API status response
            status = {
                "success": True,
                "data": {
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
                        "instagram": {"enabled": False, "configured": False, "status": "not_configured"},
                        "facebook": {"enabled": False, "configured": False, "status": "not_configured"},
                        "twitter": {"enabled": False, "configured": False, "status": "not_configured"},
                        "tiktok": {"enabled": False, "configured": False, "status": "not_configured"},
                        "threads": {"enabled": False, "configured": False, "status": "not_configured"},
                        "bluesky": {"enabled": False, "configured": False, "status": "not_configured"}
                    },
                    "analytics": {
                        "google_analytics": {"enabled": False, "configured": False, "status": "not_configured"},
                        "facebook_pixel": {"enabled": False, "configured": False, "status": "not_configured"}
                    },
                    "book_platforms": {
                        "amazon_kdp": {"enabled": False, "configured": False, "status": "not_configured"},
                        "bookbub": {"enabled": False, "configured": False, "status": "not_configured"}
                    },
                    "email_marketing": {
                        "mailchimp": {"enabled": False, "configured": False, "status": "not_configured"},
                        "convertkit": {"enabled": False, "configured": False, "status": "not_configured"}
                    },
                    "author_settings": {
                        "author_email": {
                            "enabled": bool(os.getenv("AUTHOR_EMAIL")),
                            "configured": bool(os.getenv("AUTHOR_EMAIL")),
                            "status": "ready" if os.getenv("AUTHOR_EMAIL") else "not_configured"
                        },
                        "notification_preferences": {"enabled": False, "configured": False, "status": "not_configured"}
                    }
                }
            }
            
            self.wfile.write(json.dumps(status).encode())
        else:
            self.send_response(404)
            self.end_headers()
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()