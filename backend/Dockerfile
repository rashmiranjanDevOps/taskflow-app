# ==========================================
# Stage 1: Install Dependencies
# ==========================================
FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev


# ==========================================
# Stage 2: Production Image
# ==========================================
FROM node:20-alpine

WORKDIR /app

# Upgrade Alpine packages to latest security-fixed versions
RUN apk update && apk upgrade

# Create non-root user
RUN addgroup -S appgroup && \
    adduser -S appuser -G appgroup

# Install dumb-init and curl
RUN apk add --no-cache dumb-init curl

# Copy production dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY src ./src
COPY package*.json ./

# Environment variables
ENV NODE_ENV=production \
    PORT=5000 \
    HOST=0.0.0.0

# Run application as non-root user
USER appuser

# Expose application port
EXPOSE 5000

# Container health check
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Proper signal handling
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Start application
CMD ["node", "src/server.js"]