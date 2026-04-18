# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# Stage 2: Runtime
FROM node:18-alpine

RUN npm install -g http-server

WORKDIR /app

COPY --from=builder /app/dist .

EXPOSE 8080

HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/ || exit 1

CMD ["http-server", "-p", "8080", "-c-1", "-g"]