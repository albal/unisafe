# UniSafe Backend Setup Guide

This guide will help you set up the UniSafe backend API server that provides Reddit data analysis and firmware issue monitoring.

## Architecture Overview

The UniSafe application now uses a proper backend/frontend separation:

- **Backend**: Node.js/Express API server with PostgreSQL database
- **Frontend**: React/TypeScript application that consumes the backend API
- **Reddit Integration**: Server-side Reddit OAuth for secure API access
- **Automated Scanning**: Background jobs to scan r/UNIFI for firmware issues

## Quick Setup

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Verify database setup files
./verify-database-setup.sh

# Set up PostgreSQL database
./setup-database.sh

# Copy environment template
cp .env.example .env

# Edit .env with your settings
nano .env
```

### 2. Environment Configuration

Edit `backend/.env` with your credentials:

```bash
# Database (filled by setup script)
DATABASE_URL=postgresql://unisafe_user:unisafe_password@localhost:5432/unisafe

# Reddit API (you need to provide these)
REDDIT_CLIENT_ID=your_reddit_app_client_id
REDDIT_CLIENT_SECRET=your_reddit_app_client_secret
REDDIT_USER_AGENT=UniSafe:v1.0.0 (by /u/yourusername)

# Server settings
PORT=3000
NODE_ENV=development
```

### 3. Reddit API Setup

1. Go to https://www.reddit.com/prefs/apps
2. Click "Create App" or "Create Another App"
3. Fill in:
   - **Name**: UniSafe
   - **App type**: Select "script"
   - **Description**: UniFi firmware safety scanner
   - **About URL**: (leave blank)
   - **Redirect URI**: http://localhost:3000 (not used for script apps)
4. Copy the client ID and secret to your `.env` file

### 4. Start Backend Server

```bash
cd backend
npm run dev
```

The backend will:
- Connect to PostgreSQL and create tables automatically
- Start the Express API server on port 3000
- Begin scheduled Reddit scanning every 6 hours
- Provide REST API endpoints for the frontend

### 5. Frontend Setup

```bash
# From project root
npm install
npm run dev
```

The frontend will:
- Start on port 5173
- Connect to backend API on port 3000
- Display firmware issues and statistics

## Backend API Endpoints

### Scanning
- `POST /api/v1/scan/trigger` - Manually trigger a scan
- `GET /api/v1/scan/status` - Get current scan status
- `GET /api/v1/scan/history` - Get scan history

### Issues
- `GET /api/v1/issues` - List all firmware issues
- `GET /api/v1/issues/:id` - Get specific issue
- `GET /api/v1/issues/equipment/:type` - Issues by equipment type

### Risk Assessments
- `GET /api/v1/assessments` - List risk assessments
- `GET /api/v1/assessments/risk/:level` - Assessments by risk level

### Statistics
- `GET /api/v1/stats` - General statistics
- `GET /api/v1/stats/equipment` - Equipment-specific stats

## Database Schema

The backend creates these tables automatically:

- **reddit_posts**: Raw Reddit post data
- **firmware_issues**: Analyzed firmware problems
- **risk_assessments**: Risk evaluations for issues
- **scan_results**: Scan execution history

## Troubleshooting

### Backend Won't Start

1. **PostgreSQL not running**:
   ```bash
   sudo systemctl start postgresql
   sudo systemctl status postgresql
   ```

2. **Database connection errors**:
   ```bash
   # Re-run database setup
   cd backend
   ./setup-database.sh
   ```

3. **Reddit API errors**:
   - Verify client ID and secret in `.env`
   - Check Reddit app configuration
   - Ensure user agent is unique

### Frontend Can't Connect to Backend

1. **Check backend is running**:
   ```bash
   curl http://localhost:3000/health
   ```

2. **Check CORS configuration**:
   Backend allows `http://localhost:5173` by default

3. **Environment variables**:
   Ensure `.env.local` has correct `VITE_API_BASE_URL`

### No Issues Found

The backend will only find issues if:
1. Reddit API is properly configured
2. r/UNIFI has recent firmware-related posts
3. The analysis engine detects relevant keywords

You can trigger a manual scan via the frontend or API:
```bash
curl -X POST http://localhost:3000/api/v1/scan/trigger
```

## Development

### Backend Development
```bash
cd backend
npm run dev  # Auto-restart on changes
```

### Frontend Development  
```bash
npm run dev  # Auto-refresh on changes
```

### Database Management
```bash
cd backend

# View logs
tail -f logs/app.log

# Check database
psql postgresql://unisafe_user:unisafe_password@localhost:5432/unisafe
```

## Production Deployment

For production deployment, see the main README.md file for Docker and deployment instructions.
