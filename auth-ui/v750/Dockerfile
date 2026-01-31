# NetworkBuster Auth UI v750 - Multi-stage Docker build
FROM node:24-alpine AS builder

WORKDIR /app

# Copy server files
COPY auth-ui/v750/server.js .
COPY auth-ui/v750/index.html .
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --only=production

# Production stage
FROM node:24-alpine

WORKDIR /app

# Install dumb-init to handle signals properly
RUN apk add --no-cache dumb-init

# Copy from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server.js .
COPY --from=builder /app/index.html .
COPY --from=builder /app/package.json .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3003/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Expose port
EXPOSE 3003

# Use dumb-init to handle signals
ENTRYPOINT ["/sbin/dumb-init", "--"]

# Start application
CMD ["node", "server.js"]
