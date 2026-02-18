# syntax=docker/dockerfile:1.4

ARG NODE_VERSION=20

#################################
# Dependencies Stage
#################################
FROM node:${NODE_VERSION}-alpine AS deps

RUN corepack enable pnpm

WORKDIR /workspace

# Copy workspace configuration from monorepo context
COPY --from=monorepo pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY --from=monorepo packages/shared/package.json ./packages/shared/

# Copy package.json from local context (apps/nextjs)
COPY package.json ./apps/nextjs/

# Install app dependencies together with workspace dependency graph
RUN pnpm install --frozen-lockfile --filter nextjs...

#################################
# Builder Stage
#################################
FROM node:${NODE_VERSION}-alpine AS builder

RUN corepack enable pnpm

WORKDIR /workspace

# Copy installed dependencies
COPY --from=deps /workspace/node_modules ./node_modules
COPY --from=deps /workspace/apps/nextjs/node_modules ./apps/nextjs/node_modules
COPY --from=deps /workspace/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=deps /workspace/pnpm-workspace.yaml /workspace/package.json /workspace/pnpm-lock.yaml ./

# Copy Next.js app from local context (apps/nextjs)
COPY . ./apps/nextjs
COPY --from=monorepo packages/shared ./packages/shared

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build the Next.js app
WORKDIR /workspace/apps/nextjs
RUN pnpm exec next build

#################################
# Runner Stage
#################################
FROM node:${NODE_VERSION}-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
  adduser --system --uid 1001 nextjs

# Copy standalone output (includes only required dependencies)
COPY --from=builder --chown=nextjs:nodejs /workspace/apps/nextjs/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /workspace/apps/nextjs/.next/static ./apps/nextjs/.next/static
COPY --from=builder --chown=nextjs:nodejs /workspace/apps/nextjs/public ./apps/nextjs/public

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/nextjs/server.js"]
