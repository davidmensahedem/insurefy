import { useSidebarOpen } from '@/store/appStore';
import { Calculator, Database, FileText, Settings, Users, Zap } from 'lucide-react';
import React from 'react';
import { DebugInfo } from '../Debug/DebugInfo';
import ConnectionStatus from './ConnectionStatus';
import LLMSettings from './LLMSettings';
import ToolsList from './ToolsList';

const Sidebar: React.FC = () => {
    const sidebarOpen = useSidebarOpen();

    if (!sidebarOpen) return null;

    return (
        <div className="sidebar">
            {/* Header */}
            <div className="sidebar-header">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Zap className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h1 className="font-semibold text-gray-900">Insurance AI</h1>
                        <p className="text-xs text-gray-500">MCP Client</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="sidebar-content custom-scrollbar">
                <div className="space-y-6">
                    {/* Connection Status */}
                    <section>
                        <h2 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                            <Database className="w-4 h-4 mr-2" />
                            Server Connection
                        </h2>
                        <ConnectionStatus />
                    </section>

                    {/* Available Tools */}
                    <section>
                        <h2 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                            <Settings className="w-4 h-4 mr-2" />
                            Available Tools
                        </h2>
                        <ToolsList />
                    </section>

                    {/* LLM Settings */}
                    <section>
                        <h2 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                            <Calculator className="w-4 h-4 mr-2" />
                            AI Configuration
                        </h2>
                        <LLMSettings />
                    </section>

                    {/* Quick Actions */}
                    <section>
                        <h2 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                            <Zap className="w-4 h-4 mr-2" />
                            Quick Actions
                        </h2>
                        <div className="space-y-2">
                            <QuickActionButton
                                icon={<FileText className="w-4 h-4" />}
                                title="View Policies"
                                description="Browse insurance policies"
                                onClick={() => console.log('View policies')}
                            />
                            <QuickActionButton
                                icon={<Users className="w-4 h-4" />}
                                title="Customer Search"
                                description="Find customer information"
                                onClick={() => console.log('Customer search')}
                            />
                            <QuickActionButton
                                icon={<Calculator className="w-4 h-4" />}
                                title="Premium Calculator"
                                description="Calculate insurance premiums"
                                onClick={() => console.log('Premium calculator')}
                            />
                        </div>
                    </section>

                    {/* Help & Documentation */}
                    <section>
                        <h2 className="text-sm font-medium text-gray-700 mb-3">
                            Help & Resources
                        </h2>
                        <div className="text-xs text-gray-600 space-y-2">
                            <div>
                                <strong>Sample queries:</strong>
                                <ul className="mt-1 space-y-1">
                                    <li>• "Search for auto policies"</li>
                                    <li>• "Show recent claims"</li>
                                    <li>• "Calculate premium for home insurance"</li>
                                    <li>• "Find customer John Doe"</li>
                                </ul>
                            </div>
                            <div className="pt-2 border-t">
                                <p className="text-gray-500">
                                    Connected to your insurance MCP server for real-time data access.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Debug info for troubleshooting */}
                    <section>
                        <h2 className="text-sm font-medium text-gray-700 mb-3">
                            Debug Info
                        </h2>
                        <DebugInfo />
                    </section>
                </div>
            </div>
        </div>
    );
};

interface QuickActionButtonProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick: () => void;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({
    icon,
    title,
    description,
    onClick
}) => {
    return (
        <button
            onClick={onClick}
            className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
        >
            <div className="flex items-start space-x-3">
                <div className="text-blue-600 mt-0.5">{icon}</div>
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">{title}</div>
                    <div className="text-xs text-gray-500 mt-1">{description}</div>
                </div>
            </div>
        </button>
    );
};

export default Sidebar; 