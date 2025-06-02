import type { ChatMessage, LLMConfig, ToolCall } from '@/types/insurance';
import { mcpClient } from './mcpClient';

// Simplified MCP-only service - no LLM processing
export class InsuranceLLMService {
  private isInitialized = true;
  private currentConfig: LLMConfig = {
    model: 'direct-mcp-routing',
    temperature: 0,
    maxTokens: 100,
    topP: 1
  };

  async initialize(_config?: Partial<LLMConfig>): Promise<void> {
    console.log('✅ Direct MCP routing ready (no LLM)');
    return Promise.resolve();
  }

  async generateResponse(messages: ChatMessage[]): Promise<string> {
    return "Direct MCP tool routing active. Try: 'Get back office data'";
  }

  async processWithTools(
    userMessage: string,
    _conversationHistory: ChatMessage[]
  ): Promise<{ response: string; toolCalls?: ToolCall[] }> {
    
    const lowerMessage = userMessage.toLowerCase();
    const toolCalls: ToolCall[] = [];
    
    // Simple keyword detection for back office data
    if (lowerMessage.includes('back office') || 
        lowerMessage.includes('data') || 
        lowerMessage.includes('order') ||
        lowerMessage.includes('transaction')) {
      
      console.log('🎯 Direct MCP call for back office data...');
      
      if (mcpClient.isConnected()) {
        try {
          const toolCall: ToolCall = {
            id: `tool_${Date.now()}`,
            name: 'get_insurance_backoffice_data',
            parameters: {
              startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              endDate: new Date().toISOString(),
              isFulfilled: true,
              pagesize: 50
            }
          };
          
          console.log('📞 Calling MCP tool:', toolCall.name);
          const result = await mcpClient.callTool(toolCall);
          toolCall.result = result;
          toolCalls.push(toolCall);
          
          // Format the response based on the actual data received
          let responseText = "✅ Successfully retrieved data from MCP server!";
          
          if (result && result.data) {
            const dataCount = Array.isArray(result.data) ? result.data.length : 1;
            responseText = `✅ Retrieved ${dataCount} records from insurance back office system.`;
          }
          
          return {
            response: responseText,
            toolCalls
          };
          
        } catch (error) {
          console.error('❌ MCP tool call failed:', error);
          return {
            response: "❌ Failed to retrieve data from MCP server. Please check the connection.",
            toolCalls: []
          };
        }
      } else {
        return {
          response: "⚠️ Please connect to your MCP server first (sidebar → Server Connection)",
          toolCalls: []
        };
      }
    }
    
    // Default for other queries
    return {
      response: "I can help you get insurance data from the MCP server. Try: 'Get back office data' or 'Show recent orders'",
      toolCalls: []
    };
  }

  async updateConfig(config: Partial<LLMConfig>): Promise<void> {
    this.currentConfig = { ...this.currentConfig, ...config };
  }

  getConfig(): LLMConfig {
    return { ...this.currentConfig };
  }

  isReady(): boolean {
    return this.isInitialized;
  }
}

export const llmService = new InsuranceLLMService(); 