# Unifi Firmware Safety Scanner

A full-stack web application that scans Reddit's r/UNIFI community for firmware update information and provides real-time safety assessments to help network administrators make informed update decisions.

## Architecture

- **Backend**: Node.js/Express API with PostgreSQL database for data persistence
- **Frontend**: React/TypeScript SPA that consumes the backend API
- **Reddit Integration**: Server-side OAuth for secure Reddit API access
- **Automated Scanning**: Background jobs to continuously monitor r/UNIFI
- **Docker Support**: Containerized deployment with automated builds
- **Security**: Network-isolated backend with frontend proxy architecture

## Security Features

- **Network Isolation**: Backend services run on internal-only Docker networks
- **Zero-Trust Architecture**: Backend API not directly accessible from internet
- **Frontend Proxy**: All external traffic routed through secure frontend
- **Container Security**: Non-root execution and minimal attack surface
- **Environment Isolation**: Secure credential management via environment variables

## Features

- **Real-time Reddit Scanning**: Fetches recent posts from r/UNIFI subreddit
- **AI-Powered Issue Analysis**: Automatically identifies and categorizes firmware problems
- **Risk Assessment Calculation**: Provides quantified risk levels for decision making
- **Equipment & Version Filtering**: Filter results by equipment type and firmware versions
- **Detailed Issue Tracking**: Drill-down view with links to original Reddit posts

## Quick Start

### Docker Deployment (Recommended)

The fastest way to get UniSafe running is using Docker:

```bash
# Clone the repository
git clone <repository-url>
cd unisafe

# Set up environment
cp .env.docker .env
# Edit .env with your Reddit API credentials

# Start all services
docker-compose up -d

# Access the application
open http://localhost
```

For detailed Docker deployment instructions, see [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md).

### Manual Setup

For development or manual deployment:

### Prerequisites

1. **Reddit Application Setup**:
   - Go to https://www.reddit.com/prefs/apps
   - Click "Create App" or "Create Another App"
   - Choose "web app"
   - Set name: "Unifi Firmware Safety Scanner"
   - Set about URI: `https://unisafe.tsew.com/about`
   - Set redirect URI: `https://unisafe.tsew.com/auth/callback`
   - Note down your Client ID and Client Secret

2. **Environment Configuration**:
   ```bash
   cp .env .env.local
   # Edit .env.local with your Reddit credentials
   ```

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at http://localhost:3000

### Production Build

```bash
npm run build
npm run preview
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_REDDIT_CLIENT_ID` | Reddit application client ID | Yes |
| `VITE_REDDIT_CLIENT_SECRET` | Reddit application client secret | Yes |
| `VITE_OPENAI_API_KEY` | OpenAI API key for enhanced analysis | No |

## OAuth Configuration

For deployment at https://unisafe.tsew.com, configure your Reddit application with:

- **About URI**: `https://unisafe.tsew.com/about`
- **Redirect URI**: `https://unisafe.tsew.com/auth/callback`
- **App Type**: Web Application
- **Permissions**: Read access to subreddits and user identity

## Architecture

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Build Tool**: Vite

## API Integration

The application integrates with:
- **Reddit OAuth API** for authentication
- **Reddit API** for fetching r/UNIFI posts
- **Pattern matching analysis** for issue extraction (upgradeable to LLM services)

## Deployment

### Docker Images

Pre-built Docker images are available on Docker Hub:

- **Frontend**: `albal/unisafe-frontend:latest`
- **Backend**: `albal/unisafe-backend:latest`

### Production Deployment

```bash
# Using pre-built images
docker-compose -f docker-compose.prod.yml up -d

# Or build from source
docker-compose up -d
```

### Manual Deployment

This application is designed for containerized deployment but can also be deployed manually. See [BACKEND_SETUP.md](BACKEND_SETUP.md) for manual setup instructions.

The recommended deployment process:

1. Configure environment variables for your hosting service
2. Set up PostgreSQL database
3. Deploy backend API server
4. Deploy frontend application
5. Configure reverse proxy (nginx) for SSL/TLS

## Development

### Project Structure

```text
unisafe/
├── backend/                 # Node.js/Express API server
│   ├── src/                # Source code
│   ├── Dockerfile          # Backend container
│   └── package.json        # Backend dependencies
├── src/                    # Frontend React application
├── .github/workflows/      # CI/CD automation
├── docker-compose.yml      # Development containers
├── docker-compose.prod.yml # Production containers
├── Dockerfile             # Frontend container
└── nginx.conf             # Frontend web server config
```

### Key Components

- **Dashboard**: Main interface for scanning and viewing results
- **RiskAssessmentCard**: Individual firmware risk assessment display
- **FilterPanel**: Equipment and version filtering controls
- **AuthCallback**: Reddit OAuth callback handler

### Adding New Features

1. **New Equipment Types**: Update the `EquipmentType` union in `src/types/index.ts`
2. **Enhanced Analysis**: Extend the `AnalysisService` in `src/services/analysisService.ts`
3. **Additional Filters**: Modify `FilterState` and update `FilterPanel` component

## Security Considerations

- All Reddit API calls use OAuth authentication
- Client secrets should only be used server-side (consider moving to backend)
- Environment variables are properly configured for production
- No sensitive data is stored in localStorage beyond OAuth tokens

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Disclaimer

This tool provides analysis based on community reports and should not be the sole basis for firmware update decisions. Always test firmware updates in a controlled environment before deploying to production networks.

### Security Testing

Verify the network security configuration:

```bash
# Test Docker network isolation
./test-network-security.sh

# View security documentation
cat SECURITY.md
```

### Configuration
