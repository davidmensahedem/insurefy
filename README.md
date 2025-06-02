# Insurance MCP Client

A modern React TypeScript application that serves as an MCP (Model Context Protocol) client for insurance operations, powered by local open-source LLMs with a Claude/ChatGPT-like interface.

## 🚀 Features

### Core Functionality
- **MCP Client Integration**: Connects to insurance MCP servers for real-time data access
- **Local LLM Integration**: Uses transformers.js for client-side AI processing
- **Chat Interface**: Claude/ChatGPT-inspired conversational UI
- **Tool Calling**: Supports MCP tool execution for insurance operations
- **Real-time Updates**: Live connection status and data synchronization

### Insurance-Specific Features
- **Policy Management**: Search, view, and manage insurance policies
- **Claims Processing**: Submit, track, and process insurance claims
- **Customer Support**: Access customer information and history
- **Premium Calculator**: Calculate insurance premiums and coverage options
- **Risk Assessment**: AI-powered risk analysis and recommendations

### Technical Features
- **Hybrid Architecture**: Combines MCP protocol with local LLM processing
- **TypeScript**: Full type safety and excellent developer experience
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **State Management**: Zustand for efficient state handling
- **Modern UI**: Tailwind CSS with custom components

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Client  │◄──►│   Local LLM      │    │  Insurance MCP  │
│   (UI Layer)    │    │ (transformers.js)│    │     Server      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
        │                        │                        ▲
        │                        │                        │
        ▼                        ▼                        │
┌─────────────────┐    ┌──────────────────┐               │
│  State Store    │    │  LLM Service     │               │
│   (Zustand)     │    │  (Processing)    │               │
└─────────────────┘    └──────────────────┘               │
        │                                                 │
        ▼                                                 │
┌─────────────────┐                                      │
│   MCP Client    │──────────────────────────────────────┘
│   (Protocol)    │
└─────────────────┘
```

## 📦 Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and development server
- **Tailwind CSS** - Styling framework

### AI & LLM
- **@xenova/transformers** - Local AI model execution
- **LangChain.js** - LLM orchestration and chaining
- **Model Context Protocol (MCP)** - Server communication

### State & Data
- **Zustand** - State management
- **React Markdown** - Markdown rendering
- **Lucide React** - Icon library

### Development
- **ESLint** - Code linting
- **TypeScript ESLint** - TypeScript-specific linting
- **PostCSS** - CSS processing

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Insurance MCP Server (optional for testing)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd insurance-mcp-client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Production Build

```bash
npm run build
npm run preview
```

## 🔧 Configuration

### MCP Server Connection
The client can connect to your insurance MCP server:

1. Open the sidebar
2. Navigate to "Server Connection"
3. Enter your MCP server URL (default: `ws://localhost:8080`)
4. Click "Connect"

### AI Model Settings
Configure the local LLM in the sidebar:

- **Model**: Choose from available transformers.js models
- **Temperature**: Control response creativity (0.0 - 1.0)
- **Max Tokens**: Set response length limit
- **Top P**: Fine-tune response diversity

### Available Models
- `Xenova/distilgpt2` (Default - Fast, lightweight)
- `Xenova/gpt2` (Balanced performance)
- `microsoft/DialoGPT-medium` (Better conversations)
- `microsoft/DialoGPT-large` (Highest quality)

## 🛠️ Available MCP Tools

The client supports these insurance-specific MCP tools:

### Policy Operations
- `search_policies` - Search policies by criteria
- `get_policy_details` - Get detailed policy information

### Claims Management
- `search_claims` - Find claims by status, date, etc.
- `create_claim` - Submit new insurance claims

### Customer Service
- `get_customer_info` - Retrieve customer data and history

### Calculations
- `calculate_premium` - Calculate insurance premiums

## 💬 Usage Examples

### Sample Queries
Try these example queries:

```
"Search for all active auto policies"
"Show me recent claims from last month"
"Calculate premium for home insurance"
"Find customer information for john.doe@email.com"
"Create a new claim for policy AUTO-2024-001"
```

### Tool Integration
The AI assistant automatically determines when to use MCP tools based on your queries. Tool results are displayed in expandable cards showing:

- Parameters used
- Results returned
- Execution status

## 🎨 UI Components

### Chat Interface
- **Messages**: Markdown-supported chat bubbles
- **Tool Cards**: Expandable tool execution results
- **Loading States**: Animated indicators during processing
- **Auto-scroll**: Automatic scrolling to latest messages

### Sidebar
- **Connection Status**: Real-time MCP server connection state
- **Tools List**: Available MCP tools and their descriptions
- **AI Settings**: Local LLM configuration
- **Quick Actions**: Common insurance operations

## 🔒 Security Considerations

- **Local Processing**: AI runs entirely in the browser
- **No Data Leakage**: Sensitive insurance data stays local
- **Secure Connections**: WebSocket connections to MCP servers
- **Type Safety**: Full TypeScript coverage prevents runtime errors

## 🚀 Development

### Project Structure
```
src/
├── components/          # React components
│   ├── Chat/           # Chat interface components
│   └── Sidebar/        # Sidebar components
├── services/           # Business logic
│   ├── mcpClient.ts    # MCP protocol client
│   └── llmService.ts   # Local LLM service
├── store/              # State management
│   └── appStore.ts     # Zustand store
├── types/              # TypeScript definitions
│   └── insurance.ts    # Domain types
└── styles/             # CSS and styling
```

### Adding New Tools
1. Define tool interface in `types/insurance.ts`
2. Add tool handler in `mcpClient.ts`
3. Update LLM service tool detection in `llmService.ts`
4. Add UI components as needed

### Extending the UI
The component architecture is modular:
- Add new chat message types in `ChatMessage.tsx`
- Extend sidebar sections in `Sidebar/`
- Create new tool displays in `ToolCallCard.tsx`

## 📈 Performance

### Optimization Features
- **Code Splitting**: Lazy loading of AI models
- **Efficient State**: Zustand minimizes re-renders
- **Model Caching**: Transformers.js caches downloaded models
- **Responsive Design**: Optimized for all device sizes

### Browser Requirements
- **WebGL Support**: Required for model acceleration
- **Modern Browser**: Chrome 90+, Firefox 88+, Safari 14+
- **Memory**: 2GB+ RAM recommended for larger models

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Anthropic** - For the MCP protocol specification
- **Hugging Face** - For transformers.js and model hosting
- **Xenova** - For browser-compatible AI models
- **Tailwind Labs** - For the excellent CSS framework

## 📞 Support

For support and questions:
- Open an issue on GitHub
- Check the documentation
- Review example queries in the sidebar

---

**Built with ❤️ for the insurance industry** 