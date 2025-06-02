/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_VERSION: string
  readonly VITE_APP_ENVIRONMENT: string
  readonly VITE_MCP_SERVER_URL: string
  readonly VITE_MCP_SSE_ENDPOINT: string
  readonly VITE_MCP_MESSAGES_ENDPOINT: string
  readonly VITE_MCP_HEALTH_ENDPOINT: string
  readonly VITE_DEFAULT_PAGE_SIZE: string
  readonly VITE_CONNECTION_TIMEOUT: string
  readonly VITE_SSE_TIMEOUT: string
  readonly VITE_ENABLE_DEBUG_LOGS: string
  readonly VITE_ENABLE_TEST_CONNECTION: string
  readonly VITE_ENABLE_FORCE_CONNECT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 