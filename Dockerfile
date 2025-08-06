# Frontend Dockerfile for UniSafe
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force

# Build the application
FROM base AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production image with nginx
FROM nginx:alpine AS runner

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Create non-root user for nginx
RUN addgroup -g 1001 -S nodejs
RUN adduser -S unisafe -u 1001

# Set proper permissions
RUN chown -R unisafe:nodejs /usr/share/nginx/html
RUN chown -R unisafe:nodejs /var/cache/nginx
RUN chown -R unisafe:nodejs /var/log/nginx
RUN chown -R unisafe:nodejs /etc/nginx/conf.d
RUN touch /var/run/nginx.pid
RUN chown -R unisafe:nodejs /var/run/nginx.pid

# Switch to non-root user
USER unisafe

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
