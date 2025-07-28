# FUSAF Production Dockerfile
# Multi-stage build for optimal production image

# Stage 1: Dependencies and Build
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install pnpm for better performance
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Stage 2: Production Runtime
FROM node:18-alpine AS runner

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 fusaf && \
    adduser --system --uid 1001 fusaf

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile && pnpm store prune

# Copy built application from builder stage
COPY --from=builder --chown=fusaf:fusaf /app/.next ./.next
COPY --from=builder /app/public ./public

# Copy other necessary files
COPY --chown=fusaf:fusaf next.config.js ./
COPY --chown=fusaf:fusaf tailwind.config.js ./
COPY --chown=fusaf:fusaf postcss.config.js ./

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Switch to non-root user
USER fusaf

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start the application
CMD ["pnpm", "start"]
