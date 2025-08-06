# GitHub Actions Setup for Docker Hub

This guide explains how to configure GitHub repository secrets and settings for automated Docker builds.

## Required Secrets

To enable the GitHub Actions workflow to push to Docker Hub, you need to set up these repository secrets:

### 1. Docker Hub Credentials

1. **Go to your GitHub repository**
2. **Navigate to Settings → Secrets and variables → Actions**
3. **Add the following repository secrets:**

| Secret Name | Description | Value |
|-------------|-------------|-------|
| `DOCKER_USERNAME` | Your Docker Hub username | `albal` |
| `DOCKER_PASSWORD` | Docker Hub access token | `<your_access_token>` |

### 2. Creating Docker Hub Access Token

1. **Log in to Docker Hub** (https://hub.docker.com)
2. **Go to Account Settings → Security**
3. **Click "New Access Token"**
4. **Set description**: "GitHub Actions UniSafe"
5. **Set permissions**: "Read, Write, Delete"
6. **Copy the generated token** and use it as `DOCKER_PASSWORD`

## Workflow Triggers

The GitHub Actions workflow will trigger on:

- **Push to main branch** → Builds and pushes `latest` tag
- **Push to develop branch** → Builds and pushes `develop` tag
- **Git tags** (e.g., `v1.0.0`) → Builds and pushes version tags
- **Pull requests** → Builds but doesn't push (testing only)

## Repository Structure

Ensure your repository has this structure:

```
unisafe/
├── .github/
│   └── workflows/
│       └── docker-build.yml    # GitHub Actions workflow
├── backend/
│   ├── Dockerfile              # Backend container definition
│   ├── .dockerignore          # Backend Docker ignore rules
│   └── src/                   # Backend source code
├── Dockerfile                  # Frontend container definition
├── .dockerignore              # Frontend Docker ignore rules
├── docker-compose.yml         # Development compose file
└── docker-compose.prod.yml    # Production compose file
```

## Workflow Features

### Multi-Architecture Builds
- Builds for both `linux/amd64` and `linux/arm64`
- Supports deployment on Intel and ARM servers

### Security Scanning
- Runs Trivy vulnerability scans on built images
- Uploads results to GitHub Security tab
- Fails build if critical vulnerabilities found

### Build Caching
- Uses GitHub Actions cache for faster builds
- Caches Docker layers between builds
- Significantly reduces build times

### Image Tagging Strategy

| Git Event | Docker Tags Generated |
|-----------|----------------------|
| Push to `main` | `latest`, `main` |
| Push to `develop` | `develop` |
| Tag `v1.2.3` | `v1.2.3`, `v1.2`, `v1`, `latest` |
| Pull Request #123 | `pr-123` |

## Monitoring Builds

### View Build Status
1. **Go to your repository**
2. **Click "Actions" tab**
3. **Click on a workflow run**
4. **View build logs and results**

### Build Notifications
- GitHub will email you on build failures
- Set up Slack/Discord webhooks for team notifications
- Use GitHub status checks to protect main branch

## Docker Hub Repository Setup

### 1. Create Repositories

On Docker Hub, create these repositories:
- `albal/unisafe-frontend`
- `albal/unisafe-backend`

### 2. Repository Settings

For each repository:
- **Visibility**: Public (for open source) or Private
- **Description**: "UniSafe Frontend/Backend - UniFi firmware safety scanner"
- **Auto-build**: Disabled (using GitHub Actions instead)

### 3. Webhooks (Optional)

Set up webhooks to trigger deployments when new images are pushed:
- **Webhook URL**: Your deployment server webhook endpoint
- **Triggers**: On push to repository

## Troubleshooting

### Build Failures

**Authentication Error:**
```
Error: failed to solve: failed to push: authentication required
```
- Verify `DOCKER_USERNAME` and `DOCKER_PASSWORD` secrets
- Ensure Docker Hub access token has write permissions

**Dockerfile Not Found:**
```
Error: failed to read dockerfile: open Dockerfile: no such file or directory
```
- Check Dockerfile exists in correct location
- Verify context path in workflow file

**Multi-arch Build Fails:**
```
Error: multiple platforms feature is currently not supported for docker driver
```
- This is expected if running locally without buildx
- GitHub Actions handles this automatically

### Security Scan Failures

**High/Critical Vulnerabilities:**
- Review Trivy scan results in GitHub Security tab
- Update base images in Dockerfiles
- Use specific version tags instead of `latest`

**Scan Timeout:**
```
Error: context deadline exceeded
```
- Increase timeout in workflow
- Use smaller base images

### Performance Issues

**Slow Builds:**
- Verify build cache is working
- Optimize Dockerfile layer order
- Use `.dockerignore` to exclude unnecessary files

**Large Image Size:**
- Use multi-stage builds
- Use Alpine-based images
- Remove unnecessary dependencies

## Best Practices

### Security
- Use specific version tags for base images
- Run containers as non-root users
- Regular security scanning with Trivy
- Keep access tokens secure and rotate regularly

### Performance
- Order Dockerfile instructions from least to most likely to change
- Use `.dockerignore` to exclude development files
- Leverage build cache effectively
- Use multi-stage builds to reduce final image size

### Reliability
- Pin all dependency versions
- Use health checks in containers
- Set appropriate resource limits
- Test builds in pull requests before merging

This setup provides a robust CI/CD pipeline for automatic Docker builds and deployments.
