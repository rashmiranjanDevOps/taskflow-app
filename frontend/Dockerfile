# ==========================================
# Stage 1: Build React Application
# ==========================================
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Copy package files first for better Docker layer caching
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application source
COPY . .

# Frontend API URL
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Build React application
RUN npm run build


# ==========================================
# Stage 2: Serve Application with Nginx
# ==========================================
FROM nginx:stable-alpine3.24-perl

# Upgrade Alpine packages to latest security-fixed versions
RUN apk update && apk upgrade

# Remove default Nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy production React build
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx listens on port 8080
EXPOSE 8080

# Container health check
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD wget --spider -q http://127.0.0.1:8080/health || exit 1

# Run Nginx as non-root user
USER nginx

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]