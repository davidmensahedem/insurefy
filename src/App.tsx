import { Menu, X } from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import ChatInput from './components/Chat/ChatInput';
import ChatMessage from './components/Chat/ChatMessage';
import Sidebar from './components/Sidebar/Sidebar';
import {
    useConnectionActions,
    useIsLoading,
    useLLMActions,
    useMessages,
    useSidebarOpen,
    useUIActions
} from './store/appStore';

const App: React.FC = () => {
    const messages = useMessages();
    const isLoading = useIsLoading();
    const sidebarOpen = useSidebarOpen();
    const { toggleSidebar } = useUIActions();
    const { initializeLLM } = useLLMActions();
    const { connectToServer } = useConnectionActions();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Initialize LLM and attempt connection on startup
    useEffect(() => {
        const initialize = async () => {
            try {
                // Initialize LLM with default settings
                await initializeLLM();

                // Attempt to connect to MCP server if URL is available
                try {
                    await connectToServer();
                } catch (error) {
                    console.log('MCP server not available on startup');
                }
            } catch (error) {
                console.error('Failed to initialize:', error);
            }
        };

        initialize();
    }, [initializeLLM, connectToServer]);

    return (
        <div className="h-screen flex bg-gray-50">
            {/* Sidebar */}
            {sidebarOpen && <Sidebar />}

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <header className="chat-header">
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={toggleSidebar}
                            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                            title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
                        >
                            {sidebarOpen ? (
                                <X className="w-5 h-5 text-gray-600" />
                            ) : (
                                <Menu className="w-5 h-5 text-gray-600" />
                            )}
                        </button>

                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">AI</span>
                            </div>
                            <div>
                                <h1 className="font-semibold text-gray-900">Insurance Assistant</h1>
                                <p className="text-xs text-gray-500">
                                    Powered by Local AI + MCP Server
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        {isLoading && (
                            <div className="flex items-center text-sm text-gray-500">
                                <div className="loading-dots mr-2">
                                    <div className="loading-dot"></div>
                                    <div className="loading-dot"></div>
                                    <div className="loading-dot"></div>
                                </div>
                                Processing...
                            </div>
                        )}
                    </div>
                </header>

                {/* Chat Messages */}
                <div className="chat-messages">
                    {messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center max-w-md">
                                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-white font-bold text-xl">AI</span>
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                    Welcome to Insurance AI Assistant
                                </h2>
                                <p className="text-gray-600 mb-6">
                                    I can help you with insurance policies, claims, customer information,
                                    and premium calculations. What would you like to know?
                                </p>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="p-3 bg-blue-50 rounded-lg">
                                        <div className="font-medium text-blue-900">Policy Management</div>
                                        <div className="text-blue-700 text-xs mt-1">
                                            Search, view, and manage insurance policies
                                        </div>
                                    </div>
                                    <div className="p-3 bg-green-50 rounded-lg">
                                        <div className="font-medium text-green-900">Claims Processing</div>
                                        <div className="text-green-700 text-xs mt-1">
                                            Submit and track insurance claims
                                        </div>
                                    </div>
                                    <div className="p-3 bg-purple-50 rounded-lg">
                                        <div className="font-medium text-purple-900">Customer Support</div>
                                        <div className="text-purple-700 text-xs mt-1">
                                            Find customer information and history
                                        </div>
                                    </div>
                                    <div className="p-3 bg-orange-50 rounded-lg">
                                        <div className="font-medium text-orange-900">Premium Quotes</div>
                                        <div className="text-orange-700 text-xs mt-1">
                                            Calculate insurance premiums and coverage
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {messages.map((message) => (
                                <ChatMessage key={message.id} message={message} />
                            ))}
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>

                {/* Chat Input */}
                <ChatInput />
            </div>
        </div>
    );
};

export default App; 