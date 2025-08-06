import { API_CONFIG } from './config';

export interface SocialMediaPost {
  platform: string;
  content: string;
  imageUrl?: string;
  hashtags?: string[];
  scheduledTime?: Date;
}

export interface PostResponse {
  success: boolean;
  postId?: string;
  error?: string;
  platform: string;
}

export class SocialMediaService {
  private static instance: SocialMediaService;
  
  public static getInstance(): SocialMediaService {
    if (!SocialMediaService.instance) {
      SocialMediaService.instance = new SocialMediaService();
    }
    return SocialMediaService.instance;
  }

  async postToMultiplePlatforms(post: SocialMediaPost): Promise<PostResponse[]> {
    const results: PostResponse[] = [];
    
    // Always use Ayrshare as the primary service if available
    if (API_CONFIG.ayrshare.apiKey) {
      return await this.postViaAyrshare(post);
    }
    
    // Fallback to individual platform APIs if Ayrshare is not available
    const platforms = Array.isArray(post.platform) ? post.platform : [post.platform];
    
    for (const platform of platforms) {
      const result = await this.postToSinglePlatform({
        ...post,
        platform,
      });
      results.push(result);
    }
    
    return results;
  }

  async postToSinglePlatform(post: SocialMediaPost): Promise<PostResponse> {
    try {
      switch (post.platform.toLowerCase()) {
        case 'instagram':
          return await this.postToInstagram(post);
        case 'facebook':
          return await this.postToFacebook(post);
        case 'twitter':
        case 'x':
          return await this.postToTwitter(post);
        case 'threads':
          return await this.postToThreads(post);
        case 'tiktok':
          return await this.postToTikTok(post);
        case 'bluesky':
          return await this.postToBluesky(post);
        default:
          return {
            success: false,
            error: `Unsupported platform: ${post.platform}`,
            platform: post.platform,
          };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        platform: post.platform,
      };
    }
  }

