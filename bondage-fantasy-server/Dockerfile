FROM node:22-alpine as builder
WORKDIR /app

COPY . /app/
RUN corepack enable

RUN pnpm deploy --filter=bondage-fantasy-server --prod /app/deploy/

FROM node:22-alpine
WORKDIR /app

COPY --from=builder /app/deploy/ /app/

CMD ["node", "./build/bin/server.js"]
