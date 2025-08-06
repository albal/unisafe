// Environment variables for Reddit OAuth and API configuration
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // In browser, use current location
    const { protocol, hostname, port } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `${protocol}//${hostname}${port ? `:${port}` : ''}`;
    }
    return `${protocol}//${hostname}`;
  }
  // Fallback for SSR or server-side
  return 'https://unisafe.tsew.com';
};

const BASE_URL = getBaseUrl();

export const REDDIT_CONFIG = {
  CLIENT_ID: import.meta.env.VITE_REDDIT_CLIENT_ID || '',
  REDIRECT_URI: `${BASE_URL}/auth/callback`,
  ABOUT_URI: `${BASE_URL}/about`,
  USER_AGENT: 'UnifiSafetyScanner/1.0.0 (by /u/unisafe)',
  OAUTH_URL: 'https://www.reddit.com/api/v1/authorize',
  TOKEN_URL: 'https://www.reddit.com/api/v1/access_token',
  API_BASE: 'https://oauth.reddit.com',
  SUBREDDIT: 'UNIFI'
};

export const APP_CONFIG = {
  NAME: 'Unifi Firmware Safety Scanner',
  VERSION: '1.0.0',
  DESCRIPTION: 'Real-time safety assessment of Unifi firmware updates by analyzing Reddit community reports',
  HOST_URL: BASE_URL
};
