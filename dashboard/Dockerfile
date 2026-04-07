# Stage 1 — build frontend
FROM node:22-alpine AS builder

WORKDIR /app/dashboard

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2 — production server
FROM node:22-alpine AS runner

WORKDIR /app

# Install only runtime deps for the server
COPY package*.json ./
RUN npm ci --omit=dev && npm install ws chokidar yaml

COPY --from=builder /app/dashboard/dist ./dist
COPY server.js ./

ENV PORT=4000
ENV NODE_ENV=production

HEALTHCHECK --interval=30s --timeout=5s --retries=3   CMD wget -qO- http://localhost:4000/health || exit 1

EXPOSE 4000

CMD ["node", "server.js"]
