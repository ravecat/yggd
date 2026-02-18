# syntax=docker/dockerfile:1.4

ARG NODE_VERSION=20

#################################
# Dependencies Stage
#################################
FROM node:${NODE_VERSION}-alpine AS deps

RUN corepack enable pnpm

WORKDIR /workspace

# Copy full monorepo (filtered by root .dockerignore)
COPY . .

RUN pnpm install --frozen-lockfile

# Create standalone deployment - resolves workspace:* to npm versions
RUN pnpm deploy --legacy --filter nextjs /app

#################################
# Builder Stage
#################################
FROM node:${NODE_VERSION}-alpine AS builder

WORKDIR /app

COPY --from=deps /app .

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN npx next build

#################################
# Runner Stage
#################################
FROM node:${NODE_VERSION}-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
  adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
