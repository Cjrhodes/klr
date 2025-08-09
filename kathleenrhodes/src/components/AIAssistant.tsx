import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  Avatar,
  Paper,
  Chip,
  Alert,
  IconButton,
  Divider,
} from '@mui/material';

import {
  Send,
  Psychology,
  Lightbulb,
  TrendingUp,
  Share,
  ContentCopy,
  Refresh,
} from '@mui/icons-material';
import { AIService, AIGenerationRequest } from '../services/aiService';
import { API_CONFIG, getMissingConfigs } from '../services/config';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface MarketingSuggestion {
  id: string;
  category: 'social' | 'sales' | 'content' | 'engagement';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
}

const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<MarketingSuggestion[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize with welcome message and daily suggestions
    const welcomeMessage: Message = {
      id: '1',
      type: 'assistant',
      content: `Hey Bonnie! 👋 Welcome to your marketing command center! I'm here to help boost "The Dark Road" to the top of the horror charts. 

I've been analyzing your recent performance and I've got some spooky-good ideas brewing! Here's what I'm seeing:

📈 **Current Highlights:**
- Your horror/comedy angle is unique in the market
- Instagram engagement is up 12.5% this week
- TikTok is your fastest-growing platform (+25.8%)

🎯 **Quick Wins for Today:**
- Share a behind-the-scenes video of your writing process
- Post a spine-chilling quote from The Dark Road
- Engage with horror book communities on Twitter/X

What would you like to work on first? I can help with content creation, social strategy, or dive into your sales analytics!`,
      timestamp: new Date(),
      suggestions: [
        'Create social media content',
        'Analyze sales performance',
        'Generate book quotes',
        'Plan marketing campaign',
        'Find horror book communities'
      ]
    };

    setMessages([welcomeMessage]);

    // Mock daily suggestions
    const dailySuggestions: MarketingSuggestion[] = [
      {
        id: '1',
        category: 'social',
        title: 'TikTok Horror Book Trend',
        description: 'Create a "POV: You\'re reading The Dark Road at 3 AM" video. Horror BookTok is trending with 2.3M views this week.',
        priority: 'high',
        actionable: true,
      },
      {
        id: '2',
        category: 'engagement',
        title: 'Instagram Story Series',
        description: 'Start a "Writing Horror vs Reality" story series showing funny moments from your writing process.',
        priority: 'high',
        actionable: true,
      },
      {
        id: '3',
        category: 'content',
        title: 'Quote Graphics',
        description: 'Your most engaging posts include book quotes. Create 5 atmospheric quote cards for the week.',
        priority: 'medium',
        actionable: true,
      },
      {
        id: '4',
        category: 'sales',
        title: 'Weekend Promotion',
        description: 'Saturday horror book sales spike by 23%. Consider a weekend flash promotion or giveaway.',
        priority: 'medium',
        actionable: true,
      },
      {
        id: '5',
        category: 'engagement',
        title: 'Horror Author Network',
        description: 'Connect with @horrorwritersguild and @darkfictionfeed - they have 50K+ engaged horror fans.',
        priority: 'low',
        actionable: true,
      },
    ];

    setSuggestions(dailySuggestions);
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const aiService = AIService.getInstance();
      
      const request: AIGenerationRequest = {
        prompt: `You are a marketing assistant helping author Bonnie promote her horror novel "The Dark Road". 
        User question: ${input}
        
        Provide helpful, actionable marketing advice. Include specific strategies, platform recommendations, and practical tips.
        Focus on horror book marketing, social media strategy, and author branding.
        
        Respond in a friendly, professional tone with specific suggestions.`,
        type: 'content',
        tone: 'professional and helpful',
      };
      
      const response = await aiService.generateContent(request);
      
      let assistantContent = '';
      let assistantSuggestions: string[] = [];
      
      if (response.success && response.data?.text) {
        assistantContent = response.data.text;
        // Extract suggestions from the response or provide defaults
        assistantSuggestions = [
          'Create social media content',
          'Analyze engagement metrics',
          'Plan marketing campaign',
          'Generate book quotes'
        ];
      } else {
        // Fallback to mock response if AI fails
        assistantContent = getFallbackResponse(input);
        assistantSuggestions = ['Try again', 'Get more help', 'View examples'];
      }
      
      const assistantMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
        suggestions: assistantSuggestions,
      };

      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error('AI Assistant error:', error);
      
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: 'I apologize, but I\'m having trouble connecting to my AI services right now. Please try again later or check your API configuration.',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const getFallbackResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('social') || input.includes('content')) {
      return `Great question! For "The Dark Road," I'd suggest focusing on the psychological horror elements. Here are some targeted strategies:

🎬 **Video Content Ideas:**
- "3 Real Places That Inspired The Dark Road's Creepiest Scenes"
- Reading dramatic excerpts with atmospheric lighting
- "Horror vs Comedy: How I Balance Both in My Writing"

📱 **Platform-Specific Approaches:**
- **TikTok**: Short, punchy horror facts or writing tips
- **Instagram**: Aesthetic mood boards of your book's atmosphere  
- **Twitter/X**: Engage in horror writing discussions and share quick insights

Would you like me to draft some specific posts for any of these platforms?`;
    }
    
    if (input.includes('marketing') || input.includes('promote')) {
      return `I love that idea! Let me analyze your horror/comedy balance for "The Dark Road":

😱➡️😂 **Your Unique Angle:**
Horror-comedy is having a moment! Shows like "What We Do in the Shadows" prove audiences crave this blend.

📊 **Content Strategy:**
- 70% horror atmosphere/suspense content
- 30% behind-the-scenes humor/writing comedy
- Use contrast to hook readers: "This scene terrified me to write... here's why it was also hilarious"

🎯 **Engagement Tactics:**
- "Rate this scene: More scary or more funny?" polls
- "Horror writing fails" comedy posts
- Mood whiplash: Follow a creepy quote with a funny writing moment

Want me to create a content calendar balancing both elements?`;
    }
    
    return `I'm here to help with your marketing strategy for "The Dark Road"! I can assist with:

• Social media content creation
• Platform-specific strategies
• Engagement tactics
• Content calendars
• Author branding
• Sales optimization

What specific area would you like to focus on today?`;
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getSuggestionIcon = (category: string) => {
    switch (category) {
      case 'social': return <Share sx={{ color: '#E1306C' }} />;
      case 'sales': return <TrendingUp sx={{ color: '#10b981' }} />;
      case 'content': return <Lightbulb sx={{ color: '#f59e0b' }} />;
      case 'engagement': return <Psychology sx={{ color: '#8b5cf6' }} />;
      default: return <Lightbulb />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
      {/* Daily Suggestions */}
      <Box sx={{ flex: 1, minWidth: "300px" }}>
        <Card sx={{ height: 'fit-content' }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <Psychology sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">
                Today's Marketing Insights
              </Typography>
            </Box>
            
            {suggestions.map((suggestion) => (
              <Paper
                key={suggestion.id}
                sx={{ p: 2, mb: 2, backgroundColor: 'background.default' }}
              >
                <Box display="flex" alignItems="center" mb={1}>
                  {getSuggestionIcon(suggestion.category)}
                  <Chip
                    label={suggestion.priority}
                    color={getPriorityColor(suggestion.priority) as any}
                    size="small"
                    sx={{ ml: 'auto' }}
                  />
                </Box>
                <Typography variant="subtitle2" gutterBottom>
                  {suggestion.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {suggestion.description}
                </Typography>
                {suggestion.actionable && (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setInput(`Help me with: ${suggestion.title}`)}
                  >
                    Get Help
                  </Button>
                )}
              </Paper>
            ))}
          </CardContent>
        </Card>
      </Box>

      {/* Chat Interface */}
      <Box sx={{ flex: 1, minWidth: "300px" }}>
        <Card sx={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
          <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <Psychology />
              </Avatar>
              <Typography variant="h6">
                Your AI Marketing Assistant
              </Typography>
              <IconButton sx={{ ml: 'auto' }}>
                <Refresh />
              </IconButton>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Messages */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2 }}>
              {messages.map((message) => (
                <Box
                  key={message.id}
                  sx={{
                    display: 'flex',
                    justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                    mb: 2,
                  }}
                >
                  <Paper
                    sx={{
                      p: 2,
                      maxWidth: '80%',
                      backgroundColor: message.type === 'user' ? 'primary.main' : 'background.default',
                      color: message.type === 'user' ? 'primary.contrastText' : 'text.primary',
                    }}
                  >
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {message.content}
                    </Typography>
                    
                    {message.suggestions && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>
                          Quick actions:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {message.suggestions.map((suggestion, index) => (
                            <Chip
                              key={index}
                              label={suggestion}
                              size="small"
                              onClick={() => handleSuggestionClick(suggestion)}
                              sx={{ cursor: 'pointer' }}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}

                    <Box display="flex" alignItems="center" justifyContent="space-between" mt={1}>
                      <Typography variant="caption" color="text.secondary">
                        {message.timestamp.toLocaleTimeString()}
                      </Typography>
                      {message.type === 'assistant' && (
                        <IconButton
                          size="small"
                          onClick={() => copyToClipboard(message.content)}
                        >
                          <ContentCopy fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </Paper>
                </Box>
              ))}
              {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                  <Paper sx={{ p: 2, backgroundColor: 'background.default' }}>
                    <Typography variant="body1">
                      Crafting some marketing magic... ✨
                    </Typography>
                  </Paper>
                </Box>
              )}
              <div ref={messagesEndRef} />
            </Box>

            {/* Input */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                multiline
                maxRows={3}
                placeholder="Ask me about marketing strategies, content ideas, or anything book-related..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button
                variant="contained"
                onClick={handleSendMessage}
                disabled={!input.trim() || loading}
                sx={{ minWidth: 'auto' }}
              >
                <Send />
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Integration Status */}
      <Box sx={{ width: "100%" }}>
        <IntegrationStatus />
      </Box>
    </Box>
  );
};

// Integration Status Component
const IntegrationStatus: React.FC = () => {
  const missingConfigs = getMissingConfigs();
  const hasApiKeys = missingConfigs.length < Object.keys(API_CONFIG).length;
  
  return (
    <Alert severity={hasApiKeys ? 'warning' : 'info'}>
      <Typography variant="body2">
        <strong>AI Integration Status:</strong> {hasApiKeys ? 'Partially configured' : 'Demo mode'}
        <br />
        {hasApiKeys ? (
          <>
            Some API integrations are active. The assistant will use real AI when available and fallback to mock responses when needed.
          </>
        ) : (
          <>
            Add your Anthropic API key to the .env file to enable real Claude AI conversations. 
            The assistant currently uses simulated responses for demonstration.
          </>
        )}
      </Typography>
    </Alert>
  );
};

export default AIAssistant;