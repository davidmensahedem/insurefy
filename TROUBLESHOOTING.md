# 🔧 Troubleshooting Connection Issues

## Current Issue: Both Connect and Force Connect Fail

When deployed to Coolify, both regular connection and force connection fail. Here are the most likely causes and solutions:

## 1. 🌐 CORS Configuration Issue

**Problem**: Your MCP server only allows localhost origins but the deployed app is on a different domain.

**Solution**: Update your MCP server to allow the Coolify domain:

```javascript
// In your MCP server code, add the deployed domain to CORS
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3006', 
    'http://gc00ok8w8owcg0ocs44woskk.207.180.196.252.sslip.io', // Add your Coolify domain
    // Or use wildcard for testing: '*'
  ],
  credentials: true
}));
```

## 2. 🔒 Network/Firewall Issues

**Problem**: The deployed app can't reach your local MCP server.

**Solutions**:
- Ensure your MCP server is accessible from external networks
- Check if Windows Firewall is blocking the connection
- Consider using ngrok to expose your local server:
  ```bash
  ngrok http 8080
  # Then use the ngrok URL in VITE_MCP_SERVER_URL
  ```

## 3. 🏠 Environment Variables

**Problem**: Wrong MCP server URL in production.

**Solution**: Check the debug info in the deployed app sidebar to see:
- Current MCP Server URL
- Current environment

## 4. 🔧 Quick Testing Steps

1. **Check Browser Console** (F12) for CORS/network errors
2. **Verify Environment Variables** in the debug section
3. **Test MCP Server Accessibility**:
   ```bash
   # Test if your MCP server is reachable from outside
   curl -I -H "Origin: http://gc00ok8w8owcg0ocs44woskk.207.180.196.252.sslip.io" http://your-local-ip:8080/health
   ```

## 5. 🚀 Quick Fix: Use ngrok

If you need an immediate solution:

```bash
# 1. Install ngrok (if not already installed)
npm install -g ngrok

# 2. Expose your MCP server
ngrok http 8080

# 3. Copy the ngrok URL (e.g., https://abc123.ngrok.io)

# 4. Update your environment variable
# In Coolify, set: VITE_MCP_SERVER_URL=wss://abc123.ngrok.io

# 5. Redeploy
```

## 6. 🔍 Debug Information

Check the deployed app's sidebar for debug information showing:
- Environment variables
- Current domain
- MCP server URL being used

This will help identify if it's an environment variable issue vs. a connectivity issue. 