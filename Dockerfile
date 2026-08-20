# Stage 1: Build Frontend React App
FROM node:20-alpine AS frontend-builder
WORKDIR /app/client

COPY client/package*.json ./
RUN npm ci

COPY client/ ./
RUN npm run build

# Stage 2: Backend & Production Server
FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY server/ ./server
COPY api/ ./api
COPY --from=frontend-builder /app/client/dist ./client/dist

ENV NODE_ENV=production
ENV BACKEND_PORT=5000

EXPOSE 5000

CMD ["node", "server/index.js"]
