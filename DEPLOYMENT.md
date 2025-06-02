# 🚀 Simplified Coolify Deployment Guide

## Insurance MCP Client - Simple Production Deployment

This guide walks you through deploying the Insurance MCP Client to Coolify with a simplified setup.

## 📋 Prerequisites

- Coolify instance running
- Git repository (GitHub/GitLab/etc.)
- Docker support enabled on Coolify

## 🗂️ Deployment Files (Simplified)

- ✅ `Dockerfile` - Simple single-stage build with static server
- ✅ `docker-compose.yml` - Simple local testing
- ✅ `coolify.env` - Environment variables template
- ✅ `.dockerignore` - Essential exclusions only

## 🔧 Step 1: Prepare Repository

```bash
git add .
git commit -m "Add simplified Coolify deployment"
git push origin main
```

## 🌐 Step 2: Create Coolify Project

1. **Login to Coolify** dashboard
2. **Create New Project**
3. **Choose "Git Repository"**
4. **Connect your repository**
5. **Select branch**: `main`

## ⚙️ Step 3: Configure Environment Variables

Copy from `coolify.env`:

```bash
VITE_MCP_SERVER_URL=http://gc00ok8w8owcg0ocs44woskk.207.180.196.252.sslip.io
VITE_APP_ENVIRONMENT=production
# ... (see coolify.env for complete list)
```

## 🐳 Step 4: Coolify Configuration

**Important Settings:**
- **Build Method**: `Dockerfile` (auto-detected)
- **Port**: `3000` ⭐
- **Build Context**: `.`
- **Dockerfile Path**: `./Dockerfile`

## 🚀 Step 5: Deploy

1. **Click Deploy** in Coolify
2. **Monitor build logs**
3. **Test deployment** once complete

## 🔍 Step 6: Verify Deployment

1. **Visit your domain**
2. **Check connection status**
3. **Test MCP server connection**
4. **Try "Get back office data"**

## 🛠️ Troubleshooting

### Build Issues
- Check build logs in Coolify
- Ensure all files are committed to Git
- Test locally: `docker-compose up`

### CORS Issues  
- Update your MCP server to allow the new domain
- Check browser console for CORS errors

## 🔄 Local Testing

```bash
# Test with Docker
docker-compose up

# Or test build directly
npm run build
npx serve dist
```

## 📊 What This Setup Does

1. **Builds** React app with Vite
2. **Serves** static files with `serve` package
3. **Runs** on port 3000
4. **No nginx complexity**
5. **Simple and reliable**

---

**Much simpler and should work reliably!** 🎉 