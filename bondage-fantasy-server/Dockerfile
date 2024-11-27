FROM node:22-alpine
WORKDIR /app

COPY build/package.json /app/
RUN corepack enable
RUN pnpm install

COPY build/ /app/

EXPOSE 8080
CMD ["node", "./bin/server.js"]
