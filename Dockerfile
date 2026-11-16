# ==============================================================================
# Dockerfile: Anfitrión de Fiestas (Party Game Backend - Express + Socket.IO)
# Lightweight, multi-stage optimized container for persistent WebSocket games
# ==============================================================================

FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies with production flag to keep image compact
COPY package*.json ./
RUN npm ci --only=production

# Copy application server and public assets (used for local QR generation and healthchecks)
COPY server ./server
COPY public ./public

# Environment variables
ENV PORT=3000
ENV NODE_ENV=production

# Expose HTTP and WebSocket port
EXPOSE 3000

# Health check to ensure the container is responsive
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start backend server
CMD ["node", "server/index.js"]
