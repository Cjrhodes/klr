# Marketing Assistant - Multi-Agent System

A sophisticated multi-agent marketing automation system for "The Dark Road" horror novel, built with FastAPI, CrewAI, and React.

## 🎯 Features

### Multi-Agent Architecture
- **Project Lead Agent**: Central coordinator managing all marketing efforts
- **Marketing Lead Agent**: Campaign strategy and content planning
- **Graphic Artist Agent**: DALL-E 3 image generation and visual content
- **Web/IT Agent**: Analytics tracking and platform integrations
- **Social Media Agent**: Content automation across all platforms

### AI-Powered Content Generation
- **Claude 4**: Advanced content generation and strategy development
- **DALL-E 3**: Professional image generation for marketing materials
- Platform-optimized content for Instagram, Facebook, Twitter, TikTok, Threads, Bluesky

### Automation & Scheduling
- **Task Scheduler**: Automated content generation and posting
- **Campaign Management**: End-to-end campaign coordination
- **Performance Analytics**: Real-time tracking and reporting

### Secure API Management
- **Encrypted Storage**: All API keys encrypted with Fernet
- **Web Dashboard**: Streamlit-based control panel for configuration
- **Multi-Platform Integration**: 15+ platform and service integrations

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 16+
- API keys for services you want to use

### Backend Setup

1. **Clone and setup Python environment**
   ```bash
   cd MarketingAssistant
   pip install -r requirements.txt
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Start the FastAPI server**
   ```bash
   python main.py
   ```
   Server runs on `http://localhost:8000`

### Frontend Setup

1. **Install React dependencies**
   ```bash
   cd bonnie-marketing-assistant
   npm install
   ```

2. **Start the React development server**
   ```bash
   npm start
   ```
   Frontend runs on `http://localhost:3000`

## 🛠️ API Configuration

### Required API Keys

#### AI Services (Core functionality)
- **Anthropic API**: Claude 4 content generation
- **OpenAI API**: DALL-E 3 image generation

#### Social Media Platforms
- **Instagram Business API**: Post automation and analytics
- **Facebook Graph API**: Page management and advertising
- **Twitter API v2**: Tweet automation and engagement
- **TikTok Business API**: Video content management
- **Threads API**: Meta's new platform integration
- **Bluesky API**: Decentralized social network

#### Analytics & Tracking
- **Google Analytics 4**: Website and campaign tracking
- **Facebook Pixel**: Conversion tracking and optimization

#### Book Marketing Platforms
- **Amazon KDP API**: Sales tracking and rank monitoring
- **BookBub Partners API**: Advertising and promotion management

#### Email Marketing
- **Mailchimp API**: Email campaign automation
- **ConvertKit API**: Author email marketing

### Configuration Methods

1. **Web Dashboard**: Use the API Settings tab in the React app
2. **Environment Variables**: Set in `.env` file
3. **Direct API**: POST to `/api/configure` endpoint

## 🤖 Agent System

### Project Lead Agent
- **Role**: Central coordinator and strategy oversight
- **Capabilities**:
  - Campaign creation and coordination
  - Cross-agent task delegation
  - Performance analytics aggregation
  - Strategic decision making

### Marketing Lead Agent
- **Role**: Campaign strategy and execution
- **Capabilities**:
  - Market analysis and audience targeting
  - Content strategy development
  - Campaign planning and optimization
  - ROI analysis and reporting

### Graphic Artist Agent
- **Role**: Visual content creation
- **Capabilities**:
  - DALL-E 3 image generation
  - Platform-specific graphics
  - Book cover concepts
  - Brand-consistent visual assets

### Web/IT Agent
- **Role**: Technical integration and tracking
- **Capabilities**:
  - Analytics setup and monitoring
  - API integration management
  - Performance tracking
  - Technical health monitoring

