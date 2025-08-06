# Docker Deployment Guide

This guide covers deploying UniSafe using Docker containers with automated builds from GitHub Actions.

## Quick Start with Docker Compose

### 1. Development Environment

```bash
# Clone the repository
git clone <repository-url>
cd unisafe

# Set up environment
cp .env.docker .env
# Edit .env with your Reddit API credentials

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Access the application
open http://localhost
```

### 2. Production Environment

```bash
# Use production compose file
cp .env.docker .env
# Edit .env with production values

# Pull latest images and start
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d

# Monitor services
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f
```

## Docker Images

The GitHub Actions workflow automatically builds and pushes images to Docker Hub:

- **Frontend**: `albal/unisafe-frontend:latest`
- **Backend**: `albal/unisafe-backend:latest`

### Available Tags

- `latest` - Latest stable build from main branch
- `develop` - Latest development build
- `v1.0.0` - Specific version releases
- `main`, `develop` - Branch-specific builds

## Manual Docker Build

### Build Frontend

```bash
# Build locally
docker build -t unisafe-frontend .

# Build and tag for registry
docker build -t albal/unisafe-frontend:latest .
docker push albal/unisafe-frontend:latest
```

### Build Backend

```bash
# Build locally
docker build -t unisafe-backend ./backend

# Build and tag for registry
docker build -t albal/unisafe-backend:latest ./backend
docker push albal/unisafe-backend:latest
```

## Environment Configuration

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `REDDIT_CLIENT_ID` | Reddit API client ID | `your_client_id` |
| `REDDIT_CLIENT_SECRET` | Reddit API client secret | `your_client_secret` |
| `REDDIT_USER_AGENT` | Reddit API user agent | `UniSafe:v1.0.0 (by /u/username)` |
| `POSTGRES_PASSWORD` | PostgreSQL password | `secure_password_123` |

### Optional Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `POSTGRES_DB` | `unisafe` | Database name |
| `POSTGRES_USER` | `unisafe_user` | Database user |
| `SCAN_INTERVAL_HOURS` | `6` | Hours between scans |
| `MAX_POSTS_PER_SCAN` | `100` | Max posts per scan |
| `FRONTEND_PORT` | `80` | Frontend port mapping |
| `LOG_LEVEL` | `info` | Backend log level |

## Production Deployment

### 1. Server Setup

```bash
# Install Docker and Docker Compose
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Reboot to apply group changes
sudo reboot
```

### 2. Application Deployment

```bash
# Create application directory
sudo mkdir -p /opt/unisafe
cd /opt/unisafe

# Download compose files
wget https://raw.githubusercontent.com/your-repo/unisafe/main/docker-compose.prod.yml
wget https://raw.githubusercontent.com/your-repo/unisafe/main/.env.docker

# Configure environment
cp .env.docker .env
sudo nano .env  # Edit with your values

# Start services
docker-compose -f docker-compose.prod.yml up -d
```

### 3. SSL/TLS Setup (Optional)

```bash
# Install Certbot
sudo apt update
sudo apt install certbot

# Generate SSL certificate
sudo certbot certonly --standalone -d your-domain.com

# Update nginx configuration with SSL
# See nginx/nginx.conf for SSL configuration example
```

## Service Management

### Start Services

```bash
docker-compose up -d                          # Development
docker-compose -f docker-compose.prod.yml up -d  # Production
```

### Stop Services

```bash
docker-compose down                           # Development
docker-compose -f docker-compose.prod.yml down   # Production
```

### Update Services

```bash
# Pull latest images
docker-compose pull
docker-compose up -d

# Or for production
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Database Management

```bash
# Access PostgreSQL
docker-compose exec postgres psql -U unisafe_user -d unisafe

# Backup database
docker-compose exec postgres pg_dump -U unisafe_user unisafe > backup.sql

# Restore database
docker-compose exec -T postgres psql -U unisafe_user unisafe < backup.sql
```

## Monitoring and Health Checks

### Service Status

```bash
# Check service health
docker-compose ps

# Check container health
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

### Health Check Endpoints

- Frontend: `http://localhost/health`
- Backend: `http://localhost:3000/health`
- Database: Built-in PostgreSQL health check
- Redis: Built-in Redis health check

### Resource Usage

```bash
# View resource usage
docker stats

# View disk usage
docker system df
```

## Security Considerations

### Container Security

- All containers run as non-root users
- Multi-stage builds minimize attack surface
- Regular base image updates via Dependabot
- Vulnerability scanning with Trivy

### Network Security

- Services communicate via internal Docker network
- Only necessary ports are exposed
- Environment variables for sensitive data
- Optional SSL/TLS termination

### Data Security

- PostgreSQL data persisted in Docker volumes
- Redis data persistence with password protection
- Regular database backups recommended
- Sensitive environment variables not in images

## Troubleshooting

### Common Issues

**Services won't start:**
```bash
# Check logs for errors
docker-compose logs

# Check system resources
docker system df
df -h

# Clean up unused resources
docker system prune
```

**Database connection errors:**
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Test database connection
docker-compose exec backend npm run db:test
```

**Frontend can't reach backend:**
```bash
# Check backend is accessible
curl http://localhost:3000/health

# Check CORS configuration in backend
docker-compose logs backend | grep CORS
```

### Performance Tuning

**Database Performance:**
```yaml
# Add to postgres service in docker-compose.yml
command: postgres -c shared_preload_libraries=pg_stat_statements -c max_connections=200
```

**Backend Performance:**
```yaml
# Add to backend service environment
environment:
  - NODE_OPTIONS=--max-old-space-size=4096
```

## CI/CD Pipeline

The GitHub Actions workflow automatically:

1. **Builds** both frontend and backend images
2. **Tests** the builds on multiple architectures
3. **Scans** for security vulnerabilities
4. **Pushes** to Docker Hub registry
5. **Tags** with version and branch information

### GitHub Secrets Required

Set these secrets in your GitHub repository:

- `DOCKER_USERNAME` - Docker Hub username
- `DOCKER_PASSWORD` - Docker Hub access token

### Webhook Deployment

For automatic updates, set up a webhook to pull and restart containers when new images are pushed:

```bash
#!/bin/bash
# webhook-deploy.sh
cd /opt/unisafe
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
docker image prune -f
```

This completes the Docker deployment setup for UniSafe with automated builds and comprehensive deployment options.
