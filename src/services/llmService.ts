import type { ChatMessage, LLMConfig, ToolCall } from '@/types/insurance';
import { mcpClient } from './mcpClient';

// Ultra-lightweight insurance assistant - NO AI, direct tool routing
export class InsuranceLLMService {
  private isInitialized = true; // Always ready
  private currentConfig: LLMConfig = {
    model: 'direct-routing',
    temperature: 0,
    maxTokens: 100,
    topP: 1
  };

  async initialize(_config?: Partial<LLMConfig>): Promise<void> {
    console.log('✅ Direct routing assistant ready (no AI loading)');
    return Promise.resolve();
  }

  async generateResponse(messages: ChatMessage[]): Promise<string> {
    const lastMessage = messages[messages.length - 1]?.content.toLowerCase() || '';
    
    if (lastMessage.includes('hello') || lastMessage.includes('hi')) {
      return "Hello! I can help you get insurance back office data. Try: 'Get back office data'";
    }
    
    return "I can help with insurance data. Ask me to 'Get back office data' or similar.";
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
      
      console.log('🎯 Detected back office query, calling tool...');
      
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
          
          return {
            response: "✅ Successfully retrieved back office data from your insurance server!",
            toolCalls
          };
          
        } catch (error) {
          console.error('❌ Tool call failed:', error);
          return {
            response: "❌ Failed to get data. Please check your MCP server connection.",
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
    
    // Greeting
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return {
        response: "👋 Hello! I can help you get insurance back office data. Try asking: 'Get back office data'",
        toolCalls: []
      };
    }
    
    // Default response
    return {
      response: "I can help you get insurance data. Try: 'Get back office data' or 'Show recent orders'",
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