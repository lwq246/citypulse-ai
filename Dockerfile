# 1. Base image
FROM node:20-alpine AS base

# 2. Install dependencies
FROM base AS deps
# Install libc6-compat for compatibility and build tools for native modules (like canvas)
RUN apk add --no-cache \
    libc6-compat \
    python3 \
    make \
    g++ \
    pkgconfig \
    pixman-dev \
    cairo-dev \
    pango-dev \
    libjpeg-turbo-dev \
    giflib-dev

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install with --legacy-peer-deps to ignore ESLint version conflicts
RUN npm ci --legacy-peer-deps

# 3. Build the app
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Pass API Keys into the build (required for Next.js client-side variables)
ARG NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
ARG NEXT_PUBLIC_MAP_ID
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID
ENV NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
ENV NEXT_PUBLIC_MAP_ID=$NEXT_PUBLIC_MAP_ID
ENV NEXT_PUBLIC_GA_MEASUREMENT_ID=$NEXT_PUBLIC_GA_MEASUREMENT_ID

# Build Next.js
RUN npm run build

# 4. Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Uncomment the following line if you want to disable telemetry during runtime:
# ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Leverage the standalone build feature
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"]