  private async postViaAyrshare(post: SocialMediaPost): Promise<PostResponse[]> {
    if (!API_CONFIG.ayrshare.apiKey) {
      return [{
        success: false,
        error: 'Ayrshare API key not configured',
        platform: post.platform,
      }];
    }

    const response = await fetch(`${API_CONFIG.ayrshare.baseUrl}/post`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.ayrshare.apiKey}`,
      },
      body: JSON.stringify({
        post: post.content,
        platforms: Array.isArray(post.platform) ? post.platform : [post.platform],
        mediaUrls: post.imageUrl ? [post.imageUrl] : undefined,
        scheduleDate: post.scheduledTime?.toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Ayrshare request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.platforms.map((platform: any) => ({
      success: platform.status === 'success',
      postId: platform.postId,
      error: platform.error,
      platform: platform.platform,
    }));
  }

  private async postToInstagram(post: SocialMediaPost): Promise<PostResponse> {
    if (!API_CONFIG.instagram.accessToken) {
      return this.mockPostResponse(post.platform, 'Instagram API not configured');
    }

    // Instagram requires media for posts
    if (!post.imageUrl) {
      return {
        success: false,
        error: 'Instagram posts require an image',
        platform: post.platform,
      };
    }

    // Create media container
    const mediaResponse = await fetch(`${API_CONFIG.instagram.baseUrl}/me/media`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_url: post.imageUrl,
        caption: post.content,
        access_token: API_CONFIG.instagram.accessToken,
      }),
    });

    if (!mediaResponse.ok) {
      throw new Error(`Instagram media creation failed: ${mediaResponse.statusText}`);
    }

    const mediaData = await mediaResponse.json();

    // Publish the media
    const publishResponse = await fetch(`${API_CONFIG.instagram.baseUrl}/me/media_publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        creation_id: mediaData.id,
        access_token: API_CONFIG.instagram.accessToken,
      }),
    });

    if (!publishResponse.ok) {
      throw new Error(`Instagram publish failed: ${publishResponse.statusText}`);
    }

    const publishData = await publishResponse.json();
    
    return {
      success: true,
      postId: publishData.id,
      platform: post.platform,
    };
  }

  private async postToFacebook(post: SocialMediaPost): Promise<PostResponse> {
    if (!API_CONFIG.facebook.accessToken) {
      return this.mockPostResponse(post.platform, 'Facebook API not configured');
    }

    const response = await fetch(`${API_CONFIG.facebook.baseUrl}/me/feed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: post.content,
        link: post.imageUrl,
        access_token: API_CONFIG.facebook.accessToken,
      }),
    });

    if (!response.ok) {
      throw new Error(`Facebook request failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      success: true,
      postId: data.id,
      platform: post.platform,
    };
  }

  private async postToTwitter(post: SocialMediaPost): Promise<PostResponse> {
    if (!API_CONFIG.twitter.accessToken) {
      return this.mockPostResponse(post.platform, 'Twitter API not configured');
    }

    const response = await fetch(`${API_CONFIG.twitter.baseUrl}/tweets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.twitter.accessToken}`,
      },
      body: JSON.stringify({
        text: post.content,
      }),
    });

    if (!response.ok) {
      throw new Error(`Twitter request failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      success: true,
      postId: data.data.id,
      platform: post.platform,
    };
  }

  private async postToThreads(post: SocialMediaPost): Promise<PostResponse> {
    if (!API_CONFIG.threads.accessToken) {
      return this.mockPostResponse(post.platform, 'Threads API not configured');
    }

    const response = await fetch(`${API_CONFIG.threads.baseUrl}/me/threads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        media_type: 'TEXT',
        text: post.content,
        access_token: API_CONFIG.threads.accessToken,
      }),
    });

    if (!response.ok) {
      throw new Error(`Threads request failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      success: true,
      postId: data.id,
      platform: post.platform,
    };
  }

  private async postToTikTok(post: SocialMediaPost): Promise<PostResponse> {
    // TikTok API is more complex and requires video content
    return {
      success: false,
      error: 'TikTok posting requires video content and is not yet implemented',
      platform: post.platform,
    };
  }

  private async postToBluesky(post: SocialMediaPost): Promise<PostResponse> {
    if (!API_CONFIG.bluesky.identifier || !API_CONFIG.bluesky.password) {
      return this.mockPostResponse(post.platform, 'Bluesky credentials not configured');
    }

    // First, create a session
    const authResponse = await fetch(`${API_CONFIG.bluesky.baseUrl}/com.atproto.server.createSession`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: API_CONFIG.bluesky.identifier,
        password: API_CONFIG.bluesky.password,
      }),
    });

    if (!authResponse.ok) {
      throw new Error(`Bluesky auth failed: ${authResponse.statusText}`);
    }

    const authData = await authResponse.json();

    // Create the post
    const response = await fetch(`${API_CONFIG.bluesky.baseUrl}/com.atproto.repo.createRecord`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authData.accessJwt}`,
      },
      body: JSON.stringify({
        repo: authData.did,
        collection: 'app.bsky.feed.post',
        record: {
          text: post.content,
          createdAt: new Date().toISOString(),
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Bluesky post failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      success: true,
      postId: data.uri,
      platform: post.platform,
    };
  }

  private mockPostResponse(platform: string, error?: string): PostResponse {
    if (error) {
      return {
        success: false,
        error,
        platform,
      };
    }

    return {
      success: true,
      postId: `mock_${platform}_${Date.now()}`,
      platform,
    };
  }

  async schedulePost(post: SocialMediaPost): Promise<PostResponse[]> {
    // This would integrate with scheduling services like Buffer or Hootsuite
    if (API_CONFIG.buffer.accessToken) {
      return await this.scheduleWithBuffer(post);
    }

    return [{
      success: false,
      error: 'No scheduling service configured',
      platform: post.platform,
    }];
  }

  private async scheduleWithBuffer(post: SocialMediaPost): Promise<PostResponse[]> {
    const response = await fetch(`${API_CONFIG.buffer.baseUrl}/updates/create.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.buffer.accessToken}`,
      },
      body: JSON.stringify({
        text: post.content,
        scheduled_at: post.scheduledTime?.toISOString(),
        media: post.imageUrl ? { photo: post.imageUrl } : undefined,
      }),
    });

    if (!response.ok) {
      throw new Error(`Buffer request failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    return [{
      success: true,
      postId: data.id,
      platform: post.platform,
    }];
  }
}