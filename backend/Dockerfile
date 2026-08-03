# Stage 1: Install Dependencies
FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

# Stage 2: Production Image
FROM node:20-alpine

WORKDIR /app

# Create non-root user
RUN addgroup -S appgroup && \
    adduser -S appuser -G appgroup

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init curl

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY src ./src
COPY package*.json ./

# Environment variables
ENV NODE_ENV=production \
    PORT=5000 \
    HOST=0.0.0.0

# Switch to non-root user
USER appuser

# Expose application port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Start application
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "src/server.js"]