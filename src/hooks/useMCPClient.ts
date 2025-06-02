import type { ToolCall } from '@/types/insurance';
import { useCallback, useEffect, useRef, useState } from 'react';
import { InsuranceMCPClient, mcpClient } from '../services/mcpClient';

export interface MCPClientState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  sessionId: string | null;
  capabilities: any[] | null;
  connectionAttempts: number;
}

export interface MCPClientActions {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  callTool: (toolCall: ToolCall) => Promise<any>;
  clearError: () => void;
  retry: () => Promise<void>;
}

export interface UseMCPClientReturn extends MCPClientState, MCPClientActions {
  client: InsuranceMCPClient;
}

export function useMCPClient(): UseMCPClientReturn {
  const [state, setState] = useState<MCPClientState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    sessionId: null,
    capabilities: null,
    connectionAttempts: 0
  });

  const connectingRef = useRef(false);
  const mountedRef = useRef(true);

  // Safe state updater that checks if component is still mounted
  const safeSetState = useCallback((update: Partial<MCPClientState>) => {
    if (mountedRef.current) {
      setState(prev => ({ ...prev, ...update }));
    }
  }, []);

  const connect = useCallback(async () => {
    if (connectingRef.current || state.isConnected) {
      console.log('🔄 Connection already in progress or established');
      return;
    }

    connectingRef.current = true;
    safeSetState({ 
      isConnecting: true, 
      error: null,
      connectionAttempts: state.connectionAttempts + 1
    });

    try {
      console.log('🔌 Starting MCP connection...');
      await mcpClient.connect();
      
      if (mountedRef.current) {
        const capabilities = mcpClient.getCapabilities();
        safeSetState({
          isConnected: true,
          isConnecting: false,
          sessionId: mcpClient.getSessionId(),
          capabilities: capabilities?.tools || null,
          error: null
        });
        
        console.log('✅ MCP connection successful');
      }
    } catch (error) {
      console.error('❌ MCP connection failed:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Unknown connection error';
        
      safeSetState({
        isConnected: false,
        isConnecting: false,
        error: errorMessage
      });
    } finally {
      connectingRef.current = false;
    }
  }, [state.isConnected, state.connectionAttempts, safeSetState]);

  const disconnect = useCallback(async () => {
    try {
      await mcpClient.disconnect();
      safeSetState({
        isConnected: false,
        isConnecting: false,
        sessionId: null,
        capabilities: null,
        error: null,
        connectionAttempts: 0
      });
      console.log('📴 MCP disconnected');
    } catch (error) {
      console.error('❌ Disconnect error:', error);
    }
  }, [safeSetState]);

  const callTool = useCallback(async (toolCall: ToolCall) => {
    if (!state.isConnected) {
      throw new Error('Not connected to MCP server');
    }

    try {
      const result = await mcpClient.callTool(toolCall);
      return result;
    } catch (error) {
      console.error('❌ Tool call failed:', error);
      
      // If it's a connection error, update state
      if (error instanceof Error && error.message.includes('Not connected')) {
        safeSetState({
          isConnected: false,
          error: 'Connection lost'
        });
      }
      
      throw error;
    }
  }, [state.isConnected, safeSetState]);

  const clearError = useCallback(() => {
    safeSetState({ error: null });
  }, [safeSetState]);

  const retry = useCallback(async () => {
    clearError();
    await disconnect();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Brief delay
    await connect();
  }, [clearError, disconnect, connect]);

  // Auto-connect on mount
  useEffect(() => {
    console.log('🏗️ MCP hook mounted, auto-connecting...');
    connect();

    return () => {
      mountedRef.current = false;
      console.log('🧹 MCP hook unmounting...');
    };
  }, []); // Empty dependency array for mount-only effect

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mcpClient.isConnected()) {
        mcpClient.disconnect();
      }
    };
  }, []);

  // Periodic connection health check
  useEffect(() => {
    if (!state.isConnected) return;

    const healthCheck = setInterval(() => {
      if (!mcpClient.isConnected()) {
        console.log('🔍 Health check: Connection lost, updating state');
        safeSetState({
          isConnected: false,
          error: 'Connection lost'
        });
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(healthCheck);
  }, [state.isConnected, safeSetState]);

  return {
    ...state,
    client: mcpClient,
    connect,
    disconnect,
    callTool,
    clearError,
    retry
  };
}

// Convenience hook for insurance data specifically
export function useInsuranceData() {
  const mcp = useMCPClient();
  
  const getBackofficeData = useCallback(async (params: {
    startDate: string;
    endDate: string;
    isFulfilled: boolean;
    pagesize?: number;
  }) => {
    return mcp.callTool({
      id: `tool-call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: 'get_insurance_backoffice_data',
      parameters: {
        pagesize: 100,
        ...params
      }
    });
  }, [mcp.callTool]);

  const getRecentTransactions = useCallback(async (fulfilled: boolean = false, hours: number = 24) => {
    if (!mcp.client) {
      throw new Error('MCP client not available');
    }
    
    return mcp.client.getRecentTransactions(fulfilled, hours);
  }, [mcp.client]);

  const getTodaysTransactions = useCallback(async (fulfilled: boolean = false) => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return getBackofficeData({
      startDate: startOfDay.toISOString(),
      endDate: now.toISOString(),
      isFulfilled: fulfilled
    });
  }, [getBackofficeData]);

  const getYesterdaysTransactions = useCallback(async (fulfilled: boolean = false) => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const startOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
    const endOfYesterday = new Date(startOfYesterday.getTime() + 24 * 60 * 60 * 1000);
    
    return getBackofficeData({
      startDate: startOfYesterday.toISOString(),
      endDate: endOfYesterday.toISOString(),
      isFulfilled: fulfilled
    });
  }, [getBackofficeData]);

  return {
    ...mcp,
    getBackofficeData,
    getRecentTransactions,
    getTodaysTransactions,
    getYesterdaysTransactions
  };
}

// Helper hook for creating date ranges
export function useDateRanges() {
  const createRange = useCallback((hours: number) => {
    return InsuranceMCPClient.createDateRange(hours);
  }, []);

  const today = useCallback(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return {
      startDate: startOfDay.toISOString(),
      endDate: now.toISOString()
    };
  }, []);

  const yesterday = useCallback(() => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const startOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
    const endOfYesterday = new Date(startOfYesterday.getTime() + 24 * 60 * 60 * 1000);
    
    return {
      startDate: startOfYesterday.toISOString(),
      endDate: endOfYesterday.toISOString()
    };
  }, []);

  const lastWeek = useCallback(() => {
    return createRange(24 * 7); // 7 days
  }, [createRange]);

  const lastMonth = useCallback(() => {
    return createRange(24 * 30); // 30 days
  }, [createRange]);

  return {
    createRange,
    today,
    yesterday,
    lastWeek,
    lastMonth
  };
} 