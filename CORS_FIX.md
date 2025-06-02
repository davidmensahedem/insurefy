# 🚨 CORS FIX FOR MCP SERVER

## The Problem
Your deployed app at `http://gc00ok8w8owcg0ocs44woskk.207.180.196.252.sslip.io` is being blocked by CORS when trying to connect to your local MCP server.

## The Solution

### 1. Find your MCP server code
Look for your MCP server file (usually `server.js`, `app.js`, or `index.js`)

### 2. Update CORS configuration
Add or update the CORS middleware:

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3006', 
    'http://gc00ok8w8owcg0ocs44woskk.207.180.196.252.sslip.io',  // ADD THIS LINE
    'https://gc00ok8w8owcg0ocs44woskk.207.180.196.252.sslip.io'   // AND THIS LINE
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept']
}));
```

### 3. Restart your MCP server
After making the change:
1. Stop your MCP server (Ctrl+C)
2. Start it again: `node server.js` (or whatever your start command is)

### 4. Set environment variable in Coolify
In your Coolify dashboard:
1. Go to your insurance-mcp-client project
2. Navigate to Environment Variables
3. Add: `VITE_MCP_SERVER_URL=ws://YOUR_LOCAL_IP:8080`
4. Replace `YOUR_LOCAL_IP` with your actual local IP (not localhost)
5. Redeploy the application

## Find Your Local IP Address
Run this command to find your local IP:
```bash
# Windows
ipconfig | findstr IPv4

# Mac/Linux  
ifconfig | grep inet
```

Use that IP address instead of localhost. 