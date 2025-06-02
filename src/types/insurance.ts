// Insurance Domain Types
export interface Policy {
  id: string;
  policyNumber: string;
  type: 'auto' | 'home' | 'life' | 'health' | 'business';
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  customer: Customer;
  premium: number;
  coverage: Coverage;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: Address;
  dateOfBirth: string;
  ssn?: string;
  createdAt: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Coverage {
  liability?: number;
  collision?: number;
  comprehensive?: number;
  deductible: number;
  limits: Record<string, number>;
}

export interface Claim {
  id: string;
  claimNumber: string;
  policyId: string;
  type: 'accident' | 'theft' | 'fire' | 'flood' | 'medical' | 'other';
  status: 'submitted' | 'under_review' | 'approved' | 'denied' | 'paid';
  amount: number;
  description: string;
  dateOfLoss: string;
  reportedDate: string;
  adjusterId?: string;
  documents: ClaimDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface ClaimDocument {
  id: string;
  name: string;
  type: 'photo' | 'receipt' | 'report' | 'estimate' | 'other';
  url: string;
  uploadedAt: string;
}

// MCP Types
export interface MCPMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface MCPTool {
  name: string;
  description: string;
  parameters: Record<string, any>;
}

export interface MCPResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

export interface MCPServerCapabilities {
  tools?: MCPTool[];
  resources?: MCPResource[];
  prompts?: any[];
}

// Chat Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isLoading?: boolean;
  toolCalls?: ToolCall[];
  sources?: string[];
}

export interface ToolCall {
  id: string;
  name: string;
  parameters: Record<string, any>;
  result?: any;
}

// LLM Types
export interface LLMConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
}

export interface LLMProvider {
  name: string;
  models: string[];
  isLocal: boolean;
}

// Application State Types
export interface ConnectionState {
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  serverUrl?: string;
  error?: string | null;
  capabilities?: MCPServerCapabilities;
}

export interface AppState {
  connection: ConnectionState;
  messages: ChatMessage[];
  isLoading: boolean;
  currentLLM: LLMConfig;
  sidebarOpen: boolean;
} 