# syntax=docker/dockerfile:1.4

ARG NODE_VERSION=20

#################################
# Builder Stage
#################################
FROM node:${NODE_VERSION}-bullseye-slim AS builder

WORKDIR /app

COPY package*.json pnpm-lock.yaml ./
COPY next.config.js ./
COPY tsconfig*.json ./

RUN corepack enable pnpm && pnpm install --frozen-lockfile

COPY . .

RUN pnpm exec next build

# #################################
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