### Social Media Agent
- **Role**: Content automation and community management
- **Capabilities**:
  - Multi-platform content optimization
  - Automated posting and scheduling
  - Engagement analytics
  - Hashtag strategy development

## 📊 API Endpoints

### Campaign Management
```
POST   /campaign/create          - Create new marketing campaign
GET    /agents/status            - Get all agent statuses
GET    /analytics/performance    - Get performance analytics
```

### Content Generation
```
POST   /content/generate         - Generate marketing content
POST   /image/generate           - Generate images with DALL-E 3
POST   /social/post              - Post to social media platforms
```

### Task Automation
```
POST   /schedule/task            - Schedule automated tasks
GET    /schedule/tasks           - Get all scheduled tasks
DELETE /schedule/task/{id}       - Delete scheduled task
```

### API Configuration
```
POST   /api/configure            - Configure API keys
GET    /api/status               - Get API connection status
```

## 📋 Task Scheduling

### Supported Task Types
- **Content Generation**: Automated content creation
- **Social Posts**: Scheduled social media posting
- **Analytics Reports**: Performance reporting
- **Image Generation**: Automated visual content
- **Campaign Reviews**: Strategic campaign analysis

### Schedule Patterns
- `daily` - Every day at 9 AM
- `weekly` - Every Monday at 9 AM
- `monthly` - First day of month at 9 AM
- `every N hours` - Custom interval
- `daily at HH:MM` - Custom daily time

### Example Task Creation
```python
{
    "task_type": "content_generation",
    "schedule": "daily at 14:30",
    "parameters": {
        "content_type": "post",
        "platform": "instagram",
        "topic": "behind the scenes",
        "auto_post": true
    }
}
```

## 🔐 Security Features

### API Key Management
- **Fernet Encryption**: All API keys encrypted at rest
- **Secure Storage**: Keys stored in encrypted JSON files
- **Environment Integration**: Automatic environment variable updates
- **Access Control**: Admin-only configuration access

### Data Protection
- **No Logging**: API keys never logged or exposed
- **Secure Transmission**: HTTPS-only API communication
- **Key Masking**: Keys masked in UI displays
- **Audit Trail**: Configuration change tracking

## 🎨 Horror Marketing Strategy

### Brand Guidelines
- **Color Palette**: Dark themes (#1a1a2e, #8b5cf6, #f97316)
- **Tone**: Mysterious, engaging, professional
- **Visual Style**: Gothic, atmospheric, cinematic
- **Content Themes**: Psychological horror, suspense, dark fiction

### Content Strategy
- **Monday**: Behind-the-scenes writing content
- **Tuesday**: Book excerpts and teasers
- **Wednesday**: Work-in-progress updates
- **Thursday**: Writing journey throwbacks
- **Friday**: Horror community discussions
- **Saturday**: Reader reviews and testimonials
- **Sunday**: Community engagement and stories

## 🚀 Deployment

### Production Setup
1. **Environment Configuration**
   ```bash
   export ENVIRONMENT=production
   export LOG_LEVEL=warning
   ```

2. **Docker Deployment** (optional)
   ```bash
   docker build -t marketing-assistant .
   docker run -p 8000:8000 marketing-assistant
   ```

3. **Process Management**
   ```bash
   pip install gunicorn
   gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker
   ```

### Monitoring
- **Health Checks**: `/health` endpoint
- **Metrics**: Built-in performance tracking
- **Logging**: Structured logging with levels
- **Error Handling**: Comprehensive error reporting

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **CrewAI**: Multi-agent orchestration framework
- **Anthropic**: Claude AI integration
- **OpenAI**: DALL-E 3 image generation
- **FastAPI**: High-performance API framework
- **React**: Modern web interface
- **Material-UI**: Beautiful component library

## 📞 Support

For support and questions:
- Create an issue in this repository
- Check the documentation
- Review the API examples

---

**Built for "The Dark Road" - Drive sales growth through AI-powered marketing automation** 🌙📚