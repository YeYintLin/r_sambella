FROM node:20-alpine

WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable

# Install dependencies (cacheable layer)
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches
RUN pnpm install --frozen-lockfile

# Copy source and build
COPY . .
RUN pnpm build

ENV NODE_ENV=production
EXPOSE 3000

CMD ["pnpm", "start"]
