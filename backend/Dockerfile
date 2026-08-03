# ─── Stage 1: Dependencies ────────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

# Install build tools for native modules
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# ─── Stage 2: Production Image ────────────────────────────────────────────────
FROM node:20-alpine AS production

# Reported by GET /health — see backend/src/controllers/health.controller.js.
ARG APP_VERSION=unknown

# Security: create non-root user
RUN addgroup -g 1001 -S appgroup && adduser -u 1001 -S appuser -G appgroup

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init curl

# Copy production dependencies
COPY --from=deps --chown=appuser:appgroup /app/node_modules ./node_modules

# Copy application source
COPY --chown=appuser:appgroup src/ ./src/
COPY --chown=appuser:appgroup package*.json ./

# Security: patch OpenSSL CVEs (libssl3/libcrypto3) and drop the npm CLI
# bundled in the base image — npm/npx/corepack aren't needed at runtime
# (we only run `node src/server.js`), and removing them clears the
# brace-expansion/cross-spawn/glob/minimatch/sigstore/tar CVEs that ship
# inside npm's own dependency tree.
RUN apk update && apk upgrade --no-cache libssl3 libcrypto3 \
 && rm -rf /usr/local/lib/node_modules/npm \
           /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack

# Set environment defaults
ENV NODE_ENV=production \
    PORT=5000 \
    HOST=0.0.0.0 \
    APP_VERSION=${APP_VERSION}

# Drop privileges
USER appuser

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Use dumb-init to handle PID 1 and signal forwarding
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "src/server.js"]
