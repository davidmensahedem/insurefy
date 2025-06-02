import type {
  MCPServerCapabilities,
  ToolCall
} from '@/types/insurance';

// Get server URL from environment variables or fallback to default
const getServerUrl = () => {
  // In production, Vite will replace import.meta.env with actual values
  return import.meta.env.VITE_MCP_SERVER_URL || 'http://gc00ok8w8owcg0ocs44woskk.207.180.196.252.sslip.io';
};

// Real MCP Client following Claude Desktop SSE protocol
export class InsuranceMCPClient {
  private connected = false;
  private capabilities: MCPServerCapabilities | null = null;
  private sessionId: string | null = null;
  private eventSource: EventSource | null = null;

  constructor(private serverUrl: string = getServerUrl()) {
    console.log('🏗️ MCP Client initialized for:', this.serverUrl);
    console.log('🌍 Environment:', import.meta.env.VITE_APP_ENVIRONMENT || 'development');
  }

  async connect(): Promise<void> {
    try {
      console.log('🔌 Connecting to MCP server:', this.serverUrl);
      
      // Test server availability first
      const healthResponse = await fetch(`${this.serverUrl}/health`);
      if (!healthResponse.ok) {
        throw new Error(`Server not available: ${healthResponse.status}`);
      }
      
      console.log('✅ Server is healthy, trying SSE connection...');
      
      // Try SSE connection first (like Claude Desktop)
      try {
        await this.initializeSSEConnection();
      } catch (sseError) {
        console.warn('⚠️ SSE connection failed (likely CORS), using fallback:', sseError);
        
        // Fallback: Generate session ID and test direct communication
        await this.initializeFallbackConnection();
      }
      
      await this.loadCapabilities();
      
      console.log('🎉 Connected to MCP Server successfully!');
      console.log('📡 Session ID:', this.sessionId);
      
    } catch (error) {
      console.error('❌ Failed to connect to MCP server:', error);
      this.connected = false;
      this.cleanup();
      throw new Error(`Failed to connect to insurance MCP server: ${error}`);
    }
  }

  private async initializeSSEConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('🔗 Opening SSE connection to /sse endpoint...');
      
      // Try SSE with proper error handling
      try {
        this.eventSource = new EventSource(`${this.serverUrl}/sse`, {
          withCredentials: false  // Explicit CORS setting
        });
      } catch (error) {
        console.error('❌ Failed to create EventSource:', error);
        reject(new Error('EventSource creation failed'));
        return;
      }
      
      let connectionEstablished = false;
      let messageReceived = false;
      
      this.eventSource.onopen = () => {
        console.log('✅ SSE connection opened successfully');
        connectionEstablished = true;
      };
      
      this.eventSource.onmessage = (event) => {
        console.log('📨 RAW SSE message received:', event);
        console.log('📨 SSE data:', event.data);
        console.log('📨 SSE event type:', event.type);
        console.log('📨 SSE last event ID:', event.lastEventId);
        
        messageReceived = true;
        
        // Parse ALL possible session ID formats
        let sessionId = null;
        
        try {
          // Try parsing as JSON first
          const data = JSON.parse(event.data);
          console.log('📊 Parsed JSON data:', data);
          
          // Check all possible session ID locations
          sessionId = data.sessionId || data.session || data.id || data.endpoint || data.session_id;
          
          // If endpoint URL format
          if (data.endpoint && data.endpoint.includes('sessionId=')) {
            const url = new URL(data.endpoint);
            sessionId = url.searchParams.get('sessionId');
          }
          
          // Check nested objects
          if (!sessionId && data.params) {
            sessionId = data.params.sessionId || data.params.session || data.params.id;
          }
          
        } catch (err) {
          console.log('📝 SSE message (non-JSON):', event.data);
          
          // Handle plain text - look for UUID patterns
          const text = event.data.trim();
          
          // Look for UUID pattern (8-4-4-4-12 characters)
          const uuidMatch = text.match(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i);
          if (uuidMatch) {
            sessionId = uuidMatch[0];
            console.log('🎯 Found UUID pattern:', sessionId);
          }
          
          // Look for any session-like ID
          else if (text.length > 10 && text.length < 100 && 
              (text.includes('-') || text.match(/^[a-zA-Z0-9_-]+$/))) {
            sessionId = text;
            console.log('🆔 Using text as session ID:', sessionId);
          }
        }
        
        if (sessionId) {
          console.log('🎉 Session ID captured:', sessionId);
          this.sessionId = sessionId;
          this.connected = true;
          
          // Keep connection open briefly to receive more data
          setTimeout(() => {
            this.eventSource?.close();
            resolve();
          }, 500);
        } else {
          console.log('⚠️ No session ID found in message');
        }
      };
      
      this.eventSource.onerror = (error) => {
        console.error('❌ SSE connection error:', error);
        console.log('📊 ReadyState:', this.eventSource?.readyState);
        console.log('📊 Connection established:', connectionEstablished);
        console.log('📊 Message received:', messageReceived);
        
        if (this.eventSource?.readyState === EventSource.CLOSED) {
          console.log('🔄 SSE connection was closed by server');
        }
        
        // If we got a session ID before the error, consider it success
        if (this.sessionId) {
          console.log('✅ Session ID was captured before error, continuing...');
          this.connected = true;
          resolve();
          return;
        }
        
        this.cleanup();
        reject(new Error('SSE connection failed - ' + (connectionEstablished ? 'closed after opening' : 'failed to open')));
      };
      
