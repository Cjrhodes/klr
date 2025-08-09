import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Paper,
  Avatar,
  IconButton,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';

import {
  Instagram,
  Facebook,
  Twitter,
  AutoAwesome,
  Image,
  Send,
  Preview,
  Schedule,
  Refresh,
  ContentCopy,
} from '@mui/icons-material';
import { AIService, AIGenerationRequest } from '../services/aiService';
import { SocialMediaService, SocialMediaPost } from '../services/socialMediaService';
import { API_CONFIG, getMissingConfigs } from '../services/config';

interface Platform {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  maxLength: number;
  features: string[];
}

interface PostTemplate {
  id: string;
  type: string;
  title: string;
  description: string;
  template: string;
}

interface GeneratedContent {
  text: string;
  hashtags: string[];
  imagePrompt: string;
}

const PostCreator: React.FC = () => {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['instagram']);
  const [postType, setPostType] = useState('quote');
  const [customPrompt, setCustomPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [generatingContent, setGeneratingContent] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [previewTab, setPreviewTab] = useState(0);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  const platforms: Platform[] = [
    {
      id: 'instagram',
      name: 'Instagram',
      icon: <Instagram />,
      color: '#E1306C',
      maxLength: 2200,
      features: ['images', 'hashtags', 'stories'],
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: <Facebook />,
      color: '#1877F2',
      maxLength: 63206,
      features: ['images', 'links', 'polls'],
    },
    {
      id: 'twitter',
      name: 'Twitter/X',
      icon: <Twitter />,
      color: '#1DA1F2',
      maxLength: 280,
      features: ['threads', 'hashtags'],
    },
    {
      id: 'threads',
      name: 'Threads',
      icon: <Box sx={{ width: 24, height: 24, backgroundColor: '#000', borderRadius: '50%' }} />,
      color: '#000000',
      maxLength: 500,
      features: ['images', 'hashtags'],
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      icon: <Box sx={{ width: 24, height: 24, backgroundColor: '#000', borderRadius: '50%' }} />,
      color: '#000000',
      maxLength: 300,
      features: ['video', 'hashtags'],
    },
    {
      id: 'bluesky',
      name: 'Bluesky',
      icon: <Box sx={{ width: 24, height: 24, backgroundColor: '#00A8E8', borderRadius: '50%' }} />,
      color: '#00A8E8',
      maxLength: 300,
      features: ['images', 'links'],
    },
  ];

  const postTemplates: PostTemplate[] = [
    {
      id: 'quote',
      type: 'Book Quote',
      title: 'Atmospheric Quote',
      description: 'Share a spine-chilling quote from The Dark Road',
      template: 'Create an atmospheric social media post featuring a haunting quote from "The Dark Road" horror novel',
    },
    {
      id: 'behind_scenes',
      type: 'Behind the Scenes',
      title: 'Writing Process',
      description: 'Show your writing journey and process',
      template: 'Create a behind-the-scenes post about writing horror fiction, focusing on the creative process',
    },
    {
      id: 'book_promo',
      type: 'Book Promotion',
      title: 'Book Spotlight',
      description: 'Promote The Dark Road with engaging copy',
      template: 'Create promotional content for "The Dark Road" horror novel that builds intrigue and encourages purchases',
    },
    {
      id: 'author_life',
      type: 'Author Life',
      title: 'Author Insights',
      description: 'Share relatable author moments',
      template: 'Create a relatable post about the life of a horror author, mixing humor with writing insights',
    },
    {
      id: 'horror_tips',
      type: 'Writing Tips',
      title: 'Horror Writing',
      description: 'Share horror writing advice and tips',
      template: 'Create educational content about writing effective horror fiction, sharing professional tips',
    },
    {
      id: 'interactive',
      type: 'Interactive',
      title: 'Engagement Post',
      description: 'Create polls, questions, or challenges',
      template: 'Create an interactive social media post that encourages audience engagement around horror themes',
    },
  ];

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const generateContent = async () => {
    setGeneratingContent(true);
    
    try {
      const aiService = AIService.getInstance();
      
      // Build the AI request
      const template = postTemplates.find(t => t.id === postType);
      const prompt = customPrompt || template?.template || 'Create engaging social media content for The Dark Road horror novel';
      
      const request: AIGenerationRequest = {
        prompt,
        type: 'content',
        platform: selectedPlatforms[0], // Use first selected platform for character limits
        maxLength: platforms.find(p => p.id === selectedPlatforms[0])?.maxLength,
        tone: 'engaging and atmospheric',
        includeHashtags: true,
      };
      
      const response = await aiService.generateContent(request);
      
      if (response.success && response.data) {
        setGeneratedContent({
          text: response.data.text || '',
          hashtags: response.data.hashtags || [],
          imagePrompt: response.data.imagePrompt || '',
        });
      } else {
        console.error('Content generation failed:', response.error);
        // Show error but don't break the UI
      }
    } catch (error) {
      console.error('Content generation error:', error);
      // Fallback to mock data if API fails
    } finally {
      setGeneratingContent(false);
    }
  };

  const generateImage = async () => {
    if (!generatedContent?.imagePrompt) return;
    
    setGeneratingImage(true);
    
    try {
      const aiService = AIService.getInstance();
      const response = await aiService.generateImage(generatedContent.imagePrompt);
      
      if (response.success && response.data?.imageUrl) {
        setGeneratedImageUrl(response.data.imageUrl);
      } else {
        console.error('Image generation failed:', response.error);
      }
    } catch (error) {
      console.error('Image generation error:', error);
    } finally {
      setGeneratingImage(false);
    }
  };

  const copyContent = () => {
    if (generatedContent) {
      navigator.clipboard.writeText(generatedContent.text);
    }
  };

  const handlePostNow = async () => {
    if (!generatedContent) return;
    
    try {
      const socialMediaService = SocialMediaService.getInstance();
      
      for (const platformId of selectedPlatforms) {
        const post: SocialMediaPost = {
          platform: platformId,
          content: generatedContent.text,
          imageUrl: generatedImageUrl || undefined,
          hashtags: generatedContent.hashtags,
        };
        
        const result = await socialMediaService.postToSinglePlatform(post);
        
        if (result.success) {
          console.log(`Posted to ${platformId}: ${result.postId}`);
        } else {
          console.error(`Failed to post to ${platformId}:`, result.error);
        }
      }
    } catch (error) {
      console.error('Posting error:', error);
    }
  };

  const handleSchedulePost = async () => {
    if (!generatedContent) return;
    
    try {
      const socialMediaService = SocialMediaService.getInstance();
      
      const post: SocialMediaPost = {
        platform: selectedPlatforms.join(','),
        content: generatedContent.text,
        imageUrl: generatedImageUrl || undefined,
        hashtags: generatedContent.hashtags,
        scheduledTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
      };
      
      const results = await socialMediaService.schedulePost(post);
      
      results.forEach(result => {
        if (result.success) {
          console.log(`Scheduled for ${result.platform}: ${result.postId}`);
        } else {
          console.error(`Failed to schedule for ${result.platform}:`, result.error);
        }
      });
    } catch (error) {
      console.error('Scheduling error:', error);
    }
  };

  const getPreviewForPlatform = (platformId: string) => {
    if (!generatedContent) return null;

    const platform = platforms.find(p => p.id === platformId);
    if (!platform) return null;

    let content = generatedContent.text;
    if (content.length > platform.maxLength) {
      content = content.substring(0, platform.maxLength - 3) + '...';
    }

    return (
      <Paper sx={{ p: 2, mb: 2, border: `2px solid ${platform.color}` }}>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar sx={{ bgcolor: platform.color, width: 32, height: 32, mr: 2 }}>
            {platform.icon}
          </Avatar>
          <Typography variant="h6">{platform.name}</Typography>
          <Chip 
            label={`${content.length}/${platform.maxLength}`} 
            size="small" 
            sx={{ ml: 'auto' }}
            color={content.length > platform.maxLength * 0.9 ? 'warning' : 'default'}
          />
        </Box>
        
        <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
          {content}
        </Typography>
        
        {generatedImageUrl && (
          <Box sx={{ mb: 2 }}>
            <img 
              src={generatedImageUrl} 
              alt="Generated content" 
              style={{ width: '100%', maxWidth: '300px', borderRadius: '8px' }}
            />
          </Box>
        )}
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {generatedContent.hashtags.map((tag, index) => (
            <Chip key={index} label={tag} size="small" variant="outlined" />
          ))}
        </Box>
      </Paper>
    );
  };

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
      {/* Content Generator */}
      <Box sx={{ flex: "1 1 60%", minWidth: "300px" }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              AI Content Generator
            </Typography>

            {/* Platform Selection */}
            <Box mb={3}>
              <Typography variant="subtitle2" gutterBottom>
                Select Platforms
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {platforms.map((platform) => (
                  <Chip
                    key={platform.id}
                    icon={platform.icon as React.ReactElement}
                    label={platform.name}
                    onClick={() => handlePlatformToggle(platform.id)}
                    color={selectedPlatforms.includes(platform.id) ? 'primary' : 'default'}
                    variant={selectedPlatforms.includes(platform.id) ? 'filled' : 'outlined'}
                  />
                ))}
              </Box>
            </Box>

            {/* Post Type Selection */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Post Type</InputLabel>
              <Select
                value={postType}
                label="Post Type"
                onChange={(e) => setPostType(e.target.value)}
              >
                {postTemplates.map((template) => (
                  <MenuItem key={template.id} value={template.id}>
                    <Box>
                      <Typography variant="body1">{template.title}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {template.description}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Custom Prompt */}
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Custom Instructions (Optional)"
              placeholder="Add specific details, tone, or requirements for your post..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              sx={{ mb: 3 }}
            />

            {/* Generate Button */}
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={generatingContent ? <CircularProgress size={20} /> : <AutoAwesome />}
              onClick={generateContent}
              disabled={generatingContent || selectedPlatforms.length === 0}
              sx={{ mb: 2 }}
            >
              {generatingContent ? 'Generating Content...' : 'Generate Content'}
            </Button>

            {/* Image Generation */}
            {generatedContent && (
              <Button
                fullWidth
                variant="outlined"
                startIcon={generatingImage ? <CircularProgress size={20} /> : <Image />}
                onClick={generateImage}
                disabled={generatingImage}
              >
                {generatingImage ? 'Generating Image...' : 'Generate Matching Image'}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Generated Content */}
        {generatedContent && (
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6">Generated Content</Typography>
                <Box>
                  <IconButton onClick={copyContent} size="small">
                    <ContentCopy />
                  </IconButton>
                  <IconButton onClick={generateContent} size="small">
                    <Refresh />
                  </IconButton>
                </Box>
              </Box>

              <TextField
                fullWidth
                multiline
                rows={6}
                value={generatedContent.text}
                onChange={(e) => setGeneratedContent(prev => prev ? {...prev, text: e.target.value} : null)}
                sx={{ mb: 2 }}
              />

              <Typography variant="subtitle2" gutterBottom>
                Suggested Hashtags
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                {generatedContent.hashtags.map((tag, index) => (
                  <Chip key={index} label={tag} size="small" variant="outlined" />
                ))}
              </Box>

              {generatedImageUrl && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Generated Image
                  </Typography>
                  <img 
                    src={generatedImageUrl} 
                    alt="Generated content" 
                    style={{ width: '100%', borderRadius: '8px' }}
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        )}
      </Box>

      {/* Preview */}
      <Box sx={{ flex: "1 1 60%", minWidth: "300px" }}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <Preview sx={{ mr: 1 }} />
              <Typography variant="h6">Platform Previews</Typography>
            </Box>

            {!generatedContent ? (
              <Alert severity="info">
                Generate content first to see platform-specific previews
              </Alert>
            ) : (
              <Box>
                <Tabs value={previewTab} onChange={(e, newValue) => setPreviewTab(newValue)}>
                  {selectedPlatforms.map((platformId, index) => {
                    const platform = platforms.find(p => p.id === platformId);
                    return (
                      <Tab
                        key={platformId}
                        icon={platform?.icon as React.ReactElement}
                        label={platform?.name}
                        {...{id: `preview-tab-${index}`, 'aria-controls': `preview-tabpanel-${index}`}}
                      />
                    );
                  })}
                </Tabs>

                <Box sx={{ mt: 2 }}>
                  {selectedPlatforms.map((platformId, index) => (
                    <Box
                      key={platformId}
                      role="tabpanel"
                      hidden={previewTab !== index}
                    >
                      {previewTab === index && getPreviewForPlatform(platformId)}
                    </Box>
                  ))}
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Action Buttons */}
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                  <Box sx={{ width: "100%" }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Schedule />}
                      onClick={handleSchedulePost}
                      disabled={!generatedContent}
                    >
                      Schedule Post
                    </Button>
                  </Box>
                  <Box sx={{ width: "100%" }}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<Send />}
                      onClick={handlePostNow}
                      disabled={!generatedContent}
                    >
                      Post Now
                    </Button>
                  </Box>
                </Box>
              </Box>
            )}
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
        <strong>Integration Status:</strong> {hasApiKeys ? 'Partially configured' : 'Demo mode'}
        <br />
        {hasApiKeys ? (
          <>
            Some API integrations are active. Missing configurations: {missingConfigs.join(', ')}
          </>
        ) : (
          <>
            Add your API keys to the .env file to enable real integrations with Claude AI, 
            social media platforms, and image generation services.
          </>
        )}
      </Typography>
    </Alert>
  );
};

export default PostCreator;