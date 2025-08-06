import axios from 'axios';
import { logger } from '../utils/logger';

export interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  author: string;
  created_utc: number;
  score: number;
  num_comments: number;
  url: string;
  permalink: string;
  subreddit: string;
}

export class RedditService {
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  private readonly clientId = process.env.REDDIT_CLIENT_ID!;
  private readonly clientSecret = process.env.REDDIT_CLIENT_SECRET!;
  private readonly userAgent = process.env.REDDIT_USER_AGENT!;

  async authenticate(): Promise<void> {
    try {
      logger.info('Authenticating with Reddit API');

      const response = await axios.post(
        'https://www.reddit.com/api/v1/access_token',
        new URLSearchParams({
          grant_type: 'client_credentials'
        }),
        {
          auth: {
            username: this.clientId,
            password: this.clientSecret
          },
          headers: {
            'User-Agent': this.userAgent,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
      
      logger.info('Reddit authentication successful');
    } catch (error) {
      logger.error('Reddit authentication failed:', error);
      throw new Error('Failed to authenticate with Reddit API');
    }
  }

  private async ensureAuthenticated(): Promise<void> {
    if (!this.accessToken || Date.now() >= this.tokenExpiry - 60000) {
      await this.authenticate();
    }
  }

  async fetchRecentPosts(limit: number = 100): Promise<RedditPost[]> {
    await this.ensureAuthenticated();

    try {
      logger.info(`Fetching ${limit} recent posts from r/UNIFI`);

      const response = await axios.get(
        'https://oauth.reddit.com/r/UNIFI/new',
        {
          params: {
            limit: Math.min(limit, 100),
            sort: 'new',
            t: 'week'
          },
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'User-Agent': this.userAgent
          }
        }
      );

      const posts: RedditPost[] = response.data.data.children.map((child: any) => ({
        id: child.data.id,
        title: child.data.title,
        selftext: child.data.selftext || '',
        author: child.data.author,
        created_utc: child.data.created_utc,
        score: child.data.score,
        num_comments: child.data.num_comments,
        url: child.data.url,
        permalink: child.data.permalink,
        subreddit: child.data.subreddit
      }));

      logger.info(`Successfully fetched ${posts.length} posts`);
      return posts;

    } catch (error) {
      logger.error('Error fetching Reddit posts:', error);
      throw new Error('Failed to fetch Reddit posts');
    }
  }

  async fetchPostComments(postId: string): Promise<any[]> {
    await this.ensureAuthenticated();

    try {
      const response = await axios.get(
        `https://oauth.reddit.com/r/UNIFI/comments/${postId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'User-Agent': this.userAgent
          }
        }
      );

      // Reddit returns an array with post data and comments
      const comments = response.data[1]?.data?.children || [];
      return comments.map((comment: any) => comment.data);

    } catch (error) {
      logger.error(`Error fetching comments for post ${postId}:`, error);
      return [];
    }
  }
}
