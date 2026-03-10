# syntax=docker/dockerfile:1.4

ARG NODE_VERSION=20
ARG PNPM_VERSION=9.15.9

FROM node:${NODE_VERSION}-alpine AS builder

ARG PNPM_VERSION

RUN corepack enable pnpm && corepack prepare pnpm@${PNPM_VERSION} --activate

WORKDIR /workspace

COPY . .

RUN pnpm install --frozen-lockfile
RUN pnpm --dir apps/sveltekit build
RUN pnpm --filter sveltekit deploy --prod /app
RUN cp -R apps/sveltekit/build /app/build

FROM node:${NODE_VERSION}-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs && \
  adduser --system --uid 1001 sveltekit

COPY --from=builder --chown=sveltekit:nodejs /app ./

USER sveltekit

EXPOSE 3000

CMD ["node", "build"]
