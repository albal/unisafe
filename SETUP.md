# Unifi Firmware Safety Scanner - Environment Setup Guide

## Reddit Application Setup

To use this application, you need to create a Reddit application for OAuth authentication:

### Step 1: Create Reddit Application

1. Go to [Reddit App Preferences](https://www.reddit.com/prefs/apps)
2. Click "Create App" or "Create Another App"
3. Fill in the following details:
   - **Name**: `Unifi Firmware Safety Scanner`
   - **App type**: `web app`
   - **Description**: `Scans r/UNIFI for firmware safety information`
   - **About URI**: `https://unisafe.tsew.com/about`
   - **Redirect URI**: `https://unisafe.tsew.com/auth/callback`

4. Click "Create app"
5. Note down your:
   - **Client ID** (string below the app name)
   - **Client Secret** (listed as "secret")

### Step 2: Configure Environment Variables

Create a `.env.local` file in the project root with your Reddit credentials:

```bash
# Copy the .env file to .env.local
cp .env .env.local

# Edit .env.local with your actual values:
VITE_REDDIT_CLIENT_ID=your_reddit_client_id_here
VITE_REDDIT_CLIENT_SECRET=your_reddit_client_secret_here

# Optional: For enhanced AI analysis
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

### Step 3: Development Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at http://localhost:3000

### Step 4: Production Deployment

For production deployment at https://unisafe.tsew.com:

1. **Update Reddit App Settings**:
   - About URI: `https://unisafe.tsew.com/about`
   - Redirect URI: `https://unisafe.tsew.com/auth/callback`

2. **Configure Environment Variables** in your hosting service:
   - `VITE_REDDIT_CLIENT_ID`
   - `VITE_REDDIT_CLIENT_SECRET`
   - `VITE_OPENAI_API_KEY` (optional)

3. **Build and Deploy**:
   ```bash
   npm run build
   # Deploy the 'dist' folder to your hosting service
   ```

## Azure Deployment Options

### Option 1: Azure Static Web Apps

1. Create an Azure Static Web App
2. Connect to your GitHub repository
3. Configure environment variables in the Azure portal
4. Use the provided GitHub Actions workflow

### Option 2: Azure App Service

1. Create an Azure App Service with Node.js runtime
2. Configure environment variables in the App Service settings
3. Deploy using Git or Azure DevOps
4. Serve the built files from the `dist` directory

## Security Notes

- Never commit your actual Reddit credentials to version control
- Keep your `.env.local` file in `.gitignore`
- Reddit client secrets should ideally be handled server-side in production
- The current implementation is suitable for demonstration and development

## Usage

1. **Authentication**: Click "Connect Reddit" to authenticate with Reddit
2. **Scanning**: Click "Scan Reddit" to analyze recent posts from r/UNIFI
3. **Filtering**: Use the filter panel to narrow down results by equipment type, severity, or firmware version
4. **Details**: Click "View Details" on any risk assessment to see specific issues and Reddit post links

## API Limitations

- Reddit API has rate limits (60 requests per minute for OAuth apps)
- The application scans up to 100 recent posts per scan
- Results are cached locally to reduce API calls

## Support

For issues or questions:
- Check the [README.md](./README.md) for detailed documentation
- Review Reddit API documentation at https://www.reddit.com/dev/api
- Ensure your OAuth configuration matches your deployment URL