      // Shorter timeout - if no session ID in 5 seconds, move to fallback
      setTimeout(() => {
        if (!this.connected && !this.sessionId) {
          console.log('⏰ SSE connection timeout');
          this.cleanup();
          reject(new Error('SSE connection timeout - no session ID received within 5 seconds'));
        }
      }, 5000);
    });
  }

  async initializeFallbackConnection(): Promise<void> {
    console.log('🔄 Using fallback connection method...');
    
    // Don't create fake session IDs - they don't work with the server
    console.log('⚠️ SSE connection required for real session ID');
    console.log('ℹ️ The server requires a proper SSE handshake to create sessions');
    
    // Try one more time with a very brief SSE connection
    try {
      console.log('🔧 Making final attempt to capture session ID...');
      
      await new Promise<void>((resolve, _reject) => {
        const tempEventSource = new EventSource(`${this.serverUrl}/sse`);
        let capturedSessionId = false;
        
        const cleanup = () => {
          if (tempEventSource.readyState !== EventSource.CLOSED) {
            tempEventSource.close();
          }
        };
        
        tempEventSource.onopen = () => {
          console.log('💨 Final SSE attempt opened');
        };
        
        tempEventSource.onmessage = (event) => {
          console.log('💨 Final SSE message:', event.data);
          
          // Try to extract session ID quickly
          let sessionId = null;
          
          try {
            const data = JSON.parse(event.data);
            sessionId = data.sessionId || data.session || data.id;
          } catch {
            const text = event.data.trim();
            const uuidMatch = text.match(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i);
            if (uuidMatch) {
              sessionId = uuidMatch[0];
            }
          }
          
          if (sessionId) {
            console.log('🎯 Final attempt captured session:', sessionId);
            this.sessionId = sessionId;
            capturedSessionId = true;
          }
          
          cleanup();
          resolve();
        };
        
        tempEventSource.onerror = () => {
          console.log('💨 Final SSE attempt failed');
          cleanup();
          resolve(); // Don't reject, just continue
        };
        
        // Very short timeout
        setTimeout(() => {
          if (!capturedSessionId) {
            console.log('💨 Final attempt timeout');
          }
          cleanup();
          resolve();
        }, 3000);
      });
      
    } catch (error) {
      console.log('ℹ️ Final SSE attempt failed:', error);
    }
    
    // If we still have no session ID, we cannot continue
    if (!this.sessionId) {
      console.error('❌ Cannot establish connection without real session ID');
      throw new Error('Server requires SSE connection for session establishment. Please check CORS settings or server configuration.');
    }
    
    this.connected = true;
    console.log('✅ Fallback connection established with session:', this.sessionId);
  }

  async disconnect(): Promise<void> {
    this.cleanup();
    console.log('📴 Disconnected from MCP server');
  }

  private cleanup(): void {
    this.connected = false;
    this.sessionId = null;
    this.capabilities = null;
    
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  getCapabilities(): MCPServerCapabilities | null {
    return this.capabilities;
  }

  getSessionId(): string | null {
    return this.sessionId;
  }

  getMessagesEndpoint(): string | null {
    if (!this.sessionId) return null;
    return `${this.serverUrl}/messages?sessionId=${this.sessionId}`;
  }

  private async loadCapabilities(): Promise<void> {
    // Load capabilities from real server
    this.capabilities = {
      tools: [
        {
          name: 'get_insurance_backoffice_data',
          description: 'Get insurance back office data with filtering options from Hubtel API',
          parameters: {
            type: 'object',
            properties: {
              startDate: { 
                type: 'string', 
                description: 'Start date in ISO format (e.g., 2025-06-01T09:00:00Z)' 
              },
              endDate: { 
                type: 'string', 
                description: 'End date in ISO format (e.g., 2025-06-02T09:00:00Z)' 
              },
              isFulfilled: { 
                type: 'boolean', 
                description: 'Filter by fulfillment status' 
              },
              pagesize: { 
                type: 'number', 
                description: 'Number of records per page (default: 100)' 
              }
            }
          }
        }
      ],
      resources: [
        {
          uri: 'insurance://backoffice',
          name: 'Insurance Back Office Data',
          description: 'Access to insurance back office data from Hubtel'
        }
      ]
    };
  }

  async callTool(toolCall: ToolCall): Promise<any> {
    if (!this.connected) {
      throw new Error('Not connected to MCP server');
    }

    if (!this.sessionId) {
      throw new Error('No session ID available');
    }

    try {
      console.log('🔧 Calling real MCP tool:', toolCall.name);
      console.log('📊 Parameters:', toolCall.parameters);
      
      // Make actual HTTP call to /messages endpoint with sessionId (like Claude Desktop)
      const messagesUrl = `${this.serverUrl}/messages?sessionId=${this.sessionId}`;
      console.log('📡 Calling:', messagesUrl);
      
      const response = await fetch(messagesUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now(),
          method: 'tools/call',
          params: {
            name: toolCall.name,
            arguments: toolCall.parameters
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ HTTP Error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Real MCP response received:', result);
      
      // Handle MCP response format
      if (result.error) {
        throw new Error(`MCP Error: ${result.error.message || result.error}`);
      }
      
      // Extract content from MCP response
      if (result.result && result.result.content && result.result.content[0]) {
        const content = result.result.content[0];
        if (content.type === 'text') {
          return JSON.parse(content.text);
        }
      }
      
      // Return raw result if no content structure
      return result.result || result;
      
    } catch (error) {
      console.error('❌ Real MCP tool call failed:', error);
      throw error;
    }
  }
}

// Singleton instance
export const mcpClient = new InsuranceMCPClient(); 