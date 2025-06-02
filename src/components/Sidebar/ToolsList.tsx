import { useConnection } from '@/store/appStore';
import { CheckCircle, Settings } from 'lucide-react';
import React from 'react';

const ToolsList: React.FC = () => {
    const connection = useConnection();
    const tools = connection.capabilities?.tools || [];

    if (tools.length === 0) {
        return (
            <div className="text-center py-4 text-gray-500">
                <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No tools available</p>
                <p className="text-xs mt-1">Connect to MCP server to see available tools</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {tools.map((tool, index) => (
                <div key={index} className="p-3 bg-white border rounded-lg">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="font-medium text-sm text-gray-900">
                                    {tool.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </span>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">{tool.description}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ToolsList; 