# Simple single-stage Dockerfile for React app
FROM node:18-alpine

# Install curl and python for serving
RUN apk add --no-cache curl python3

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev deps needed for build)
RUN npm ci

# Copy source code
COPY . .

# Build arguments for Vite environment variables
ARG VITE_MCP_SERVER_URL
ARG VITE_APP_ENVIRONMENT=production
ARG VITE_ENABLE_DEBUG_LOGS=true

# Set environment variables for build
ENV VITE_MCP_SERVER_URL=$VITE_MCP_SERVER_URL
ENV VITE_APP_ENVIRONMENT=$VITE_APP_ENVIRONMENT
ENV VITE_ENABLE_DEBUG_LOGS=$VITE_ENABLE_DEBUG_LOGS

# Build the application
RUN npm run build

# Verify build output exists
RUN ls -la dist/

# Copy our custom server script
COPY server.py .

# Make server script executable
RUN chmod +x server.py

# Expose port 3000
EXPOSE 3000

# Use our custom Python server that handles React Router
CMD ["python3", "server.py"] 