import { useConnection, useConnectionActions } from '@/store/appStore';
import { clsx } from 'clsx';
import { AlertCircle, AlertTriangle, CheckCircle, Loader2, Power, Wifi, XCircle } from 'lucide-react';
import React, { useState } from 'react';

const ConnectionStatus: React.FC = () => {
    const connection = useConnection();
    const { connectToServer, disconnectFromServer } = useConnectionActions();
    const [serverUrlInput, setServerUrlInput] = useState(
        connection.serverUrl || 'http://gc00ok8w8owcg0ocs44woskk.207.180.196.252.sslip.io'
    );
    const [isConnecting, setIsConnecting] = useState(false);

    const handleConnect = async () => {
        if (connection.status === 'connected') {
            await disconnectFromServer();
            return;
        }

        setIsConnecting(true);
        try {
            await connectToServer(serverUrlInput);
        } catch (error) {
            console.error('Connection failed:', error);
        } finally {
            setIsConnecting(false);
        }
    };

    const getStatusIcon = () => {
        switch (connection.status) {
            case 'connected':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'connecting':
                return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
            case 'error':
                return <XCircle className="w-4 h-4 text-red-500" />;
            default:
                return <Wifi className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusText = () => {
        switch (connection.status) {
            case 'connected':
                return 'Connected';
            case 'connecting':
                return 'Connecting...';
            case 'error':
                return 'Connection Failed';
            default:
                return 'Disconnected';
        }
    };

    const getStatusColor = () => {
        switch (connection.status) {
            case 'connected':
                return 'text-green-600';
            case 'connecting':
                return 'text-yellow-600';
            case 'error':
                return 'text-red-600';
            default:
                return 'text-gray-500';
        }
    };

    const handleTestConnection = async () => {
        console.log('🔍 Testing MCP server connection...');

        try {
            // Test 1: Health endpoint
            console.log('📡 Testing /health endpoint...');
            const healthResponse = await fetch('http://gc00ok8w8owcg0ocs44woskk.207.180.196.252.sslip.io/health', {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!healthResponse.ok) {
                throw new Error(`Health check failed: ${healthResponse.status}`);
            }

            const healthData = await healthResponse.text();
            console.log('✅ Health check passed:', healthData);

            // Test 2: SSE endpoint (like Claude Desktop)
            console.log('📡 Testing /sse endpoint...');

            const testSSE = () => {
                return new Promise((resolve, reject) => {
                    const eventSource = new EventSource('http://gc00ok8w8owcg0ocs44woskk.207.180.196.252.sslip.io/sse');

                    const timeout = setTimeout(() => {
                        eventSource.close();
                        resolve('SSE connection opened successfully (timeout after 3s)');
                    }, 3000);

                    eventSource.onopen = () => {
                        console.log('✅ SSE connection opened!');
                    };

                    eventSource.onmessage = (event) => {
                        console.log('📨 SSE message:', event.data);
                        eventSource.close();
                        clearTimeout(timeout);
                        resolve(`SSE working! Received: ${event.data}`);
                    };

                    eventSource.onerror = (error) => {
                        console.error('❌ SSE error:', error);
                        eventSource.close();
                        clearTimeout(timeout);
                        reject('SSE connection failed');
                    };
                });
            };

            const sseResult = await testSSE();
            console.log('✅ SSE test result:', sseResult);

            alert(`✅ MCP Server Tests Passed!\n\n` +
                `Health: ${healthResponse.status} - ${healthData}\n` +
                `SSE: ${sseResult}`);

        } catch (error) {
            console.error('❌ Connection test failed:', error);
            alert('❌ Connection test failed: ' + error);
        }
    };

    return (
        <div className="space-y-3">
            {/* Status Display */}
            <div className="flex items-center justify-between p-3 bg-white border rounded-lg">
                <div className="flex items-center space-x-2">
                    {getStatusIcon()}
                    <span className={clsx('text-sm font-medium', getStatusColor())}>
                        {getStatusText()}
                    </span>
                </div>

                <div className={clsx(
                    'connection-indicator',
                    connection.status
                )}>
                    <div className="w-2 h-2 rounded-full bg-current mr-1"></div>
                    {connection.status}
                </div>
            </div>

            {/* Connection Controls */}
            <div className="space-y-2">
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        Server URL
                    </label>
                    <input
                        type="text"
                        value={serverUrlInput}
                        onChange={(e) => setServerUrlInput(e.target.value)}
                        disabled={connection.status === 'connecting'}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                        placeholder="http://gc00ok8w8owcg0ocs44woskk.207.180.196.252.sslip.io"
                    />
                </div>

                <button
                    onClick={handleConnect}
                    disabled={isConnecting || !serverUrlInput.trim()}
                    className={clsx(
                        'w-full flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                        connection.status === 'connected'
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                >
                    {isConnecting ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : connection.status === 'connected' ? (
                        <Power className="w-4 h-4 mr-2" />
                    ) : (
                        <Wifi className="w-4 h-4 mr-2" />
                    )}
                    {connection.status === 'connected' ? 'Disconnect' : 'Connect'}
                </button>

                {/* Force Connect Button for CORS bypass */}
                {connection.status !== 'connected' && (
                    <button
                        onClick={async () => {
                            setIsConnecting(true);
                            try {
                                // Force direct connection without SSE
                                const { mcpClient } = await import('@/services/mcpClient');
                                await mcpClient.initializeFallbackConnection();
                                await connectToServer(serverUrlInput);
                            } catch (error) {
                                console.error('Force connection failed:', error);
                            } finally {
                                setIsConnecting(false);
                            }
                        }}
                        disabled={isConnecting || !serverUrlInput.trim()}
                        className="w-full flex items-center justify-center px-2 py-1 text-xs font-medium rounded-md bg-yellow-500 hover:bg-yellow-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        🔧 Force Connect (Skip SSE)
                    </button>
                )}
            </div>

            {/* Error Display */}
            {connection.error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                        <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-red-700">
                            <div className="font-medium">Connection Failed</div>
                            <div className="text-xs mt-1">{connection.error}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Server Info */}
            {connection.status === 'connected' && connection.capabilities && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-sm text-green-700">
                        <div className="font-medium mb-1">Server Information</div>
                        <div className="text-xs space-y-1">
                            {connection.capabilities.tools && (
                                <div>Tools: {connection.capabilities.tools.length}</div>
                            )}
                            {connection.capabilities.resources && (
                                <div>Resources: {connection.capabilities.resources.length}</div>
                            )}
                            <div>URL: {connection.serverUrl}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add test button */}
            <button
                onClick={handleTestConnection}
                className="w-full text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
            >
                <AlertTriangle className="w-3 h-3" />
                Test Connection
            </button>
        </div>
    );
};

export default ConnectionStatus; 