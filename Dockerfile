# Simple single-stage Dockerfile for React app
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev deps needed for build)
RUN npm ci

# Install serve globally for static hosting
RUN npm install -g serve

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port 80
EXPOSE 80

# Serve the built app on port 80
CMD ["serve", "-s", "dist", "-l", "80"] 