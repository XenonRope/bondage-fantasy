FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable
COPY . /app/
RUN corepack prepare --activate
RUN pnpm deploy --filter=bondage-fantasy-server --prod /app/deploy/

FROM node:22-alpine
LABEL org.opencontainers.image.source=https://github.com/XenonRope/bondage-fantasy
WORKDIR /app
COPY --from=builder /app/deploy/node_modules /app/
COPY --from=builder /app/deploy/package.json /app/
COPY --from=builder /app/deploy/build /app/
CMD ["node", "./build/bin/server.js"]
