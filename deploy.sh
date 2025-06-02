#!/bin/bash

# Insurance MCP Client - Deployment Script
echo "🚀 Preparing Insurance MCP Client for deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Error handling
set -e

echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm ci

echo -e "${BLUE}🔧 Running build...${NC}"
npm run build

echo -e "${BLUE}🧪 Testing build...${NC}"
if [ -d "dist" ]; then
    echo -e "${GREEN}✅ Build successful! dist/ directory created${NC}"
    echo -e "${BLUE}📊 Build size:${NC}"
    du -sh dist/
else
    echo -e "${RED}❌ Build failed! dist/ directory not found${NC}"
    exit 1
fi

echo -e "${BLUE}🐳 Building Docker image...${NC}"
docker build -t insurance-mcp-client .

echo -e "${BLUE}🧪 Testing Docker image...${NC}"
docker run --rm -d -p 8080:80 --name insurance-test insurance-mcp-client

# Wait for container to start
sleep 5

# Test health endpoint
if curl -f http://localhost:8080/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Docker image working correctly!${NC}"
else
    echo -e "${RED}❌ Docker health check failed${NC}"
    exit 1
fi

# Cleanup
docker stop insurance-test

echo -e "${GREEN}🎉 Deployment preparation complete!${NC}"
echo -e "${YELLOW}📋 Next steps for Coolify:${NC}"
echo "1. Push this repository to Git"
echo "2. Create new project in Coolify"
echo "3. Connect your Git repository"
echo "4. Set environment variables from coolify.env"
echo "5. Deploy!"

echo -e "${BLUE}📝 Files ready for Coolify:${NC}"
echo "✅ Dockerfile"
echo "✅ nginx.conf"
echo "✅ docker-compose.yml"
echo "✅ coolify.env"
echo "✅ .dockerignore" 