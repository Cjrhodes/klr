import { API_CONFIG } from './config';

export interface AIGenerationRequest {
  prompt: string;
  type: 'content' | 'image';
  platform?: string;
  maxLength?: number;
  tone?: string;
  includeHashtags?: boolean;
}

export interface AIGenerationResponse {
  success: boolean;
  data?: {
    text?: string;
    hashtags?: string[];
    imagePrompt?: string;
    imageUrl?: string;
  };
  error?: string;
}

export class AIService {
  private static instance: AIService;
  
  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async generateContent(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    try {
      // Check if Anthropic API is configured
      if (!API_CONFIG.anthropic.apiKey) {
        return this.fallbackToMockData(request);
      }

      const response = await fetch(`${API_CONFIG.anthropic.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_CONFIG.anthropic.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: this.buildPrompt(request),
          }],
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseClaudeResponse(data);
      
    } catch (error) {
      console.error('AI Service Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async generateImage(prompt: string): Promise<AIGenerationResponse> {
    try {
      // Check if image generation API is configured
      if (!API_CONFIG.stability.apiKey && !API_CONFIG.dalle.apiKey) {
        return this.fallbackToMockImage();
      }

      // Try Stability AI first
      if (API_CONFIG.stability.apiKey) {
        return await this.generateWithStabilityAI(prompt);
      }

      // Fallback to DALL-E
      if (API_CONFIG.dalle.apiKey) {
        return await this.generateWithDallE(prompt);
      }

      return this.fallbackToMockImage();
      
    } catch (error) {
      console.error('Image Generation Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Image generation failed',
      };
    }
  }

  private buildPrompt(request: AIGenerationRequest): string {
    let prompt = `Create social media content for "The Dark Road" horror novel. `;
    
    if (request.platform) {
      prompt += `Platform: ${request.platform}. `;
    }
    
    if (request.maxLength) {
      prompt += `Maximum length: ${request.maxLength} characters. `;
    }
    
    if (request.tone) {
      prompt += `Tone: ${request.tone}. `;
    }
    
    prompt += `\n\nSpecific request: ${request.prompt}\n\n`;
    
    if (request.includeHashtags) {
      prompt += `Please include relevant hashtags. `;
    }
    
    prompt += `Respond in JSON format with: {"text": "content", "hashtags": ["tag1", "tag2"], "imagePrompt": "description for image generation"}`;
    
    return prompt;
  }

  private parseClaudeResponse(data: any): AIGenerationResponse {
    try {
      const content = data.content?.[0]?.text || '';
      
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          success: true,
          data: {
            text: parsed.text || '',
            hashtags: parsed.hashtags || [],
            imagePrompt: parsed.imagePrompt || '',
          },
        };
      }
      
      // If no JSON found, return the raw content
      return {
        success: true,
        data: {
          text: content,
          hashtags: [],
          imagePrompt: '',
        },
      };
      
    } catch (error) {
      return {
        success: false,
        error: 'Failed to parse AI response',
      };
    }
  }

  private async generateWithStabilityAI(prompt: string): Promise<AIGenerationResponse> {
    const response = await fetch(`${API_CONFIG.stability.baseUrl}/generation/stable-diffusion-v1-6/text-to-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.stability.apiKey}`,
      },
      body: JSON.stringify({
        text_prompts: [{ text: prompt }],
        cfg_scale: 7,
        height: 512,
        width: 512,
        samples: 1,
        steps: 20,
      }),
    });

    if (!response.ok) {
      throw new Error(`Stability AI request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: {
        imageUrl: `data:image/png;base64,${data.artifacts[0].base64}`,
      },
    };
  }

  private async generateWithDallE(prompt: string): Promise<AIGenerationResponse> {
    const response = await fetch(`${API_CONFIG.dalle.baseUrl}/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.dalle.apiKey}`,
      },
      body: JSON.stringify({
        prompt: prompt,
        n: 1,
        size: '512x512',
      }),
    });

    if (!response.ok) {
      throw new Error(`DALL-E request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: {
        imageUrl: data.data[0].url,
      },
    };
  }

  private fallbackToMockData(request: AIGenerationRequest): AIGenerationResponse {
    // Return mock data when APIs are not configured
    const mockTemplates = {
      quote: {
        text: `"The road stretched endlessly into the darkness, each step forward feeling like a step closer to something that should never be found..." 🌙\n\nSometimes the most terrifying journeys are the ones we choose to take. What's the scariest path you've ever walked down?\n\n#TheDarkRoad #HorrorFiction #BookQuote`,
        hashtags: ['#TheDarkRoad', '#HorrorFiction', '#BookQuote', '#ScaryReads', '#HorrorAuthor', '#DarkFiction'],
        imagePrompt: 'A dark, winding road disappearing into misty darkness, atmospheric horror book cover style, moody lighting, cinematic',
      },
      behind_scenes: {
        text: `Writing horror at 2 AM hits different 🕐✍️\n\nMe: *types terrifying scene*\nAlso me: *checks every shadow in my room*\n\nThe irony of scaring yourself with your own writing never gets old! Currently working on a particularly spine-chilling chapter of The Dark Road and I might need to sleep with the lights on tonight 😅\n\nFellow writers, do you ever creep yourself out with your own stories?`,
        hashtags: ['#WriterLife', '#HorrorWriter', '#WritingProcess', '#AuthorProblems', '#TheDarkRoad', '#WritingCommunity'],
        imagePrompt: 'Cozy writing setup at night, laptop glowing in dark room, coffee cup, atmospheric lighting, writer at work',
      },
      book_promo: {
        text: `🖤 Ready for a journey into darkness? 🖤\n\nThe Dark Road is calling... and it's not for the faint of heart. This psychological horror will have you questioning every shadow, every whisper in the night.\n\n✨ What readers are saying:\n"Couldn't put it down!"\n"Brilliantly terrifying"\n"Perfect blend of horror and suspense"\n\nDare to walk The Dark Road? Link in bio 📖\n\n#TheDarkRoad #NewRelease #HorrorLovers`,
        hashtags: ['#TheDarkRoad', '#HorrorBooks', '#NewRelease', '#MustRead', '#PsychologicalHorror', '#BookLovers'],
        imagePrompt: 'Professional book cover mockup for horror novel, dark atmospheric design, The Dark Road title, mysterious and intriguing',
      },
    };

    // Simple matching based on prompt keywords
    let selectedTemplate = mockTemplates.quote;
    const prompt = request.prompt.toLowerCase();
    
    if (prompt.includes('behind') || prompt.includes('writing') || prompt.includes('process')) {
      selectedTemplate = mockTemplates.behind_scenes;
    } else if (prompt.includes('promote') || prompt.includes('book') || prompt.includes('sale')) {
      selectedTemplate = mockTemplates.book_promo;
    }

    return {
      success: true,
      data: selectedTemplate,
    };
  }

  private fallbackToMockImage(): AIGenerationResponse {
    return {
      success: true,
      data: {
        imageUrl: 'https://via.placeholder.com/500x500/1a1a2e/8b5cf6?text=Generated+Image',
      },
    };
  }
}