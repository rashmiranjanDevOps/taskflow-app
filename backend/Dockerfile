# ==========================================
# Stage 1: Install Production Dependencies
# ==========================================
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package files first for Docker layer caching
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev


# ==========================================
# Stage 2: Production Image
# ==========================================
FROM node:20-alpine

WORKDIR /app

# Upgrade Alpine packages to latest security-fixed versions
RUN apk update && apk upgrade

# Remove unused package managers from production runtime
RUN rm -rf /usr/local/lib/node_modules/npm \
           /usr/local/lib/node_modules/corepack \
           /opt/yarn-v1.22.22 \
    && rm -f /usr/local/bin/npm \
              /usr/local/bin/npx \
              /usr/local/bin/corepack \
              /usr/local/bin/yarn \
              /usr/local/bin/yarnpkg

# Create non-root user and group
RUN addgroup -S appgroup && \
    adduser -S appuser -G appgroup

# Install required runtime utilities
RUN apk add --no-cache dumb-init curl

# Copy production dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY src ./src

# Copy package metadata
COPY package*.json ./

# Environment variables
ENV NODE_ENV=production \
    PORT=5000 \
    HOST=0.0.0.0

# Run application as non-root user
USER appuser

# Application port
EXPOSE 5000

# Container health check
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Proper signal handling
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Start application
CMD ["node", "src/server.js"]