# Build stage for Node.js Express server
FROM node:24-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Production stage
FROM node:24-alpine

WORKDIR /app

# Copy node_modules from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy application files
COPY . .

# Create non-root user with configurable UID/GID via build args
ARG NB_USER=nodejs
ARG NB_UID=1000
ARG NB_GID=1000
RUN addgroup -g ${NB_GID} -S ${NB_USER} && adduser -S ${NB_USER} -u ${NB_UID} -G ${NB_USER} || true

# Change ownership (best-effort; host mounts may override ownership)
RUN chown -R ${NB_USER}:${NB_USER} /app || true

USER ${NB_USER}

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application
CMD ["node", "server.js"]
