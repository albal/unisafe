# UniSafe Network Security Architecture

## Overview

The UniSafe application implements a secure Docker network architecture that ensures only the frontend can communicate with the backend, preventing direct external access to the API and database.

## Network Architecture

### Network Segmentation

```
┌─────────────────────────────────────────────────────────────┐
│                    External Traffic                         │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                Frontend Network (Bridge)                    │
│  ┌─────────────────────────────────────────────────────────┐│
│  │               Frontend Container                        ││
│  │          (nginx + React App)                           ││
│  │               Port: 80                                  ││
│  └─────────────────────┬───────────────────────────────────┘│
└────────────────────────┼────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend Network (Internal Only)                │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│  │   PostgreSQL    │ │   Backend API   │ │     Redis       ││
│  │   Database      │ │   (Express.js)  │ │     Cache       ││
│  │   Port: 5432    │ │   Port: 3000    │ │   Port: 6379    ││
│  └─────────────────┘ └─────────────────┘ └─────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## Security Features

### 1. Network Isolation
- **Backend Network**: Internal-only network (`internal: true`)
  - No direct external access
  - Contains: PostgreSQL, Backend API, Redis
  - Services communicate using container names

- **Frontend Network**: Bridge network for external access
  - Allows incoming traffic from the internet
  - Frontend container is exposed on port 80

### 2. Frontend as Proxy
- Frontend container connects to both networks
- Acts as a secure proxy between external users and backend services
- All backend API calls go through the frontend container

### 3. Container-Level Security
- Non-root user execution in containers
- Multi-stage Docker builds to minimize attack surface
- Health checks for service monitoring
- Resource limits and security contexts

## Development vs Production

### Development Mode (docker-compose.yml)
- Backend API port (3000) exposed for development convenience
- Database port (5432) exposed for direct access tools
- Redis port (6379) exposed for debugging
- All services on isolated networks but with external port access

### Production Mode (docker-compose.prod.yml)
- **Only frontend port (80) exposed externally**
- Backend, database, and Redis ports are internal-only
- Maximum security with no direct backend access
- Environment variables for production configuration

## Configuration Files

### Network Configuration
```yaml
networks:
  frontend-network:
    driver: bridge
  backend-network:
    driver: bridge
    internal: true  # This prevents external access
```

### Service Configuration
```yaml
frontend:
  networks:
    - frontend-network    # For external access
    - backend-network     # For backend communication

backend:
  networks:
    - backend-network     # Internal only

postgres:
  networks:
    - backend-network     # Internal only
```

## Testing Security

Use the provided test script to verify network security:

```bash
./test-network-security.sh
```

This script tests:
1. External frontend accessibility
2. Backend API internal communication
3. Network isolation verification
4. Container network assignments

## API Communication

### Frontend to Backend
```javascript
// Frontend makes API calls to backend using internal network
const API_BASE_URL = 'http://backend:3000/api/v1';
```

### External to Frontend
```
http://your-domain.com:80/  → Frontend (nginx)
                           → React App
                           → API calls to backend:3000 (internal)
```

## Security Benefits

1. **Defense in Depth**: Multiple layers of network security
2. **Principle of Least Privilege**: Services only access what they need
3. **Attack Surface Reduction**: Backend not directly exposed
4. **Traffic Control**: All API access flows through frontend
5. **Monitoring**: Single point of entry for logging and monitoring

## Environment Variables

Sensitive configuration is managed through environment variables:
- `REDDIT_CLIENT_ID`: Reddit API client ID
- `REDDIT_CLIENT_SECRET`: Reddit API client secret
- `DATABASE_URL`: PostgreSQL connection string
- `VITE_API_BASE_URL`: Frontend API endpoint configuration

## Deployment Considerations

1. **HTTPS Termination**: Add TLS certificates at the frontend/load balancer
2. **Rate Limiting**: Implement rate limiting at the frontend
3. **WAF**: Consider adding a Web Application Firewall
4. **Monitoring**: Set up logging and monitoring for all services
5. **Backup**: Ensure database backups are configured
6. **Updates**: Regular security updates for base images

## Troubleshooting

### Network Connectivity Issues
```bash
# Check network configuration
docker compose config

# Inspect container networks
docker inspect <container_name> | jq '.NetworkSettings.Networks'

# Test internal connectivity
docker exec <frontend_container> ping backend
```

### Service Health
```bash
# Check service status
docker compose ps

# View service logs
docker compose logs <service_name>

# Check health status
docker inspect <container_name> | jq '.State.Health'
```

This architecture ensures that your UniSafe application follows security best practices while maintaining functionality and ease of deployment.
