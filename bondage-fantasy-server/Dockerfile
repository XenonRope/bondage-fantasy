FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable
COPY . /app/
RUN corepack prepare --activate
RUN pnpm deploy --filter=bondage-fantasy-server --prod /app/deploy/

FROM node:22-alpine
LABEL org.opencontainers.image.source=https://github.com/XenonRope/bondage-fantasy
WORKDIR /app
COPY --from=builder /app/deploy/ /app/
CMD ["node", "./build/bin/server.js"]
