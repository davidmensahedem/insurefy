import type {
  MCPServerCapabilities,
  ToolCall
} from '@/types/insurance';

// Get server URL from environment variables or fallback to default
const getServerUrl = () => {
  // In production, Vite will replace import.meta.env with actual values
  const envUrl = import.meta.env.VITE_MCP_SERVER_URL;
  const fallbackUrl = 'http://gc00ok8w8owcg0ocs44woskk.207.180.196.252.sslip.io';
  
  console.log('🌍 Environment:', import.meta.env.VITE_APP_ENVIRONMENT || 'development');
  console.log('🔗 Server URL from env:', envUrl);
  
  return envUrl || fallbackUrl;
};

// Enhanced MCP Client with better error handling and reconnection
export class InsuranceMCPClient {
  private connected = false;
  private capabilities: MCPServerCapabilities | null = null;
  private sessionId: string | null = null;
  private eventSource: EventSource | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private reconnectDelay = 1000; // Start with 1 second
  private connectionPromise: Promise<void> | null = null;

  constructor(private serverUrl: string = getServerUrl()) {
    console.log('🏗️ MCP Client initialized for:', this.serverUrl);
    console.log('🌍 Mode:', import.meta.env.MODE);
    console.log('🌍 Environment:', import.meta.env.VITE_APP_ENVIRONMENT || 'development');
  }

  async connect(): Promise<void> {
    // Prevent multiple concurrent connection attempts
    if (this.connectionPromise) {
      console.log('⏳ Connection already in progress, waiting...');
      return this.connectionPromise;
    }

    // If already connected, return immediately
    if (this.connected && this.sessionId) {
      console.log('✅ Already connected with session:', this.sessionId);
      return Promise.resolve();
    }

    this.connectionPromise = this._doConnect();
    
    try {
      await this.connectionPromise;
    } finally {
      this.connectionPromise = null;
    }
  }

  private async _doConnect(): Promise<void> {
    try {
      console.log('🔌 Connecting to MCP server:', this.serverUrl);
      
      // Test server availability first
      const healthResponse = await fetch(`${this.serverUrl}/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!healthResponse.ok) {
        throw new Error(`Server not available: ${healthResponse.status} ${healthResponse.statusText}`);
      }
      
      const healthData = await healthResponse.json();
      console.log('✅ Server is healthy:', healthData);
      
      // Initialize SSE connection with enhanced error handling
      await this.initializeSSEConnection();
      await this.loadCapabilities();
      
      this.reconnectAttempts = 0; // Reset on successful connection
      console.log('🎉 Connected to MCP Server successfully!');
      console.log('📡 Session ID:', this.sessionId);
      
    } catch (error) {
      console.error('❌ Failed to connect to MCP server:', error);
      this.connected = false;
      this.cleanup();
      
      // Implement exponential backoff for reconnection
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
        console.log(`🔄 Retrying connection in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this._doConnect(); // Recursive retry
      }
      
      throw new Error(`Failed to connect to insurance MCP server after ${this.maxReconnectAttempts} attempts: ${error}`);
    }
  }

  private async initializeSSEConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('🔗 Opening SSE connection to /sse endpoint...');
      
      let connectionTimeout: NodeJS.Timeout;
      let isResolved = false;
      
      const resolveOnce = (success: boolean, error?: Error) => {
        if (isResolved) return;
        isResolved = true;
        
        if (connectionTimeout) {
          clearTimeout(connectionTimeout);
        }
        
        if (success) {
          resolve();
        } else {
          reject(error);
        }
      };
      
      try {
        this.eventSource = new EventSource(`${this.serverUrl}/sse`, {
          withCredentials: false
        });
      } catch (error) {
        console.error('❌ Failed to create EventSource:', error);
        resolveOnce(false, new Error('EventSource creation failed'));
        return;
      }
      
      let connectionEstablished = false;
      
      this.eventSource.onopen = () => {
        console.log('✅ SSE connection opened successfully');
        connectionEstablished = true;
      };
      
