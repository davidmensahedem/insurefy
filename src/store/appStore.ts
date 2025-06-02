import { llmService } from '@/services/llmService';
import { mcpClient } from '@/services/mcpClient';
import type {
    AppState,
    ChatMessage,
    ConnectionState,
    LLMConfig,
    MCPServerCapabilities
} from '@/types/insurance';
import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface AppStore extends AppState {
  // Actions
  setConnectionStatus: (status: ConnectionState['status']) => void;
  setServerUrl: (url: string) => void;
  setConnectionError: (error: string | null) => void;
  setCapabilities: (capabilities: MCPServerCapabilities) => void;
  
  addMessage: (message: Omit<ChatMessage, 'id'>) => void;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  clearMessages: () => void;
  
  setLoading: (loading: boolean) => void;
  updateLLMConfig: (config: Partial<LLMConfig>) => void;
  toggleSidebar: () => void;
  
  // Async actions
  connectToServer: (url?: string) => Promise<void>;
  disconnectFromServer: () => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  initializeLLM: (config?: Partial<LLMConfig>) => Promise<void>;
}

export const useAppStore = create<AppStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      connection: {
        status: 'disconnected',
        serverUrl: undefined,
        error: null,
        capabilities: undefined
      },
      messages: [],
      isLoading: false,
      currentLLM: {
        model: 'Xenova/distilgpt2',
        temperature: 0.7,
        maxTokens: 512,
        topP: 0.9
      },
      sidebarOpen: true,

      // Connection actions
      setConnectionStatus: (status) =>
        set((state) => ({
          connection: { ...state.connection, status }
        })),

      setServerUrl: (serverUrl) =>
        set((state) => ({
          connection: { ...state.connection, serverUrl }
        })),

      setConnectionError: (error) =>
        set((state) => ({
          connection: { ...state.connection, error }
        })),

      setCapabilities: (capabilities) =>
        set((state) => ({
          connection: { ...state.connection, capabilities }
        })),

      // Message actions
      addMessage: (message) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              ...message,
              id: uuidv4(),
              timestamp: message.timestamp || new Date().toISOString()
            }
          ]
        })),

      updateMessage: (id, updates) =>
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === id ? { ...msg, ...updates } : msg
          )
        })),

      clearMessages: () => set({ messages: [] }),

      // UI actions
      setLoading: (isLoading) => set({ isLoading }),

      updateLLMConfig: (config) =>
        set((state) => ({
          currentLLM: { ...state.currentLLM, ...config }
        })),

      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      // Async actions
      connectToServer: async (url) => {
        const { setConnectionStatus, setServerUrl, setConnectionError, setCapabilities } = get();
        
        try {
          setConnectionStatus('connecting');
          setConnectionError(null);
          
          if (url) {
            setServerUrl(url);
          }

          await mcpClient.connect();
          
          const capabilities = mcpClient.getCapabilities();
          if (capabilities) {
            setCapabilities(capabilities);
          }

          setConnectionStatus('connected');
        } catch (error) {
          setConnectionStatus('error');
          setConnectionError(error instanceof Error ? error.message : 'Connection failed');
          throw error;
        }
      },

      disconnectFromServer: async () => {
        const { setConnectionStatus, setConnectionError, setCapabilities } = get();
        
        try {
          await mcpClient.disconnect();
          setConnectionStatus('disconnected');
          setConnectionError(null);
          setCapabilities(undefined as any);
        } catch (error) {
          console.error('Disconnect error:', error);
        }
      },

      sendMessage: async (content) => {
        const { addMessage, updateMessage, setLoading, messages } = get();
        
        try {
          setLoading(true);

          // Add user message
          const userMessage: ChatMessage = {
            id: uuidv4(),
            role: 'user',
            content,
            timestamp: new Date().toISOString()
          };
          addMessage(userMessage);

          // Add loading assistant message
          const assistantMessage: ChatMessage = {
            id: uuidv4(),
            role: 'assistant',
            content: '',
            timestamp: new Date().toISOString(),
            isLoading: true
          };
          addMessage(assistantMessage);

          // Process with LLM and tools
          const result = await llmService.processWithTools(content, messages);

          // Update assistant message with response
          updateMessage(assistantMessage.id, {
            content: result.response,
            isLoading: false,
            toolCalls: result.toolCalls,
            sources: result.toolCalls?.map(tc => tc.name)
          });

        } catch (error) {
          console.error('Send message error:', error);
          
          // Update with error message
          const currentMessages = get().messages;
          const lastMessage = currentMessages[currentMessages.length - 1];
          if (lastMessage && lastMessage.isLoading) {
            updateMessage(lastMessage.id, {
              content: 'Sorry, I encountered an error processing your request. Please try again.',
              isLoading: false
            });
          }
        } finally {
          setLoading(false);
        }
      },

      initializeLLM: async (config) => {
        const { updateLLMConfig, setLoading } = get();
        
        try {
          setLoading(true);
          
          if (config) {
            updateLLMConfig(config);
          }

          await llmService.initialize(config);
        } catch (error) {
          console.error('LLM initialization error:', error);
          throw error;
        } finally {
          setLoading(false);
        }
      }
    }),
    {
      name: 'insurance-app-store',
      partialize: (state: AppState) => ({
        // Persist only certain parts of the state
        currentLLM: state.currentLLM,
        sidebarOpen: state.sidebarOpen,
        connection: {
          serverUrl: state.connection.serverUrl
        }
      })
    }
  )
);

// Selectors for better performance
export const useConnection = () => useAppStore((state) => state.connection);
export const useMessages = () => useAppStore((state) => state.messages);
export const useIsLoading = () => useAppStore((state) => state.isLoading);
export const useLLMConfig = () => useAppStore((state) => state.currentLLM);
export const useSidebarOpen = () => useAppStore((state) => state.sidebarOpen);

// Actions
export const useConnectionActions = () => useAppStore((state) => ({
  connectToServer: state.connectToServer,
  disconnectFromServer: state.disconnectFromServer,
  setServerUrl: state.setServerUrl
}));

export const useMessageActions = () => useAppStore((state) => ({
  sendMessage: state.sendMessage,
  clearMessages: state.clearMessages,
  addMessage: state.addMessage,
  updateMessage: state.updateMessage
}));

export const useUIActions = () => useAppStore((state) => ({
  toggleSidebar: state.toggleSidebar,
  setLoading: state.setLoading
}));

export const useLLMActions = () => useAppStore((state) => ({
  updateLLMConfig: state.updateLLMConfig,
  initializeLLM: state.initializeLLM
})); 