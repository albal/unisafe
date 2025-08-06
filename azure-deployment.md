# Azure App Service deployment configuration
# To deploy this app to Azure:
# 1. Create an Azure App Service with Node.js runtime
# 2. Configure environment variables for Reddit OAuth
# 3. Set up continuous deployment from Git repository

# Build commands
npm install
npm run build

# Startup command (for Azure App Service)
# The built files will be served from the 'dist' directory

# Runtime: Node.js 18+ LTS

# Environment Variables Required:
# VITE_REDDIT_CLIENT_ID=your_reddit_client_id
# VITE_REDDIT_CLIENT_SECRET=your_reddit_client_secret
# VITE_OPENAI_API_KEY=your_openai_key (optional)

# OAuth Configuration:
# - About URI: https://unisafe.tsew.com/about
# - Redirect URI: https://unisafe.tsew.com/auth/callback