      // Add specific handler for 'endpoint' events
      this.eventSource.addEventListener('endpoint', (event) => {
        console.log('🎯 Received "endpoint" event:');
        console.log('  - Data:', event.data);
        console.log('  - Raw event:', event);
        
        const sessionId = this.extractSessionId(event.data);
        
        if (sessionId) {
          console.log('🎉 Session ID captured from endpoint event:', sessionId);
          this.sessionId = sessionId;
          this.connected = true;
          
          // Close SSE connection after getting session ID
          setTimeout(() => {
            this.eventSource?.close();
            resolveOnce(true);
          }, 100);
        } else {
          console.log('⚠️ No session ID found in endpoint event');
          console.log('  - Tried to extract from:', JSON.stringify(event.data));
        }
      });
      
      this.eventSource.onmessage = (event) => {
        console.log('📨 SSE message received:');
        console.log('  - Type:', event.type);
        console.log('  - Data:', event.data);
        console.log('  - Raw event:', event);
        
        // Also check if there are other event types
        console.log('  - Event keys:', Object.keys(event));
        
        const sessionId = this.extractSessionId(event.data);
        
        if (sessionId) {
          console.log('🎉 Session ID captured:', sessionId);
          this.sessionId = sessionId;
          this.connected = true;
          
          // Close SSE connection after getting session ID
          setTimeout(() => {
            this.eventSource?.close();
            resolveOnce(true);
          }, 100);
        } else {
          console.log('⚠️ No session ID found in message, waiting for more...');
          console.log('  - Tried to extract from:', JSON.stringify(event.data));
        }
      };
      
      this.eventSource.onerror = (error) => {
        console.error('❌ SSE connection error:', error);
        console.log('📊 ReadyState:', this.eventSource?.readyState);
        console.log('📊 Connection established:', connectionEstablished);
        
        // If we got a session ID before the error, consider it success
        if (this.sessionId && this.connected) {
          console.log('✅ Session ID was captured before error, continuing...');
          resolveOnce(true);
          return;
        }
        
        this.cleanup();
        
        const errorMessage = connectionEstablished 
          ? 'SSE connection closed unexpectedly' 
          : 'Failed to establish SSE connection';
          
        resolveOnce(false, new Error(`${errorMessage}. This might be a CORS issue.`));
      };
      
