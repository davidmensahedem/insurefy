# 🚀 Coolify Deployment Guide

## Insurance MCP Client - Production Deployment

This guide walks you through deploying the Insurance MCP Client to Coolify.

## 📋 Prerequisites

- Coolify instance running
- Git repository (GitHub/GitLab/etc.)
- Docker support enabled on Coolify
- Your MCP server accessible from Coolify

## 🗂️ Deployment Files

The following files are prepared for Coolify deployment:

- ✅ `Dockerfile` - Multi-stage build with nginx
- ✅ `nginx.conf` - Production nginx configuration  
- ✅ `docker-compose.yml` - Local testing reference
- ✅ `coolify.env` - Environment variables template
- ✅ `.dockerignore` - Optimized build context
- ✅ `deploy.sh` - Automated deployment preparation

## 🔧 Step 1: Prepare Repository

1. **Commit all files** to your Git repository:
   ```bash
   git add .
   git commit -m "Add Coolify deployment configuration"
   git push origin main
   ```

## 🌐 Step 2: Create Coolify Project

1. **Login to Coolify** dashboard
2. **Create New Project**
3. **Choose "Git Repository"**
4. **Connect your repository** (GitHub/GitLab/etc.)
5. **Select branch**: `main`

## ⚙️ Step 3: Configure Environment Variables

In Coolify, add these environment variables:

```bash
# Copy from coolify.env and customize:
VITE_APP_TITLE=Insurance AI - MCP Client
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=production
VITE_MCP_SERVER_URL=http://gc00ok8w8owcg0ocs44woskk.207.180.196.252.sslip.io
VITE_MCP_SSE_ENDPOINT=/sse
VITE_MCP_MESSAGES_ENDPOINT=/messages
VITE_MCP_HEALTH_ENDPOINT=/health
VITE_DEFAULT_PAGE_SIZE=50
VITE_CONNECTION_TIMEOUT=10000
VITE_SSE_TIMEOUT=5000
VITE_ENABLE_DEBUG_LOGS=false
VITE_ENABLE_TEST_CONNECTION=true
VITE_ENABLE_FORCE_CONNECT=true
```

## 🐳 Step 4: Docker Configuration

Coolify will automatically detect:
- ✅ `Dockerfile` (multi-stage build)
- ✅ Port `80` (nginx serves on port 80)
- ✅ Health check at `/health`

## 🔧 Step 5: Build Settings

Configure in Coolify:
- **Build Command**: `npm run build` (handled by Dockerfile)
- **Start Command**: `nginx -g "daemon off;"` (handled by Dockerfile)
- **Port**: `80`
- **Health Check**: `/health`

## 🌍 Step 6: Domain & SSL

1. **Configure domain** in Coolify
2. **Enable SSL** (Let's Encrypt)
3. **Update MCP server CORS** to allow your new domain

## 🚀 Step 7: Deploy

1. **Click Deploy** in Coolify
2. **Monitor build logs**
3. **Test deployment** once complete

## 🔍 Step 8: Verify Deployment

After deployment, test:

1. **Visit your domain**
2. **Check connection status**
3. **Test MCP server connection**
4. **Try "Get back office data"**

## 🛠️ Troubleshooting

### Build Issues
- Check build logs in Coolify
- Verify all files are committed to Git
- Run `./deploy.sh` locally to test

### CORS Issues  
- Update your MCP server to allow the new domain
- Check browser console for CORS errors
- Verify environment variables are set

### Connection Issues
- Test MCP server accessibility from Coolify
- Check environment variables
- Verify SSE endpoint works

## 🔄 Updates

To update the deployment:
1. **Push changes** to Git
2. **Coolify auto-deploys** (if enabled)
3. **Or manually trigger** deployment

## 📊 Performance

The deployment includes:
- ✅ **Gzip compression**
- ✅ **Static asset caching**
- ✅ **Optimized nginx config**
- ✅ **Small Docker image** (~50MB)
- ✅ **Health monitoring**

## 🔒 Security

Production features:
- ✅ **Security headers**
- ✅ **HTTPS/SSL**
- ✅ **No development tools**
- ✅ **Minified assets**

## 📞 Support

If you need help:
1. Check Coolify logs
2. Review this deployment guide
3. Test locally with `docker-compose up`

---

**Ready to deploy!** 🎉

Your Insurance MCP Client is now production-ready for Coolify! 