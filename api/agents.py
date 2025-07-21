from http.server import BaseHTTPRequestHandler
import json
from datetime import datetime

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/api/agents' or self.path.startswith('/api/agents'):
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            # Mock agents status
            status = {
                "success": True,
                "data": {
                    "project_lead": {
                        "status": "active",
                        "last_activity": datetime.now().isoformat(),
                        "description": "Central coordinator managing all marketing efforts"
                    },
                    "marketing_lead": {
                        "status": "active", 
                        "last_activity": datetime.now().isoformat(),
                        "description": "Campaign strategy and content planning"
                    },
                    "graphic_artist": {
                        "status": "active",
                        "last_activity": datetime.now().isoformat(),
                        "description": "DALL-E 3 image generation and visual content"
                    },
                    "web_it": {
                        "status": "active",
                        "last_activity": datetime.now().isoformat(),
                        "description": "Analytics tracking and platform integrations"
                    },
                    "social_media": {
                        "status": "active",
                        "last_activity": datetime.now().isoformat(),
                        "description": "Content automation across all platforms"
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