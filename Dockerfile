# Stage 1: build (with Rust for LightningCSS)
FROM node:20-slim AS builder

WORKDIR /app

# 1) Install build essentials and Rust (for compiling lightningcss)
RUN apt-get update \
 && apt-get install -y curl build-essential ca-certificates \
 && rm -rf /var/lib/apt/lists/* \
 && curl https://sh.rustup.rs -sSf | sh -s -- -y

# Add Rust to PATH
ENV PATH="/root/.cargo/bin:${PATH}"

# 2) Install JS dependencies
COPY package.json package-lock.json ./
RUN npm ci

# 3) Rebuild lightningcss native binding for this architecture
RUN npm rebuild lightningcss

# 4) Copy rest of source & build Next.js
COPY . .
RUN npm run build

# Stage 2: production image
FROM node:20-slim AS runner

WORKDIR /app
ENV NODE_ENV=production

# 5) Copy built assets and manifest files
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json

# 6) Install only production deps
RUN npm ci --omit=dev

# 7) Expose port and healthcheck
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s \
  CMD wget -qO- http://localhost:3000/_next/healthcheck || exit 1

# 8) Start the app
CMD ["npm", "run", "start"]