      // Connection timeout with more specific messaging
      connectionTimeout = setTimeout(() => {
        if (!this.connected && !this.sessionId) {
          console.log('⏰ SSE connection timeout - no session ID received');
          this.cleanup();
          
          const timeoutError = connectionEstablished
            ? new Error('SSE connection established but no session ID received within timeout')
            : new Error('SSE connection timeout - server may not be responding or CORS is blocking');
            
          resolveOnce(false, timeoutError);
        }
      }, 8000); // Increased timeout to 8 seconds
    });
  }

  private extractSessionId(data: string): string | null {
    console.log('🔍 Extracting session ID from:', JSON.stringify(data));
    
    try {
      // Try parsing as JSON first
      const parsed = JSON.parse(data);
      console.log('📊 Parsed JSON data:', parsed);
      
      // Check all possible session ID locations
      const sessionId = parsed.sessionId || 
                       parsed.session || 
                       parsed.id || 
                       parsed.endpoint || 
                       parsed.session_id ||
                       parsed.params?.sessionId ||
                       parsed.params?.session ||
                       parsed.params?.id;
      
      if (sessionId) {
        console.log('✅ Found session ID in JSON:', sessionId);
        return sessionId;
      }
      
      // If endpoint URL format
      if (parsed.endpoint && parsed.endpoint.includes('sessionId=')) {
        try {
          const url = new URL(parsed.endpoint, this.serverUrl);
          const extractedId = url.searchParams.get('sessionId');
          if (extractedId) {
            console.log('✅ Found session ID in JSON endpoint URL:', extractedId);
            return extractedId;
          }
        } catch (e) {
          console.warn('Failed to parse endpoint URL:', e);
        }
      }
      
    } catch (err) {
      console.log('📝 SSE message is not JSON, processing as text...');
      
      // Handle plain text - check if it's a URL path with sessionId
      const text = data.trim();
      console.log('📝 Processing text:', text);
      
      // Check for URL path format like "/messages?sessionId=uuid"
      if (text.includes('sessionId=')) {
        console.log('🔍 Found sessionId= in text, extracting...');
        
        // First try regex extraction (most reliable)
        const sessionMatch = text.match(/sessionId=([a-f0-9-]{36})/i);
        if (sessionMatch) {
          console.log('✅ Found session ID via regex:', sessionMatch[1]);
          return sessionMatch[1];
        }
        
        // Fallback: try a broader regex
        const broadMatch = text.match(/sessionId=([a-f0-9-]+)/i);
        if (broadMatch) {
          console.log('✅ Found session ID via broad regex:', broadMatch[1]);
          return broadMatch[1];
        }
        
        // Try URL parsing as fallback
        try {
          const url = new URL(text, this.serverUrl);
          const sessionId = url.searchParams.get('sessionId');
          if (sessionId) {
            console.log('✅ Found session ID in URL path:', sessionId);
            return sessionId;
          }
        } catch (e) {
          console.warn('Failed to parse as URL:', e);
        }
      }
      
      // Look for UUID pattern anywhere in the text (8-4-4-4-12 characters)
      const uuidMatch = text.match(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i);
      if (uuidMatch) {
        console.log('✅ Found UUID pattern:', uuidMatch[0]);
        return uuidMatch[0];
      }
      
      // Look for any session-like ID (alphanumeric with dashes/underscores)
      if (text.length > 10 && text.length < 100 && text.match(/^[a-zA-Z0-9_-]+$/)) {
        console.log('🆔 Using text as session ID:', text);
        return text;
      }
    }
    
    console.log('❌ No session ID found in data');
    return null;
  }

  async disconnect(): Promise<void> {
    this.cleanup();
    this.reconnectAttempts = 0;
    console.log('📴 Disconnected from MCP server');
  }

  private cleanup(): void {
    this.connected = false;
    this.sessionId = null;
    this.capabilities = null;
    
    if (this.eventSource) {
      if (this.eventSource.readyState !== EventSource.CLOSED) {
        this.eventSource.close();
      }
      this.eventSource = null;
    }
  }

  isConnected(): boolean {
    return this.connected && !!this.sessionId;
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
    // Enhanced capabilities with better typing
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
                description: 'Start date in ISO format (e.g., 2025-06-01T09:00:00Z)',
                format: 'date-time'
              },
              endDate: { 
                type: 'string', 
                description: 'End date in ISO format (e.g., 2025-06-02T09:00:00Z)',
                format: 'date-time'
              },
              isFulfilled: { 
                type: 'boolean', 
                description: 'Filter by fulfillment status (true for fulfilled, false for unfulfilled)'
              },
              pagesize: { 
                type: 'number', 
                description: 'Number of records per page (default: 100, max: 1000)',
                minimum: 1,
                maximum: 1000,
                default: 100
              }
            },
            required: ['startDate', 'endDate', 'isFulfilled']
          }
        }
      ],
      resources: [
        {
          uri: 'insurance://backoffice',
          name: 'Insurance Back Office Data',
          description: 'Access to insurance back office data from Hubtel with real-time transaction information'
        }
      ]
    };
  }

  async callTool(toolCall: ToolCall): Promise<any> {
    if (!this.connected) {
      throw new Error('Not connected to MCP server. Call connect() first.');
    }

    if (!this.sessionId) {
      throw new Error('No session ID available. Connection may have failed.');
    }

    // Validate tool call parameters
    if (toolCall.name === 'get_insurance_backoffice_data') {
      this.validateInsuranceParameters(toolCall.parameters);
    }

    try {
      console.log('🔧 Calling MCP tool:', toolCall.name);
      console.log('📊 Parameters:', toolCall.parameters);
      
      const messagesUrl = `${this.serverUrl}/messages?sessionId=${this.sessionId}`;
      console.log('📡 Calling:', messagesUrl);
      
      const requestBody = {
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/call',
        params: {
          name: toolCall.name,
          arguments: toolCall.parameters
        }
      };
      
      console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch(messagesUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ HTTP Error:', response.status, response.statusText, errorText);
        
        // Handle specific HTTP errors
        if (response.status === 400) {
          throw new Error(`Bad Request: ${errorText}`);
        } else if (response.status === 404) {
          throw new Error(`Endpoint not found: ${messagesUrl}`);
        } else if (response.status >= 500) {
          throw new Error(`Server error (${response.status}): ${errorText}`);
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
        }
      }

      const result = await response.json();
      console.log('✅ MCP response received:', result);
      
      // Handle MCP error responses
      if (result.error) {
        const errorMsg = result.error.message || result.error.code || 'Unknown MCP error';
        console.error('❌ MCP Error:', result.error);
        throw new Error(`MCP Error: ${errorMsg}`);
      }
      
      // Extract content from MCP response
      if (result.result && result.result.content && Array.isArray(result.result.content) && result.result.content.length > 0) {
        const content = result.result.content[0];
        if (content.type === 'text' && content.text) {
          try {
            return JSON.parse(content.text);
          } catch (parseError) {
            console.warn('Failed to parse response as JSON, returning raw text:', parseError);
            return content.text;
          }
        }
      }
      
      // Return raw result if no content structure
      return result.result || result;
      
    } catch (error) {
      console.error('❌ MCP tool call failed:', error);
      
      // If it's a connection error, mark as disconnected
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.log('🔌 Network error detected, marking as disconnected');
        this.connected = false;
      }
      
      throw error;
    }
  }

  private validateInsuranceParameters(params: any): void {
    const required = ['startDate', 'endDate', 'isFulfilled'];
    
    for (const field of required) {
      if (!(field in params)) {
        throw new Error(`Missing required parameter: ${field}`);
      }
    }
    
    // Validate date formats
    try {
      new Date(params.startDate).toISOString();
      new Date(params.endDate).toISOString();
    } catch (error) {
      throw new Error('Invalid date format. Use ISO 8601 format (e.g., 2025-06-01T09:00:00Z)');
    }
    
    // Validate date range
    const start = new Date(params.startDate);
    const end = new Date(params.endDate);
    
    if (start >= end) {
      throw new Error('Start date must be before end date');
    }
    
    // Validate pagesize if provided
    if (params.pagesize !== undefined) {
      const pagesize = Number(params.pagesize);
      if (isNaN(pagesize) || pagesize < 1 || pagesize > 1000) {
        throw new Error('pagesize must be a number between 1 and 1000');
      }
    }
    
    // Validate boolean
    if (typeof params.isFulfilled !== 'boolean') {
      throw new Error('isFulfilled must be a boolean (true or false)');
    }
  }

  // Utility method to create date strings for common queries
  static createDateRange(hours: number = 24): { startDate: string; endDate: string } {
    const now = new Date();
    const start = new Date(now.getTime() - (hours * 60 * 60 * 1000));
    
    return {
      startDate: start.toISOString(),
      endDate: now.toISOString()
    };
  }

  // Method to get quick summaries
  async getRecentTransactions(fulfilled: boolean = false, hours: number = 24): Promise<any> {
    const dateRange = InsuranceMCPClient.createDateRange(hours);
    
    return this.callTool({
      id: `tool-call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: 'get_insurance_backoffice_data',
      parameters: {
        ...dateRange,
        isFulfilled: fulfilled,
        pagesize: 100
      }
    });
  }
}

// Enhanced singleton instance with error recovery
export const mcpClient = new InsuranceMCPClient(); 