# Stage 1: Build React Static Assets
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package configuration and install dependencies
COPY frontend/package.json ./frontend/
RUN cd frontend && npm install

# Copy source and build static files
COPY frontend/ ./frontend/
RUN cd frontend && npm run build

# Stage 2: Serve Assets using Nginx
FROM nginx:alpine
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
