import axios from 'axios';
import { REDDIT_CONFIG } from '../config/constants';
import { RedditListing, RedditPost, AuthState } from '../types';

class RedditService {
  private authState: AuthState = {
    isAuthenticated: false,
    accessToken: null,
    refreshToken: null,
    expiresAt: null,
    username: null
  };

  // Generate OAuth URL for Reddit authentication
  getAuthUrl(): string {
    console.log('🔍 OAuth Debug Info:');
    console.log('- Environment:', {
      hostname: window.location.hostname,
      origin: window.location.origin,
      isLocalhost: window.location.hostname === 'localhost'
    });
    
    const state = this.generateState();
    const params = new URLSearchParams({
      client_id: REDDIT_CONFIG.CLIENT_ID,
      response_type: 'code',
      state,
      redirect_uri: REDDIT_CONFIG.REDIRECT_URI,
      duration: 'permanent',
      scope: 'read identity'
    });

    const authUrl = `${REDDIT_CONFIG.OAUTH_URL}?${params.toString()}`;
    
    console.log('📋 Reddit OAuth Configuration:');
    console.log('- Client ID:', REDDIT_CONFIG.CLIENT_ID === 'your_reddit_client_id' ? '❌ NOT SET' : '✅ Configured');
    console.log('- Client ID Value:', REDDIT_CONFIG.CLIENT_ID);
    console.log('- Redirect URI:', REDDIT_CONFIG.REDIRECT_URI);
    console.log('- About URI:', REDDIT_CONFIG.ABOUT_URI);
    console.log('- Generated State:', state);
    console.log('🚀 Auth URL:', authUrl);
    
    if (REDDIT_CONFIG.CLIENT_ID === 'your_reddit_client_id') {
      console.warn('❌ Reddit Client ID not configured! Please set up your Reddit app first.');
      return '';
    }
    
    // Store state for validation
    localStorage.setItem('reddit_oauth_state', state);
    
    return authUrl;
  }

  // Exchange authorization code for access token
  async exchangeCodeForToken(code: string, state: string): Promise<boolean> {
    try {
      // Validate state parameter
      const storedState = localStorage.getItem('reddit_oauth_state');
      if (!storedState || storedState !== state) {
        console.error('OAuth state mismatch:', { received: state, stored: storedState });
        throw new Error('Invalid OAuth state parameter');
      }
      
      // Clean up stored state
      localStorage.removeItem('reddit_oauth_state');
      
      console.log('Exchanging OAuth code for tokens...');
      
      const response = await axios.post(REDDIT_CONFIG.TOKEN_URL, 
        new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: REDDIT_CONFIG.REDIRECT_URI
        }), 
        {
          auth: {
            username: REDDIT_CONFIG.CLIENT_ID,
            password: import.meta.env.VITE_REDDIT_CLIENT_SECRET || ''
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': REDDIT_CONFIG.USER_AGENT
          }
        }
      );

      const { access_token, refresh_token, expires_in } = response.data;
      
      console.log('OAuth tokens received successfully');
      
      this.authState = {
        isAuthenticated: true,
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt: Date.now() + (expires_in * 1000),
        username: null // Will be set when we fetch user info
      };

      // Store in localStorage for persistence
      localStorage.setItem('reddit_auth', JSON.stringify(this.authState));
      
      return true;
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Response status:', error.response?.status);
      }
      return false;
    }
  }

  // Authenticate the application using client credentials
  async authenticateApp(): Promise<boolean> {
    console.log('🤖 Authenticating application...');
    try {
      const response = await axios.post(
        REDDIT_CONFIG.TOKEN_URL,
        new URLSearchParams({
          grant_type: 'client_credentials',
          duration: 'permanent'
        }),
        {
          auth: {
            username: REDDIT_CONFIG.CLIENT_ID,
            password: import.meta.env.VITE_REDDIT_CLIENT_SECRET || ''
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': REDDIT_CONFIG.USER_AGENT
          }
        }
      );

      const { access_token, expires_in } = response.data;
      
      console.log('✅ Application authenticated successfully');
      
      this.authState = {
        isAuthenticated: true,
        accessToken: access_token,
        refreshToken: null, // Not provided in this flow
        expiresAt: Date.now() + (expires_in * 1000),
        username: 'Application' // No user context in this flow
      };

      localStorage.setItem('reddit_auth', JSON.stringify(this.authState));
      
      return true;
    } catch (error) {
      console.error('❌ Error authenticating application:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Response status:', error.response?.status);
      }
      return false;
    }
  }

  // Fetch posts from r/UNIFI subreddit
  async fetchSubredditPosts(limit: number = 100, after?: string): Promise<RedditListing | null> {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated with Reddit');
    }

    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        sort: 'new',
        t: 'week' // Last week's posts
      });

      if (after) {
        params.append('after', after);
      }

      const response = await axios.get(
        `${REDDIT_CONFIG.API_BASE}/r/${REDDIT_CONFIG.SUBREDDIT}/new`,
        {
          params,
          headers: {
            'Authorization': `Bearer ${this.authState.accessToken}`,
            'User-Agent': REDDIT_CONFIG.USER_AGENT
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching subreddit posts:', error);
      return null;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    // Check localStorage for persisted auth
    const stored = localStorage.getItem('reddit_auth');
    if (stored) {
      const auth = JSON.parse(stored);
      if (auth.expiresAt && auth.expiresAt > Date.now()) {
        this.authState = auth;
        return true;
      } else {
        // Token expired, clear storage
        localStorage.removeItem('reddit_auth');
      }
    }
    
    return Boolean(this.authState.isAuthenticated && 
           this.authState.accessToken && 
           (this.authState.expiresAt ? this.authState.expiresAt > Date.now() : false));
  }

  // Get current auth state
  getAuthState(): AuthState {
    return { ...this.authState };
  }

  // Logout user
  logout(): void {
    this.authState = {
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      username: null
    };
    localStorage.removeItem('reddit_auth');
  }

  // Generate random state for OAuth security
  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  // Fetch user info
  async fetchUserInfo(): Promise<any> {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await axios.get(`${REDDIT_CONFIG.API_BASE}/api/v1/me`, {
        headers: {
          'Authorization': `Bearer ${this.authState.accessToken}`,
          'User-Agent': REDDIT_CONFIG.USER_AGENT
        }
      });

      this.authState.username = response.data.name;
      localStorage.setItem('reddit_auth', JSON.stringify(this.authState));
      
      return response.data;
    } catch (error) {
      console.error('Error fetching user info:', error);
      return null;
    }
  }
}

export const redditService = new RedditService();
