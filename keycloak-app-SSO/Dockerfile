# --- Build stage: install deps and build the static frontend ---
FROM node:22-alpine AS build
WORKDIR /app

# Enable pnpm (matches the pnpm-lock.yaml / pnpm-workspace.yaml in this repo)
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# --- Runtime stage: just node + the built dist/ + server.js ---
FROM node:22-alpine
WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/server.js ./server.js
COPY --from=build /app/package.json ./package.json

ENV PORT=3000
EXPOSE 3000

CMD ["node", "server.js"]
