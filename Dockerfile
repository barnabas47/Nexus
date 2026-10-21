# Multi-stage Dockerfile for NexusAI Platform on Render
# Stage 1: Build React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY index.html tsconfig.json vite.config.ts tailwind.config.js postcss.config.js ./
COPY src/ ./src/
RUN npm run build

# Stage 2: Python Backend with built static assets
FROM python:3.12-slim
WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=10000

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY backend/ ./backend/

# Copy built frontend assets from stage 1
COPY --from=frontend-builder /app/dist ./dist

EXPOSE 10000

# Start Uvicorn ASGI server with dynamic port binding
CMD uvicorn backend.api.main:app --host 0.0.0.0 --port ${PORT}
