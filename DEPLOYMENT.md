# Deployment Guide

## 🚀 Deploy to Vercel

### Prerequisites
- GitHub account
- Vercel account (linked to GitHub)
- API keys for Anthropic Claude and OpenAI DALL-E 3

### 1. Push to GitHub

```bash
# If not already done, create GitHub repository
gh repo create MarketingAssistant --public --source=. --remote=origin --push

# Or manually:
# 1. Create new repository on GitHub named "MarketingAssistant"
# 2. Then run:
git remote add origin https://github.com/YOUR_USERNAME/MarketingAssistant.git
git push -u origin main
```

### 2. Deploy on Vercel

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository "MarketingAssistant"

2. **Configure Build Settings**
   - Framework Preset: `Other`
   - Build Command: `cd bonnie-marketing-assistant && npm run build`
   - Output Directory: `bonnie-marketing-assistant/build`
   - Install Command: `cd bonnie-marketing-assistant && npm install`

3. **Set Environment Variables**
   Go to Project Settings > Environment Variables and add:
   
   ```
   ANTHROPIC_API_KEY=your_claude_api_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   AUTHOR_EMAIL=your_email@example.com
   AUTHOR_NAME=Your Name
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build completion
   - Your app will be live at `https://your-project-name.vercel.app`

### 3. Post-Deployment Setup

1. **Configure API Settings**
   - Visit your deployed app
   - Go to "⚙️ API Settings" tab
   - Add your API keys and author email
   - Test all integrations

2. **Verify Agent System**
   - Check the Agent Message Banner loads
   - Test content generation
   - Verify image generation
   - Test calendar functionality

## 🔧 Local Development

```bash
# Backend (Terminal 1)
pip install -r requirements_minimal.txt
python3 main_simple.py

# Frontend (Terminal 2) 
cd bonnie-marketing-assistant
npm install
npm start
```

## 🌐 Production URLs

- **Frontend**: `https://your-project-name.vercel.app`
- **API**: `https://your-project-name.vercel.app/api`

## 📱 Mobile Responsiveness

The app is fully responsive and works on:
- ✅ Desktop browsers
- ✅ Tablets
- ✅ Mobile devices

## 🔒 Security Features

- Encrypted API key storage
- CORS protection
- Environment variable isolation
- Secure authentication handling

## 📊 Monitoring

Monitor your deployment:
- Vercel Dashboard for performance metrics
- API usage through provider dashboards
- Agent activity in the app dashboard

## 🆘 Troubleshooting

**Build Errors:**
- Check Node.js version (16+ required)
- Verify all dependencies in package.json
- Check environment variables are set

**API Errors:**
- Verify API keys are correctly set
- Check CORS settings for your domain
- Monitor API rate limits

**Agent Issues:**
- Ensure all required environment variables are set
- Check API key permissions and quotas
- Verify network connectivity to AI services

## 🔄 Updates

To deploy updates:
```bash
git add .
git commit -m "Update: description of changes"
git push origin main
```

Vercel will automatically redeploy on every push to main branch.

---

**Built for "The Dark Road" - AI-Powered Marketing Automation** 🌙📚