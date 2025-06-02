import { useMCPClient } from '@/hooks/useMCPClient';
import { AlertCircle, CheckCircle, Loader2, RefreshCw, Zap } from 'lucide-react';
import React from 'react';

const ConnectionStatus: React.FC = () => {
    const {
        isConnected,
        isConnecting,
        error,
        sessionId,
        connectionAttempts,
        connect,
        disconnect,
        retry,
        clearError
    } = useMCPClient();

    const handleConnect = async () => {
        try {
            clearError();
            await connect();
        } catch (err) {
            console.error('Connection failed:', err);
        }
    };

    const handleForceConnect = async () => {
        try {
            clearError();
            await disconnect();
            // Brief delay before reconnecting
            setTimeout(() => connect(), 500);
        } catch (err) {
            console.error('Force connection failed:', err);
        }
    };

    const handleRetry = async () => {
        try {
            await retry();
        } catch (err) {
            console.error('Retry failed:', err);
        }
    };

    const getStatusColor = () => {
        if (isConnecting) return 'text-yellow-600';
        if (isConnected) return 'text-green-600';
        if (error) return 'text-red-600';
        return 'text-gray-600';
    };

    const getStatusIcon = () => {
        if (isConnecting) return <Loader2 className="w-4 h-4 animate-spin" />;
        if (isConnected) return <CheckCircle className="w-4 h-4" />;
        if (error) return <AlertCircle className="w-4 h-4" />;
        return <AlertCircle className="w-4 h-4" />;
    };

    const getStatusText = () => {
        if (isConnecting) return 'Connecting...';
        if (isConnected) return 'Connected';
        if (error) return 'Connection Failed';
        return 'Disconnected';
    };

    return (
        <div className="space-y-3">
            {/* Status Display */}
            <div className={`flex items-center space-x-2 ${getStatusColor()}`}>
                {getStatusIcon()}
                <span className="text-sm font-medium">{getStatusText()}</span>
            </div>

            {/* Session Info */}
            {isConnected && sessionId && (
                <div className="text-xs text-gray-500">
                    <div>Session: {sessionId.substring(0, 8)}...</div>
                </div>
            )}

            {/* Connection Attempts */}
            {connectionAttempts > 0 && (
                <div className="text-xs text-gray-500">
                    Attempts: {connectionAttempts}
                </div>
            )}

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="text-sm text-red-800 font-medium mb-1">Connection Error</div>
                    <div className="text-xs text-red-600">{error}</div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
                {!isConnected && !isConnecting && (
                    <button
                        onClick={handleConnect}
                        className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                    >
                        <Zap className="w-4 h-4" />
                        <span>Connect</span>
                    </button>
                )}

                {!isConnecting && (
                    <button
                        onClick={handleForceConnect}
                        className="w-full flex items-center justify-center space-x-2 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span>Force Connect (Skip SSE)</span>
                    </button>
                )}

                {error && !isConnecting && (
                    <button
                        onClick={handleRetry}
                        className="w-full flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span>Retry Connection</span>
                    </button>
                )}

                {isConnected && (
                    <button
                        onClick={disconnect}
                        className="w-full flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                    >
                        <span>Disconnect</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default ConnectionStatus; 