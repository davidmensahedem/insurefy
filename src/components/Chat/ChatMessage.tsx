import type { ChatMessage as ChatMessageType } from '@/types/insurance';
import { Bot, Loader2, User } from 'lucide-react';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import ToolCallCard from './ToolCallCard';

interface ChatMessageProps {
    message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
    const isUser = message.role === 'user';

    // Debug logging
    React.useEffect(() => {
        if (!isUser) {
            console.log('🔄 ChatMessage render:', {
                id: message.id,
                isLoading: message.isLoading,
                hasContent: !!message.content,
                contentLength: message.content?.length || 0,
                hasToolCalls: !!(message.toolCalls && message.toolCalls.length > 0)
            });
        }
    }, [message.isLoading, message.content, message.toolCalls, isUser, message.id]);

    return (
        <div className={`message-bubble ${isUser ? 'message-user' : 'message-assistant'} fade-in`}>
            <div className="flex items-start space-x-3">
                {!isUser && (
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-blue-600" />
                    </div>
                )}

                <div className={`flex-1 ${isUser ? 'flex justify-end' : ''}`}>
                    <div className={`message-content ${isUser ? 'max-w-sm' : 'max-w-none'}`}>
                        {message.isLoading ? (
                            <div className="flex items-center space-x-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Thinking...</span>
                                <div className="loading-dots">
                                    <div className="loading-dot"></div>
                                    <div className="loading-dot"></div>
                                    <div className="loading-dot"></div>
                                </div>
                            </div>
                        ) : (
                            <div>
                                {isUser ? (
                                    <p className="whitespace-pre-wrap">{message.content}</p>
                                ) : (
                                    <ReactMarkdown className="prose prose-sm max-w-none prose-gray">
                                        {message.content}
                                    </ReactMarkdown>
                                )}

                                {/* Show tool calls if any */}
                                {message.toolCalls && message.toolCalls.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        <div className="text-xs text-gray-500 font-medium">
                                            Insurance System Actions:
                                        </div>
                                        {message.toolCalls.map((toolCall) => (
                                            <ToolCallCard key={toolCall.id} toolCall={toolCall} />
                                        ))}
                                    </div>
                                )}

                                {/* Show sources if any */}
                                {message.sources && message.sources.length > 0 && (
                                    <div className="mt-2 text-xs text-gray-500">
                                        <span className="font-medium">Sources: </span>
                                        {message.sources.join(', ')}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {isUser && (
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                    </div>
                )}
            </div>

            {/* Timestamp */}
            <div className={`mt-1 text-xs text-gray-400 ${isUser ? 'text-right' : 'text-left ml-11'}`}>
                {new Date(message.timestamp).toLocaleTimeString()}
            </div>
        </div>
    );
};

export default ChatMessage; 