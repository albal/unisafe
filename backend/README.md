# UniSafe Backend

A Node.js/Express API for monitoring Reddit's r/UNIFI for firmware-related issues and providing risk assessments.

## Features

- **Reddit Integration**: Automated scanning of r/UNIFI subreddit for firmware-related posts
- **Issue Analysis**: AI-powered analysis to detect firmware problems and categorize by severity
- **Risk Assessment**: Automated risk evaluation based on issue severity and equipment type
- **PostgreSQL Storage**: Persistent storage of posts, issues, and assessments
- **Scheduled Scanning**: Configurable automatic scanning with cron jobs
- **RESTful API**: Comprehensive API for accessing issues, assessments, and statistics
- **Security**: Rate limiting, CORS protection, and input validation

## Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- Reddit API credentials

## Quick Start

1. **Clone and Install**
   ```bash
   cd backend
   npm install
   ```

2. **Database Setup**
   ```bash
   # Run the automated setup script
   ./setup-database.sh
   
   # Or manually create database:
   sudo -u postgres createuser unisafe_user -P
   sudo -u postgres createdb unisafe -O unisafe_user
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `REDDIT_CLIENT_ID` | Reddit API client ID | Required |
| `REDDIT_CLIENT_SECRET` | Reddit API client secret | Required |
| `REDDIT_USER_AGENT` | Reddit API user agent | Required |
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment mode | development |
| `SCAN_INTERVAL_HOURS` | Hours between scans | 6 |
| `MAX_POSTS_PER_SCAN` | Max posts per scan | 100 |

## API Endpoints

### Scanning
- `POST /api/v1/scan/trigger` - Trigger manual scan
- `GET /api/v1/scan/status` - Get scan status
- `GET /api/v1/scan/history` - Get scan history

### Issues
- `GET /api/v1/issues` - List firmware issues
- `GET /api/v1/issues/:id` - Get specific issue
- `GET /api/v1/issues/equipment/:type` - Issues by equipment type

### Risk Assessments  
- `GET /api/v1/assessments` - List risk assessments
- `GET /api/v1/assessments/:id` - Get specific assessment
- `GET /api/v1/assessments/risk/:level` - Assessments by risk level

### Statistics
- `GET /api/v1/stats` - General statistics
- `GET /api/v1/stats/scans` - Scan performance metrics
- `GET /api/v1/stats/equipment` - Equipment-specific stats
- `GET /api/v1/stats/firmware` - Firmware version stats

## Database Schema

### Tables

**reddit_posts**: Stores raw Reddit post data
- `id`, `reddit_id`, `title`, `selftext`, `author`, `created_utc`, `score`, `num_comments`, `url`, `permalink`

**firmware_issues**: Analyzed firmware problems
- `id`, `post_id`, `equipment_type`, `firmware_version`, `severity`, `description`, `keywords`

**risk_assessments**: Risk evaluations for issues
- `id`, `issue_id`, `risk_level`, `impact_score`, `likelihood_score`, `recommendations`

**scan_results**: Scan execution history
- `id`, `started_at`, `completed_at`, `posts_processed`, `issues_found`, `status`, `error_message`

## Analysis Engine

The backend includes sophisticated analysis capabilities:

### Issue Detection
- Keyword-based filtering for firmware-related posts
- Severity classification (low, medium, high, critical)
- Equipment type identification (UDM, UAP, USW, etc.)
- Firmware version extraction

### Risk Assessment
- Impact analysis based on equipment criticality
- Likelihood scoring based on post engagement
- Automated recommendations generation
- Risk level categorization

### Equipment Types Supported
- **UDM** (UniFi Dream Machine)
- **UAP** (UniFi Access Points) 
- **USW** (UniFi Switches)
- **UCK** (UniFi Cloud Key)
- **UXG** (UniFi Express Gateway)
- **Generic** (Other UniFi equipment)

## Development

### Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run test` - Run test suite
- `npm run lint` - Run ESLint

### Project Structure
```
src/
├── database/           # Database connection and schema
├── middleware/         # Express middleware
├── routes/            # API route handlers
├── services/          # Business logic services
├── types/             # TypeScript type definitions
├── utils/             # Helper utilities
└── server.ts          # Main application entry point
```

## Security

- Rate limiting (100 requests per 15 minutes)
- CORS protection with configurable origins
- Helmet.js security headers
- Input validation and sanitization
- Environment variable validation
- SQL injection prevention with parameterized queries

## Monitoring

- Winston logging with configurable levels
- Request/response logging middleware
- Error tracking and reporting
- Performance monitoring for scan operations
- Database query performance tracking

## Production Deployment

1. **Environment Setup**
   ```bash
   NODE_ENV=production
   DATABASE_URL=postgresql://user:pass@host:5432/unisafe
   ```

2. **Build and Start**
   ```bash
   npm run build
   npm start
   ```

3. **Process Management**
   Use PM2 or similar process manager:
   ```bash
   pm2 start dist/server.js --name unisafe-backend
   ```

4. **Database Migration**
   Database tables are created automatically on first run.

## Troubleshooting

### Common Issues

**Database Connection Errors**
- Verify PostgreSQL is running
- Check DATABASE_URL format
- Ensure database and user exist

**Reddit API Errors**  
- Verify client credentials
- Check rate limits (60 requests/minute)
- Ensure user agent is unique

**Scan Failures**
- Check Reddit API connectivity
- Verify subreddit access
- Review error logs for details

### Logs
Logs are written to `logs/app.log` and console output.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
