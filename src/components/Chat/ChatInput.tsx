import { useIsLoading, useMessageActions } from '@/store/appStore';
import { Mic, Paperclip, Send } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface ChatInputProps {
    placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
    placeholder = "Ask me about insurance policies, claims, or customer information..."
}) => {
    const [message, setMessage] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { sendMessage } = useMessageActions();
    const isLoading = useIsLoading();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!message.trim() || isLoading) return;

        const messageToSend = message.trim();
        setMessage('');

        try {
            await sendMessage(messageToSend);
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const adjustTextareaHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
        }
    };

    useEffect(() => {
        adjustTextareaHeight();
    }, [message]);

    const canSend = message.trim().length > 0 && !isLoading;

    return (
        <div className="chat-input-container">
            <form onSubmit={handleSubmit} className="chat-input">
                <div className="flex-1 relative">
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        disabled={isLoading}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                        rows={1}
                        style={{ minHeight: '48px', maxHeight: '120px' }}
                    />

                    {/* Attachment button */}
                    <button
                        type="button"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Attach file"
                    >
                        <Paperclip className="w-4 h-4" />
                    </button>
                </div>

                {/* Voice input button */}
                <button
                    type="button"
                    className="p-3 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Voice input"
                >
                    <Mic className="w-5 h-5" />
                </button>

                {/* Send button */}
                <button
                    type="submit"
                    disabled={!canSend}
                    className={`p-3 rounded-lg transition-all ${canSend
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                    title="Send message"
                >
                    <Send className="w-5 h-5" />
                </button>
            </form>

            {/* Suggested prompts for insurance */}
            {message.length === 0 && (
                <div className="max-w-3xl mx-auto mt-3">
                    <div className="flex flex-wrap gap-2">
                        {[
                            "Get back office data",
                            "Show recent orders",
                            "Search for auto policies",
                            "Show recent claims",
                            "Calculate home insurance premium",
                            "Find customer by email"
                        ].map((prompt) => (
                            <button
                                key={prompt}
                                onClick={() => setMessage(prompt)}
                                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                            >
                                {prompt}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatInput; 