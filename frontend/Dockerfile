# ---- Base Stage ----
FROM node:20-alpine AS base
WORKDIR /app

# ---- Dependencies Stage ----
FROM base AS deps
# Create directory structure first
RUN mkdir -p /app
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install ALL dependencies (including dev) for building
RUN npm ci

# ---- Builder Stage ----
FROM base AS builder
WORKDIR /app

# Create app directory structure
RUN mkdir -p /app

# Copy all dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY . .

# Set build environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Disable Next.js barrel optimization to fix react-icons issue
ENV NEXT_DISABLE_BARREL_OPTIMIZATION=1

# Build the application
RUN npm run build

# Create production node_modules (remove dev dependencies)
RUN npm ci --only=production --ignore-scripts

# ---- Production Stage ----
FROM node:20-alpine AS production
WORKDIR /app

# Create directory structure
RUN mkdir -p /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Install curl for health checks
RUN apk add --no-cache curl

# Copy necessary files from builder
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/next.config.mjs ./next.config.mjs
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# Create minimal next.config.mjs if it doesn't exist
RUN if [ ! -f next.config.mjs ]; then \
    echo 'export default { output: "standalone" }' > next.config.mjs; \
    fi

# Set proper ownership
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Set runtime environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || \
        curl -f http://localhost:3000/health || \
        curl -f http://localhost:3000/ || exit 1

# Expose Next.js port
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]