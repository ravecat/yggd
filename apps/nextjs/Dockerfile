# syntax=docker/dockerfile:1.4

ARG NODE_VERSION=20

#################################
# Dependencies Stage
#################################
FROM node:${NODE_VERSION}-bullseye-slim AS deps

WORKDIR /app

# Copy workspace package files for dependency resolution
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/nextjs/package.json apps/nextjs/

# Install dependencies using npm workspaces
RUN npm ci

#################################
# Builder Stage
#################################
FROM node:${NODE_VERSION}-bullseye-slim AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json nx.json tsconfig.base.json tsconfig.json eslint.config.mjs ./
COPY packages/shared/. packages/shared/
COPY apps/nextjs apps/nextjs

# Patch nx.json: remove @nx/eslint/plugin to avoid circular ESLint config error during graph build
# ESLint is not needed for compilation, only for linting (which runs separately)
RUN node -e "const fs=require('fs'); \
  const nx=JSON.parse(fs.readFileSync('nx.json','utf8')); \
  nx.plugins = nx.plugins.filter(p => typeof p === 'string' || p.plugin !== '@nx/eslint/plugin'); \
  fs.writeFileSync('nx.json', JSON.stringify(nx, null, 2));"

ENV NEXT_TELEMETRY_DISABLED=1

RUN  npx nx build nextjs --skip-nx-cache

#################################
# Runner Stage
#################################
FROM node:${NODE_VERSION}-bullseye-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
  adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/nextjs/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/nextjs/.next/static ./apps/nextjs/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/nextjs/public ./apps/nextjs/public
COPY --from=builder --chown=nextjs:nodejs /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder --chown=nextjs:nodejs /app/packages/shared/package.json ./packages/shared/package.json

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/nextjs/server.js"]
