# Stage 1: Build React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

# Copy package.json to install dependencies
COPY frontend/package.json ./
RUN npm install

# Copy source and build static assets
COPY frontend/ ./
RUN npm run build

# Stage 2: Build FastAPI Backend
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies if any are needed (e.g. build-essential)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r ./backend/requirements.txt

# Copy backend codebase
COPY backend/ ./backend/

# Copy the built frontend static assets from Stage 1
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

EXPOSE 8000

ENV PYTHONUNBUFFERED=1

# Start the FastAPI server using python running the main script
CMD ["python", "backend/main.py"]
